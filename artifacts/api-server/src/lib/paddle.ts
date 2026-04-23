import crypto from "crypto";

export function generateTicketCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CE-${part(4)}-${part(4)}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateQrUrl(ticketCode: string, baseUrl: string): string {
  const scanUrl = `${baseUrl}/scan?code=${encodeURIComponent(ticketCode)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(scanUrl)}&bgcolor=2D2021&color=ffffff&margin=20`;
}

export function verifyPaddleWebhook(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string,
): boolean {
  try {
    const parts: Record<string, string> = {};
    for (const part of signatureHeader.split(";")) {
      const [k, ...v] = part.split("=");
      parts[k] = v.join("=");
    }
    const ts = parts["ts"];
    const h1 = parts["h1"];
    if (!ts || !h1) return false;

    const signed = `${ts}:${rawBody.toString("utf8")}`;
    const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(h1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
