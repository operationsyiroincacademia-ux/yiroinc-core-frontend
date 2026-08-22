import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateAdminTutor } from "@/features/admin/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { AdminTutorForm } from "./AdminTutorForm";

export function AdminNewTutorPage() {
  const navigate = useNavigate();
  const createTutor = useCreateAdminTutor();

  return (
    <AdminLayout>
      <BackLink />
      <PageHeader title="Add tutor" description="Create a tutor record for candidate matching." />
      <AdminTutorForm
        submitLabel="Create tutor"
        isPending={createTutor.isPending}
        error={createTutor.error}
        onSubmit={async (input) => {
          const tutor = await createTutor.mutateAsync(input);
          toast.success("Tutor created successfully.");
          if (tutor?.id) {
            await navigate({ to: "/admin/tutors/$tutorId", params: { tutorId: String(tutor.id) } });
          } else {
            await navigate({ to: "/admin/tutors" });
          }
        }}
      />
    </AdminLayout>
  );
}

function BackLink() {
  return (
    <Button asChild variant="ghost" className="mb-5 px-0">
      <Link to="/admin/tutors">
        <ArrowLeft className="h-4 w-4" />
        Back to tutors
      </Link>
    </Button>
  );
}
