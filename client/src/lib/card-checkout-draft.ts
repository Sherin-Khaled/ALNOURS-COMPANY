type ShippingAddress = {
  city: string;
  country: string;
  email: string;
  fullName: string;
  phone: string;
  postalCode?: string;
  street: string;
};

type CardCheckoutDraft = {
  paymentMethod: "card";
  shippingAddress: ShippingAddress;
};

type CardCheckoutFlash = {
  message: string;
  status: "failed" | "pending";
};

const CARD_CHECKOUT_DRAFT_KEY = "alnours-card-checkout-draft";
const CARD_CHECKOUT_FLASH_KEY = "alnours-card-checkout-flash";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function loadCardCheckoutDraft() {
  return readJson<CardCheckoutDraft>(CARD_CHECKOUT_DRAFT_KEY);
}

export function saveCardCheckoutDraft(draft: CardCheckoutDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CARD_CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function clearCardCheckoutDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CARD_CHECKOUT_DRAFT_KEY);
}

export function saveCardCheckoutFlash(flash: CardCheckoutFlash) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CARD_CHECKOUT_FLASH_KEY, JSON.stringify(flash));
}

export function consumeCardCheckoutFlash() {
  const flash = readJson<CardCheckoutFlash>(CARD_CHECKOUT_FLASH_KEY);
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(CARD_CHECKOUT_FLASH_KEY);
  }
  return flash;
}

export function clearCardCheckoutFlash() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CARD_CHECKOUT_FLASH_KEY);
}
