import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { NotificationPopover } from "@/components/shared/NotificationPopover";
import { SidebarNav } from "./SidebarNav";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { initialsOf, type CurrentUser } from "@/lib/auth/current-user";
import { EXPERIENCE_LABEL } from "@/lib/roles";

export function Topbar({ user }: { user: CurrentUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

      <div className="ml-auto flex min-w-0 items-center gap-1.5">
        <NotificationPopover experience={user.experience} />

        <div className="ml-1 flex min-w-0 items-center gap-2.5 border-l border-border pl-3">
          <UserAvatar user={user} />
          <span className="hidden min-w-0 max-w-44 flex-col leading-tight md:flex lg:max-w-56">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.displayName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {EXPERIENCE_LABEL[user.experience]}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

function UserAvatar({ user }: { user: CurrentUser }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = normalizeAvatarUrl(user.avatarUrl);
  const showImage = Boolean(avatarUrl) && !imageFailed;
  const altName = user.displayName || user.email || "User";

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden bg-primary-soft text-xs font-bold text-primary">
      {showImage ? (
        <img
          src={avatarUrl ?? undefined}
          alt={`${altName} profile photo`}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initialsOf(user.displayName)
      )}
    </span>
  );
}

function normalizeAvatarUrl(value: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
