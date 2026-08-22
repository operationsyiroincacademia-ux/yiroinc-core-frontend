import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  completeConsultingRequest,
  completeTutorRequest,
  createAdminTutor,
  createAdminResource,
  dispatchOrder,
  fetchAdminDashboard,
  fetchAdminConsultingRequest,
  fetchAdminConsultingRequests,
  fetchAdminOrder,
  fetchAdminOrders,
  fetchAdminPayment,
  fetchAdminPayments,
  fetchAdminProcurement,
  fetchAdminProcurements,
  fetchAdminResource,
  fetchAdminResources,
  fetchAdminUser,
  fetchAdminUsers,
  fetchAdminTutor,
  fetchAdminTutorRequest,
  fetchAdminTutorRequests,
  fetchAdminTutors,
  fulfilOrder,
  matchTutorRequest,
  markProcurementDelivered,
  removeAdminResource,
  rejectPayment,
  startConsultingRequest,
  startTutorRequest,
  updateOrderStatus,
  updateAdminTutor,
  updateAdminResource,
  uploadAdminResourceFile,
  verifyPayment,
  type AdminResourceInput,
  type AdminResourcesParams,
  type AdminUsersParams,
  type AdminTutorInput,
  type AdminTutorsParams,
  type AdminOrderStatus,
  type AdminPaymentsParams,
  type AdminRequestKind,
  type AdminRequestsParams,
} from "./api";

export const ADMIN_DASHBOARD_KEY = ["admin", "dashboard"];
export const ADMIN_PAYMENTS_KEY = ["admin", "payments"];
export const ADMIN_PAYMENT_KEY = ["admin", "payment"];
export const ADMIN_ORDERS_KEY = ["admin", "orders"];
export const ADMIN_ORDER_KEY = ["admin", "order"];
export const ADMIN_REQUESTS_KEY = ["admin", "requests"];
export const ADMIN_REQUEST_KEY = ["admin", "request"];
export const ADMIN_TUTORS_KEY = ["admin", "tutors"];
export const ADMIN_TUTOR_KEY = ["admin", "tutor"];
export const ADMIN_RESOURCES_KEY = ["admin", "resources"];
export const ADMIN_RESOURCE_KEY = ["admin", "resource"];
export const ADMIN_USERS_KEY = ["admin", "users"];
export const ADMIN_USER_KEY = ["admin", "user"];

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEY,
    queryFn: fetchAdminDashboard,
    retry: false,
  });
}

export function useAdminPayments(params: AdminPaymentsParams) {
  return useQuery({
    queryKey: [...ADMIN_PAYMENTS_KEY, params],
    queryFn: () => fetchAdminPayments(params),
    retry: false,
  });
}

export function useAdminPayment(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_PAYMENT_KEY, String(id)],
    queryFn: () => fetchAdminPayment(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminOrders(params: {
  status?: AdminOrderStatus;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: [...ADMIN_ORDERS_KEY, params],
    queryFn: () => fetchAdminOrders(params),
    retry: false,
  });
}

export function useAdminOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_ORDER_KEY, String(id)],
    queryFn: () => fetchAdminOrder(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminTutorRequests(params: AdminRequestsParams) {
  return useQuery({
    queryKey: [...ADMIN_REQUESTS_KEY, "tutor", params],
    queryFn: () => fetchAdminTutorRequests(params),
    retry: false,
  });
}

export function useAdminConsultingRequests(params: AdminRequestsParams) {
  return useQuery({
    queryKey: [...ADMIN_REQUESTS_KEY, "consulting", params],
    queryFn: () => fetchAdminConsultingRequests(params),
    retry: false,
  });
}

export function useAdminProcurements(params: AdminRequestsParams) {
  return useQuery({
    queryKey: [...ADMIN_REQUESTS_KEY, "procurement", params],
    queryFn: () => fetchAdminProcurements(params),
    retry: false,
  });
}

export function useAdminTutorRequest(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_REQUEST_KEY, "tutor", String(id)],
    queryFn: () => fetchAdminTutorRequest(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminTutors(params: AdminTutorsParams, enabled = true) {
  return useQuery({
    queryKey: [...ADMIN_TUTORS_KEY, params],
    queryFn: () => fetchAdminTutors(params),
    enabled,
    retry: false,
  });
}

export function useAdminResources(params: AdminResourcesParams) {
  return useQuery({
    queryKey: [...ADMIN_RESOURCES_KEY, params],
    queryFn: () => fetchAdminResources(params),
    retry: false,
  });
}

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, params],
    queryFn: () => fetchAdminUsers(params),
    retry: false,
  });
}

export function useAdminUser(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_USER_KEY, String(id)],
    queryFn: () => fetchAdminUser(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminResource(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_RESOURCE_KEY, String(id)],
    queryFn: () => fetchAdminResource(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminTutor(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_TUTOR_KEY, String(id)],
    queryFn: () => fetchAdminTutor(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminConsultingRequest(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_REQUEST_KEY, "consulting", String(id)],
    queryFn: () => fetchAdminConsultingRequest(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

export function useAdminProcurement(id: string | number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_REQUEST_KEY, "procurement", String(id)],
    queryFn: () => fetchAdminProcurement(id!),
    enabled: id !== undefined && id !== "",
    retry: false,
  });
}

function invalidateAdminPaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_PAYMENTS_KEY });
  void queryClient.invalidateQueries({ queryKey: [...ADMIN_PAYMENT_KEY, String(id)] });
}

function invalidateAdminOrderPaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  paymentId: string | number,
  orderId: string | number,
) {
  invalidateAdminPaymentQueries(queryClient, paymentId);
  void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
  void queryClient.invalidateQueries({ queryKey: [...ADMIN_ORDER_KEY, String(orderId)] });
}

export function useVerifyAdminPayment(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => verifyPayment(id),
    onSuccess: () => invalidateAdminPaymentQueries(queryClient, id),
  });
}

export function useRejectAdminPayment(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rejectionReason: string) => rejectPayment(id, rejectionReason),
    onSuccess: () => invalidateAdminPaymentQueries(queryClient, id),
  });
}

export function useVerifyAdminOrderPayment(paymentId: string | number, orderId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => verifyPayment(paymentId),
    onSuccess: () => invalidateAdminOrderPaymentQueries(queryClient, paymentId, orderId),
  });
}

export function useRejectAdminOrderPayment(paymentId: string | number, orderId: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rejectionReason: string) => rejectPayment(paymentId, rejectionReason),
    onSuccess: () => invalidateAdminOrderPaymentQueries(queryClient, paymentId, orderId),
  });
}

function invalidateAdminOrderQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY });
  void queryClient.invalidateQueries({ queryKey: [...ADMIN_ORDER_KEY, String(id)] });
  void queryClient.invalidateQueries({ queryKey: ["orders"] });
  void queryClient.invalidateQueries({ queryKey: ["order", String(id)] });
}

export function useUpdateAdminOrderStatus(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => updateOrderStatus(id, status),
    onSuccess: () => invalidateAdminOrderQueries(queryClient, id),
  });
}

export function useDispatchAdminOrder(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => dispatchOrder(id),
    onSuccess: () => invalidateAdminOrderQueries(queryClient, id),
  });
}

export function useFulfilAdminOrder(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fulfilOrder(id),
    onSuccess: () => invalidateAdminOrderQueries(queryClient, id),
  });
}

function invalidateAdminRequestQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  kind: AdminRequestKind,
  id: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY });
  void queryClient.invalidateQueries({ queryKey: [...ADMIN_REQUESTS_KEY, kind] });
  void queryClient.invalidateQueries({ queryKey: [...ADMIN_REQUEST_KEY, kind, String(id)] });
}

function invalidateAdminTutorQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_TUTORS_KEY });
  if (id !== undefined) {
    void queryClient.invalidateQueries({ queryKey: [...ADMIN_TUTOR_KEY, String(id)] });
  }
}

function invalidateAdminResourceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string | number,
) {
  void queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEY });
  void queryClient.invalidateQueries({ queryKey: ADMIN_RESOURCES_KEY });
  void queryClient.invalidateQueries({ queryKey: ["resources"] });
  void queryClient.invalidateQueries({ queryKey: ["resources", "purchased"] });
  if (id !== undefined) {
    void queryClient.invalidateQueries({ queryKey: [...ADMIN_RESOURCE_KEY, String(id)] });
    void queryClient.invalidateQueries({ queryKey: ["resources", String(id)] });
  }
}

export function useCreateAdminTutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTutorInput) => createAdminTutor(input),
    onSuccess: () => invalidateAdminTutorQueries(queryClient),
  });
}

export function useUpdateAdminTutor(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminTutorInput) => updateAdminTutor(id, input),
    onSuccess: () => invalidateAdminTutorQueries(queryClient, id),
  });
}

export function useCreateAdminResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminResourceInput) => createAdminResource(input),
    onSuccess: (resource) => invalidateAdminResourceQueries(queryClient, resource?.id),
  });
}

export function useUpdateAdminResource(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminResourceInput) => updateAdminResource(id, input),
    onSuccess: () => invalidateAdminResourceQueries(queryClient, id),
  });
}

export function useRemoveAdminResource(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => removeAdminResource(id),
    onSuccess: () => invalidateAdminResourceQueries(queryClient, id),
  });
}

export function useUploadAdminResourceFile() {
  return useMutation({ mutationFn: uploadAdminResourceFile });
}

export function useMatchAdminTutorRequest(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tutorId: string | number) => matchTutorRequest(id, tutorId),
    onSuccess: () => {
      invalidateAdminRequestQueries(queryClient, "tutor", id);
      void queryClient.invalidateQueries({ queryKey: ADMIN_TUTORS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useStartAdminTutorRequest(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startTutorRequest(id),
    onSuccess: () => invalidateAdminRequestQueries(queryClient, "tutor", id),
  });
}

export function useCompleteAdminTutorRequest(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeTutorRequest(id),
    onSuccess: () => invalidateAdminRequestQueries(queryClient, "tutor", id),
  });
}

export function useStartAdminConsultingRequest(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startConsultingRequest(id),
    onSuccess: () => invalidateAdminRequestQueries(queryClient, "consulting", id),
  });
}

export function useCompleteAdminConsultingRequest(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeConsultingRequest(id),
    onSuccess: () => invalidateAdminRequestQueries(queryClient, "consulting", id),
  });
}

export function useDeliverAdminProcurement(id: string | number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markProcurementDelivered(id),
    onSuccess: () => invalidateAdminRequestQueries(queryClient, "procurement", id),
  });
}
