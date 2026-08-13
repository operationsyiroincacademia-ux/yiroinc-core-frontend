import type { ReactNode } from "react";

/**
 * Shared frame for the sign-in and registration screens. Same flat surfaces,
 * 1px borders, 0px radius and Manrope typography as the portal shell.
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="YiroInc Academia"
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="text-sm font-extrabold tracking-tight text-foreground">
            YiroInc Academia
          </span>
        </div>

        <section className="border border-border bg-card">
          <header className="border-b border-border px-6 py-5">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </header>
          <div className="px-6 py-6">{children}</div>
        </section>

        {footer && <div className="mt-5 text-center text-xs text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";
