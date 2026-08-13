import { useMemo, useState } from "react";
import { Search, Download, ExternalLink, BookOpen } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RESOURCES, RESOURCE_CATEGORIES } from "@/features/resources/preview-data";

/**
 * Items come from the resources data module (preview data today, the
 * resources endpoint once the API layer is wired). Downloads use an
 * authenticated request to GET /files/{id}/download. Search is local to
 * the loaded list — never the admin-only /search endpoint.
 */
export function ResourcesPage() {
  const [category, setCategory] =
    useState<(typeof RESOURCE_CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((resource) => {
      const matchesCategory = category === "All" || resource.category === category;
      const matchesQuery =
        q.length === 0 ||
        resource.title.toLowerCase().includes(q) ||
        resource.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const hasResources = RESOURCES.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Resources"
        description="Guides, templates and recorded sessions available to your account."
      />

      {hasResources && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {RESOURCE_CATEGORIES.map((item) => {
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
          <BookOpen
            className="mx-auto h-6 w-6 text-muted-foreground"
            strokeWidth={1.7}
          />
          <p className="mt-3 text-sm font-semibold text-foreground">
            No resources available yet
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Guides, templates and recorded sessions shared with your account will
            appear here.
          </p>
        </section>
      ) : filtered.length === 0 ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">
            No matching resources
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Try a different category or search term.
          </p>
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => (
            <li
              key={resource.id}
              className="flex flex-col border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <StatusBadge label={resource.category} tone={resource.tone} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  {resource.format}
                </span>
              </div>

              <h2 className="mt-3 text-sm font-bold tracking-tight text-foreground">
                {resource.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {resource.description}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Added {resource.addedAt}
                  {resource.size ? ` · ${resource.size}` : ""}
                </p>
                <Button variant="outline" size="sm">
                  {resource.access === "download" ? (
                    <>
                      <Download className="h-4 w-4" strokeWidth={2} />
                      Download
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
      )}
    </AppShell>
  );
}
