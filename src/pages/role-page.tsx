import { useEffect, type ComponentType } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth/auth-context";
import type { Experience } from "@/lib/roles";
import { EXPERIENCE_BASE, ExperienceProvider } from "@/lib/roles/experience-context";

function SessionGate({
  experience,
  children,
}: {
  experience: Experience;
  children: React.ReactNode;
}) {
  const { status, experience: userExperience } = useAuth();
  const navigate = useNavigate();

  const mismatch =
    status === "authenticated" && userExperience !== null && userExperience !== experience;

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (mismatch && userExperience) {
      navigate({ to: EXPERIENCE_BASE[userExperience], replace: true });
    }
  }, [status, mismatch, userExperience, navigate]);

  if (status !== "authenticated" || mismatch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading your portal…</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Thin role wrapper for shared feature pages. It fixes the active experience
 * for the subtree so the shell, navigation, role label and profile_type
 * context are correct, and prevents a signed-in user from opening another
 * role's experience by editing the URL.
 */
export function withExperience<P extends object>(
  experience: Experience,
  Component: ComponentType<P>,
) {
  return function RoleScopedPage(props: P) {
    return (
      <SessionGate experience={experience}>
        <ExperienceProvider experience={experience}>
          <Component {...props} />
        </ExperienceProvider>
      </SessionGate>
    );
  };
}
