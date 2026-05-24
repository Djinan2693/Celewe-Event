import QRCode from "qrcode";

const SCAN_BASE_URL = "https://www.celeweevent.com/scan";

export function buildTicketScanUrl(ticketCode: string) {
  const code = ticketCode.trim().toUpperCase();
  return `${SCAN_BASE_URL}?code=${encodeURIComponent(code)}`;
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