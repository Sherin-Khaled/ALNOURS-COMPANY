import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Product } from "@shared/schema";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch(api.products.list.path);
      if (!res.ok) throw new Error("Failed to fetch products");
      // Trusting backend response for now, fallback to empty array on parse fail
      return await res.json().catch(() => []);
    },
  });
}

export function useProduct(slug: string, locale: "en" | "ar") {
  return useQuery({
    queryKey: [api.products.get.path, slug, locale],
    queryFn: async (): Promise<Product | null> => {
      if (!slug) return null;
      const url = `${buildUrl(api.products.get.path, { slug })}?lang=${locale}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return await res.json();
    },
    enabled: !!slug,
  });
}
