import type { NextFunction, Request, Response } from "express";
import { OrderProvider, OrderStatus, TicketStatus } from "@prisma/client";
import { db } from "../lib/db";
import { createTicketCodeGenerator } from "../lib/ticketCode";

type ManualOrderBody = {
  eventSlug?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  qty?: unknown;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseManualOrderInput(body: ManualOrderBody) {
  const eventSlug = normalizeString(body.eventSlug);
  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const email = normalizeString(body.email).toLowerCase();
  const phone = normalizeString(body.phone);
  const qty = typeof body.qty === "number" ? body.qty : Number(body.qty);

  const errors: string[] = [];

  if (!eventSlug) {
    errors.push("eventSlug is required");
  }

  if (!firstName) {
    errors.push("firstName is required");
  }

  if (!lastName) {
    errors.push("lastName is required");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("email must be a valid email address");
  }

  if (!phone) {
    errors.push("phone is required");
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    errors.push("qty must be a positive integer");
  }

  if (qty > 20) {
    errors.push("qty must be less than or equal to 20");
  }

  return {
    errors,
    data: {
      eventSlug,
      firstName,
      lastName,
      email,
      phone,
      qty,
    },
  };
}

export async function createManualOrder(req: Request, res: Response, next: NextFunction) {
  const { errors, data } = parseManualOrderInput(req.body as ManualOrderBody);

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      errors,
    });
  }

  try {
    const event = await db.event.findUnique({
      where: { slug: data.eventSlug },
    });

    if (!event) {
      return res.status(404).json({
        ok: false,
        error: "Event not found",
      });
    }

    const result = await db.$transaction(async (tx) => {
      const existingTicketCount = await tx.ticket.count({
        where: { eventId: event.id },
      });
      const reservedTicketCodes = new Set<string>();

      const generateTicketCode = createTicketCodeGenerator({
        countTicketsForEvent: async () => existingTicketCount,
        ticketCodeExists: async (ticketCode) => {
          if (reservedTicketCodes.has(ticketCode)) {
            return true;
          }

          const ticket = await tx.ticket.findUnique({ where: { ticketCode } });
          return ticket !== null;
        },
      });

      const order = await tx.order.create({
        data: {
          eventId: event.id,
          buyerFirstName: data.firstName,
          buyerLastName: data.lastName,
          buyerEmail: data.email,
          buyerPhone: data.phone,
          qty: data.qty,
          amountPHP: event.pricePHP * data.qty,
          status: OrderStatus.PENDING,
          provider: OrderProvider.MANUAL,
        },
      });

      const ticketCodes: string[] = [];

      for (let index = 0; index < data.qty; index += 1) {
        const ticketCode = await generateTicketCode({
          eventId: event.id,
          eventSlug: event.slug,
          sequenceNumber: existingTicketCount + index + 1,
        });

        reservedTicketCodes.add(ticketCode);
        ticketCodes.push(ticketCode);
      }

      await tx.ticket.createMany({
        data: ticketCodes.map((ticketCode) => ({
          orderId: order.id,
          eventId: event.id,
          ticketCode,
          status: TicketStatus.VALID,
        })),
      });

      return {
        orderId: order.id,
        tickets: ticketCodes,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}