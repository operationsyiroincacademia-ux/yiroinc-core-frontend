import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { navigationFor } from "@/lib/roles/navigation";
import { EXPERIENCE_LABEL, type Experience } from "@/lib/roles";

type SidebarNavProps = {
  experience: Experience;
  onNavigate?: () => void;
};

export function SidebarNav({ experience, onNavigate }: SidebarNavProps) {
  const pathname = useRouterState({
    select: (router) => router.location.pathname,
  });
  const sections = navigationFor(experience);

  // Only the single best (longest) matching item is active, so a parent like
  // "/exam" never highlights alongside "/exam/orders".
  const matches = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const activePath = sections
    .flatMap((section) => section.items)
    .map((item) => item.to)
    .filter(matches)
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <Link to="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="YiroInc Academia"
            className="h-8 w-8 shrink-0 object-contain"
          />

          <span className="min-w-0 truncate text-sm font-extrabold tracking-tight text-foreground">
            YiroInc Academia
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {sections.map((section) => (
          <div key={section.label} className="mb-8 last:mb-0">
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.to === activePath;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "relative flex items-center gap-3.5 px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-soft text-primary"
                          : "text-muted-foreground hover:bg-primary-soft/60 hover:text-foreground",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-5 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {EXPERIENCE_LABEL[experience]}
        </p>
      </div>
    </div>
  );
}
