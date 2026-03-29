import type { PaymentStatus } from "@shared/schema";

const MOYASAR_API_BASE_URL = "https://api.moyasar.com/v1";

type MoyasarCreatePaymentInput = {
  amount: number;
  callbackUrl: string;
  description: string;
  metadata: Record<string, string>;
  token: string;
};

type MoyasarApiError = {
  message?: string | null;
  type?: string | null;
  errors?: unknown;
};

export type MoyasarPayment = {
  amount: number;
  callback_url?: string | null;
  created_at?: string;
  currency: string;
  description?: string | null;
  id: string;
  metadata?: Record<string, string> | null;
  source?: {
    message?: string | null;
    token?: string;
    transaction_url?: string;
    type?: string;
  } & Record<string, unknown>;
  status: string;
  updated_at?: string;
};

export type MoyasarWebhookEvent = {
  created_at?: string;
  data?: MoyasarPayment;
  id?: string;
  live?: boolean;
  secret_token?: string;
  type?: string;
};

function getBasicAuthHeader(key: string) {
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

function parseKey(key: string | undefined) {
  return key?.trim() || "";
}

function parseMoyasarMode(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "live" || normalized === "test") {
    return normalized;
  }

  return null;
}

function resolveMoyasarMode() {
  const configuredMode = parseMoyasarMode(process.env.MOYASAR_MODE);
  if (configuredMode) {
    return configuredMode;
  }

  const publishableKey = parseKey(process.env.MOYASAR_PUBLISHABLE_KEY);
  const secretKey = parseKey(process.env.MOYASAR_SECRET_KEY);

  const looksLive = publishableKey.startsWith("pk_live_") || secretKey.startsWith("sk_live_");
  return looksLive ? "live" : "test";
}

export function isMoyasarLiveMode() {
  return resolveMoyasarMode() === "live";
}

export function getMoyasarConfigError(): string | null {
  const mode = resolveMoyasarMode();
  const publishableKey = parseKey(process.env.MOYASAR_PUBLISHABLE_KEY);
  const secretKey = parseKey(process.env.MOYASAR_SECRET_KEY);
  const webhookSecret = parseKey(process.env.MOYASAR_WEBHOOK_SECRET);

  if (!publishableKey) return "MOYASAR_PUBLISHABLE_KEY is not configured";
  if (!secretKey) return "MOYASAR_SECRET_KEY is not configured";
  if (!webhookSecret) return "MOYASAR_WEBHOOK_SECRET is not configured";
  if (mode === "live") {
    if (!publishableKey.startsWith("pk_live_")) return "MOYASAR_PUBLISHABLE_KEY must be a live key when MOYASAR_MODE=live";
    if (!secretKey.startsWith("sk_live_")) return "MOYASAR_SECRET_KEY must be a live key when MOYASAR_MODE=live";
  } else {
    if (!publishableKey.startsWith("pk_test_")) return "MOYASAR_PUBLISHABLE_KEY must be a test key when MOYASAR_MODE=test";
    if (!secretKey.startsWith("sk_test_")) return "MOYASAR_SECRET_KEY must be a test key when MOYASAR_MODE=test";
  }

  return null;
}

export function getMoyasarPublishableKey(): string {
  return parseKey(process.env.MOYASAR_PUBLISHABLE_KEY);
}

export function getMoyasarWebhookSecret(): string {
  return parseKey(process.env.MOYASAR_WEBHOOK_SECRET);
}

async function parseMoyasarJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Moyasar returned a non-JSON response with status ${res.status}`);
    }
  }

  if (!res.ok) {
    const errorPayload = payload as MoyasarApiError | null;
    throw new Error(errorPayload?.message || `Moyasar request failed with status ${res.status}`);
  }

  return payload as T;
}

async function moyasarRequest<T>(path: string, init: RequestInit): Promise<T> {
  const secretKey = parseKey(process.env.MOYASAR_SECRET_KEY);
  const response = await fetch(`${MOYASAR_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: getBasicAuthHeader(secretKey),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  return parseMoyasarJson<T>(response);
}

export async function createMoyasarPayment(input: MoyasarCreatePaymentInput): Promise<MoyasarPayment> {
  return moyasarRequest<MoyasarPayment>("/payments", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      callback_url: input.callbackUrl,
      currency: "SAR",
      description: input.description,
      metadata: input.metadata,
      source: {
        type: "token",
        token: input.token,
      },
    }),
  });
}

export async function fetchMoyasarPayment(paymentId: string): Promise<MoyasarPayment> {
  return moyasarRequest<MoyasarPayment>(`/payments/${paymentId}`, {
    method: "GET",
  });
}

export function mapMoyasarStatusToPaymentStatus(status: string | undefined | null): PaymentStatus {
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "captured":
      return "paid";
    case "initiated":
    case "authorized":
    case "verified":
      return "pending";
    case "failed":
    case "voided":
    case "refunded":
    default:
      return "failed";
  }
}
