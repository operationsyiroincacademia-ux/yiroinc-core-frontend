import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import type { AdminTutor, AdminTutorsParams } from "@/features/admin/api";
import { useAdminTutors } from "@/features/admin/hooks";
import {
  availabilityBadge,
  expertiseText,
  levelsText,
  statusBadge,
} from "@/features/admin/tutor-format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

type DirectoryFilter = "all" | "active" | "inactive" | "available" | "unavailable";

const FILTERS: { label: string; value: DirectoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
];

const EXAM_FILTERS = [
  { label: "All exams", value: "all" },
  { label: "CFA", value: "CFA" },
  { label: "FRM", value: "FRM" },
];

const PER_PAGE = 20;

export function AdminTutorsPage() {
  const [filter, setFilter] = useState<DirectoryFilter>("all");
  const [exam, setExam] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = tutorParams(filter, exam, search, page);
  const query = useAdminTutors(params);
  const rows = query.data?.tutors ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [filter, exam, search]);

  return (
    <AdminLayout>
      <PageHeader
        title="Tutors"
        description="Manage tutors available for candidate matching."
        actions={
          <Button asChild>
            <Link to="/admin/tutors/new">
              <Plus className="h-4 w-4" />
              Add tutor
            </Link>
          </Button>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => (
              <FilterButton
                key={item.value}
                active={item.value === filter}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </FilterButton>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tutors"
              aria-label="Search tutors"
              className="h-10 pl-9"
            />
          </div>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {EXAM_FILTERS.map((item) => (
            <FilterButton
              key={item.value}
              active={item.value === exam}
              onClick={() => setExam(item.value)}
            >
              {item.label}
            </FilterButton>
          ))}
        </div>
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">Loading tutors...</p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Tutors could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState
              message={search.trim() ? "No tutors match this search." : "No tutors found."}
            />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Tutor",
                      "Exam expertise",
                      "Levels",
                      "Timezone",
                      "Availability",
                      "Status",
                      "",
                    ].map((heading, index) => (
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
                  {rows.map((tutor) => (
                    <TutorRow key={String(tutor.id)} tutor={tutor} />
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <ul className="divide-y divide-border md:hidden">
              {rows.map((tutor) => (
                <li key={String(tutor.id)} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{tutor.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {expertiseText(tutor)} · {levelsText(tutor)}
                      </p>
                    </div>
                    <StatusBadge {...statusBadge(tutor.status)} />
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link to="/admin/tutors/$tutorId" params={{ tutorId: String(tutor.id) }}>
                      View/Edit
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

function TutorRow({ tutor }: { tutor: AdminTutor }) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="whitespace-nowrap px-5 py-4 text-sm">
        <Link
          to="/admin/tutors/$tutorId"
          params={{ tutorId: String(tutor.id) }}
          className="font-semibold text-foreground hover:text-primary hover:underline"
        >
          {tutor.name}
        </Link>
        {tutor.email && <p className="mt-0.5 text-xs text-muted-foreground">{tutor.email}</p>}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
        {expertiseText(tutor)}
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">{levelsText(tutor)}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {tutor.timezone ?? "-"}
      </td>
      <td className="px-5 py-4">
        <StatusBadge {...availabilityBadge(tutor.availability)} />
      </td>
      <td className="px-5 py-4">
        <StatusBadge {...statusBadge(tutor.status)} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/tutors/$tutorId" params={{ tutorId: String(tutor.id) }}>
            View/Edit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function tutorParams(
  filter: DirectoryFilter,
  exam: string,
  search: string,
  page: number,
): AdminTutorsParams {
  return {
    status: filter === "active" || filter === "inactive" ? filter : "all",
    availability: filter === "available" || filter === "unavailable" ? filter : "all",
    examExpertise: exam === "all" ? undefined : exam,
    search,
    page,
    perPage: PER_PAGE,
  };
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
          : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {children}
    </button>
  );
}
