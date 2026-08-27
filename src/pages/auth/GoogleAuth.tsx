import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import type { GoogleCustomerProfileType } from "@/features/auth/api";
import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/auth/auth-context";
import type { Experience } from "@/lib/roles";

import { Field, inputClass } from "./AuthLayout";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (
      element: HTMLElement,
      options: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
        text?: "signin_with" | "signup_with" | "continue_with" | "signin";
        shape?: "rectangular" | "pill" | "circle" | "square";
        width?: number;
      },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export type GoogleSetup = {
  credential: string;
  email: string;
  name: string;
};

type GoogleAuthProps = {
  remember?: boolean;
  text: "signin_with" | "signup_with" | "continue_with";
  onAuthenticated: (experience: Experience) => void;
  onSetupRequired?: (setup: GoogleSetup) => void;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
type GoogleSetupAccountType = "academic" | "exam" | "corporate";
type GoogleSetupExamType = "cfa_candidate" | "frm_candidate";

const GOOGLE_SETUP_ACCOUNT_OPTIONS: { label: string; value: GoogleSetupAccountType }[] = [
  { label: "Academic User", value: "academic" },
  { label: "Exam Candidate", value: "exam" },
  { label: "Corporate User", value: "corporate" },
];

const GOOGLE_SETUP_EXAM_OPTIONS: { label: string; value: GoogleSetupExamType }[] = [
  { label: "CFA", value: "cfa_candidate" },
  { label: "FRM", value: "frm_candidate" },
];

function describeGoogleError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 400 || error.status === 401) {
      return "Google authentication could not be verified. Please restart Google sign-in.";
    }
    if (error.status === 403) {
      return "Google sign-in is not available for this account. Use email and password instead.";
    }
    if (error.status === 409) {
      return "This Google identity conflicts with an existing account. Sign in with email and password or contact support.";
    }
    if (error.status >= 500) {
      return "Google sign-in is temporarily unavailable. Please try again shortly.";
    }
  }
  return describeApiError(error, fallback);
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Google sign-in is unavailable."));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          googleScriptPromise = null;
          reject(new Error("Google sign-in could not load."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Google sign-in could not load."));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleAccountSetupForm({
  setup,
  remember = true,
  onComplete,
  onUseDifferentAccount,
}: {
  setup: GoogleSetup;
  remember?: boolean;
  onComplete: (result: { experience: Experience; profileType: GoogleCustomerProfileType }) => void;
  onUseDifferentAccount?: () => void;
}) {
  const { signInWithGoogle } = useAuth();
  const mountedRef = useRef(true);
  const pendingRef = useRef(false);
  const [accountType, setAccountType] = useState<GoogleSetupAccountType | "">("");
  const [examType, setExamType] = useState<GoogleSetupExamType | "">("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submitSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingRef.current) return;
    setError(null);
    let profileType: GoogleCustomerProfileType;
    if (!accountType) {
      setError("Choose an account type before completing setup.");
      return;
    }
    if (accountType === "exam") {
      if (!examType) {
        setError("Choose an exam before completing setup.");
        return;
      }
      profileType = examType;
    } else {
      profileType = accountType === "corporate" ? "corporate_client" : "academic_user";
    }
    const organization = organizationName.trim();
    if (accountType === "corporate" && organization.length === 0) {
      setError("Organization name is required for Corporate accounts.");
      return;
    }
    if (accountType === "corporate" && organization.length > 255) {
      setError("Organization name must be 255 characters or fewer.");
      return;
    }

    pendingRef.current = true;
    setPending(true);
    try {
      const result = await signInWithGoogle(
        {
          credential: setup.credential,
          profile_type: profileType,
          ...(accountType === "corporate" ? { organization_name: organization } : {}),
        },
        { remember },
      );
      if (!mountedRef.current) return;
      if (result.status === "requires_profile") {
        setError("Google setup could not be completed. Please try Google sign-in again.");
        return;
      }
      setOrganizationName("");
      onComplete({ experience: result.experience, profileType });
    } catch (err) {
      if (mountedRef.current) {
        setError(describeGoogleError(err, "Google setup failed. Please try again."));
      }
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  };

  return (
    <form onSubmit={submitSetup} className="space-y-4" aria-busy={pending}>
      <div className="border border-border bg-muted px-3 py-2.5">
        <p className="break-words text-sm font-semibold text-foreground">
          {setup.name || "Google user"}
        </p>
        <p className="mt-0.5 break-all text-xs text-muted-foreground">{setup.email}</p>
      </div>

      <Field label="Account type">
        <select
          required
          value={accountType}
          onChange={(event) => {
            const nextAccountType = event.target.value as GoogleSetupAccountType;
            setAccountType(nextAccountType);
            if (nextAccountType !== "exam") setExamType("");
            if (nextAccountType !== "corporate") setOrganizationName("");
            setError(null);
          }}
          className={inputClass}
        >
          <option value="" disabled>
            Choose an account type
          </option>
          {GOOGLE_SETUP_ACCOUNT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {accountType === "exam" ? (
        <Field label="Exam">
          <select
            required
            value={examType}
            onChange={(event) => {
              setExamType(event.target.value as GoogleSetupExamType);
              setError(null);
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Choose an exam
            </option>
            {GOOGLE_SETUP_EXAM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {accountType === "corporate" ? (
        <Field label="Organization name">
          <input
            required
            maxLength={255}
            autoComplete="organization"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            className={inputClass}
            placeholder="Acme Corporation"
          />
        </Field>
      ) : null}

      {error ? (
        <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? <ButtonLoading>Completing...</ButtonLoading> : "Complete setup"}
      </Button>

      {onUseDifferentAccount ? (
        <button
          type="button"
          disabled={pending}
          onClick={onUseDifferentAccount}
          className="mx-auto block text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
        >
          Use a different Google account
        </button>
      ) : null}
    </form>
  );
}

export function GoogleAuth({
  remember = true,
  text,
  onAuthenticated,
  onSetupRequired,
}: GoogleAuthProps) {
  const { signInWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(true);
  const pendingRef = useRef(false);
  const rememberRef = useRef(remember);
  const onAuthenticatedRef = useRef(onAuthenticated);
  const onSetupRequiredRef = useRef(onSetupRequired);
  const [setup, setSetup] = useState<GoogleSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [scriptStatus, setScriptStatus] = useState<"idle" | "ready" | "error">("idle");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    rememberRef.current = remember;
    onAuthenticatedRef.current = onAuthenticated;
    onSetupRequiredRef.current = onSetupRequired;
  }, [onAuthenticated, onSetupRequired, remember]);

  const handleCredential = useCallback(
    async (credential: string) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setPending(true);
      setError(null);
      try {
        const result = await signInWithGoogle({ credential }, { remember: rememberRef.current });
        if (!mountedRef.current) return;
        if (result.status === "requires_profile") {
          const nextSetup = {
            credential,
            email: result.setup.email,
            name: result.setup.name,
          };
          if (onSetupRequiredRef.current) {
            onSetupRequiredRef.current(nextSetup);
            return;
          }
          setSetup(nextSetup);
          return;
        }
        onAuthenticatedRef.current(result.experience);
      } catch (err) {
        if (mountedRef.current) {
          setError(describeGoogleError(err, "Google sign-in failed. Please try again."));
        }
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setPending(false);
      }
    },
    [signInWithGoogle],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || setup) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !mountedRef.current || !buttonRef.current) return;
        if (!window.google?.accounts?.id) {
          throw new Error("Google sign-in is unavailable.");
        }
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (!mountedRef.current) return;
            if (!response.credential) {
              setError("Google did not return a usable credential. Please try again.");
              return;
            }
            void handleCredential(response.credential);
          },
        });
        buttonRef.current.innerHTML = "";
        const availableWidth = buttonRef.current.clientWidth || 320;
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text,
          shape: "rectangular",
          width: Math.min(availableWidth, 360),
        });
        setScriptStatus("ready");
      })
      .catch((err: unknown) => {
        if (!cancelled && mountedRef.current) {
          setScriptStatus("error");
          setError(describeGoogleError(err, "Google sign-in could not be initialized."));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [handleCredential, setup, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="border border-border bg-muted px-3 py-2.5 text-center text-xs text-muted-foreground">
        Google sign-in is not configured. Email and password still work.
      </p>
    );
  }

  if (setup) {
    return (
      <GoogleAccountSetupForm
        setup={setup}
        remember={remember}
        onComplete={({ experience }) => {
          setSetup(null);
          onAuthenticatedRef.current(experience);
        }}
        onUseDifferentAccount={() => {
          setSetup(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-2" aria-live="polite">
      <div
        ref={buttonRef}
        className="flex min-h-11 w-full items-center justify-center"
        aria-busy={pending || scriptStatus === "idle"}
      />
      {scriptStatus === "idle" ? (
        <p className="text-center text-xs text-muted-foreground">Loading Google sign-in...</p>
      ) : null}
      {pending ? (
        <p className="text-center text-xs text-muted-foreground">Checking Google...</p>
      ) : null}
      {error ? (
        <p role="alert" className="bg-danger-soft px-3 py-2.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
