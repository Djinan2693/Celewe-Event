import crypto from "crypto";
import { db, ordersTable, ticketsTable } from "@workspace/db";

function generateId(): string {
  return crypto.randomUUID();
}

function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CE-${part(4)}-${part(4)}`;
}

function generateQrUrl(code: string): string {
  const baseUrl = process.env.SITE_URL ?? "https://celeweevent.com";
  const scanUrl = `${baseUrl}/scan?code=${encodeURIComponent(code)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(scanUrl)}&bgcolor=2D2021&color=ffffff&margin=20`;
}

const events = [
  {
    id: "evt-french-kiss-night",
    title: "French Kiss Night",
    date: "April 4, 2026",
    venue: "Bâton Rouge Bar, Makati",
    currency: "PHP",
    unitAmount: 1500,
  },
  {
    id: "evt-nuit-rouge-gala",
    title: "Nuit Rouge Gala",
    date: "May 10, 2026",
    venue: "Grand Ballroom, BGC",
    currency: "PHP",
    unitAmount: 3500,
  },
];

type SeedTicketRow = {
  id: string;
  orderId: string;
  ticketCode: string;
  qrUrl: string;
  holderName: string;
  holderEmail: string;
  eventId: string;
  eventTitle: string;
  status: "VALID" | "USED";
};

const seedOrders: {
  id: string;
  eventId: string;
  eventTitle: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paddleTransactionId: string;
  status: string;
}[] = [];

const seedTickets: SeedTicketRow[] = [];

for (const [idx, event] of events.entries()) {
  const qty = idx === 0 ? 1 : 2;
  const orderId = generateId();

  seedOrders.push({
    id: orderId,
    eventId: event.id,
    eventTitle: event.title,
    customerName: idx === 0 ? "Jean-Baptiste Moreau" : "Sophie Tran",
    customerEmail: idx === 0 ? "jbm@example.com" : "sophie@example.com",
    amount: event.unitAmount * qty,
    currency: event.currency,
    paddleTransactionId: `txn_seed_${idx + 1}_${Date.now()}`,
    status: "paid",
  });

  for (let i = 0; i < qty; i++) {
    const code = generateTicketCode();
    seedTickets.push({
      id: generateId(),
      orderId,
      ticketCode: code,
      qrUrl: generateQrUrl(code),
      holderName: idx === 0 ? "Jean-Baptiste Moreau" : "Sophie Tran",
      holderEmail: idx === 0 ? "jbm@example.com" : "sophie@example.com",
      eventId: event.id,
      eventTitle: event.title,
      status: "VALID",
    });
  }
}

console.log("🌱  Seeding database...\n");

try {
  await db.insert(ordersTable).values(seedOrders).onConflictDoNothing();
  console.log(`✅  Inserted ${seedOrders.length} orders`);

  await db.insert(ticketsTable).values(seedTickets).onConflictDoNothing();
  console.log(`✅  Inserted ${seedTickets.length} tickets\n`);

  for (const ticket of seedTickets) {
    const event = events.find((e) => e.id === seedOrders.find((o) => o.id === ticket.orderId)?.eventId);
    console.log(`   🎫  ${ticket.ticketCode}  —  ${event?.title ?? "?"}`);
    console.log(`        QR: ${ticket.qrUrl}`);
  }

  console.log("\n✨  Seed complete. Use these codes on /scan to test the scanner.");
} catch (err) {
  console.error("❌  Seed failed:", err);
  process.exit(1);
}
