import type { Request, Response } from "express";
import { TicketStatus } from "@prisma/client";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { db } from "../lib/db";
import { buildTicketScanUrl, generateTicketQrPngBuffer } from "../lib/qr";
import { createTicketCodeGenerator } from "../lib/ticketCode";

type VerifyStatus = "VALID" | "USED" | "NOT_FOUND";

type UseTicketBody = {
  code?: unknown;
  pin?: unknown;
  agentName?: unknown;
};

function getStaffPin() {
  const pin = process.env.STAFF_PIN?.trim();

  if (!pin) {
    throw new Error("STAFF_PIN is not configured");
  }

  return pin;
}

function isStaffPinValid(pin: unknown) {
  return typeof pin === "string" && pin.trim() === getStaffPin();
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function appendTicketScanLog(entry: {
  ticketCode: string;
  status: VerifyStatus;
  agentName: string;
  usedAtISO?: string;
}) {
  const logPath = process.env.SCAN_LOG_PATH?.trim() || path.join(process.cwd(), "tmp", "ticket-scan-history.log");
  const logDir = path.dirname(logPath);

  try {
    await mkdir(logDir, { recursive: true });
    await appendFile(
      logPath,
      `${JSON.stringify({ timestampISO: new Date().toISOString(), ...entry })}\n`,
      "utf8",
    );
  } catch (error) {
    console.error("[ticket-scan-log] failed to append", error);
  }
}

export async function verifyTicket(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code.trim().toUpperCase() : "";

  if (!code) {
    return res.status(400).json({
      error: "code query parameter is required",
    });
  }

  const ticket = await db.ticket.findUnique({
    where: { ticketCode: code },
    include: {
      event: true,
    },
  });

  if (!ticket) {
    return res.json({
      status: "NOT_FOUND" satisfies VerifyStatus,
      ticketCode: code,
    });
  }

  const status: VerifyStatus = ticket.status === TicketStatus.VALID ? "VALID" : "USED";

  return res.json({
    status,
    ticketCode: ticket.ticketCode,
    event: {
      title: ticket.event.title,
      dateISO: ticket.event.dateISO,
      venue: ticket.event.venue,
    },
    usedAt: ticket.usedAt ?? undefined,
  });
}

export async function useTicket(req: Request, res: Response) {
  const body = (req.body ?? {}) as UseTicketBody;
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const pin = body.pin;
  const agentName = typeof body.agentName === "string" && body.agentName.trim().length > 0
    ? body.agentName.trim().slice(0, 80)
    : "STAFF";

  if (!code) {
    return res.status(400).json({ error: "code is required" });
  }

  if (!isStaffPinValid(pin)) {
    return res.status(401).json({ error: "Invalid staff pin" });
  }

  const ticket = await db.ticket.findUnique({
    where: { ticketCode: code },
    include: { event: true },
  });

  if (!ticket) {
    await appendTicketScanLog({
      ticketCode: code,
      status: "NOT_FOUND",
      agentName,
    });

    return res.status(404).json({
      status: "NOT_FOUND" satisfies VerifyStatus,
      ticketCode: code,
    });
  }

  if (ticket.status !== TicketStatus.VALID) {
    const usedAtISO = (ticket.usedAt ?? new Date()).toISOString();

    await appendTicketScanLog({
      ticketCode: ticket.ticketCode,
      status: "USED",
      agentName,
      usedAtISO,
    });

    return res.status(409).json({
      status: "USED" satisfies VerifyStatus,
      ticketCode: ticket.ticketCode,
      usedAt: ticket.usedAt ?? new Date(),
      event: {
        title: ticket.event.title,
        dateISO: ticket.event.dateISO,
        venue: ticket.event.venue,
      },
    });
  }

  const usedAt = new Date();

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: {
      status: TicketStatus.USED,
      usedAt,
    },
    include: {
      event: true,
    },
  });

  await appendTicketScanLog({
    ticketCode: updated.ticketCode,
    status: "USED",
    agentName,
    usedAtISO: usedAt.toISOString(),
  });

  return res.json({
    status: "USED" satisfies VerifyStatus,
    ticketCode: updated.ticketCode,
    usedAt,
    event: {
      title: updated.event.title,
      dateISO: updated.event.dateISO,
      venue: updated.event.venue,
    },
  });
}

export async function getTicketQr(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code.trim().toUpperCase() : "";

  if (!code) {
    return res.status(400).json({
      error: "code query parameter is required",
    });
  }

  const pngBuffer = await generateTicketQrPngBuffer(code);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store");
  return res.send(pngBuffer);
}

export async function bulkCreateTickets(req: Request, res: Response) {
  const eventSlug = typeof req.body?.eventSlug === "string" ? req.body.eventSlug.trim() : "";
  const count = typeof req.body?.count === "number" ? req.body.count : Number(req.body?.count);
  const pin = req.body?.pin;

  if (!eventSlug) {
    return res.status(400).json({ error: "eventSlug is required" });
  }

  if (!Number.isInteger(count) || count <= 0) {
    return res.status(400).json({ error: "count must be a positive integer" });
  }

  if (count > 500) {
    return res.status(400).json({ error: "count must be less than or equal to 500" });
  }

  if (!isStaffPinValid(pin)) {
    return res.status(401).json({ error: "Invalid staff pin" });
  }

  const event = await db.event.findUnique({ where: { slug: eventSlug } });

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const result = await db.$transaction(async (tx) => {
    const existingTicketCount = await tx.ticket.count({ where: { eventId: event.id } });
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

    const ticketCodes: string[] = [];

    for (let index = 0; index < count; index += 1) {
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
        eventId: event.id,
        orderId: null,
        ticketCode,
        status: TicketStatus.VALID,
      })),
    });

    return ticketCodes;
  });

  return res.status(201).json({
    tickets: result.map((ticketCode) => ({
      ticketCode,
      qrUrl: buildTicketScanUrl(ticketCode),
    })),
  });
}

export async function exportTicketsCsv(req: Request, res: Response) {
  const eventSlug = typeof req.query.eventSlug === "string" ? req.query.eventSlug.trim() : "";
  const pin = req.query.pin;

  if (!eventSlug) {
    return res.status(400).json({ error: "eventSlug query parameter is required" });
  }

  if (!isStaffPinValid(pin)) {
    return res.status(401).json({ error: "Invalid staff pin" });
  }

  const event = await db.event.findUnique({ where: { slug: eventSlug } });

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const tickets = await db.ticket.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    select: { ticketCode: true },
  });

  const header = "ticketCode,qrUrl";
  const rows = tickets.map(({ ticketCode }) => {
    const qrUrl = buildTicketScanUrl(ticketCode);
    return `${csvEscape(ticketCode)},${csvEscape(qrUrl)}`;
  });
  const csv = [header, ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${event.slug}-tickets.csv"`);
  return res.send(csv);
}