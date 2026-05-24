import type { NextFunction, Request, Response } from "express";
import { OrderProvider, OrderStatus, TicketStatus } from "@prisma/client";
import { db } from "../lib/db";
import { createTicketCodeGenerator } from "../lib/ticketCode";
import {
  createPaypalOrder,
  capturePaypalOrder,
  getApprovalLink,
  verifyPaypalWebhookSignature,
} from "../lib/paypal";
import { sendTicketEmail } from "../lib/email";
import { buildTicketScanUrl } from "../lib/qr";

type CreatePaypalOrderBody = {
  eventSlug?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  qty?: unknown;
};

type CapturePaypalOrderBody = {
  paypalOrderId?: unknown;
};

type PaypalWebhookPayload = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseCreateOrderInput(body: CreatePaypalOrderBody) {
  const eventSlug = normalizeString(body.eventSlug);
  const firstName = normalizeString(body.firstName);
  const lastName = normalizeString(body.lastName);
  const email = normalizeString(body.email).toLowerCase();
  const phone = normalizeString(body.phone);
  const qty = typeof body.qty === "number" ? body.qty : Number(body.qty);

  const errors: string[] = [];
  if (!eventSlug) errors.push("eventSlug is required");
  if (!firstName) errors.push("firstName is required");
  if (!lastName) errors.push("lastName is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email must be a valid email address");
  if (!phone) errors.push("phone is required");
  if (!Number.isInteger(qty) || qty <= 0) errors.push("qty must be a positive integer");
  if (qty > 20) errors.push("qty must be less than or equal to 20");

  return { errors, data: { eventSlug, firstName, lastName, email, phone, qty } };
}

function getPayCurrency() {
  return (process.env.PAYPAL_CURRENCY?.trim().toUpperCase() || "USD");
}

function getFxPhpPerUnit() {
  const value = Number(process.env.FX_PHP_PER_UNIT || "56");
  return Number.isFinite(value) && value > 0 ? value : 56;
}

function convertPhpAmount(amountPHP: number) {
  const currency = getPayCurrency();

  if (currency === "PHP") {
    return {
      currency,
      amountValue: amountPHP.toFixed(2),
      fxPhpPerUnit: 1,
    };
  }

  const fxPhpPerUnit = getFxPhpPerUnit();
  const converted = amountPHP / fxPhpPerUnit;

  return {
    currency,
    amountValue: converted.toFixed(2),
    fxPhpPerUnit,
  };
}

