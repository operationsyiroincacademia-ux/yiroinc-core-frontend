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
  fetchCurrentSession,
  loginWithPassword,
  registerAccount,
  logoutSession,
  type AuthMeta,
  type AuthProfile,
  type AuthUser,
  type RegisterInput,
} from "@/features/auth/api";
import { getAuthToken, setAuthToken } from "@/lib/auth/token";
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
  signIn: (input: { email: string; password: string }) => Promise<{
    profile: AuthProfile;
    experience: Experience;
  }>;
  signUp: (input: RegisterInput) => Promise<AuthProfile>;
  signOut: () => Promise<void>;
};

const CACHE_KEY = "yac_session";
type CachedSession = { user: AuthUser; profile: AuthProfile; auth?: AuthMeta | null };

function readCache(): CachedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedSession) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(CACHE_KEY);
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
  return toFlag(session.auth?.is_admin) || toFlag(session.user.is_admin);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [auth, setAuth] = useState<AuthMeta | null>(null);

  const apply = useCallback((session: CachedSession) => {
    setUser(session.user);
    setProfile(session.profile);
    setAuth(session.auth ?? null);
    writeCache(session);
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
    if (!token) {
      writeCache(null);
      setStatus("unauthenticated");
      return;
    }

    const cached = readCache();
    if (cached) {
      setUser(cached.user);
      setProfile(cached.profile);
      setStatus("authenticated");
    }

    let cancelled = false;
    fetchCurrentSession(token)
      .then((session) => {
        if (!cancelled) apply(session);
      })
      .catch(() => {
        if (!cancelled) clear();
      });

    return () => {
      cancelled = true;
    };
  }, [apply, clear]);

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      const session = await loginWithPassword(input);
      setAuthToken(session.token);
      apply({ user: session.user, profile: session.profile, auth: session.auth ?? null });
      return {
        profile: session.profile,
        experience: resolveExperience(session.profile.profile_type, false),
      };
    },
    [apply],
  );

  const signUp = useCallback(
    async (input: RegisterInput) => {
      const session = await registerAccount(input);
      setAuthToken(session.token);
      apply({ user: session.user, profile: session.profile, auth: session.auth ?? null });
      return session.profile;
    },
    [apply],
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

  const isAdmin = user ? sessionIsAdmin({ user, auth }) : false;

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      profile,
      auth,
      isAdmin,
      experience: profile ? resolveExperience(profile.profile_type, false) : null,
      signIn,
      signUp,
      signOut,
    }),
    [status, user, profile, auth, isAdmin, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
