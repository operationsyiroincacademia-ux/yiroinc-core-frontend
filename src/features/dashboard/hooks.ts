import { useQuery } from "@tanstack/react-query";

import { fetchCorporateDashboard, fetchExamDashboard, fetchGeneralDashboard } from "./api";

export const DASHBOARD_KEY = ["dashboard"];

export function useGeneralDashboard() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "general"],
    queryFn: fetchGeneralDashboard,
    retry: false,
  });
}

export function useExamDashboard() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "exam"],
    queryFn: fetchExamDashboard,
    retry: false,
  });
}

export function useCorporateDashboard() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "corporate"],
    queryFn: fetchCorporateDashboard,
    retry: false,
  });
}
