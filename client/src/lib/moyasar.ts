import { api } from "@shared/routes";
import { z } from "zod";

type CardDetails = {
  cvv: string;
  expiry: string;
  name: string;
  number: string;
};

type JsonError = {
  message?: string;
};

type MoyasarTokenResponse = {
  id?: string;
  message?: string | null;
  status?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as (T & JsonError) | null;

  if (!res.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as T;
}

export async function fetchMoyasarConfig() {
  const res = await fetch(api.payments.moyasar.config.path, {
    credentials: "include",
  });

  return parseJson<{ publishableKey: string }>(res);
}

export async function createMoyasarCardToken(publishableKey: string, cardDetails: CardDetails) {
  const [month = "", year = ""] = cardDetails.expiry.split("/");
  const res = await fetch("https://api.moyasar.com/v1/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cvc: cardDetails.cvv.trim(),
      month: month.trim(),
      name: cardDetails.name.trim(),
      number: cardDetails.number.replace(/\s/g, ""),
      publishable_api_key: publishableKey,
      save_only: true,
      year: year.trim(),
    }),
  });

  const payload = await parseJson<MoyasarTokenResponse>(res);
  if (!payload.id) {
    throw new Error(payload.message || "Failed to tokenize card");
  }

  return {
    tokenId: payload.id,
  };
}

export async function createBackendMoyasarPayment(input: z.infer<typeof api.payments.moyasar.create.input>) {
  const res = await fetch(api.payments.moyasar.create.path, {
    method: api.payments.moyasar.create.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    credentials: "include",
  });

  return parseJson<{
    checkoutSessionId: number;
    paymentId: string;
    paymentStatus: "pending" | "paid" | "failed" | "unpaid";
    transactionUrl: string;
  }>(res);
}

type VerifyBackendMoyasarPaymentInput = z.infer<typeof api.payments.moyasar.verify.input>;
type VerifyBackendMoyasarPaymentResponse = {
  checkoutSessionId: number | null;
  moyasarStatus: string;
  orderId: number | null;
  orderNo: string | null;
  paymentId: string;
  paymentStatus: "pending" | "paid" | "failed" | "unpaid";
};

const inflightPaymentVerificationRequests = new Map<string, Promise<VerifyBackendMoyasarPaymentResponse>>();

function buildVerifyPaymentRequestKey(input: VerifyBackendMoyasarPaymentInput) {
  return input.paymentId.trim();
}

async function requestBackendMoyasarPaymentVerification(input: VerifyBackendMoyasarPaymentInput) {
  const res = await fetch(api.payments.moyasar.verify.path, {
    method: api.payments.moyasar.verify.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    credentials: "include",
  });

  return parseJson<VerifyBackendMoyasarPaymentResponse>(res);
}

export async function verifyBackendMoyasarPayment(input: VerifyBackendMoyasarPaymentInput) {
  return requestBackendMoyasarPaymentVerification(input);
}

export async function verifyBackendMoyasarPaymentOnce(input: VerifyBackendMoyasarPaymentInput) {
  const requestKey = buildVerifyPaymentRequestKey(input);
  const existingRequest = inflightPaymentVerificationRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = requestBackendMoyasarPaymentVerification(input);
  inflightPaymentVerificationRequests.set(requestKey, requestPromise);

  void requestPromise
    .finally(() => {
      if (inflightPaymentVerificationRequests.get(requestKey) === requestPromise) {
        inflightPaymentVerificationRequests.delete(requestKey);
      }
    })
    .catch(() => undefined);

  return requestPromise;
}
