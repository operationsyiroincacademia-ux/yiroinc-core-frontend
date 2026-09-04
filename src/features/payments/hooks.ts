import { useQuery } from "@tanstack/react-query";

import { fetchPayment, fetchPayments } from "./api";

export const PAYMENTS_KEY = ["payments"];
export const PAYMENT_KEY = ["payment"];

export function usePayments(page = 1, perPage = 20) {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, page, perPage],
    queryFn: () => fetchPayments({ page, perPage }),
    retry: false,
  });
}

export function usePayment(id: string | number | undefined) {
  return useQuery({
    queryKey: [...PAYMENT_KEY, String(id)],
    queryFn: () => fetchPayment(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
