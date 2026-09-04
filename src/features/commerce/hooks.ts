import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DASHBOARD_KEY } from "@/features/dashboard/hooks";
import { ORDER_KEY, ORDERS_KEY } from "@/features/orders/hooks";
import { PAYMENT_KEY, PAYMENTS_KEY } from "@/features/payments/hooks";
import {
  createOrder,
  createPayment,
  fetchBankAccount,
  fetchOrder,
  fetchProduct,
  fetchProducts,
  uploadProofOfPayment,
} from "./api";

type CacheInvalidationInput = {
  orderId?: string | number | null;
  paymentId?: string | number | null;
};

export function invalidateOrderPaymentCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  input: CacheInvalidationInput = {},
) {
  void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
  void queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
  void queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });

  if (input.orderId !== undefined && input.orderId !== null && input.orderId !== "") {
    void queryClient.invalidateQueries({ queryKey: [...ORDER_KEY, String(input.orderId)] });
  }

  if (input.paymentId !== undefined && input.paymentId !== null && input.paymentId !== "") {
    void queryClient.invalidateQueries({ queryKey: [...PAYMENT_KEY, String(input.paymentId)] });
  }
}

export function useOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ORDER_KEY, String(id)],
    queryFn: () => fetchOrder(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}


export function useProducts(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["products", page, perPage],
    queryFn: () => fetchProducts({ page, perPage }),
    retry: false,
  });
}

export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: ["product", String(id)],
    queryFn: () => fetchProduct(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useBankAccount() {
  return useQuery({
    queryKey: ["bank-account"],
    queryFn: fetchBankAccount,
    retry: false,
  });
}

export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: (payment) => {
      invalidateOrderPaymentCaches(queryClient, {
        orderId: payment.order_id,
        paymentId: payment.payment_id,
      });
    },
  });
}

export function useUploadProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProofOfPayment,
    onSuccess: (proof, input) => {
      invalidateOrderPaymentCaches(queryClient, {
        paymentId: proof.related_id || input.paymentId,
      });
    },
  });
}
