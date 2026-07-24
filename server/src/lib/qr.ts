import QRCode from "qrcode";

// Base URL the QR opens when scanned. Configurable so it can point to the
// production domain in prod, or to a LAN address (e.g. http://192.168.x.x:4000)
// when testing scanning from a phone against the local dev server.
const PUBLIC_BASE_URL = (
  process.env.SITE_URL?.trim() ||
  process.env.APP_URL?.trim() ||
  "https://www.celeweevent.com"
).replace(/\/$/, "");

const SCAN_BASE_URL =
  process.env.SCAN_BASE_URL?.trim().replace(/\/$/, "") || `${PUBLIC_BASE_URL}/scan`;

export function buildTicketScanUrl(ticketCode: string) {
  const code = ticketCode.trim().toUpperCase();
  return `${SCAN_BASE_URL}?code=${encodeURIComponent(code)}`;
}

export function buildTicketQrImageUrl(ticketCode: string) {
  const code = ticketCode.trim().toUpperCase();
  return `${PUBLIC_BASE_URL}/api/tickets/qr?code=${encodeURIComponent(code)}`;
}

export async function generateTicketQrDataUrl(ticketCode: string) {
  const url = buildTicketScanUrl(ticketCode);

  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    type: "image/png",
  });
}

export async function generateTicketQrPngBuffer(ticketCode: string) {
  const url = buildTicketScanUrl(ticketCode);

  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    type: "png",
  });
}