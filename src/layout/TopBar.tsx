/**
 * TopBar — App header with sidebar toggle, user role display, and sign-out.
 *
 * Step 6 changes:
 * - Shows actual user role from auth context (not hardcoded "Super Admin")
 * - Adds sign-out button
 */

import { useState } from 'react';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../auth';

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ sidebarOpen, onToggleSidebar }: TopBarProps) {
  const { user, role, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';
  const displayRole = role ?? 'User';

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <header
      className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 right-0 z-30"
      style={{ left: sidebarOpen ? 256 : 0 }}
    >
      <button
        onClick={onToggleSidebar}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">{initial}</span>
        </div>
        {/* Role */}
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <UserCircle className="w-3.5 h-3.5" />
          {displayRole}
        </span>
        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{signingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>
    </header>
  );
}