async function finalizeLocalOrderAndTickets(paypalOrderId: string) {
  const localOrder = await db.order.findFirst({
    where: {
      provider: OrderProvider.PAYPAL,
      providerRef: paypalOrderId,
    },
    include: {
      event: true,
    },
  });

  if (!localOrder) {
    throw new Error("Local order not found for this PayPal order");
  }

  const createdTickets = await db.$transaction(async (tx) => {
    if (localOrder.status !== OrderStatus.PAID) {
      await tx.order.update({
        where: { id: localOrder.id },
        data: { status: OrderStatus.PAID },
      });
    }

    const existingTickets = await tx.ticket.count({ where: { orderId: localOrder.id } });
    if (existingTickets > 0) {
      return false;
    }

    const existingTicketCountForEvent = await tx.ticket.count({ where: { eventId: localOrder.eventId } });
    const reservedTicketCodes = new Set<string>();

    const generateTicketCode = createTicketCodeGenerator({
      countTicketsForEvent: async () => existingTicketCountForEvent,
      ticketCodeExists: async (ticketCode) => {
        if (reservedTicketCodes.has(ticketCode)) {
          return true;
        }

        const ticket = await tx.ticket.findUnique({ where: { ticketCode } });
        return ticket !== null;
      },
    });

    const ticketCodes: string[] = [];
    for (let index = 0; index < localOrder.qty; index += 1) {
      const ticketCode = await generateTicketCode({
        eventId: localOrder.eventId,
        eventSlug: localOrder.event.slug,
        sequenceNumber: existingTicketCountForEvent + index + 1,
      });
      reservedTicketCodes.add(ticketCode);
      ticketCodes.push(ticketCode);
    }

    await tx.ticket.createMany({
      data: ticketCodes.map((ticketCode) => ({
        orderId: localOrder.id,
        eventId: localOrder.eventId,
        ticketCode,
        status: TicketStatus.VALID,
      })),
    });

    return true;
  });

  if (createdTickets) {
    const orderWithTickets = await db.order.findUnique({
      where: { id: localOrder.id },
      include: {
        event: true,
        tickets: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (orderWithTickets && orderWithTickets.tickets.length > 0) {
      await sendTicketEmail({
        to: orderWithTickets.buyerEmail,
        customerName: `${orderWithTickets.buyerFirstName} ${orderWithTickets.buyerLastName}`.trim(),
        eventTitle: orderWithTickets.event.title,
        eventDate: orderWithTickets.event.dateISO,
        eventVenue: orderWithTickets.event.venue,
        totalAmountPhp: orderWithTickets.amountPHP,
        tickets: orderWithTickets.tickets.map((ticket) => ({
          ticketCode: ticket.ticketCode,
          qrUrl: buildTicketScanUrl(ticket.ticketCode),
        })),
      });
    }
  }

  return localOrder.id;
}

export async function createPaypalOrderHandler(req: Request, res: Response, next: NextFunction) {
  const { errors, data } = parseCreateOrderInput(req.body as CreatePaypalOrderBody);

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const event = await db.event.findUnique({ where: { slug: data.eventSlug } });

    if (!event) {
      return res.status(404).json({ ok: false, error: "Event not found" });
    }

    const amountPHP = event.pricePHP * data.qty;
    const converted = convertPhpAmount(amountPHP);
    const proto = req.get("x-forwarded-proto") ?? req.protocol;
    const host = req.get("host") ?? "localhost";
    const siteBaseUrl = `${proto}://${host}`;
    const returnUrl = `${siteBaseUrl}/events/${event.slug}?paypal=success`;
    const cancelUrl = `${siteBaseUrl}/events/${event.slug}?paypal=cancel`;

    const localOrder = await db.order.create({
      data: {
        eventId: event.id,
        buyerFirstName: data.firstName,
        buyerLastName: data.lastName,
        buyerEmail: data.email,
        buyerPhone: data.phone,
        qty: data.qty,
        amountPHP,
        providerCurrency: converted.currency,
        providerAmount: converted.amountValue,
        fxPhpPerUnit: converted.fxPhpPerUnit,
        status: OrderStatus.PENDING,
        provider: OrderProvider.PAYPAL,
      },
    });

    const paypalOrder = await createPaypalOrder({
      referenceId: localOrder.id,
      amountValue: converted.amountValue,
      currencyCode: converted.currency,
      description: `${event.title} x${data.qty}`,
      returnUrl,
      cancelUrl,
    });

    await db.order.update({
      where: { id: localOrder.id },
      data: { providerRef: paypalOrder.id },
    });

    return res.status(201).json({
      paypalOrderId: paypalOrder.id,
      localOrderId: localOrder.id,
      approvalUrl: getApprovalLink(paypalOrder),
    });
  } catch (error) {
    return next(error);
  }
}

export async function capturePaypalOrderHandler(req: Request, res: Response, next: NextFunction) {
  const paypalOrderId = normalizeString((req.body as CapturePaypalOrderBody).paypalOrderId);

  if (!paypalOrderId) {
    return res.status(400).json({ error: "paypalOrderId is required" });
  }

  try {
    const captureResult = await capturePaypalOrder(paypalOrderId);
    const captureCompleted = captureResult.status === "COMPLETED";

    if (!captureCompleted) {
      return res.status(409).json({
        error: "PayPal order is not completed",
        captureResult,
      });
    }

    const localOrderId = await finalizeLocalOrderAndTickets(paypalOrderId);

    return res.json({
      localOrderId,
      captureResult,
    });
  } catch (error) {
    return next(error);
  }
}

export async function paypalWebhookHandler(req: Request, res: Response, next: NextFunction) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();

  if (!webhookId) {
    return res.status(500).json({ error: "PAYPAL_WEBHOOK_ID is not configured" });
  }

  const transmissionId = req.header("paypal-transmission-id") ?? "";
  const transmissionTime = req.header("paypal-transmission-time") ?? "";
  const certUrl = req.header("paypal-cert-url") ?? "";
  const authAlgo = req.header("paypal-auth-algo") ?? "";
  const transmissionSig = req.header("paypal-transmission-sig") ?? "";

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return res.status(400).json({ error: "Missing PayPal signature headers" });
  }

  const payload = req.body as PaypalWebhookPayload;

  try {
    const isValid = await verifyPaypalWebhookSignature({
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      webhookId,
      webhookEvent: payload,
    });

    if (!isValid) {
      return res.status(401).json({ error: "Invalid PayPal webhook signature" });
    }

    const paypalOrderId =
      payload.resource?.supplementary_data?.related_ids?.order_id ?? payload.resource?.id;

    if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED" && paypalOrderId) {
      await finalizeLocalOrderAndTickets(paypalOrderId);
    }

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}