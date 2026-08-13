import { useQuery } from "@tanstack/react-query";

import { fetchPayment, fetchPayments } from "./api";

export function usePayments(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["payments", page, perPage],
    queryFn: () => fetchPayments({ page, perPage }),
    retry: false,
  });
}

export function usePayment(id: string | number | undefined) {
  return useQuery({
    queryKey: ["payment", String(id)],
    queryFn: () => fetchPayment(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
