import { Router, type IRouter } from "express";
import { verifyPaddleWebhook } from "../lib/paddle";
import { createOrderWithTickets } from "../lib/tickets";
import { sendTicketEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/webhooks/paddle", async (req, res): Promise<void> => {
  const signatureHeader = req.headers["paddle-signature"] as string | undefined;

  if (!signatureHeader) {
    req.log.warn("Missing Paddle-Signature header");
    res.status(400).json({ error: "Missing signature" });
    return;
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    req.log.error("PADDLE_WEBHOOK_SECRET not configured");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const rawBody = req.body as Buffer;

  const isValid = verifyPaddleWebhook(rawBody, signatureHeader, webhookSecret);
  if (!isValid) {
    req.log.warn("Invalid Paddle webhook signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
  } catch {
    req.log.warn("Failed to parse webhook body");
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const eventType = event.event_type as string;
  req.log.info({ eventType }, "Received Paddle webhook");

  if (eventType === "transaction.completed") {
    const data = event.data as Record<string, unknown>;
    const transactionId = data.id as string;

    const customData = (data.custom_data as Record<string, unknown>) ?? {};
    const customer = (data.customer as Record<string, unknown>) ?? {};
    const customerEmail = (customer.email as string) ?? "";
    const customerName = (customer.name as string) ?? "Guest";

    const eventId = (customData.eventId as string) ?? "unknown";
    const eventTitle = (customData.eventTitle as string) ?? "Céléwé Event";
    const eventDate = (customData.eventDate as string) ?? "";
    const eventVenue = (customData.eventVenue as string) ?? "";

    const items = (data.items as Record<string, unknown>[]) ?? [];

    let totalQty = 0;
    let unitAmount = 0;
    let currency = "PHP";

    for (const item of items) {
      const qty = (item.quantity as number) ?? 1;
      totalQty += qty;

      const price = item.price as Record<string, unknown> | undefined;
      const unitPrice = price?.unit_price as Record<string, unknown> | undefined;
      if (unitPrice) {
        const rawAmount = unitPrice.amount as number | string | undefined;
        unitAmount = typeof rawAmount === "string" ? parseInt(rawAmount, 10) : (rawAmount ?? 0);
        currency = (unitPrice.currency_code as string) ?? "PHP";
      }
    }

    if (totalQty === 0) totalQty = 1;

    const baseUrl = process.env.SITE_URL ?? "https://celeweevent.com";

    try {
      const { order, tickets } = await createOrderWithTickets(
        {
          eventId,
          eventTitle,
          eventDate,
          eventVenue,
          customerName,
          customerEmail,
          unitAmount,
          currency,
          paddleTransactionId: transactionId,
          quantity: totalQty,
        },
        baseUrl,
      );

      req.log.info(
        { orderId: order.id, ticketCount: tickets.length },
        "Order and tickets created",
      );

      await sendTicketEmail({
        to: customerEmail,
        customerName,
        eventTitle,
        eventDate,
        eventVenue,
        totalAmount: order.amount,
        currency,
        tickets: tickets.map((t, i) => ({
          ticketCode: t.ticketCode,
          qrUrl: t.qrUrl,
          seatIndex: i + 1,
        })),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to create order/tickets or send email");
      res.status(500).json({ error: "Internal error" });
      return;
    }
  }

  res.json({ received: true });
});

export default router;
