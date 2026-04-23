import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, ticketsTable } from "@workspace/db";
import { verifyPaddleWebhook, generateId, generateTicketCode, generateQrUrl } from "../lib/paddle";
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
    const customerEmail = ((data.customer as Record<string, unknown>)?.email as string) ?? "";
    const customerName = ((data.customer as Record<string, unknown>)?.name as string) ?? "Guest";
    const eventId = customData.eventId as string ?? "unknown";
    const eventTitle = customData.eventTitle as string ?? "Céléwé Event";
    const eventDate = customData.eventDate as string ?? "";
    const eventVenue = customData.eventVenue as string ?? "";

    const items = (data.items as Record<string, unknown>[]) ?? [];
    const unitPrice = items[0]
      ? ((items[0].price as Record<string, unknown>)?.unit_price as Record<string, unknown>)?.amount as number ?? 0
      : 0;
    const currency = items[0]
      ? ((items[0].price as Record<string, unknown>)?.unit_price as Record<string, unknown>)?.currency_code as string ?? "PHP"
      : "PHP";

    const orderId = generateId();
    const ticketId = generateId();
    const ticketCode = generateTicketCode();
    const baseUrl = process.env.SITE_URL ?? "https://celeweevent.com";
    const qrUrl = generateQrUrl(ticketCode, baseUrl);

    try {
      const [order] = await db.insert(ordersTable).values({
        id: orderId,
        eventId,
        eventTitle,
        customerName,
        customerEmail,
        amount: unitPrice,
        currency,
        paddleTransactionId: transactionId,
        status: "paid",
      }).returning();

      await db.insert(ticketsTable).values({
        id: ticketId,
        orderId: order.id,
        ticketCode,
        qrUrl,
        holderName: customerName,
        holderEmail: customerEmail,
        eventId,
        eventTitle,
        status: "VALID",
      });

      req.log.info({ orderId, ticketCode }, "Order and ticket created");

      await sendTicketEmail({
        to: customerEmail,
        customerName,
        eventTitle,
        eventDate,
        eventVenue,
        ticketCode,
        qrUrl,
      });

    } catch (err) {
      req.log.error({ err }, "Failed to create order or ticket");
      res.status(500).json({ error: "Internal error" });
      return;
    }
  }

  res.json({ received: true });
});

export default router;
