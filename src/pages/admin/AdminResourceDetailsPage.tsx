import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  useAdminResource,
  useRemoveAdminResource,
  useUpdateAdminResource,
} from "@/features/admin/hooks";
import {
  normalizeResourceAudiences,
  resourceAudienceDetailLabel,
  resourceHasExamAudience,
  resourceLevelLabel,
  resourcePriceLabel,
} from "@/features/admin/resource-format";
import { formatDateTime, toFlag } from "@/features/commerce/format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";
import { AdminResourceForm } from "./AdminResourceForm";

export function AdminResourceDetailsPage() {
  const { resourceId } = useParams({ strict: false }) as { resourceId: string };
  const navigate = useNavigate();
  const { data: resource, isLoading, isError, error } = useAdminResource(resourceId);
  const updateResource = useUpdateAdminResource(resourceId);
  const removeResource = useRemoveAdminResource(resourceId);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader title="Loading resource..." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading resource...</p>
        </section>
      </AdminLayout>
    );
  }

  if (isError || !resource) {
    return (
      <AdminLayout>
        <PageHeader title="Resource not found" description="This resource record is unavailable." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The resource you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/admin/resources">Back to resources</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  const audiences = normalizeResourceAudiences(resource);
  const hasExamAudience = resourceHasExamAudience(resource);

  return (
    <AdminLayout>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/admin/resources">
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>
      </Button>

      <PageHeader
        title={resource.title}
        description={resource.category || "Learning resource"}
        actions={
          <StatusBadge
            label={toFlag(resource.is_public) ? "Public" : "Private"}
            tone={toFlag(resource.is_public) ? "success" : "neutral"}
          />
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Summary
          label="Available to"
          value={
            audiences.length > 0
              ? audiences.map((audience) => resourceAudienceDetailLabel(audience)).join(", ")
              : "-"
          }
        />
        {hasExamAudience ? (
          <Summary
            label="Exam"
            value={`${resource.exam_type ?? "-"} · ${resourceLevelLabel(resource.exam_level)}`}
          />
        ) : null}
        <Summary label="Price" value={resourcePriceLabel(resource)} />
        <Summary label="Created" value={formatDateTime(resource.created_at)} />
        <Summary label="Updated" value={formatDateTime(resource.updated_at)} />
      </div>

      <AdminResourceForm
        resource={resource}
        submitLabel="Save changes"
        isPending={updateResource.isPending}
        error={updateResource.error}
        onSubmit={async (input) => {
          await updateResource.mutateAsync(input);
        }}
      />

      <section className="mt-6 max-w-4xl border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">Remove resource</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hide this resource from normal user availability while preserving historical records.
            </p>
            {removeResource.error ? (
              <p className="mt-2 text-sm text-danger">
                {describeApiError(removeResource.error, "Resource could not be removed.")}
              </p>
            ) : null}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={removeResource.isPending}>
                Remove resource
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this resource?</AlertDialogTitle>
                <AlertDialogDescription>
                  This resource will no longer be available to users. Existing orders, payments and
                  purchased access will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await removeResource.mutateAsync();
                    await navigate({ to: "/admin/resources" });
                  }}
                >
                  Remove resource
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </AdminLayout>
  );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <section className="border border-border bg-card px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </section>
  );
}
