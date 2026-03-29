export type PromoPricing = {
  discountAmount: number;
  promoCode: string | null;
  shippingCost: number;
  subtotal: number;
  total: number;
};

type PromotionRuleBase = {
  firstOrderOnly?: boolean;
  minSubtotal?: number;
  oncePerUser?: boolean;
};

type PromotionRule =
  | (PromotionRuleBase & { type: "fixed"; amount: number })
  | (PromotionRuleBase & { type: "free_shipping" })
  | (PromotionRuleBase & { type: "percentage"; percentage: number });

const PROMOTION_RULES: Record<string, PromotionRule> = {
  FREESHIP: { type: "free_shipping", minSubtotal: 80, oncePerUser: true },
  SAVE20: { type: "fixed", amount: 20, minSubtotal: 100, oncePerUser: true },
  WELCOME10: { type: "percentage", percentage: 10, oncePerUser: true, firstOrderOnly: true },
};

export function normalizePromoCode(value: string | null | undefined) {
  return value?.trim().toUpperCase() || "";
}

export function getPromotionRule(value: string | null | undefined) {
  const normalizedPromoCode = normalizePromoCode(value);
  if (!normalizedPromoCode) {
    return null;
  }

  return {
    promoCode: normalizedPromoCode,
    rule: PROMOTION_RULES[normalizedPromoCode] || null,
  };
}

export function promotionRequiresAuthenticatedUser(value: string | null | undefined) {
  const resolvedPromotion = getPromotionRule(value);
  if (!resolvedPromotion?.rule) {
    return false;
  }

  return Boolean(resolvedPromotion.rule.oncePerUser || resolvedPromotion.rule.firstOrderOnly);
}

export function assertPromoEligibility(input: {
  hasPlacedOrder?: boolean;
  hasUsedPromo?: boolean;
  promoCode?: string | null;
  subtotal: number;
}) {
  const resolvedPromotion = getPromotionRule(input.promoCode);
  if (!resolvedPromotion?.rule) {
    if (normalizePromoCode(input.promoCode)) {
      throw new Error("Invalid promo code");
    }
    return;
  }

  const { promoCode, rule } = resolvedPromotion;

  if (rule.oncePerUser && input.hasUsedPromo) {
    throw new Error(`${promoCode} has already been used on your account`);
  }

  if (rule.firstOrderOnly && input.hasPlacedOrder) {
    throw new Error(`${promoCode} is only available on your first order`);
  }

  if (typeof rule.minSubtotal === "number" && input.subtotal < rule.minSubtotal) {
    throw new Error(`${promoCode} requires a subtotal of at least ${rule.minSubtotal} SAR`);
  }
}

export function calculatePromoPricing(input: {
  promoCode?: string | null;
  shippingCost: number;
  subtotal: number;
}): PromoPricing {
  const subtotal = Math.max(0, Math.round(input.subtotal));
  const baseShippingCost = Math.max(0, Math.round(input.shippingCost));
  const normalizedPromoCode = normalizePromoCode(input.promoCode);

  if (!normalizedPromoCode) {
    return {
      discountAmount: 0,
      promoCode: null,
      shippingCost: baseShippingCost,
      subtotal,
      total: subtotal + baseShippingCost,
    };
  }

  const promotion = PROMOTION_RULES[normalizedPromoCode];
  if (!promotion) {
    throw new Error("Invalid promo code");
  }

  let discountAmount = 0;
  let shippingCost = baseShippingCost;

  switch (promotion.type) {
    case "percentage":
      discountAmount = Math.min(subtotal, Math.round((subtotal * promotion.percentage) / 100));
      break;
    case "fixed":
      discountAmount = Math.min(subtotal, promotion.amount);
      break;
    case "free_shipping":
      shippingCost = 0;
      break;
  }

  return {
    discountAmount,
    promoCode: normalizedPromoCode,
    shippingCost,
    subtotal,
    total: Math.max(0, subtotal - discountAmount + shippingCost),
  };
}
