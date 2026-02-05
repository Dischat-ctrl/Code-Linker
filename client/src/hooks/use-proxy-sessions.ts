import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertProxySession, type ProxySession } from "@shared/schema";

export function useProxySessions() {
  return useQuery({
    queryKey: [api.proxy.list.path],
    queryFn: async () => {
      const res = await fetch(api.proxy.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return api.proxy.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProxySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProxySession) => {
      const res = await fetch(api.proxy.create.path, {
        method: api.proxy.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to create session");
      return api.proxy.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.proxy.list.path] }),
  });
}

export function useDeleteProxySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.proxy.delete.path, { id });
      const res = await fetch(url, {
        method: api.proxy.delete.method,
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to delete session");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.proxy.list.path] }),
  });
}
