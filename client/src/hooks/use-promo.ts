import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type PromoQuoteInput = z.infer<typeof api.promos.apply.input>;
type PromoQuoteResponse = z.infer<typeof api.promos.apply.responses[200]>;

function buildPromoQuoteQueryKey(input: PromoQuoteInput | null) {
  return [api.promos.apply.path, input] as const;
}

async function requestPromoQuote(input: PromoQuoteInput): Promise<PromoQuoteResponse> {
  const res = await fetch(api.promos.apply.path, {
    method: api.promos.apply.method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Failed to apply promo code" }));
    throw new Error(err.message || "Failed to apply promo code");
  }

  return await res.json();
}

export function useApplyPromo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestPromoQuote,
    onSuccess: (data, input) => {
      queryClient.setQueryData(
        buildPromoQuoteQueryKey({
          ...input,
          promoCode: data.promoCode,
        }),
        data,
      );
    },
  });
}

export function usePromoQuote(input: PromoQuoteInput | null) {
  return useQuery({
    queryKey: buildPromoQuoteQueryKey(input),
    queryFn: () => requestPromoQuote(input!),
    enabled: Boolean(input?.promoCode && input.items.length > 0),
    retry: false,
  });
}
