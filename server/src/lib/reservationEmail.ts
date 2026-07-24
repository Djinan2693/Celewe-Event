// Emails for the manual reservation flow (no payment captured yet, no QR issued).
// Sends an internal notification to the admin and a "reservation received"
// confirmation to the customer via the Resend HTTP API.

const RESERVATION_PHONE = "09771008568";

export type ReservationEmailPayload = {
  orderId: string;
  event: {
    title: string;
    dateLabel: string;
    timeLabel: string;
    venue: string;
    pricePHP: number;
  };
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  quantity: number;
  totalPHP: number;
};

export type ReservationEmailResult = {
  adminSent: boolean;
  customerSent: boolean;
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getFromEmail() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "tickets@celeweevent.com"
  );
}

function getAdminEmail() {
  return (
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.CONTACT_EMAIL?.trim() ||
    "contact@celeweevent.com"
  );
}

function getContactEmail() {
  return process.env.CONTACT_EMAIL?.trim() || "contact@celeweevent.com";
}

function formatPhp(amount: number) {
  return `PHP ${new Intl.NumberFormat("en-PH").format(amount)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY not configured. Email "${params.subject}" to ${params.to} was not sent.`,
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `CÈLÉWÉ Events <${getFromEmail()}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Failed to send email "${params.subject}":`, body);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error sending email "${params.subject}":`, error);
    return false;
  }
}

function buildAdminEmail(payload: ReservationEmailPayload) {
  const { event, buyer, quantity, totalPHP, orderId } = payload;
  const fullName = `${buyer.firstName} ${buyer.lastName}`.trim();

  const subject = `New ${event.title} Ticket Reservation - CÈLÉWÉ Events`;

  const rows: Array<[string, string]> = [
    ["Event", event.title],
    ["Date", event.dateLabel],
    ["Time", event.timeLabel],
    ["Venue", event.venue],
    ["Buyer name", fullName],
    ["Buyer email", buyer.email],
    ["Buyer phone / WhatsApp", buyer.phone],
    ["Quantity", String(quantity)],
    ["Price per ticket", formatPhp(event.pricePHP)],
    ["Total amount", formatPhp(totalPHP)],
    ["Status", "PENDING_PAYMENT"],
    ["Order ID", orderId],
  ];

  const text = [
    "New ticket reservation received.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Action required: Contact the buyer manually with payment instructions.",
    "Once payment is confirmed, generate and send the official QR e-ticket.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
      <h2 style="margin:0 0 16px;">New ticket reservation</h2>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `
        <tr>
          <td style="padding:8px 12px 8px 0;color:#555;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`,
          )
          .join("")}
      </table>
      <div style="margin-top:20px;padding:14px 16px;background:#fff5f5;border:1px solid #f0caca;border-radius:8px;">
        <strong>Action required:</strong> Contact the buyer manually with payment instructions.
        Once payment is confirmed, generate and send the official QR e-ticket.
      </div>
    </div>
  `;

  return { subject, text, html };
}

function buildCustomerEmail(payload: ReservationEmailPayload) {
  const { event, buyer, quantity, totalPHP } = payload;
  const contactEmail = getContactEmail();

  const subject = `${event.title} Reservation Received - CÈLÉWÉ Events`;

  const text = [
    `Hello ${buyer.firstName},`,
    "",
    `Thank you for your reservation for ${event.title} by CÈLÉWÉ Events.`,
    "",
    "We have received your ticket request.",
    "",
    "Reservation details:",
    `Event: ${event.title}`,
    `Date: ${event.dateLabel}`,
    `Time: ${event.timeLabel}`,
    `Venue: ${event.venue}`,
    `Quantity: ${quantity}`,
    `Total amount: ${formatPhp(totalPHP)}`,
    "",
    "Your ticket is not confirmed yet.",
    "Our team will contact you shortly with payment instructions.",
    "",
    "Once your payment is confirmed, your official QR e-ticket will be sent to your email.",
    "",
    "For urgent inquiries, contact us:",
    contactEmail,
    RESERVATION_PHONE,
    "",
    "Thank you,",
    "CÈLÉWÉ Events",
  ].join("\n");

  const detailRows: Array<[string, string]> = [
    ["Event", event.title],
    ["Date", event.dateLabel],
    ["Time", event.timeLabel],
    ["Venue", event.venue],
    ["Quantity", String(quantity)],
    ["Total amount", formatPhp(totalPHP)],
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
      <p style="margin:0 0 16px;">Hello ${escapeHtml(buyer.firstName)},</p>
      <p style="margin:0 0 16px;">
        Thank you for your reservation for <strong>${escapeHtml(event.title)}</strong> by CÈLÉWÉ Events.
      </p>
      <p style="margin:0 0 16px;">We have received your ticket request.</p>

      <h3 style="margin:20px 0 8px;">Reservation details</h3>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        ${detailRows
          .map(
            ([label, value]) => `
        <tr>
          <td style="padding:6px 12px 6px 0;color:#555;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`,
          )
          .join("")}
      </table>

      <div style="margin:16px 0;padding:14px 16px;background:#fff8ec;border:1px solid #f0dcae;border-radius:8px;">
        <strong>Your ticket is not confirmed yet.</strong><br />
        Our team will contact you shortly with payment instructions. Once your payment is
        confirmed, your official QR e-ticket will be sent to your email.
      </div>

      <p style="margin:16px 0 4px;color:#555;">For urgent inquiries, contact us:</p>
      <p style="margin:0 0 16px;">
        <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a><br />
        ${escapeHtml(RESERVATION_PHONE)}
      </p>

      <p style="margin:0;">Thank you,<br />CÈLÉWÉ Events</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendReservationEmails(
  payload: ReservationEmailPayload,
): Promise<ReservationEmailResult> {
  const admin = buildAdminEmail(payload);
  const customer = buildCustomerEmail(payload);

  const [adminSent, customerSent] = await Promise.all([
    sendEmail({
      to: getAdminEmail(),
      subject: admin.subject,
      html: admin.html,
      text: admin.text,
      replyTo: payload.buyer.email,
    }),
    sendEmail({
      to: payload.buyer.email,
      subject: customer.subject,
      html: customer.html,
      text: customer.text,
      replyTo: getContactEmail(),
    }),
  ]);

  return { adminSent, customerSent };
}
