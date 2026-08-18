import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { EmptyState } from "@/components/shared/DashboardCard";
import { RoleLink } from "@/components/shared/RoleLink";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/commerce/hooks";
import { describeApiError } from "@/features/commerce/api";
import { formatMoney } from "@/features/commerce/format";

/**
 * Yiroinc Store — shared across Academic, Exam Candidate and Corporate.
 * Catalogue is served by GET /products (WooCommerce) via the verified API.
 */
export function StorePage() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error } = useProducts(page, 20);

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  return (
    <AppShell>
      <PageHeader
        title="Yiroinc Store"
        description="Browse available services, open an item and place an order. Payment is by bank transfer — there is no automated payment gateway."
      />

      {isError && (
        <section className="border border-border bg-card">
          <p className="px-5 py-8 text-center text-sm text-danger">
            {describeApiError(error, "The service catalogue could not be loaded.")}
          </p>
        </section>
      )}

      {isPending && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-56 animate-pulse border border-border bg-muted" />
          ))}
        </div>
      )}

      {!isPending && !isError && products.length === 0 && (
        <section className="border border-border bg-card">
          <EmptyState message="No services are available yet." />
        </section>
      )}

      {!isPending && !isError && products.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="flex flex-col border border-border bg-card p-5">
                {product.sku && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    {product.sku}
                  </p>
                )}
                <h2 className="mt-2 text-sm font-bold tracking-tight text-foreground">
                  {product.name}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {product.short_description?.replace(/<[^>]*>/g, "")}
                </p>
                <p className="mt-4 text-lg font-extrabold tracking-tight text-foreground">
                  {formatMoney(product.price, product.currency)}
                </p>
                <Button asChild className="mt-5 w-full">
                  <RoleLink to={`/services/${product.id}`}>
                    View details
                    <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
                  </RoleLink>
                </Button>
              </article>
            ))}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3 border border-border bg-card px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
