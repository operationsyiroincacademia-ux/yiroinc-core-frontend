import { useQuery } from "@tanstack/react-query";

import { fetchOrder, fetchOrders } from "./api";

export function useOrders(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["orders", page, perPage],
    queryFn: () => fetchOrders({ page, perPage }),
    retry: false,
  });
}

export function useOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: ["order", String(id)],
    queryFn: () => fetchOrder(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
