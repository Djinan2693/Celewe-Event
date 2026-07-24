// Composes a branded digital ticket PNG: the event's ticket design image with
// the ticket's QR code (and its human-readable code) laid on top. The QR encodes
// the /scan URL, so scanning it opens the valid/used verification page.

import path from "node:path";
import { existsSync } from "node:fs";
import sharp, { type OverlayOptions } from "sharp";
import { generateTicketQrPngBuffer } from "./qr";

export type TicketLayout = {
  // Absolute or server-relative path to the ticket design image (PNG/JPG).
  templatePath: string;
  // Optional mask rectangle drawn UNDER the QR, to cover baked-in elements
  // (e.g. the barcode + printed price on the stub) with the stub's own color.
  mask: {
    show: boolean;
    top: number;
    left: number;
    width: number;
    height: number;
    color: string;
  };
  qr: {
    top: number;
    left: number;
    size: number;
  };
  // Optional printed ticket code on the design. Set show:false to hide it.
  code: {
    show: boolean;
    top: number;
    left: number;
    fontSize: number;
    color: string;
    // Rotate the code text (degrees). Useful for narrow vertical stubs.
    rotate: number;
  };
};

const ASSETS_DIR = path.resolve(__dirname, "..", "..", "assets");

function num(envKey: string, fallback: number) {
  const raw = process.env[envKey];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function str(envKey: string, fallback: string) {
  return process.env[envKey]?.trim() || fallback;
}

// Per-event ticket layout. Positions are in pixels relative to the design image
// and are overridable via env vars so they can be tuned without code changes.
export function getTicketLayout(eventSlug: string): TicketLayout {
  // Currently one design (Déjà-Vu). Add more entries keyed by slug as needed.
  const templateFile = str("TICKET_TEMPLATE_FILE", "deja-vu-ticket.png");
  const templatePath = path.isAbsolute(templateFile)
    ? templateFile
    : path.join(ASSETS_DIR, templateFile);

  return {
    templatePath,
    mask: {
      show: str("TICKET_MASK_SHOW", "false") === "true",
      top: num("TICKET_MASK_TOP", 0),
      left: num("TICKET_MASK_LEFT", 0),
      width: num("TICKET_MASK_WIDTH", 0),
      height: num("TICKET_MASK_HEIGHT", 0),
      color: str("TICKET_MASK_COLOR", "#efe7ee"),
    },
    qr: {
      top: num("TICKET_QR_TOP", 0),
      left: num("TICKET_QR_LEFT", 0),
      size: num("TICKET_QR_SIZE", 300),
    },
    code: {
      show: str("TICKET_CODE_SHOW", "true") !== "false",
      top: num("TICKET_CODE_TOP", 0),
      left: num("TICKET_CODE_LEFT", 0),
      fontSize: num("TICKET_CODE_FONT_SIZE", 28),
      color: str("TICKET_CODE_COLOR", "#ffffff"),
      rotate: num("TICKET_CODE_ROTATE", 0),
    },
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Returns a PNG buffer of the ticket design with the QR (and code) composited on
 * top. Throws if the template image is missing, so callers can fall back.
 */
export async function composeTicketPng(
  ticketCode: string,
  eventSlug: string,
): Promise<Buffer> {
  const layout = getTicketLayout(eventSlug);

  if (!existsSync(layout.templatePath)) {
    throw new Error(
      `Ticket template not found at ${layout.templatePath}. ` +
        `Add the design image or set TICKET_TEMPLATE_FILE.`,
    );
  }

  const composites: OverlayOptions[] = [];

  // 1) Mask: cover baked-in barcode/price with a solid rectangle (drawn first).
  if (layout.mask.show && layout.mask.width > 0 && layout.mask.height > 0) {
    const maskSvg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(layout.mask.width)}" height="${Math.round(layout.mask.height)}">
         <rect width="100%" height="100%" fill="${layout.mask.color}"/>
       </svg>`,
    );
    composites.push({
      input: maskSvg,
      top: Math.round(layout.mask.top),
      left: Math.round(layout.mask.left),
    });
  }

  // 2) QR code.
  const qrPng = await generateTicketQrPngBuffer(ticketCode);
  const qrResized = await sharp(qrPng)
    .resize(layout.qr.size, layout.qr.size, { fit: "fill" })
    .png()
    .toBuffer();
  composites.push({
    input: qrResized,
    top: Math.round(layout.qr.top),
    left: Math.round(layout.qr.left),
  });

  // 3) Ticket code text (optionally rotated for narrow vertical stubs).
  if (layout.code.show) {
    const text = escapeXml(ticketCode);
    const svgWidth = Math.ceil(text.length * layout.code.fontSize * 0.65);
    const svgHeight = Math.ceil(layout.code.fontSize * 1.6);
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
         <text x="0" y="${layout.code.fontSize}" font-family="'Courier New', monospace"
               font-size="${layout.code.fontSize}" font-weight="700" fill="${layout.code.color}"
               letter-spacing="1">${text}</text>
       </svg>`,
    );

    const codeInput =
      layout.code.rotate !== 0
        ? await sharp(svg)
            .rotate(layout.code.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer()
        : svg;

    composites.push({
      input: codeInput,
      top: Math.round(layout.code.top),
      left: Math.round(layout.code.left),
    });
  }

  return sharp(layout.templatePath).composite(composites).png().toBuffer();
}
