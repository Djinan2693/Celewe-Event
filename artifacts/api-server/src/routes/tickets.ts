import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ticketsTable, ordersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/tickets/:code", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const code = raw?.trim().toUpperCase();

  if (!code) {
    res.status(400).json({ error: "Missing ticket code" });
    return;
  }

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.ticketCode, code));

  if (!ticket) {
    res.status(404).json({ valid: false, error: "Ticket not found" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, ticket.orderId));

  res.json({
    valid: ticket.status === "VALID",
    ticket: {
      code: ticket.ticketCode,
      status: ticket.status,
      holderName: ticket.holderName,
      holderEmail: ticket.holderEmail,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      usedAt: ticket.usedAt,
      createdAt: ticket.createdAt,
    },
    order: order
      ? {
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          createdAt: order.createdAt,
        }
      : null,
  });
});

router.post("/tickets/:code/use", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const code = raw?.trim().toUpperCase();

  if (!code) {
    res.status(400).json({ error: "Missing ticket code" });
    return;
  }

  const [ticket] = await db
    .select()
    .from(ticketsTable)
    .where(eq(ticketsTable.ticketCode, code));

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (ticket.status !== "VALID") {
    res.status(409).json({ error: "Ticket already used", status: ticket.status });
    return;
  }

  const [updated] = await db
    .update(ticketsTable)
    .set({ status: "USED", usedAt: new Date() })
    .where(eq(ticketsTable.ticketCode, code))
    .returning();

  req.log.info({ code }, "Ticket marked as used");
  res.json({ success: true, ticket: updated });
});

router.get("/config/paddle", async (_req, res): Promise<void> => {
  res.json({
    clientToken: process.env.PADDLE_CLIENT_TOKEN ?? "",
    environment: process.env.PADDLE_ENV ?? "sandbox",
  });
});

export default router;
