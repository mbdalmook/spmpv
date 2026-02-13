/**
 * App Entry Point — Updated for Supabase Auth
 *
 * This file shows the CHANGES to your existing App.tsx.
 * The key additions are:
 *   1. Wrap everything with <AuthProvider>
 *   2. Wrap the main app content with <ProtectedRoute>
 *   3. Add a sign-out button to the TopBar
 *
 * Flow: Load → Check Auth → Login if needed → Show app (with existing seed data for now)
 */

// --- NEW IMPORTS (add these to the top of your existing App.tsx) ---
// import { AuthProvider, ProtectedRoute, useAuth } from './auth';

// --- UPDATED App COMPONENT ---
// Replace your current App component with this structure:

/*

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

// Move your existing App component body into AppContent:
function AppContent() {
  // ... all your existing state, providers, sidebar, router, etc.
  // This is exactly what your current App component does today.
  
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <NavigationContext.Provider value={{ currentPage, setCurrentPage }}>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-auto p-6">
                <PageRouter />
              </main>
            </div>
          </div>
        </NavigationContext.Provider>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

*/

// --- ADDING SIGN-OUT TO THE TOP BAR ---
// In your TopBar component, add the sign-out button.
// Here's the updated TopBar with auth integration:

/*

function TopBar() {
  const { role, signOut, appUser } = useAuth();

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div>{/* left side — your existing content *\/}</div>
      <div className="flex items-center gap-3">
        {/* Role badge *\/}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            {appUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-600">{role ?? 'Staff'}</span>
        </div>
        {/* Sign out *\/}
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

*/

// --- THAT'S IT ---
// The existing seed data, reducer, and all screens continue to work unchanged.
// In the next session, we'll rewire individual screens to use dataService
// instead of dispatch().

export {};
