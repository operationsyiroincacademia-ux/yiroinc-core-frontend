import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/DashboardCard";
import { TableScroll } from "@/components/shared/TableScroll";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminResources } from "@/features/admin/hooks";
import type {
  AdminResourceAudience,
  AdminResourceExam,
  AdminResourcePricing,
  AdminResourceSource,
  AdminResourceVisibility,
} from "@/features/admin/api";
import {
  resourceAudienceLabel,
  resourceHasExamAudience,
  resourceLevelLabel,
  resourcePriceLabel,
} from "@/features/admin/resource-format";
import { formatDate, toFlag } from "@/features/commerce/format";
import type { Resource } from "@/features/resources/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

const PER_PAGE = 20;
const SELECT_CLASS =
  "h-10 border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

export function AdminResourcesPage() {
  const [pricing, setPricing] = useState<AdminResourcePricing>("all");
  const [audience, setAudience] = useState<AdminResourceAudience>("all");
  const [exam, setExam] = useState<AdminResourceExam>("all");
  const [visibility, setVisibility] = useState<AdminResourceVisibility>("all");
  const [sourceType, setSourceType] = useState<AdminResourceSource>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ pricing, audience, exam, visibility, sourceType, search, page, perPage: PER_PAGE }),
    [pricing, audience, exam, visibility, sourceType, search, page],
  );
  const query = useAdminResources(params);
  const rows = query.data?.resources ?? [];
  const pagination = query.data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  useEffect(() => {
    setPage(1);
  }, [pricing, audience, exam, visibility, sourceType, search]);

  return (
    <AdminLayout>
      <PageHeader
        title="Resources"
        description="Manage learning resources available to users."
        actions={
          <Button asChild>
            <Link to="/admin/resources/new">
              <Plus className="h-4 w-4" />
              Add resource
            </Link>
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Filter
            label="Audience"
            value={audience}
            onChange={(value) => setAudience(value as AdminResourceAudience)}
          >
            <option value="all">All audiences</option>
            <option value="academic">Academic</option>
            <option value="exam_candidate">Exam Candidates</option>
            <option value="corporate">Corporate</option>
          </Filter>
          <Filter
            label="Pricing"
            value={pricing}
            onChange={(value) => setPricing(value as AdminResourcePricing)}
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </Filter>
          <Filter
            label="Exam"
            value={exam}
            onChange={(value) => setExam(value as AdminResourceExam)}
          >
            <option value="all">All</option>
            <option value="CFA">CFA</option>
            <option value="FRM">FRM</option>
          </Filter>
          <Filter
            label="Visibility"
            value={visibility}
            onChange={(value) => setVisibility(value as AdminResourceVisibility)}
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Filter>
          <Filter
            label="Source"
            value={sourceType}
            onChange={(value) => setSourceType(value as AdminResourceSource)}
          >
            <option value="all">All</option>
            <option value="file">File</option>
            <option value="external">External</option>
          </Filter>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources"
            aria-label="Search resources"
            className="h-10 pl-9"
          />
        </div>
      </div>

      <section className="min-w-0 border border-border bg-card">
        {query.isLoading ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            Loading resources...
          </p>
        ) : query.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Resources could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(query.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16">
            <EmptyState
              message={search.trim() ? "No resources match this search." : "No resources found."}
            />
          </div>
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[1080px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Resource",
                      "Audience",
                      "Exam",
                      "Level/Part",
                      "Type",
                      "Price",
                      "Visibility",
                      "Updated",
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
                  {rows.map((resource) => (
                    <ResourceRow key={String(resource.id)} resource={resource} />
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <ul className="divide-y divide-border md:hidden">
              {rows.map((resource) => (
                <li key={String(resource.id)} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{resource.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {resourceAudienceLabel(resource)} · {examTargetLabel(resource)} ·{" "}
                        {resourcePriceLabel(resource)}
                      </p>
                    </div>
                    <StatusBadge {...visibilityBadge(resource)} />
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                    <Link
                      to="/admin/resources/$resourceId"
                      params={{ resourceId: String(resource.id) }}
                    >
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

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </span>
      <select
        className={SELECT_CLASS}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="px-5 py-4 text-sm">
        <Link
          to="/admin/resources/$resourceId"
          params={{ resourceId: String(resource.id) }}
          className="font-semibold text-foreground hover:text-primary hover:underline"
        >
          {resource.title}
        </Link>
        <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
          {resource.category || resource.description || "-"}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-muted-foreground">{resourceAudienceLabel(resource)}</td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
        {resourceHasExamAudience(resource) ? (resource.exam_type ?? "-") : "-"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {resourceHasExamAudience(resource) ? resourceLevelLabel(resource.exam_level) : "-"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {resource.source_type === "file" ? "File" : "External"}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
        {resourcePriceLabel(resource)}
      </td>
      <td className="px-5 py-4">
        <StatusBadge {...visibilityBadge(resource)} />
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
        {formatDate(resource.updated_at)}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-right">
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/resources/$resourceId" params={{ resourceId: String(resource.id) }}>
            View/Edit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

function visibilityBadge(resource: Resource) {
  return toFlag(resource.is_public)
    ? { label: "Public", tone: "success" as const }
    : { label: "Private", tone: "neutral" as const };
}

function examTargetLabel(resource: Resource) {
  if (!resourceHasExamAudience(resource)) return "No exam targeting";
  return `${resource.exam_type ?? "-"} ${resourceLevelLabel(resource.exam_level)}`;
}
