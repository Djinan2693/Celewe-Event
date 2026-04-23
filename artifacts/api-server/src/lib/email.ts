import { Resend } from "resend";
import { logger } from "./logger";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — email sending disabled");
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface TicketEmailData {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketCode: string;
  qrUrl: string;
}

function buildTicketEmailHtml(data: TicketEmailData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Ticket — ${data.eventTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&family=Work+Sans:wght@300;400;500&display=swap');
    body { margin: 0; padding: 0; background: #1a1012; font-family: 'Work Sans', sans-serif; color: #ffffff; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #2D2021; }
    .header { background: #1a1012; padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(151,12,16,0.3); }
    .logo { font-family: 'Lexend', sans-serif; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: 0.15em; text-transform: uppercase; }
    .logo span { color: #970C10; }
    .body { padding: 48px 40px; }
    .greeting { font-family: 'Lexend', sans-serif; font-size: 28px; font-weight: 300; color: #ffffff; margin-bottom: 12px; line-height: 1.3; }
    .sub { color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 40px; }
    .ticket { background: #1a1012; border: 1px solid rgba(151,12,16,0.4); padding: 32px; margin: 0 0 40px; }
    .event-name { font-family: 'Lexend', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff; margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .detail-label { color: rgba(255,255,255,0.45); font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
    .detail-value { color: rgba(255,255,255,0.9); font-size: 14px; text-align: right; }
    .ticket-code-block { text-align: center; padding: 24px 0 8px; }
    .ticket-code-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.35); margin-bottom: 10px; }
    .ticket-code { font-family: 'Lexend', sans-serif; font-size: 28px; font-weight: 600; color: #970C10; letter-spacing: 0.12em; }
    .qr-block { text-align: center; padding: 24px 0; }
    .qr-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
    .qr-img { border: 1px solid rgba(151,12,16,0.3); padding: 12px; background: #1a1012; }
    .note { background: rgba(151,12,16,0.1); border-left: 3px solid #970C10; padding: 16px 20px; color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.6; margin-bottom: 40px; }
    .footer { background: #1a1012; padding: 28px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
    .footer-text { color: rgba(255,255,255,0.25); font-size: 12px; line-height: 1.8; }
    .footer-brand { font-family: 'Lexend', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 0.15em; margin-bottom: 8px; }
    .divider { border: none; border-top: 1px solid rgba(151,12,16,0.25); margin: 32px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">CÉLÉWÉ <span>EVENTS</span></div>
    </div>

    <div class="body">
      <h1 class="greeting">Your ticket is confirmed,<br>${data.customerName}.</h1>
      <p class="sub">
        Payment received and verified. Your exclusive access to <strong style="color:#fff">${data.eventTitle}</strong> is secured.<br>
        Present this QR code at the entrance for seamless check-in.
      </p>

      <div class="ticket">
        <div class="event-name">${data.eventTitle}</div>

        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${data.eventDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Venue</span>
          <span class="detail-value">${data.eventVenue}</span>
        </div>
        <div class="detail-row" style="border:none">
          <span class="detail-label">Guest</span>
          <span class="detail-value">${data.customerName}</span>
        </div>

        <hr class="divider" />

        <div class="ticket-code-block">
          <div class="ticket-code-label">Ticket Code</div>
          <div class="ticket-code">${data.ticketCode}</div>
        </div>

        <div class="qr-block">
          <div class="qr-label">Scan at entrance</div>
          <img class="qr-img" src="${data.qrUrl}" width="200" height="200" alt="QR Code ${data.ticketCode}" />
        </div>
      </div>

      <div class="note">
        This ticket is strictly non-transferable and non-refundable. Present the QR code or your ticket code at the entrance. Doors open 30 minutes before the event starts.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CÉLÉWÉ EVENTS</div>
      <div class="footer-text">
        Manila's Premier VIP Experience Agency<br>
        celeweevent.com &nbsp;·&nbsp; Crafting Moments that Matter
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendTicketEmail(data: TicketEmailData): Promise<boolean> {
  const client = getResend();
  if (!client) return false;

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "tickets@celeweevent.com";
    const { error } = await client.emails.send({
      from: `Céléwé Events <${fromEmail}>`,
      to: [data.to],
      subject: `Your Ticket — ${data.eventTitle} | Céléwé Events`,
      html: buildTicketEmailHtml(data),
    });

    if (error) {
      logger.error({ error }, "Failed to send ticket email");
      return false;
    }

    logger.info({ to: data.to, ticketCode: data.ticketCode }, "Ticket email sent");
    return true;
  } catch (err) {
    logger.error({ err }, "Error sending ticket email");
    return false;
  }
}
