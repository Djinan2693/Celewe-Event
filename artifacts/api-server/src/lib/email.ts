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

export interface TicketInfo {
  ticketCode: string;
  qrUrl: string;
  seatIndex: number;
}

export interface TicketEmailData {
  to: string;
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  totalAmount: number;
  currency: string;
  tickets: TicketInfo[];
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function renderTicketBlock(ticket: TicketInfo, total: number, eventTitle: string): string {
  const perTicketLabel = total > 1 ? `Ticket ${ticket.seatIndex} of ${total}` : "Your Ticket";
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1012;border:1px solid rgba(151,12,16,0.4);margin-bottom:24px;">
      <tr>
        <td style="padding:28px 32px 0;">
          <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(255,255,255,0.35);font-family:'Work Sans',Arial,sans-serif;">${perTicketLabel}</p>
          <p style="margin:0;font-family:'Lexend',Arial,sans-serif;font-size:22px;font-weight:600;color:#ffffff;">${eventTitle}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);font-family:'Work Sans',Arial,sans-serif;">Ticket Code</span>
              </td>
              <td align="right" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                <span style="font-family:'Lexend',Arial,sans-serif;font-size:18px;font-weight:600;color:#970C10;letter-spacing:0.12em;">${ticket.ticketCode}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding:28px 32px 32px;">
          <p style="margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;color:rgba(255,255,255,0.35);font-family:'Work Sans',Arial,sans-serif;">Scan at entrance</p>
          <img
            src="${ticket.qrUrl}"
            width="300"
            height="300"
            alt="QR Code ${ticket.ticketCode}"
            style="display:block;margin:0 auto;border:1px solid rgba(151,12,16,0.35);padding:12px;background:#1a1012;"
          />
        </td>
      </tr>
    </table>`;
}

function buildTicketEmailHtml(data: TicketEmailData): string {
  const amountFormatted = formatCurrency(data.totalAmount, data.currency);
  const ticketBlocks = data.tickets
    .map((t) => renderTicketBlock(t, data.tickets.length, data.eventTitle))
    .join("");

  const ticketLabel = data.tickets.length === 1 ? "ticket is" : "tickets are";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Ticket${data.tickets.length > 1 ? "s" : ""} — ${data.eventTitle}</title>
</head>
<body style="margin:0;padding:0;background:#1a1012;font-family:'Work Sans',Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1012;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Wrapper -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#2D2021;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1012;padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(151,12,16,0.3);">
              <p style="margin:0;font-family:'Lexend',Arial,sans-serif;font-size:20px;font-weight:600;color:#ffffff;letter-spacing:0.18em;text-transform:uppercase;">
                CÉLÉWÉ <span style="color:#970C10;">EVENTS</span>
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:44px 40px 0;">
              <h1 style="margin:0 0 14px;font-family:'Lexend',Arial,sans-serif;font-size:26px;font-weight:300;color:#ffffff;line-height:1.35;">
                Your ${ticketLabel} confirmed,<br />${data.customerName}.
              </h1>
              <p style="margin:0 0 36px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
                Payment received and verified. Your exclusive access to
                <strong style="color:#ffffff;">${data.eventTitle}</strong> is secured.
                Present the QR code${data.tickets.length > 1 ? "s" : ""} at the entrance for seamless check-in.
              </p>
            </td>
          </tr>

          <!-- Event Summary -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.07);">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Date</span>
                  </td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:14px;color:rgba(255,255,255,0.9);">${data.eventDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Venue</span>
                  </td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:14px;color:rgba(255,255,255,0.9);">${data.eventVenue}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Tickets</span>
                  </td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);">
                    <span style="font-size:14px;color:rgba(255,255,255,0.9);">${data.tickets.length}x</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);">Total Paid</span>
                  </td>
                  <td align="right" style="padding:12px 0;">
                    <span style="font-family:'Lexend',Arial,sans-serif;font-size:16px;font-weight:600;color:#970C10;">${amountFormatted}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section label -->
          <tr>
            <td style="padding:0 40px 20px;">
              <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:rgba(255,255,255,0.3);">
                — Your ticket${data.tickets.length > 1 ? "s are" : " is"} attached below —
              </p>
            </td>
          </tr>

          <!-- Ticket blocks -->
          <tr>
            <td style="padding:0 40px 32px;">
              ${ticketBlocks}
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding:0 40px 44px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(151,12,16,0.1);border-left:3px solid #970C10;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:rgba(255,255,255,0.65);font-size:13px;line-height:1.65;">
                      Ticket${data.tickets.length > 1 ? "s are" : " is"} strictly non-transferable and non-refundable.
                      Present the QR code${data.tickets.length > 1 ? "s" : ""} or ticket code${data.tickets.length > 1 ? "s" : ""} at the entrance.
                      Doors open 30 minutes before the event.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1012;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.07);">
              <p style="margin:0 0 6px;font-family:'Lexend',Arial,sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.35);letter-spacing:0.15em;">CÉLÉWÉ EVENTS</p>
              <p style="margin:0;color:rgba(255,255,255,0.2);font-size:12px;line-height:1.8;">
                Manila's Premier VIP Experience Agency<br />
                <a href="https://celeweevent.com" style="color:rgba(151,12,16,0.7);text-decoration:none;">celeweevent.com</a>
                &nbsp;·&nbsp; Crafting Moments that Matter
              </p>
            </td>
          </tr>

        </table>
        <!-- /Wrapper -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTicketEmail(data: TicketEmailData): Promise<boolean> {
  const client = getResend();
  if (!client) {
    logger.warn({ to: data.to }, "Email skipped — RESEND_API_KEY not configured");
    return false;
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "tickets@celeweevent.com";
    const ticketPlural = data.tickets.length > 1 ? "Tickets" : "Ticket";
    const { error } = await client.emails.send({
      from: `Céléwé Events <${fromEmail}>`,
      to: [data.to],
      subject: `Your ${ticketPlural} — ${data.eventTitle} | Céléwé Events`,
      html: buildTicketEmailHtml(data),
    });

    if (error) {
      logger.error({ error }, "Failed to send ticket email via Resend");
      return false;
    }

    logger.info(
      { to: data.to, ticketCount: data.tickets.length },
      "Ticket email sent successfully",
    );
    return true;
  } catch (err) {
    logger.error({ err }, "Unexpected error sending ticket email");
    return false;
  }
}
