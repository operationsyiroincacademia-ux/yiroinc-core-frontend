import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
import { Toaster } from "@/components/ui/sonner";
import { useCurrentUser } from "@/lib/auth/current-user";

export function AppShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] px-3 sm:px-5 lg:px-8 xl:px-12">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-0 h-screen w-64 bg-sidebar relative">
            <div className="absolute inset-y-0 -left-3 w-3 bg-sidebar sm:-left-5 sm:w-5 lg:-left-8 lg:w-8 xl:-left-12 xl:w-12" />
            <SidebarNav experience={user.experience} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="min-w-0 flex-1 px-3 py-6 sm:px-6 sm:py-10">{children}</main>
        </div>
      </div>
      <Toaster closeButton duration={4500} position="top-right" />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0 max-w-full">
        <h1 className="break-words text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="flex w-full max-w-sm items-center gap-2 sm:w-auto sm:max-w-none sm:shrink-0 [&>*]:w-full sm:[&>*]:w-auto">
          {actions}
        </div>
      )}
    </header>
  );
}
