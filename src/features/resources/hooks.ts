import { useQuery } from "@tanstack/react-query";

import { fetchResource, fetchResources } from "./api";

export const RESOURCES_KEY = ["resources"];

export function useResources() {
  return useQuery({
    queryKey: RESOURCES_KEY,
    queryFn: fetchResources,
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
