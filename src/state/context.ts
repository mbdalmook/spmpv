import { createContext, useContext } from "react";
import type { AppState, AppAction } from "../types";

// ---------------------------------------------------------------------------
// Navigation state
// ---------------------------------------------------------------------------
export interface NavigationState {
  currentPage: string;
  navigate: (page: string) => void;
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------
export const AppStateContext = createContext<AppState | null>(null);
export const AppDispatchContext = createContext<React.Dispatch<AppAction> | null>(null);
export const NavigationContext = createContext<NavigationState | null>(null);

// ---------------------------------------------------------------------------
// Typed hooks
// ---------------------------------------------------------------------------
export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (ctx === null) {
    throw new Error("useAppState must be used within an AppStateContext provider");
  }
  return ctx;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const ctx = useContext(AppDispatchContext);
  if (ctx === null) {
    throw new Error("useAppDispatch must be used within an AppDispatchContext provider");
  }
  return ctx;
}

export function useNavigation(): NavigationState {
  const ctx = useContext(NavigationContext);
  if (ctx === null) {
    throw new Error("useNavigation must be used within a NavigationContext provider");
  }
  return ctx;
}
