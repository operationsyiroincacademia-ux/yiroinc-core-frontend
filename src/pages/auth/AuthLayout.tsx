import { useId, useState, type ChangeEventHandler, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Shared frame for the sign-in and registration screens. Same flat surfaces,
 * 1px borders, 0px radius and Manrope typography as the portal shell.
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
  titleScale = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  titleScale?: "default" | "login";
}) {
  return (
    <main className="auth-layout flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <div className="auth-layout__brand mb-8 flex translate-y-5 items-center justify-center gap-2.5 sm:mb-10 sm:translate-y-6">
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
          <header className="auth-layout__header border-b border-border px-5 py-6 text-center sm:px-8">
            <h1
              className={`${titleScale === "login" ? "text-lg sm:text-xl" : "text-xl"} font-bold text-foreground`}
            >
              {title}
            </h1>
            {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
            {footer && <div className="mt-2 text-sm text-muted-foreground">{footer}</div>}
          </header>
          <div className="auth-layout__body px-5 py-6 sm:px-8 sm:py-7">{children}</div>
        </section>
      </div>
    </main>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
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
  "h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:ring-1 focus-visible:ring-ring";

export function PasswordInput({
  label = "Password",
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
}: {
  label?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete: "current-password" | "new-password";
  placeholder: string;
  minLength?: number;
}) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={`${inputClass} pr-11`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
