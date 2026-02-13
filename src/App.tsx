/**
 * App.tsx — Root component.
 *
 * Step 6 changes:
 * - Replaced buildSeedData() with useSupabaseData() hook
 * - Shows loading spinner during initial Supabase fetch
 * - Shows error state if fetch fails
 * - Toast provider wraps the app for success/error notifications
 */

import { useReducer, useState, useCallback, useMemo } from 'react';
import { AuthProvider, ProtectedRoute } from './auth';
import { useSupabaseData } from './hooks/useSupabaseData';
import { rootReducer } from './state/rootReducer';
import { AppStateContext, AppDispatchContext, NavigationContext } from './state/context';
import { ToastContainer, useToast } from './components/Toast';
import { ToastContext } from './components/ToastContext';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { PageRouter } from './layout/PageRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AppState } from './types/state';

// ─── Loading Screen ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Loading Seamless...</p>
      </div>
    </div>
  );
}

// ─── Error Screen ────────────────────────────────────────────────────────────

function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ─── App Shell (rendered after data is loaded) ───────────────────────────────

function AppShell({ initialData }: { initialData: AppState }) {
  const [state, dispatch] = useReducer(rootReducer, initialData);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('org-chart');
  const navigate = useCallback((id: string) => setCurrentPage(id), []);
  const navValue = useMemo(() => ({ currentPage, navigate }), [currentPage, navigate]);

  const { toasts, showToast, dismissToast } = useToast();
  const toastValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        <NavigationContext.Provider value={navValue}>
          <ToastContext.Provider value={toastValue}>
            <div className="min-h-screen bg-gray-50">
              <Sidebar isOpen={sidebarOpen} />
              <TopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              />
              <main
                className="pt-12 transition-all duration-200"
                style={{ marginLeft: sidebarOpen ? 256 : 0 }}
              >
                <div className="p-6">
                  <ErrorBoundary>
                    <PageRouter pageId={currentPage} />
                  </ErrorBoundary>
                </div>
              </main>
            </div>
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
          </ToastContext.Provider>
        </NavigationContext.Provider>
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// ─── Data Loader (sits inside ProtectedRoute) ────────────────────────────────

function DataLoader() {
  const { data, loading, error, refetch } = useSupabaseData();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={refetch} />;
  if (!data) return <ErrorScreen error="No data returned" onRetry={refetch} />;

  return <AppShell initialData={data} />;
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DataLoader />
      </ProtectedRoute>
    </AuthProvider>
  );
}
