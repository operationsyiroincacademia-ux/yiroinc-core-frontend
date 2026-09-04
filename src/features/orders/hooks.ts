import { useQuery } from "@tanstack/react-query";

import { fetchOrder, fetchOrders } from "./api";

export const ORDERS_KEY = ["orders"];
export const ORDER_KEY = ["order"];

export function useOrders(page = 1, perPage = 20) {
  return useQuery({
    queryKey: [...ORDERS_KEY, page, perPage],
    queryFn: () => fetchOrders({ page, perPage }),
    retry: false,
  });
}

export function useOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ORDER_KEY, String(id)],
    queryFn: () => fetchOrder(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
