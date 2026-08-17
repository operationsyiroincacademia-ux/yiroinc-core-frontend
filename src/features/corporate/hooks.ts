import { useQuery } from "@tanstack/react-query";

import {
  fetchConsultingRequest,
  fetchConsultingRequests,
  fetchProcurement,
  fetchProcurements,
} from "./api";

export const CONSULTING_REQUESTS_KEY = ["consulting-requests"];
export const PROCUREMENTS_KEY = ["procurements"];

export function useConsultingRequests(page = 1, perPage = 20, status?: string) {
  return useQuery({
    queryKey: [...CONSULTING_REQUESTS_KEY, page, perPage, status ?? "all"],
    queryFn: () => fetchConsultingRequests({ page, perPage, status }),
    retry: false,
  });
}

export function useConsultingRequest(id: string | number | undefined) {
  return useQuery({
    queryKey: [...CONSULTING_REQUESTS_KEY, "detail", String(id)],
    queryFn: () => fetchConsultingRequest(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useProcurements(page = 1, perPage = 20, status?: string) {
  return useQuery({
    queryKey: [...PROCUREMENTS_KEY, page, perPage, status ?? "all"],
    queryFn: () => fetchProcurements({ page, perPage, status }),
    retry: false,
  });
}

export function useProcurement(id: string | number | undefined) {
  return useQuery({
    queryKey: [...PROCUREMENTS_KEY, "detail", String(id)],
    queryFn: () => fetchProcurement(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
