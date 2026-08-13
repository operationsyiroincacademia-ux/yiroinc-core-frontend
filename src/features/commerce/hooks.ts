import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createOrder,
  createPayment,
  fetchBankAccount,
  fetchOrder,
  fetchProduct,
  fetchProducts,
  uploadProofOfPayment,
} from "./api";

export function useOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: ["order", String(id)],
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
  return useMutation({ mutationFn: createPayment });
}

export function useUploadProof() {
  return useMutation({ mutationFn: uploadProofOfPayment });
}
