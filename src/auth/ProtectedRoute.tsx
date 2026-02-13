/**
 * Protected Route
 *
 * Wraps the main app content:
 * - Not authenticated → shows LoginPage
 * - Loading → shows loading spinner
 * - Authenticated → renders children
 */

import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { LoginPage } from '../screens/auth/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  // Still checking session on mount
  if (loading) {
    return <LoadingScreen />;
  }

  // Not signed in
  if (!session) {
    return <LoginPage />;
  }

  // Signed in — render the app
  return <>{children}</>;
}

// --- Loading spinner matching the app's visual style ---

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 mb-4">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
