import { useQuery } from "@tanstack/react-query";

import { fetchPurchasedResources, fetchResource, fetchResources } from "./api";

export const RESOURCES_KEY = ["resources"];
export const PURCHASED_RESOURCES_KEY = ["resources", "purchased"];

export function useResources(enabled = true) {
  return useQuery({
    queryKey: RESOURCES_KEY,
    queryFn: fetchResources,
    enabled,
    retry: false,
  });
}

export function usePurchasedResources(enabled = true) {
  return useQuery({
    queryKey: PURCHASED_RESOURCES_KEY,
    queryFn: fetchPurchasedResources,
    enabled,
    retry: false,
  });
}

export function useResource(id: string | number | undefined) {
  return useQuery({
    queryKey: [...RESOURCES_KEY, String(id)],
    queryFn: () => fetchResource(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}
