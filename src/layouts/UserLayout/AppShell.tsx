import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";
import { Topbar } from "./Topbar";
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
          <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
        </div>
      </div>
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
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
