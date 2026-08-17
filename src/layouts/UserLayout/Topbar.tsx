import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { SidebarNav } from "./SidebarNav";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { initialsOf, type CurrentUser } from "@/lib/auth/current-user";
import { EXPERIENCE_LABEL } from "@/lib/roles";
import { useAuth } from "@/lib/auth/auth-context";
import { useUnreadCount } from "@/features/notifications/hooks";
import { roleHref } from "@/lib/roles/experience-context";

export function Topbar({ user }: { user: CurrentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const unreadNotifications = unreadCount.data ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" strokeWidth={1.9} />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav experience={user.experience} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate({ to: roleHref(user.experience, "/notifications") })}
          className="relative inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" strokeWidth={1.9} />
          {unreadNotifications > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
          )}
        </button>

        <div className="ml-1 flex min-w-0 items-center gap-2.5 border-l border-border pl-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-primary-soft text-xs font-bold text-primary">
            {initialsOf(user.displayName)}
          </span>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {EXPERIENCE_LABEL[user.experience]}
            </span>
          </span>
        </div>

        <button
          type="button"
          aria-label="Sign out"
          onClick={async () => {
            await signOut();
            navigate({ to: "/login", replace: true });
          }}
          className="ml-1 inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.9} />
        </button>
      </div>
    </header>
  );
}
