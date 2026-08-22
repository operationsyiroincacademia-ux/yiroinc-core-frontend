import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateAdminResource } from "@/features/admin/hooks";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { AdminResourceForm } from "./AdminResourceForm";

export function AdminNewResourcePage() {
  const navigate = useNavigate();
  const createResource = useCreateAdminResource();

  return (
    <AdminLayout>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/admin/resources">
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>
      </Button>

      <PageHeader title="Add resource" description="Create a learning resource for users." />

      <AdminResourceForm
        submitLabel="Create resource"
        isPending={createResource.isPending}
        error={createResource.error}
        onSubmit={async (input) => {
          const resource = await createResource.mutateAsync(input);
          toast.success("Resource created successfully.");
          await navigate({
            to: resource?.id ? "/admin/resources/$resourceId" : "/admin/resources",
            params: resource?.id ? { resourceId: String(resource.id) } : undefined,
          });
        }}
      />
    </AdminLayout>
  );
}
