// Sends the confirmed digital ticket(s) to the buyer after payment is confirmed.
// Each ticket is a branded PNG (event design + QR) shown inline and attached.

const RESERVATION_PHONE = "09771008568";

export type DigitalTicket = {
  ticketCode: string;
  png: Buffer;
};

export type TicketEmailPayload = {
  to: string;
  customerName: string;
  event: {
    title: string;
    dateLabel: string;
    timeLabel: string;
    venue: string;
  };
  totalPHP: number;
  tickets: DigitalTicket[];
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

function slugifyFilename(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "ticket"
  );
}

export async function sendDigitalTicketEmail(
  payload: TicketEmailPayload,
): Promise<boolean> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.warn(
      `RESEND_API_KEY not configured. Ticket email to ${payload.to} was not sent.`,
    );
    return false;
  }

  const eventSlugName = slugifyFilename(payload.event.title);
  const multiple = payload.tickets.length > 1;

  const attachments = payload.tickets.map((ticket, index) => {
    const contentId = `ticket-${index + 1}`;
    return {
      filename: `${eventSlugName}-ticket-${index + 1}-${ticket.ticketCode}.png`,
      content: ticket.png.toString("base64"),
      content_id: contentId,
    };
  });

  const ticketBlocks = payload.tickets
    .map((ticket, index) => {
      const contentId = `ticket-${index + 1}`;
      return `
        <div style="margin:0 0 24px;text-align:center;">
          ${multiple ? `<div style="font-weight:700;margin:0 0 8px;">Ticket ${index + 1} of ${payload.tickets.length}</div>` : ""}
          <img src="cid:${contentId}" alt="Ticket ${escapeHtml(ticket.ticketCode)}"
               style="display:block;width:100%;max-width:420px;margin:0 auto;height:auto;border:1px solid #eee;" />
          <div style="margin-top:6px;font-size:12px;color:#666;">${escapeHtml(ticket.ticketCode)}</div>
        </div>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
      <h2 style="margin:0 0 12px;">Your payment is confirmed — here ${multiple ? "are your tickets" : "is your ticket"}</h2>
      <p style="margin:0 0 16px;">Hello ${escapeHtml(payload.customerName)},</p>
      <p style="margin:0 0 16px;">
        Your reservation for <strong>${escapeHtml(payload.event.title)}</strong> is confirmed.
        ${multiple ? "Your tickets are" : "Your ticket is"} below and attached to this email.
      </p>

      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#555;">Event</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.event.title)}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Date</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.event.dateLabel)}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Time</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.event.timeLabel)}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Venue</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.event.venue)}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Total paid</td><td style="padding:6px 0;font-weight:700;">${formatPhp(payload.totalPHP)}</td></tr>
      </table>

      <h3 style="margin:20px 0 12px;">Your ticket${multiple ? "s" : ""}</h3>
      ${ticketBlocks}

      <p style="margin:16px 0;color:#444;">
        Show the QR code at the entrance — it will be scanned for admission. Each ticket admits one person and can be used once.
      </p>

      <p style="margin:16px 0 4px;color:#555;">Questions?</p>
      <p style="margin:0 0 16px;">
        <a href="mailto:${escapeHtml(getContactEmail())}">${escapeHtml(getContactEmail())}</a><br />
        ${escapeHtml(RESERVATION_PHONE)}
      </p>

      <p style="margin:0;">See you there,<br />CÈLÉWÉ Events</p>
    </div>
  `;

  const text = [
    `Hello ${payload.customerName},`,
    "",
    `Your reservation for ${payload.event.title} is confirmed.`,
    `${multiple ? "Your tickets are" : "Your ticket is"} attached to this email.`,
    "",
    `Event: ${payload.event.title}`,
    `Date: ${payload.event.dateLabel}`,
    `Time: ${payload.event.timeLabel}`,
    `Venue: ${payload.event.venue}`,
    `Total paid: ${formatPhp(payload.totalPHP)}`,
    "",
    `Ticket code${multiple ? "s" : ""}:`,
    ...payload.tickets.map((t) => `- ${t.ticketCode}`),
    "",
    "Show the QR code at the entrance for admission. Each ticket can be used once.",
    "",
    "Questions?",
    getContactEmail(),
    RESERVATION_PHONE,
    "",
    "See you there,",
    "CÈLÉWÉ Events",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `CÈLÉWÉ Events <${getFromEmail()}>`,
        to: [payload.to],
        subject: `Your ticket${multiple ? "s" : ""} — ${payload.event.title}`,
        html,
        text,
        attachments,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Failed to send ticket email:", body);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending ticket email:", error);
    return false;
  }
}
