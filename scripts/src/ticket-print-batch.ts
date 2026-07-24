import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type BulkCreateResponse = {
  tickets: Array<{
    ticketCode: string;
  }>;
};

type Args = {
  apiBase: string;
  eventSlug: string;
  pin: string;
  count: number;
  output: string;
  template?: string;
  qrSize: number;
  qrTop: number;
  qrLeft: number;
  codeTop: number;
  codeLeft: number;
};

function parseArgValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

function parseNumber(name: string, fallback: number): number {
  const raw = parseArgValue(name);
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function parseArgs(): Args {
  const apiBase = (parseArgValue("apiBase") || "https://celeweevent.com").replace(/\/$/, "");
  const eventSlug = parseArgValue("eventSlug") || "";
  const pin = parseArgValue("pin") || "";
  const count = parseNumber("count", 500);
  const output = parseArgValue("output") || "./tickets-batch.html";
  const template = parseArgValue("template");

  if (!eventSlug) {
    throw new Error("Missing --eventSlug=<slug>");
  }

  if (!pin) {
    throw new Error("Missing --pin=<STAFF_PIN>");
  }

  if (!Number.isInteger(count) || count <= 0 || count > 500) {
    throw new Error("--count must be an integer between 1 and 500");
  }

  return {
    apiBase,
    eventSlug,
    pin,
    count,
    output,
    template,
    qrSize: parseNumber("qrSize", 180),
    qrTop: parseNumber("qrTop", 140),
    qrLeft: parseNumber("qrLeft", 540),
    codeTop: parseNumber("codeTop", 340),
    codeLeft: parseNumber("codeLeft", 540),
  };
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function toBackgroundCssValue(template?: string): Promise<string | null> {
  if (!template) return null;
  if (/^https?:\/\//i.test(template)) {
    return `url('${template.replace(/'/g, "\\'")}')`;
  }

  const fileBuffer = await readFile(template);
  const mimeType = getMimeType(template);
  const base64 = fileBuffer.toString("base64");
  return `url('data:${mimeType};base64,${base64}')`;
}

async function createTickets(args: Args): Promise<string[]> {
  const response = await fetch(`${args.apiBase}/api/tickets/bulk-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventSlug: args.eventSlug,
      count: args.count,
      pin: args.pin,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bulk create failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as BulkCreateResponse;
  if (!payload.tickets || payload.tickets.length === 0) {
    throw new Error("No tickets returned by bulk-create endpoint");
  }

  return payload.tickets.map((t) => t.ticketCode);
}

function buildTicketHtml(code: string, index: number, args: Args, backgroundCss: string | null): string {
  const qrImageUrl = `${args.apiBase}/api/tickets/qr?code=${encodeURIComponent(code)}`;

  const backgroundStyle = backgroundCss
    ? `background-image:${backgroundCss};background-size:cover;background-position:center;`
    : "background:linear-gradient(135deg,#1f1f1f,#3a3a3a);";

  return `
  <section class="ticket-page">
    <div class="ticket" style="${backgroundStyle}">
      <img class="qr" src="${qrImageUrl}" alt="QR ${code}" />
      <div class="code">${code}</div>
      <div class="serial">#${String(index + 1).padStart(4, "0")}</div>
    </div>
  </section>`;
}

function buildDocument(codes: string[], args: Args, backgroundCss: string | null): string {
  const ticketsHtml = codes
    .map((code, index) => buildTicketHtml(code, index, args, backgroundCss))
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ticket Batch (${codes.length})</title>
  <style>
    @page { size: A4; margin: 0; }
    body { margin: 0; font-family: Arial, sans-serif; background: #111; }
    .ticket-page {
      width: 210mm;
      min-height: 297mm;
      display: flex;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      background: #111;
    }
    .ticket {
      position: relative;
      width: 180mm;
      height: 90mm;
      border: 1px solid #333;
      overflow: hidden;
      color: #fff;
    }
    .qr {
      position: absolute;
      width: ${args.qrSize}px;
      height: ${args.qrSize}px;
      left: ${args.qrLeft}px;
      top: ${args.qrTop}px;
      background: #fff;
      padding: 6px;
      box-sizing: border-box;
    }
    .code {
      position: absolute;
      left: ${args.codeLeft}px;
      top: ${args.codeTop}px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.08em;
      background: rgba(0, 0, 0, 0.5);
      padding: 6px 10px;
    }
    .serial {
      position: absolute;
      left: 16px;
      bottom: 12px;
      font-size: 14px;
      background: rgba(0, 0, 0, 0.5);
      padding: 4px 8px;
    }
  </style>
</head>
<body>
${ticketsHtml}
</body>
</html>`;
}

async function main() {
  const args = parseArgs();
  const backgroundCss = await toBackgroundCssValue(args.template);

  console.log(`Creating ${args.count} tickets for event '${args.eventSlug}'...`);
  const codes = await createTickets(args);

  console.log("Building printable HTML...");
  const html = buildDocument(codes, args, backgroundCss);

  await writeFile(args.output, html, "utf8");
  console.log(`Done. File created: ${args.output}`);
  console.log(`Tickets generated: ${codes.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
