import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AdminUser, AdminUserProfileType } from "@/features/admin/api";
import { useAdminUsers } from "@/features/admin/hooks";
import {
  adminUserDisplayName,
  adminUserJoinedAt,
  adminUserTypeLabel,
} from "@/features/admin/user-format";
import { formatDate } from "@/features/commerce/format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const PER_PAGE = 20;

const FILTERS: { label: string; value: AdminUserProfileType }[] = [
  { label: "All Users", value: "all" },
  { label: "Academic Users", value: "academic_user" },
  { label: "CFA Candidates", value: "cfa_candidate" },
  { label: "FRM Candidates", value: "frm_candidate" },
  { label: "Corporate Users", value: "corporate_client" },
];

export function AdminUsersPage() {
  const [profileType, setProfileType] = useState<AdminUserProfileType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({ profileType, search, page, perPage: PER_PAGE }),
    [profileType, search, page],
  );
  const query = useAdminUsers(params);
  const rows = query.data?.users ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [profileType, search]);

  return (
    <AdminLayout>
      <PageHeader title="Users" description="View platform users and their activity." />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {FILTERS.map((item) => {
            const active = item.value === profileType;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setProfileType(item.value)}
                className={
                  active
                    ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                    : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">Loading users...</p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Users could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState
              message={search.trim() ? "No users match this search." : "No platform users found."}
            />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["User", "Type", "Email", "Country", "Joined", ""].map((heading, index) => (
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
                <tbody className="divide-y divide-border">
                  {rows.map((user) => (
                    <UserRow key={String(user.id)} user={user} />
                  ))}
                </tbody>
              </table>
            </TableScroll>

            <ul className="divide-y divide-border md:hidden">
              {rows.map((user) => (
                <li key={String(user.id)} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {adminUserDisplayName(user)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {user.email || `User #${user.id}`} · {formatDate(adminUserJoinedAt(user))}
                      </p>
                    </div>
                    <StatusBadge label={adminUserTypeLabel(user.profile_type)} tone="info" />
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link to="/admin/users/$userId" params={{ userId: String(user.id) }}>
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
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
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="px-5 py-4 text-sm">
        <Link
          to="/admin/users/$userId"
          params={{ userId: String(user.id) }}
          className="font-semibold text-foreground hover:text-primary hover:underline"
        >
          {adminUserDisplayName(user)}
        </Link>
        <p className="mt-0.5 text-xs text-muted-foreground">User #{user.id}</p>
      </td>
      <td className="px-5 py-4">
        <StatusBadge label={adminUserTypeLabel(user.profile_type)} tone="info" />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {user.email || "-"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {user.country || "-"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {formatDate(adminUserJoinedAt(user))}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/users/$userId" params={{ userId: String(user.id) }}>
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </td>
    </tr>
  );
}
