import { useQuery } from "@tanstack/react-query";

import { fetchAdminDashboard } from "./api";

export const ADMIN_DASHBOARD_KEY = ["admin", "dashboard"];

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEY,
    queryFn: fetchAdminDashboard,
    retry: false,
  });
}
