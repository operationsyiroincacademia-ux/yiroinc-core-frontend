import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { RoleLink } from "@/components/shared/RoleLink";
import { Button } from "@/components/ui/button";
import { describeApiError } from "@/features/commerce/api";
import { useCreateOrder, useProduct } from "@/features/commerce/hooks";
import { formatMoney } from "@/features/commerce/format";
import { roleHref, useExperience } from "@/lib/roles/experience-context";

/**
 * Product / Service details — shared across all user experiences.
 * "Place order" calls POST /orders; the returned order id, reference and
 * server-derived total are carried into the manual checkout page.
 */
export function ProductDetailsPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const { data: product, isPending, isError, error } = useProduct(productId);
  const experience = useExperience();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  if (isPending) {
    return (
      <AppShell>
        <PageHeader title="Loading service…" />
        <div className="h-72 animate-pulse border border-border bg-muted" />
      </AppShell>
    );
  }

  if (isError || !product) {
    return (
      <AppShell>
        <PageHeader
          title="Service not available"
          description={describeApiError(error, "This item could not be loaded.")}
        />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <Button asChild variant="outline">
            <RoleLink to="/services">Back to services</RoleLink>
          </Button>
        </section>
      </AppShell>
    );
  }

  const placeOrder = () => {
    createOrder.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: (order) => {
          navigate({
            to: roleHref(experience, `/checkout/${order.order_id}`),
          });
        },
      },
    );
  };


  return (
    <AppShell>
      <RoleLink
        to="/services"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to services
      </RoleLink>

      <PageHeader
        title={product.name}
        description={product.short_description?.replace(/<[^>]*>/g, "")}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border border-border bg-card">
          <header className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              About this service
            </h2>
          </header>
          <div className="px-5 py-5">
            <div
              className="whitespace-pre-line text-sm leading-relaxed text-foreground [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{
                __html: product.description || product.short_description || "",
              }}
            />

            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {product.sku && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    SKU
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{product.sku}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Price
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatMoney(product.price, product.currency)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="h-fit border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              Total
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
              {formatMoney(product.price, product.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Quantity: 1</p>
          </div>
          <div className="px-5 py-5">
            <Button
              className="w-full"
              disabled={createOrder.isPending}
              onClick={placeOrder}
            >
              {createOrder.isPending ? "Placing order…" : "Place order"}
            </Button>

            {createOrder.isError && (
              <p className="mt-3 bg-danger-soft px-3 py-2.5 text-xs text-danger">
                {describeApiError(createOrder.error, "Your order could not be created.")}
              </p>
            )}

            <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              Placing an order does not charge you. You will receive bank transfer
              instructions on the next screen.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
