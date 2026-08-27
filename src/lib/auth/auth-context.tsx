import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authenticateWithGoogle,
  fetchCurrentSession,
  loginWithPassword,
  registerAccount,
  logoutSession,
  type AuthMeta,
  type AuthProfile,
  type AuthSession,
  type AuthUser,
  type GoogleAuthInput,
  type GoogleProfileRequired,
  type RegisterInput,
} from "@/features/auth/api";
import {
  getAuthPersistence,
  getAuthToken,
  setAuthToken,
  type AuthPersistence,
} from "@/lib/auth/token";
import { resolveExperience, type Experience } from "@/lib/roles";

/**
 * Shared authentication state.
 *
 * The JWT is stored through setAuthToken; user and profile are cached so the
 * shell can render immediately, then revalidated with GET /auth/me on load.
 */

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  profile: AuthProfile | null;
  auth: AuthMeta | null;
  isAdmin: boolean;
  experience: Experience | null;
  signIn: (
    input: { email: string; password: string },
    options?: { remember?: boolean },
  ) => Promise<{
    profile: AuthProfile | null;
    experience: Experience;
  }>;
  signUp: (input: RegisterInput) => Promise<AuthProfile>;
  signInWithGoogle: (
    input: GoogleAuthInput,
    options?: { remember?: boolean },
  ) => Promise<
    | { status: "authenticated"; profile: AuthProfile | null; experience: Experience }
    | { status: "requires_profile"; setup: GoogleProfileRequired }
  >;
  clearSession: () => void;
  signOut: () => Promise<void>;
};

const CACHE_KEY = "yac_session";
type CachedSession = { user: AuthUser; profile: AuthProfile | null; auth?: AuthMeta | null };

function readCache(): CachedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY) ?? window.sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedSession) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedSession | null, persistence: AuthPersistence = "local") {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.removeItem(CACHE_KEY);
      window.sessionStorage.removeItem(CACHE_KEY);
      const storage = persistence === "local" ? window.localStorage : window.sessionStorage;
      storage.setItem(CACHE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(CACHE_KEY);
      window.sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

const AuthContext = createContext<AuthState | null>(null);

function toFlag(value: string | number | boolean | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value === null || value === undefined) return false;
  const raw = String(value).toLowerCase();
  return raw === "1" || raw === "true";
}

function sessionIsAdmin(session: Pick<CachedSession, "user" | "auth">): boolean {
  return (
    toFlag(session.auth?.is_admin) ||
    toFlag(session.auth?.capabilities?.manage_options) ||
    toFlag(session.user.is_admin) ||
    toFlag(session.user.capabilities?.manage_options)
  );
}

function sessionExperience(session: CachedSession | null): Experience | null {
  if (!session) return null;
  const isAdmin = sessionIsAdmin(session);
  if (isAdmin) return "admin";
  return session.profile ? resolveExperience(session.profile.profile_type, false) : null;
}

function requiresGoogleProfile(
  result: AuthSession | GoogleProfileRequired,
): result is GoogleProfileRequired {
  return "requires_profile" in result && result.requires_profile === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [auth, setAuth] = useState<AuthMeta | null>(null);

  const apply = useCallback((session: CachedSession, persistence: AuthPersistence = "local") => {
    setUser(session.user);
    setProfile(session.profile);
    setAuth(session.auth ?? null);
    writeCache(session, persistence);
    setStatus("authenticated");
  }, []);

  const clear = useCallback(() => {
    setAuthToken(null);
    writeCache(null);
    setUser(null);
    setProfile(null);
    setAuth(null);
    setStatus("unauthenticated");
  }, []);

  // Session restoration: a stored token is validated with GET /auth/me.
  useEffect(() => {
    const token = getAuthToken();
    const persistence = getAuthPersistence();
    if (!token) {
      writeCache(null);
      setStatus("unauthenticated");
      return;
    }

    let cancelled = false;
    fetchCurrentSession(token)
      .then((session) => {
        if (!cancelled && getAuthToken() === token) apply(session, persistence ?? "local");
      })
      .catch(() => {
        if (!cancelled && getAuthToken() === token) clear();
      });

    return () => {
      cancelled = true;
    };
  }, [apply, clear]);

  const signIn = useCallback(
    async (input: { email: string; password: string }, options: { remember?: boolean } = {}) => {
      const persistence: AuthPersistence = options.remember === false ? "session" : "local";
      const session = await loginWithPassword(input);
      setAuthToken(session.token, persistence);
      let canonical: Awaited<ReturnType<typeof fetchCurrentSession>>;
      try {
        canonical = await fetchCurrentSession(session.token);
      } catch (error) {
        setAuthToken(null);
        writeCache(null);
        throw error;
      }
      const experience = sessionExperience(canonical);
      if (!experience) {
        setAuthToken(null);
        writeCache(null);
        throw new Error("Sign in completed without a profile.");
      }
      apply(canonical, persistence);
      return {
        profile: canonical.profile,
        experience,
      };
    },
    [apply],
  );

  const applyAuthSession = useCallback(
    async (session: AuthSession, persistence: AuthPersistence) => {
      if (!session.profile) {
        throw new Error("Authentication completed without a profile.");
      }
      const experience = sessionExperience({
        user: session.user,
        profile: session.profile,
        auth: session.auth ?? null,
      });
      if (!experience || experience === "admin") {
        throw new Error("Google sign-in is available for customer accounts only.");
      }
      setAuthToken(session.token, persistence);
      let canonical: Awaited<ReturnType<typeof fetchCurrentSession>>;
      try {
        canonical = await fetchCurrentSession(session.token);
      } catch (error) {
        setAuthToken(null);
        writeCache(null);
        throw error;
      }
      const canonicalExperience = sessionExperience(canonical);
      if (!canonicalExperience || canonicalExperience === "admin") {
        setAuthToken(null);
        writeCache(null);
        throw new Error("Google sign-in is available for customer accounts only.");
      }
      apply(canonical, persistence);
      return {
        profile: canonical.profile,
        experience: canonicalExperience,
      };
    },
    [apply],
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const session = await registerAccount(input);
      if (!session.profile) {
        throw new Error("Registration completed without a profile.");
      }
      setAuthToken(session.token);
      apply({ user: session.user, profile: session.profile, auth: session.auth ?? null });
      return session.profile;
    },
    [apply],
  );

  const signInWithGoogle = useCallback(
    async (input: GoogleAuthInput, options: { remember?: boolean } = {}) => {
      const persistence: AuthPersistence = options.remember === false ? "session" : "local";
      const result = await authenticateWithGoogle(input);
      if (requiresGoogleProfile(result)) {
        return { status: "requires_profile" as const, setup: result };
      }
      const authenticated = await applyAuthSession(result, persistence);
      return { status: "authenticated" as const, ...authenticated };
    },
    [applyAuthSession],
  );

  // Sign out: revoke server-side when possible, but always clear locally.
  const signOut = useCallback(async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await logoutSession(token);
      } catch {
        /* expired or rejected token — local state is cleared regardless */
      }
    }
    clear();
  }, [clear]);

  const session = user ? { user, profile, auth } : null;
  const isAdmin = session ? sessionIsAdmin(session) : false;
  const experience = sessionExperience(session);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      profile,
      auth,
      isAdmin,
      experience,
      signIn,
      signUp,
      signInWithGoogle,
      clearSession: clear,
      signOut,
    }),
    [
      status,
      user,
      profile,
      auth,
      isAdmin,
      experience,
      signIn,
      signUp,
      signInWithGoogle,
      clear,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
