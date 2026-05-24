type PaypalMode = "sandbox" | "live";

type PaypalCreateOrderInput = {
  referenceId: string;
  amountValue: string;
  currencyCode: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
};

export type PaypalCreateOrderResult = {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method: string }>;
};

export type PaypalCaptureOrderResult = {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: { currency_code: string; value: string };
      }>;
    };
  }>;
};

type VerifyWebhookInput = {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  webhookEvent: unknown;
};

function getPaypalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_SECRET?.trim();
  const mode = (process.env.PAYPAL_MODE?.trim() || "sandbox") as PaypalMode;

  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured");
  }

  const baseUrl = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  return { clientId, secret, baseUrl };
}

async function getAccessToken() {
  const { clientId, secret, baseUrl } = getPaypalConfig();
  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get PayPal access token: ${text}`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

export async function createPaypalOrder(input: PaypalCreateOrderInput) {
  const { baseUrl } = getPaypalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: "PAY_NOW",
      },
      purchase_units: [
        {
          reference_id: input.referenceId,
          description: input.description,
          amount: {
            currency_code: input.currencyCode,
            value: input.amountValue,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create PayPal order: ${text}`);
  }

  return (await response.json()) as PaypalCreateOrderResult;
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const { baseUrl } = getPaypalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to capture PayPal order: ${text}`);
  }

  return (await response.json()) as PaypalCaptureOrderResult;
}

export async function verifyPaypalWebhookSignature(input: VerifyWebhookInput) {
  const { baseUrl } = getPaypalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transmission_id: input.transmissionId,
      transmission_time: input.transmissionTime,
      cert_url: input.certUrl,
      auth_algo: input.authAlgo,
      transmission_sig: input.transmissionSig,
      webhook_id: input.webhookId,
      webhook_event: input.webhookEvent,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to verify PayPal webhook signature: ${text}`);
  }

  const payload = (await response.json()) as { verification_status?: string };
  return payload.verification_status === "SUCCESS";
}

export function getApprovalLink(result: PaypalCreateOrderResult) {
  return result.links?.find((link) => link.rel === "approve")?.href ?? null;
}