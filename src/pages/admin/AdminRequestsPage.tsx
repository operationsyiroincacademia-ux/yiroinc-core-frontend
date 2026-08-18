import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { formatDate, humaniseStatus } from "@/features/commerce/format";
import {
  useAdminConsultingRequests,
  useAdminProcurements,
  useAdminTutorRequests,
} from "@/features/admin/hooks";
import type { ConsultingRequest, Procurement } from "@/features/corporate/api";
import type { TutorRequest } from "@/features/tutoring/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

type RequestTab = "tutor" | "consulting" | "procurement";

const TABS: { label: string; value: RequestTab }[] = [
  { label: "Tutoring", value: "tutor" },
  { label: "Consulting", value: "consulting" },
  { label: "Procurement", value: "procurement" },
];

const STATUS_FILTERS: Record<RequestTab, { label: string; value: string }[]> = {
  tutor: [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Matched", value: "matched" },
    { label: "In progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ],
  consulting: [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Under review", value: "under_review" },
    { label: "Assigned", value: "assigned" },
    { label: "In progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ],
  procurement: [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Sourcing", value: "sourcing" },
    { label: "Ordered", value: "ordered" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ],
};

const PER_PAGE = 20;

export function AdminRequestsPage() {
  const [tab, setTab] = useState<RequestTab>("tutor");
  const [statusByTab, setStatusByTab] = useState<Record<RequestTab, string>>({
    tutor: "all",
    consulting: "all",
    procurement: "all",
  });
  const [search, setSearch] = useState("");
  const [pageByTab, setPageByTab] = useState<Record<RequestTab, number>>({
    tutor: 1,
    consulting: 1,
    procurement: 1,
  });
  const status = statusByTab[tab];
  const page = pageByTab[tab];

  useEffect(() => {
    setPageByTab((value) => ({ ...value, [tab]: 1 }));
  }, [tab, status, search]);

  const controls = (
    <>
      <div className="mb-4 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={
              item.value === tab
                ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {STATUS_FILTERS[tab].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setStatusByTab((value) => ({ ...value, [tab]: item.value }))}
              className={
                item.value === status
                  ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                  : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests"
            aria-label="Search requests"
            className="h-10 pl-9"
          />
        </div>
      </div>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Requests"
        description="Review tutoring, consulting and procurement requests."
      />
      {controls}
      {tab === "tutor" && (
        <TutorTable
          status={status}
          search={search}
          page={page}
          setPage={(next) => setPageByTab((value) => ({ ...value, tutor: next }))}
        />
      )}
      {tab === "consulting" && (
        <ConsultingTable
          status={status}
          search={search}
          page={page}
          setPage={(next) => setPageByTab((value) => ({ ...value, consulting: next }))}
        />
      )}
      {tab === "procurement" && (
        <ProcurementTable
          status={status}
          search={search}
          page={page}
          setPage={(next) => setPageByTab((value) => ({ ...value, procurement: next }))}
        />
      )}
    </AdminLayout>
  );
}

function TutorTable(props: TableProps) {
  const query = useAdminTutorRequests({ ...props, perPage: PER_PAGE });
  const rows = query.data?.requests ?? [];
  return (
    <RequestTable
      query={query}
      rows={rows}
      page={props.page}
      setPage={props.setPage}
      headings={["Request", "Customer", "Exam", "Level", "Status", "Date", ""]}
      renderRow={(request) => (
        <tr key={String(request.id)} className="transition-colors hover:bg-muted/40">
          <Cell strong>#{request.id}</Cell>
          <Cell>
            <CustomerCell
              record={request as unknown as Record<string, unknown>}
              fallbackId={request.user_id}
            />
          </Cell>
          <Cell>{request.exam_type}</Cell>
          <Cell>{request.exam_level ?? "-"}</Cell>
          <Cell>
            <StatusBadge {...requestStatusBadge(request.status)} />
          </Cell>
          <Cell>{formatDate(request.created_at)}</Cell>
          <ActionCell to="/admin/requests/tutor/$requestId" id={request.id} />
        </tr>
      )}
      renderMobile={(request) => (
        <MobileRow
          key={String(request.id)}
          title={`Tutor request #${request.id}`}
          detail={`${request.exam_type} · ${formatDate(request.created_at)}`}
          badge={requestStatusBadge(request.status)}
          to="/admin/requests/tutor/$requestId"
          id={request.id}
        />
      )}
    />
  );
}

function ConsultingTable(props: TableProps) {
  const query = useAdminConsultingRequests({ ...props, perPage: PER_PAGE });
  const rows = query.data?.requests ?? [];
  return (
    <RequestTable
      query={query}
      rows={rows}
      page={props.page}
      setPage={props.setPage}
      headings={["Request", "Customer", "Service", "Organization", "Status", "Date", ""]}
      renderRow={(request) => (
        <tr key={String(request.id)} className="transition-colors hover:bg-muted/40">
          <Cell strong>#{request.id}</Cell>
          <Cell>
            <CustomerCell
              record={request as unknown as Record<string, unknown>}
              fallbackId={request.user_id}
              fallbackEmail={request.contact_email}
            />
          </Cell>
          <Cell>{request.service_type}</Cell>
          <Cell>{request.organization_name ?? "-"}</Cell>
          <Cell>
            <StatusBadge {...requestStatusBadge(request.status)} />
          </Cell>
          <Cell>{formatDate(request.created_at)}</Cell>
          <ActionCell to="/admin/requests/consulting/$requestId" id={request.id} />
        </tr>
      )}
      renderMobile={(request) => (
        <MobileRow
          key={String(request.id)}
          title={`Consulting request #${request.id}`}
          detail={`${request.service_type} · ${formatDate(request.created_at)}`}
          badge={requestStatusBadge(request.status)}
          to="/admin/requests/consulting/$requestId"
          id={request.id}
        />
      )}
    />
  );
}

function ProcurementTable(props: TableProps) {
  const query = useAdminProcurements({ ...props, perPage: PER_PAGE });
  const rows = query.data?.procurements ?? [];
  return (
    <RequestTable
      query={query}
      rows={rows}
      page={props.page}
      setPage={props.setPage}
      headings={["Reference", "Customer", "Order", "Supplier", "Status", "Date", ""]}
      renderRow={(request) => (
        <tr key={String(request.id)} className="transition-colors hover:bg-muted/40">
          <Cell strong>{request.procurement_reference}</Cell>
          <Cell>
            <CustomerCell
              record={request as unknown as Record<string, unknown>}
              fallbackId={request.user_id}
            />
          </Cell>
          <Cell>#{request.order_id}</Cell>
          <Cell>{request.supplier_name ?? "-"}</Cell>
          <Cell>
            <StatusBadge {...requestStatusBadge(request.status)} />
          </Cell>
          <Cell>{formatDate(request.created_at)}</Cell>
          <ActionCell to="/admin/requests/procurement/$requestId" id={request.id} />
        </tr>
      )}
      renderMobile={(request) => (
        <MobileRow
          key={String(request.id)}
          title={request.procurement_reference}
          detail={`Order #${request.order_id} · ${formatDate(request.created_at)}`}
          badge={requestStatusBadge(request.status)}
          to="/admin/requests/procurement/$requestId"
          id={request.id}
        />
      )}
    />
  );
}

type TableProps = {
  status: string;
  search: string;
  page: number;
  setPage: (page: number) => void;
};

function RequestTable<T>({
  query,
  rows,
  page,
  setPage,
  headings,
  renderRow,
  renderMobile,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    data?: { pagination?: { total_pages: number; total: number; page: number } | null };
  };
  rows: T[];
  page: number;
  setPage: (page: number) => void;
  headings: string[];
  renderRow: (row: T) => React.ReactNode;
  renderMobile: (row: T) => React.ReactNode;
}) {
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  return (
    <>
      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            Loading requests...
          </p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Requests could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState message="No requests found." />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[1040px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {headings.map((heading, index) => (
                      <th
                        key={heading || `action-${index}`}
                        scope="col"
                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">{rows.map(renderRow)}</tbody>
              </table>
            </TableScroll>
            <ul className="divide-y divide-border md:hidden">{rows.map(renderMobile)}</ul>
          </>
        )}
      </section>
      {!query.isLoading && !query.isError && rows.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {pagination?.page ?? page} of {totalPages}
            {pagination ? ` · ${pagination.total} total` : ""}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Cell({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td
      className={
        strong
          ? "whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground"
          : "whitespace-nowrap px-5 py-4 text-sm text-muted-foreground"
      }
    >
      {children}
    </td>
  );
}

function CustomerCell({
  record,
  fallbackId,
  fallbackEmail,
}: {
  record: Record<string, unknown>;
  fallbackId?: string | number;
  fallbackEmail?: string | null;
}) {
  const name = firstString(
    record.customer_display_name,
    record.customer_name,
    record.display_name,
    record.name,
    record.full_name,
  );
  const email = firstString(record.customer_email, record.email, record.user_email, fallbackEmail);
  if (!name && !email) return <>{fallbackId ? `#${fallbackId}` : "-"}</>;
  return (
    <span className="block min-w-0">
      {name && <span className="block font-medium text-foreground">{name}</span>}
      {email && <span className="block text-xs text-muted-foreground">{email}</span>}
    </span>
  );
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim() !== "");
}

function ActionCell({ to, id }: { to: string; id: string | number }) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-right">
      <Button asChild variant="outline" size="sm">
        <Link to={to} params={{ requestId: String(id) }}>
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </td>
  );
}

function MobileRow({
  title,
  detail,
  badge,
  to,
  id,
}: {
  title: string;
  detail: string;
  badge: { label: string; tone: StatusTone };
  to: string;
  id: string | number;
}) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </div>
      <Button asChild variant="outline" size="sm" className="mt-3 w-full">
        <Link to={to} params={{ requestId: String(id) }}>
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </li>
  );
}

function requestStatusBadge(status: string): { label: string; tone: StatusTone } {
  if (status === "completed" || status === "delivered") {
    return { label: humaniseStatus(status), tone: "success" };
  }
  if (status === "cancelled") return { label: "Cancelled", tone: "neutral" };
  if (status === "pending") return { label: "Pending", tone: "warning" };
  return { label: humaniseStatus(status), tone: "info" };
}
