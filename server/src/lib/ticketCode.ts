import assert from "node:assert/strict";
import { db } from "./db";

const EVENT_CODE_PREFIXES: Record<string, string> = {
  "french-kiss-night": "FK",
  "dj-mulukuku-manila": "DM",
};

const RANDOM_SUFFIX_LENGTH = 4;
const MAX_GENERATION_ATTEMPTS = 25;

type TicketCodeDeps = {
  countTicketsForEvent: (eventId: string) => Promise<number>;
  ticketCodeExists: (ticketCode: string) => Promise<boolean>;
};

function getEventCodePrefix(eventSlug: string) {
  const prefix = EVENT_CODE_PREFIXES[eventSlug];

  if (!prefix) {
    throw new Error(`Unsupported event slug for ticket code generation: ${eventSlug}`);
  }

  return prefix;
}

function randomUppercaseAlnum(length: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }

  return result;
}

function formatTicketCode(prefix: string, sequenceNumber: number, suffix: string) {
  return `CE-${prefix}-${String(sequenceNumber).padStart(6, "0")}-${suffix}`;
}

export function createTicketCodeGenerator(deps: TicketCodeDeps) {
  return async function generateTicketCode(params: {
    eventId: string;
    eventSlug: string;
    sequenceNumber?: number;
  }) {
    const prefix = getEventCodePrefix(params.eventSlug);
    const sequenceNumber =
      params.sequenceNumber ?? ((await deps.countTicketsForEvent(params.eventId)) + 1);

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const suffix = randomUppercaseAlnum(RANDOM_SUFFIX_LENGTH);
      const ticketCode = formatTicketCode(prefix, sequenceNumber, suffix);
      const alreadyExists = await deps.ticketCodeExists(ticketCode);

      if (!alreadyExists) {
        return ticketCode;
      }
    }

    throw new Error(`Unable to generate a unique ticket code after ${MAX_GENERATION_ATTEMPTS} attempts`);
  };
}

export const generateTicketCode = createTicketCodeGenerator({
  countTicketsForEvent: (eventId) => db.ticket.count({ where: { eventId } }),
  ticketCodeExists: async (ticketCode) => {
    const ticket = await db.ticket.findUnique({ where: { ticketCode } });
    return ticket !== null;
  },
});

export async function runTicketCodeSelfTest() {
  const generatedCodes: string[] = [];
  const generator = createTicketCodeGenerator({
    countTicketsForEvent: async () => 0,
    ticketCodeExists: async (ticketCode) => generatedCodes.includes(ticketCode),
  });

  const ticketCode = await generator({
    eventId: "event_test",
    eventSlug: "french-kiss-night",
  });

  generatedCodes.push(ticketCode);

  assert.match(ticketCode, /^CE-FK-000001-[A-Z0-9]{4}$/);

  return {
    ok: true,
    ticketCode,
  };
}