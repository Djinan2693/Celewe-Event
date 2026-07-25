import type { NextFunction, Request, Response } from "express";
import { OrderProvider, OrderStatus, TicketStatus } from "@prisma/client";
import { db } from "../lib/db";
import { createTicketCodeGenerator } from "../lib/ticketCode";
import { sendReservationEmails } from "../lib/reservationEmail";
import { getEventLabels } from "../lib/eventDisplay";

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

// ---------------------------------------------------------------------------
// Manual reservation flow (no payment captured yet, no QR ticket generated).
// A reservation is stored as an Order with status PENDING_PAYMENT / provider
// MANUAL. Staff confirm payment manually and issue the ticket later.
// ---------------------------------------------------------------------------

function sanitize(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }
  // Strip control characters and collapse whitespace, then cap the length.
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Lightweight in-memory rate limiter (per IP + email). Resets on restart; it is
// only meant as basic abuse/spam protection, not a hard security boundary.
const RESERVATION_WINDOW_MS = 10 * 60 * 1000;
const RESERVATION_MAX_PER_WINDOW = 6;
const reservationHits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (reservationHits.get(key) ?? []).filter(
    (ts) => now - ts < RESERVATION_WINDOW_MS,
  );
  recent.push(now);
  reservationHits.set(key, recent);
  return recent.length > RESERVATION_MAX_PER_WINDOW;
}

type ReservationBody = {
  eventSlug?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  quantity?: unknown;
  qty?: unknown;
  // Honeypot: real users never fill this; bots often do.
  website?: unknown;
};

export async function createReservation(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as ReservationBody;

  // Honeypot check — silently reject obvious bots.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return res.status(400).json({ ok: false, error: "Invalid submission." });
  }

  const eventSlug = sanitize(body.eventSlug, 100).toLowerCase();
  const firstName = sanitize(body.firstName, 80);
  const lastName = sanitize(body.lastName, 80);
  const email = sanitize(body.email, 160).toLowerCase();
  const phone = sanitize(body.phone, 40);
  const rawQuantity = body.quantity ?? body.qty;
  const quantity =
    typeof rawQuantity === "number" ? rawQuantity : Number(rawQuantity);

  const errors: string[] = [];

  if (!eventSlug) errors.push("eventSlug is required");
  if (!firstName) errors.push("firstName is required");
  if (!lastName) errors.push("lastName is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("A valid email is required");
  }
  if (!phone) errors.push("phone is required");
  if (!Number.isInteger(quantity) || quantity < 1) {
    errors.push("quantity must be a whole number of at least 1");
  }
  if (Number.isInteger(quantity) && quantity > 20) {
    errors.push("quantity must be 20 or fewer");
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  const rateKey = `${req.ip ?? "unknown"}|${email}`;
  if (isRateLimited(rateKey)) {
    return res.status(429).json({
      ok: false,
      error: "Too many reservation attempts. Please try again in a few minutes.",
    });
  }

  try {
    const event = await db.event.findUnique({ where: { slug: eventSlug } });

    if (!event) {
      return res.status(404).json({ ok: false, error: "Event not found" });
    }

    // Server-side amount — the client-provided price is never trusted.
    const totalPHP = event.pricePHP * quantity;

    const order = await db.order.create({
      data: {
        eventId: event.id,
        buyerFirstName: firstName,
        buyerLastName: lastName,
        buyerEmail: email,
        buyerPhone: phone,
        qty: quantity,
        amountPHP: totalPHP,
        status: OrderStatus.PENDING_PAYMENT,
        provider: OrderProvider.MANUAL,
      },
    });

    // No tickets are created here — the QR ticket is issued only after payment
    // is confirmed manually.

    const labels = getEventLabels(event.slug, event.dateISO);
    // Send the notification emails in the background: the customer gets an
    // instant confirmation and the request doesn't hold server resources
    // waiting on the email API (which reduces load and avoids timeouts).
    void sendReservationEmails({
      orderId: order.id,
      event: {
        title: event.title,
        dateLabel: labels.dateLabel,
        timeLabel: labels.timeLabel,
        venue: event.venue,
        pricePHP: event.pricePHP,
      },
      buyer: { firstName, lastName, email, phone },
      quantity,
      totalPHP,
    }).catch((err) => {
      console.error("Reservation emails failed:", err);
    });

    return res.status(201).json({
      ok: true,
      orderId: order.id,
      status: OrderStatus.PENDING_PAYMENT,
      amountPHP: totalPHP,
      currency: event.currency,
      emails: { queued: true },
    });
  } catch (error) {
    return next(error);
  }
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