/**
 * Auth Context
 *
 * Provides authentication state to the entire app.
 * On mount: checks for an existing Supabase session.
 * After sign-in: fetches the user's role from the `app_user` table.
 * Listens for auth state changes (e.g., token refresh, sign-out from another tab).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AppRole, AppUser, AuthContextValue } from './types';
import { toCamelCase } from '../utils/caseMapper';

// --- Context ---

const AuthContext = createContext<AuthContextValue | null>(null);

// --- Hook ---

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

// --- Provider ---

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the app_user row for the given auth UID.
   * The `app_user.id` is the same UUID as `auth.users.id` for the Super Admin.
   * For other users, we match on the `email` column.
   */
  const fetchAppUser = useCallback(async (authUser: SupabaseUser): Promise<void> => {
    try {
      // First try matching by auth UID (works for Super Admin whose app_user.id = auth.uid)
      let { data, error } = await supabase
        .from('app_user')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // If no match by ID, try matching by email
      if (!data && !error && authUser.email) {
        ({ data, error } = await supabase
          .from('app_user')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle());
      }

      if (error) {
        console.error('Failed to fetch app_user:', error.message);
        return;
      }

      if (data) {
        const mapped = toCamelCase<AppUser>(data as Record<string, unknown>);
        setAppUser(mapped);
        setRole(mapped.role);
      } else {
        // User exists in auth but has no app_user row — default to Staff
        console.warn('No app_user row found for:', authUser.email);
        setRole('Staff');
      }
    } catch (err) {
      console.error('Error fetching app_user:', err);
    }
  }, []);

  /**
   * Clear all auth-related state.
   */
  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setAppUser(null);
    setRole(null);
  }, []);

  /**
   * Handle a new session (either from mount check or auth state change).
   */
  const handleSession = useCallback(
    async (newSession: Session | null) => {
      setSession(newSession);
      const authUser = newSession?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchAppUser(authUser);
      } else {
        clearAuthState();
      }
    },
    [fetchAppUser, clearAuthState]
  );

  // --- Check for existing session on mount ---
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (mounted) {
          await handleSession(existingSession);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (mounted) {
          await handleSession(newSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSession]);

  // --- Sign in ---
  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return error.message;
      }
      // Session will be picked up by onAuthStateChange listener
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'An unexpected error occurred';
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Sign out ---
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      clearAuthState();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  const value: AuthContextValue = {
    user,
    session,
    appUser,
    role,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
