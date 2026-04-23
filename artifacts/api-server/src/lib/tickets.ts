import { db, ordersTable, ticketsTable } from "@workspace/db";
import type { Order, Ticket } from "@workspace/db";
import { generateId, generateTicketCode, generateQrUrl } from "./paddle";

export interface CreateTicketsInput {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  customerName: string;
  customerEmail: string;
  unitAmount: number;
  currency: string;
  paddleTransactionId: string;
  quantity: number;
}

export interface CreateTicketsResult {
  order: Order;
  tickets: Ticket[];
}

export async function createOrderWithTickets(
  input: CreateTicketsInput,
  baseUrl: string,
): Promise<CreateTicketsResult> {
  const qty = Math.max(1, input.quantity);
  const orderId = generateId();

  const [order] = await db
    .insert(ordersTable)
    .values({
      id: orderId,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      amount: input.unitAmount * qty,
      currency: input.currency,
      paddleTransactionId: input.paddleTransactionId,
      status: "paid",
    })
    .returning();

  const ticketRows = Array.from({ length: qty }, () => {
    const ticketCode = generateTicketCode();
    const qrUrl = generateQrUrl(ticketCode, baseUrl);
    return {
      id: generateId(),
      orderId: order.id,
      ticketCode,
      qrUrl,
      holderName: input.customerName,
      holderEmail: input.customerEmail,
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      status: "VALID" as const,
    };
  });

  const tickets = await db.insert(ticketsTable).values(ticketRows).returning();

  return { order, tickets };
}
