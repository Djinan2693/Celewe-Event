// Sends a contact-form inquiry to the CÈLÉWÉ inbox via the Resend HTTP API.

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
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

function getInboxEmail() {
  return (
    process.env.CONTACT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "contact@celeweevent.com"
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactEmail(payload: ContactPayload): Promise<boolean> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Contact email not sent.");
    return false;
  }

  const subject = `New contact inquiry from celeweevent.com — ${payload.name}`;

  const text = [
    "New inquiry from the website contact form.",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
      <h2 style="margin:0 0 16px;">New contact inquiry</h2>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px;">
        <tr><td style="padding:6px 12px 6px 0;color:#555;">Name</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.name)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#555;">Email</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.email)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#555;">Phone</td><td style="padding:6px 0;font-weight:700;">${escapeHtml(payload.phone || "Not provided")}</td></tr>
      </table>
      <div style="padding:14px 16px;background:#f7f7f7;border:1px solid #eee;border-radius:8px;white-space:pre-wrap;">${escapeHtml(payload.message)}</div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `CÈLÉWÉ Events <${getFromEmail()}>`,
        to: [getInboxEmail()],
        subject,
        html,
        text,
        reply_to: payload.email,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Failed to send contact email:", body);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error sending contact email:", error);
    return false;
  }
}
