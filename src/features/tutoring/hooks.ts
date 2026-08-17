import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTutorRequest,
  fetchTutorRequest,
  fetchTutorRequests,
  type CreateTutorRequestInput,
} from "./api";

export const TUTORING_REQUESTS_KEY = ["tutoring-requests"];

export function useTutorRequests(page = 1, perPage = 20, status?: string) {
  return useQuery({
    queryKey: [...TUTORING_REQUESTS_KEY, page, perPage, status ?? "all"],
    queryFn: () => fetchTutorRequests({ page, perPage, status }),
    retry: false,
  });
}

export function useTutorRequest(id: string | number | undefined) {
  return useQuery({
    queryKey: [...TUTORING_REQUESTS_KEY, "detail", String(id)],
    queryFn: () => fetchTutorRequest(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useCreateTutorRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTutorRequestInput) => createTutorRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TUTORING_REQUESTS_KEY });
    },
  });
}
