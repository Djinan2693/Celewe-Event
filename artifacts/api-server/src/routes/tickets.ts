import { Router, type IRouter } from "express";
import { eq, desc, or, ilike } from "drizzle-orm";
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

router.post("/tickets/validate", async (req, res): Promise<void> => {
  const { code: rawCode, pin } = req.body as { code?: string; pin?: string };
  const code = rawCode?.trim().toUpperCase();

  if (!code || !pin) {
    res.status(400).json({ error: "code and pin are required" });
    return;
  }

  const staffPin = process.env.STAFF_PIN;
  if (!staffPin) {
    req.log.error("STAFF_PIN env var not configured");
    res.status(500).json({ error: "Staff PIN not configured on server" });
    return;
  }

  if (pin !== staffPin) {
    res.status(401).json({ error: "Invalid PIN" });
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
    res.status(409).json({ error: "Ticket already used or invalid", status: ticket.status });
    return;
  }

  const now = new Date();
  const [updated] = await db
    .update(ticketsTable)
    .set({ status: "USED", usedAt: now })
    .where(eq(ticketsTable.ticketCode, code))
    .returning();

  req.log.info({ code }, "Ticket validated by staff");

  res.json({
    success: true,
    ticket: {
      code: updated.ticketCode,
      status: updated.status,
      holderName: updated.holderName,
      holderEmail: updated.holderEmail,
      eventTitle: updated.eventTitle,
      usedAt: updated.usedAt,
    },
  });
});

router.get("/admin/tickets", async (req, res): Promise<void> => {
  const { password, search } = req.query as { password?: string; search?: string };

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: "ADMIN_PASSWORD not configured" });
    return;
  }

  if (password !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const q = db
    .select({
      id: ticketsTable.id,
      ticketCode: ticketsTable.ticketCode,
      holderName: ticketsTable.holderName,
      holderEmail: ticketsTable.holderEmail,
      eventTitle: ticketsTable.eventTitle,
      eventId: ticketsTable.eventId,
      status: ticketsTable.status,
      createdAt: ticketsTable.createdAt,
      usedAt: ticketsTable.usedAt,
    })
    .from(ticketsTable)
    .orderBy(desc(ticketsTable.createdAt))
    .limit(200);

  const tickets = await q;

  const filtered = search
    ? tickets.filter(
        (t) =>
          t.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
          t.holderName.toLowerCase().includes(search.toLowerCase()) ||
          t.holderEmail.toLowerCase().includes(search.toLowerCase()),
      )
    : tickets;

  res.json({ tickets: filtered, total: filtered.length });
});

router.get("/config/paddle", async (_req, res): Promise<void> => {
  res.json({
    clientToken: process.env.PADDLE_CLIENT_TOKEN ?? "",
    environment: process.env.PADDLE_ENV ?? "sandbox",
  });
});

export default router;
