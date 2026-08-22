import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAdminTutor, useUpdateAdminTutor } from "@/features/admin/hooks";
import { availabilityBadge, statusBadge } from "@/features/admin/tutor-format";
import { formatDateTime } from "@/features/commerce/format";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";
import { AdminTutorForm } from "./AdminTutorForm";

export function AdminTutorDetailsPage() {
  const { tutorId } = useParams({ strict: false }) as { tutorId: string };
  const { data: tutor, isLoading, isError, error } = useAdminTutor(tutorId);
  const updateTutor = useUpdateAdminTutor(tutorId);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageHeader title="Loading tutor..." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading tutor...</p>
        </section>
      </AdminLayout>
    );
  }

  if (isError || !tutor) {
    return (
      <AdminLayout>
        <PageHeader title="Tutor not found" description="This tutor record is unavailable." />
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {describeApiError(error, "The tutor you are looking for could not be loaded.")}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/admin/tutors">Back to tutors</Link>
          </Button>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/admin/tutors">
          <ArrowLeft className="h-4 w-4" />
          Back to tutors
        </Link>
      </Button>

      <PageHeader
        title={tutor.name}
        description={tutor.email ?? "Tutor directory record"}
        actions={<StatusBadge {...statusBadge(tutor.status)} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Summary
          label="Availability"
          value={<StatusBadge {...availabilityBadge(tutor.availability)} />}
        />
        <Summary label="Created" value={formatDateTime(tutor.created_at)} />
        <Summary label="Updated" value={formatDateTime(tutor.updated_at)} />
      </div>

      <AdminTutorForm
        tutor={tutor}
        submitLabel="Save changes"
        isPending={updateTutor.isPending}
        error={updateTutor.error}
        onSubmit={async (input) => {
          await updateTutor.mutateAsync(input);
          toast.success("Tutor updated successfully.");
        }}
      />
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
