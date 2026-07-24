import type { NextFunction, Request, Response } from "express";
import { OrderStatus, TicketStatus } from "@prisma/client";
import { db } from "../lib/db";
import { isStaffPinValid } from "../lib/staffAuth";
import { createTicketCodeGenerator } from "../lib/ticketCode";
import { getEventLabels } from "../lib/eventDisplay";
import { composeTicketPng } from "../lib/ticketImage";
import { sendDigitalTicketEmail } from "../lib/ticketEmail";

function pinFrom(req: Request): unknown {
  return (req.body && (req.body as Record<string, unknown>).pin) ?? req.query?.pin;
}

type OrderWithEvent = Awaited<ReturnType<typeof loadOrder>>;

async function loadOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: { event: true, tickets: true },
  });
}

// Composes a branded PNG per ticket code and emails them to the buyer. Never
// throws — a missing template or send failure is reported, not fatal, so issued
// tickets are not lost.
async function composeAndEmail(
  order: NonNullable<OrderWithEvent>,
  ticketCodes: string[],
): Promise<{ sent: boolean; error?: string }> {
  try {
    const labels = getEventLabels(order.event.slug, order.event.dateISO);
    const tickets = [];
    for (const code of ticketCodes) {
      const png = await composeTicketPng(code, order.event.slug);
      tickets.push({ ticketCode: code, png });
    }

    const sent = await sendDigitalTicketEmail({
      to: order.buyerEmail,
      customerName: `${order.buyerFirstName} ${order.buyerLastName}`.trim(),
      event: {
        title: order.event.title,
        dateLabel: labels.dateLabel,
        timeLabel: labels.timeLabel,
        venue: order.event.venue,
      },
      totalPHP: order.amountPHP,
      tickets,
    });

    return { sent };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("composeAndEmail failed:", message);
    return { sent: false, error: message };
  }
}

export async function listReservations(req: Request, res: Response, next: NextFunction) {
  if (!isStaffPinValid(pinFrom(req))) {
    return res.status(401).json({ ok: false, error: "Invalid staff pin" });
  }

  try {
    const showAll = req.query.status === "all";
    const where = showAll
      ? {}
      : { status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING] } };

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { event: true, _count: { select: { tickets: true } } },
      take: 500,
    });

    return res.json({
      ok: true,
      reservations: orders.map((o) => ({
        id: o.id,
        status: o.status,
        provider: o.provider,
        eventTitle: o.event.title,
        eventSlug: o.event.slug,
        firstName: o.buyerFirstName,
        lastName: o.buyerLastName,
        email: o.buyerEmail,
        phone: o.buyerPhone,
        qty: o.qty,
        amountPHP: o.amountPHP,
        currency: o.event.currency,
        ticketsIssued: o._count.tickets,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function confirmPayment(req: Request, res: Response, next: NextFunction) {
  if (!isStaffPinValid(pinFrom(req))) {
    return res.status(401).json({ ok: false, error: "Invalid staff pin" });
  }

  const id = String(req.params.id);

  try {
    const order = await loadOrder(id);
    if (!order) {
      return res.status(404).json({ ok: false, error: "Reservation not found" });
    }

    // Already confirmed with tickets: do not re-issue or re-send automatically.
    if (order.status === OrderStatus.PAID && order.tickets.length > 0) {
      return res.status(200).json({
        ok: true,
        alreadyConfirmed: true,
        orderId: order.id,
        status: order.status,
        ticketCodes: order.tickets.map((t) => t.ticketCode),
        emailSent: false,
        note: "Already confirmed. Use 'Resend ticket' to send the email again.",
      });
    }

    // Issue tickets atomically and mark the order PAID. `created` tells us
    // whether THIS request generated the tickets (so only it sends the email),
    // guarding against double-clicks racing.
    const { codes, created } = await db.$transaction(async (tx) => {
      const existing = await tx.ticket.findMany({ where: { orderId: order.id } });
      if (existing.length > 0) {
        if (order.status !== OrderStatus.PAID) {
          await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });
        }
        return { codes: existing.map((t) => t.ticketCode), created: false };
      }

      const existingForEvent = await tx.ticket.count({ where: { eventId: order.eventId } });
      const reserved = new Set<string>();
      const generateTicketCode = createTicketCodeGenerator({
        countTicketsForEvent: async () => existingForEvent,
        ticketCodeExists: async (ticketCode) => {
          if (reserved.has(ticketCode)) return true;
          return (await tx.ticket.findUnique({ where: { ticketCode } })) !== null;
        },
      });

      const generated: string[] = [];
      for (let index = 0; index < order.qty; index += 1) {
        const ticketCode = await generateTicketCode({
          eventId: order.eventId,
          eventSlug: order.event.slug,
          sequenceNumber: existingForEvent + index + 1,
        });
        reserved.add(ticketCode);
        generated.push(ticketCode);
      }

      await tx.ticket.createMany({
        data: generated.map((ticketCode) => ({
          orderId: order.id,
          eventId: order.eventId,
          ticketCode,
          status: TicketStatus.VALID,
        })),
      });

      await tx.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });

      return { codes: generated, created: true };
    });

    // Only the request that actually created the tickets sends the email.
    const email = created ? await composeAndEmail(order, codes) : { sent: false };

    return res.status(200).json({
      ok: true,
      orderId: order.id,
      status: OrderStatus.PAID,
      ticketCodes: codes,
      newlyIssued: created,
      emailSent: email.sent,
      emailError: email.error,
    });
  } catch (error) {
    return next(error);
  }
}

export async function resendTicket(req: Request, res: Response, next: NextFunction) {
  if (!isStaffPinValid(pinFrom(req))) {
    return res.status(401).json({ ok: false, error: "Invalid staff pin" });
  }

  const id = String(req.params.id);

  try {
    const order = await loadOrder(id);
    if (!order) {
      return res.status(404).json({ ok: false, error: "Reservation not found" });
    }
    if (order.tickets.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "No ticket issued yet. Confirm the payment first.",
      });
    }

    const email = await composeAndEmail(
      order,
      order.tickets.map((t) => t.ticketCode),
    );

    return res.status(200).json({
      ok: true,
      orderId: order.id,
      ticketCodes: order.tickets.map((t) => t.ticketCode),
      emailSent: email.sent,
      emailError: email.error,
    });
  } catch (error) {
    return next(error);
  }
}
