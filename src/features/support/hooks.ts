import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSupportMessage,
  createSupportTicket,
  fetchSupportTicket,
  fetchSupportTickets,
} from "./api";

export const SUPPORT_TICKETS_KEY = ["support", "tickets"];
export const SUPPORT_TICKET_KEY = ["support", "ticket"];

function invalidateSupportCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
  if (id !== undefined && id !== "") {
    void queryClient.invalidateQueries({ queryKey: [...SUPPORT_TICKET_KEY, String(id)] });
  }
}

export function useSupportTickets() {
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEY,
    queryFn: fetchSupportTickets,
    retry: false,
  });
}

export function useSupportTicket(id: string | number | undefined) {
  return useQuery({
    queryKey: [...SUPPORT_TICKET_KEY, String(id)],
    queryFn: () => fetchSupportTicket(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupportTicket,
    onSuccess: () => {
      invalidateSupportCaches(queryClient);
    },
  });
}

export function useCreateSupportMessage(ticketId: string | number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupportMessage,
    onSuccess: () => {
      invalidateSupportCaches(queryClient, ticketId);
    },
  });
}
