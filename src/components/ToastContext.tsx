/**
 * ToastContext — Provides showToast() to any component in the tree.
 */

import { createContext, useContext } from 'react';

type ToastVariant = 'success' | 'error';

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useShowToast(): (message: string, variant: ToastVariant) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useShowToast must be used within a ToastContext.Provider');
  }
  return ctx.showToast;
}
