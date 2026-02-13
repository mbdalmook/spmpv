/**
 * Auth Types
 *
 * Types specific to authentication and authorization.
 * Separate from entity types to keep concerns clean.
 */

import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

/** Application roles matching the `app_user.role` column values */
export type AppRole = 'Staff' | 'Admin' | 'Super Admin';

/** The shape of a row in the `app_user` table (camelCase frontend version) */
export interface AppUser {
  id: string;
  username: string | null;
  email: string | null;
  role: AppRole;
  staffId: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Auth context value exposed to the entire app */
export interface AuthContextValue {
  /** The Supabase auth user (null when not signed in) */
  user: SupabaseUser | null;
  /** The active Supabase session (null when not signed in) */
  session: Session | null;
  /** The app_user row for the signed-in user (null until fetched) */
  appUser: AppUser | null;
  /** The user's application role (null until fetched) */
  role: AppRole | null;
  /** True while checking session on mount or during sign-in */
  loading: boolean;
  /** Sign in with email and password. Returns error message on failure, null on success. */
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Sign out and clear all auth state. */
  signOut: () => Promise<void>;
}
