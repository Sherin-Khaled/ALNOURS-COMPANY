import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

export function useAddresses() {
  return useQuery({
    queryKey: [api.addresses.list.path],
    queryFn: async () => {
      const res = await fetch(api.addresses.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch addresses");
      return await res.json();
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.addresses.create.input>) => {
      const res = await fetch(api.addresses.create.path, {
        method: api.addresses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create address");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.addresses.list.path] }),
  });
}
