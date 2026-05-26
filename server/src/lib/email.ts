import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateTicketQrPngBuffer } from "./qr";

type TicketEmailItem = {
  ticketCode: string;
  qrImageUrl?: string;
  scanUrl?: string;
  qrUrl?: string;
};

type TicketEmailPayload = {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  totalAmountPhp: number;
  tickets: TicketEmailItem[];
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "tickets@celeweevent.com";
}

function formatPhp(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function buildTicketsPdfBase64(payload: TicketEmailPayload) {
  const pdf = await PDFDocument.create();
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

  const pageWidth = 1600;
  const pageHeight = 768;

  for (const ticket of payload.tickets) {
    const page = pdf.addPage([pageWidth, pageHeight]);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.1, 0.06, 0.07),
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width: 320,
      height: pageHeight,
      color: rgb(0.73, 0.06, 0.09),
    });

    page.drawRectangle({
      x: 320,
      y: 0,
      width: 2,
      height: pageHeight,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText("DJ MULUKUKU", {
      x: 420,
      y: 540,
      size: 112,
      font: fontBold,
      color: rgb(0.95, 0.95, 0.92),
    });

    page.drawText("MANILA", {
      x: 420,
      y: 425,
      size: 142,
      font: fontBold,
      color: rgb(0.95, 0.95, 0.92),
    });

    page.drawText(payload.eventTitle.toUpperCase(), {
      x: 420,
      y: 338,
      size: 34,
      font: fontRegular,
      color: rgb(0.93, 0.93, 0.93),
    });

    page.drawText(payload.eventDate.toUpperCase(), {
      x: 1200,
      y: 620,
      size: 44,
      font: fontBold,
      color: rgb(0.93, 0.93, 0.93),
    });

    page.drawText(payload.eventVenue, {
      x: 420,
      y: 90,
      size: 36,
      font: fontBold,
      color: rgb(0.9, 0.9, 0.9),
    });

    const qrPng = await generateTicketQrPngBuffer(ticket.ticketCode);
    const qrImage = await pdf.embedPng(qrPng);
    const qrSize = 245;
    const qrX = 36;
    const qrY = (pageHeight - qrSize) / 2;

    page.drawRectangle({
      x: qrX - 10,
      y: qrY - 10,
      width: qrSize + 20,
      height: qrSize + 20,
      color: rgb(1, 1, 1),
    });

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    page.drawText(ticket.ticketCode, {
      x: 36,
      y: qrY - 48,
      size: 26,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("VALIDATE ON: CELEWEEVENT.COM/SCAN", {
      x: 36,
      y: qrY - 84,
      size: 16,
      font: fontRegular,
      color: rgb(1, 1, 1),
    });
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes).toString("base64");
}

function buildHtml(payload: TicketEmailPayload) {
  const ticketRows = payload.tickets
    .map(
      (ticket, index) => {
        const scanLink = ticket.scanUrl ?? ticket.qrUrl ?? "";

        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">Ticket ${index + 1}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:700;">${ticket.ticketCode}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="${scanLink}">Open scan link</a></td>
        </tr>
      `;
      },
    )
    .join("");

  const qrBlocks = payload.tickets
    .map(
      (ticket, index) => {
        const scanLink = ticket.scanUrl ?? ticket.qrUrl ?? "";
        const imageUrl = ticket.qrImageUrl ?? ticket.qrUrl ?? "";

        return `
        <div style="margin:0 0 20px;padding:14px;border:1px solid #eee;border-radius:8px;">
          <div style="font-weight:700;margin:0 0 10px;">Ticket ${index + 1}: ${ticket.ticketCode}</div>
          <img src="${imageUrl}" alt="QR ${ticket.ticketCode}" style="display:block;width:220px;max-width:100%;height:auto;border:1px solid #ddd;padding:8px;background:#fff;" />
          <div style="margin-top:8px;font-size:12px;color:#666;">If image is blocked, use: <a href="${scanLink}">${scanLink}</a></div>
        </div>
      `;
      },
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#111;">
      <h2 style="margin:0 0 12px;">Payment confirmed, your ticket is ready</h2>
      <p style="margin:0 0 16px;">Hello ${payload.customerName},</p>
      <p style="margin:0 0 16px;">
        We confirmed your PayPal payment for <strong>${payload.eventTitle}</strong>.
      </p>

      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#555;">Event</td><td style="padding:6px 0;font-weight:700;">${payload.eventTitle}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Date</td><td style="padding:6px 0;font-weight:700;">${payload.eventDate}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Venue</td><td style="padding:6px 0;font-weight:700;">${payload.eventVenue}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Total paid</td><td style="padding:6px 0;font-weight:700;">${formatPhp(payload.totalAmountPhp)}</td></tr>
      </table>

      <h3 style="margin:20px 0 8px;">Your ticket${payload.tickets.length > 1 ? "s" : ""}</h3>
      <p style="margin:0 0 10px;color:#444;">A print-ready PDF with QR code${payload.tickets.length > 1 ? "s" : ""} is attached to this email.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:10px 0;border-bottom:1px solid #ccc;">Label</th>
            <th align="left" style="padding:10px 0;border-bottom:1px solid #ccc;">Code</th>
            <th align="left" style="padding:10px 0;border-bottom:1px solid #ccc;">QR</th>
          </tr>
        </thead>
        <tbody>
          ${ticketRows}
        </tbody>
      </table>

      <div style="margin-top:16px;">
        ${qrBlocks}
      </div>

      <p style="margin:20px 0 0;color:#555;">Show your QR code at the entrance.</p>
    </div>
  `;
}

export async function sendTicketEmail(payload: TicketEmailPayload) {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Ticket email not sent.");
    return false;
  }

  const pdfBase64 = await buildTicketsPdfBase64(payload);
  const fileName = `${slugify(payload.eventTitle) || "ticket"}-tickets.pdf`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Celewe Events <${getFromEmail()}>`,
      to: [payload.to],
      subject: `Your ticket${payload.tickets.length > 1 ? "s" : ""} — ${payload.eventTitle}`,
      html: buildHtml(payload),
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed to send ticket email:", text);
    return false;
  }

  return true;
}
