type TicketEmailItem = {
  ticketCode: string;
  qrUrl: string;
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

function buildHtml(payload: TicketEmailPayload) {
  const ticketRows = payload.tickets
    .map(
      (ticket, index) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">Ticket ${index + 1}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:700;">${ticket.ticketCode}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="${ticket.qrUrl}">Open QR</a></td>
        </tr>
      `,
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
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Failed to send ticket email:", text);
    return false;
  }

  return true;
}
