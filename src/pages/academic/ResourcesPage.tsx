import { useMemo, useState } from "react";
import { Search, Download, ExternalLink, BookOpen } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { describeApiError } from "@/lib/api/errors";
import { formatDate, humaniseStatus } from "@/features/commerce/format";
import { downloadResourceFile, type Resource } from "@/features/resources/api";
import { useResources } from "@/features/resources/hooks";

/**
 * Items come from GET /resources. Visibility is enforced by the backend.
 * Downloads use an authenticated request to GET /files/{id}/download.
 * Search is local to the loaded list — never the admin-only /search endpoint.
 */
export function ResourcesPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [activeDownload, setActiveDownload] = useState<string | number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useResources();

  const resources = useMemo(() => data ?? [], [data]);
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          resources
            .map((resource) => resource.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    ],
    [resources],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = category === "All" || (resource.category ?? "") === category;
      const matchesQuery =
        q.length === 0 ||
        resource.title.toLowerCase().includes(q) ||
        (resource.description ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, resources]);

  const hasResources = resources.length > 0;

  const handleAction = async (resource: Resource) => {
    setDownloadError(null);

    if (resource.source_type === "external") {
      if (resource.external_url) {
        window.open(resource.external_url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (!resource.file_id) {
      setDownloadError("This resource file is not available for download.");
      return;
    }

    setActiveDownload(resource.id);
    try {
      const blob = await downloadResourceFile(resource.file_id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resource.file_name || `${resource.title}.${resource.file_format ?? "file"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(describeApiError(err, "This resource could not be downloaded."));
    } finally {
      setActiveDownload(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Resources"
        description="Guides, templates and recorded sessions available to your account."
      />

      {isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading resources…</p>
        </section>
      ) : isError ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Resources could not be loaded</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "Please try again in a moment.")}
          </p>
        </section>
      ) : (
        <>
          {hasResources && (
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                {categories.map((item) => {
                  const active = item === category;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={
                        active
                          ? "whitespace-nowrap border border-primary bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
                          : "whitespace-nowrap border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.9}
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search resources"
                  aria-label="Search resources by title or description"
                  className="h-10 pl-9"
                />
              </div>
            </div>
          )}

          {!hasResources ? (
            <section className="border border-border bg-card px-6 py-16 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" strokeWidth={1.7} />
              <p className="mt-3 text-sm font-semibold text-foreground">
                No resources available yet
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                Guides, templates and recorded sessions shared with your account will appear here.
              </p>
            </section>
          ) : filtered.length === 0 ? (
            <section className="border border-border bg-card px-6 py-16 text-center">
              <p className="text-sm font-semibold text-foreground">No matching resources</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Try a different category or search term.
              </p>
            </section>
          ) : (
            <>
              {downloadError && (
                <div className="mb-5 bg-danger-soft px-4 py-3 text-sm text-danger">
                  {downloadError}
                </div>
              )}
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((resource) => (
                  <li key={resource.id} className="flex flex-col border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <StatusBadge
                        label={resource.category ? humaniseStatus(resource.category) : "Resource"}
                        tone="neutral"
                      />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                        {formatOf(resource)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-sm font-bold tracking-tight text-foreground">
                      {resource.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {resource.description || "No description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(resource.created_at)}
                        {sizeOf(resource) ? ` · ${sizeOf(resource)}` : ""}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(resource)}
                        disabled={!canOpen(resource) || activeDownload === resource.id}
                      >
                        {resource.source_type === "file" ? (
                          <>
                            <Download className="h-4 w-4" strokeWidth={2} />
                            {activeDownload === resource.id ? "Downloading…" : "Download"}
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" strokeWidth={2} />
                            Open
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </AppShell>
  );
}

function canOpen(resource: Resource): boolean {
  if (resource.source_type === "file") return Boolean(resource.file_id);
  return Boolean(resource.external_url);
}

function formatOf(resource: Resource): string {
  if (resource.source_type === "external") return "Link";
  return resource.file_format || resource.mime_type || "File";
}

function sizeOf(resource: Resource): string | null {
  const value = resource.file_size;
  if (value === null || value === undefined || value === "") return null;
  const bytes = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(bytes)) return String(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
