import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = pgTable("tickets", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  ticketCode: text("ticket_code").notNull().unique(),
  qrUrl: text("qr_url").notNull(),
  holderName: text("holder_name").notNull(),
  holderEmail: text("holder_email").notNull(),
  eventId: text("event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  status: text("status").notNull().default("VALID"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ createdAt: true, usedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
