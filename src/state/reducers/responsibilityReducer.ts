import type { AppState, AppAction } from "../../types";

export function responsibilityReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_RESPONSIBILITY":
      return {
        ...state,
        responsibilities: [...state.responsibilities, action.payload],
      };
    case "UPDATE_RESPONSIBILITY":
      return {
        ...state,
        responsibilities: state.responsibilities.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r,
        ),
      };
    case "DELETE_RESPONSIBILITY":
      return {
        ...state,
        responsibilities: state.responsibilities.filter((r) => r.id !== action.payload),
      };
    case "TRANSFER_RESPONSIBILITY":
      return {
        ...state,
        responsibilities: state.responsibilities.map((r) =>
          r.id === action.payload.id ? { ...r, functionId: action.payload.newFunctionId } : r,
        ),
      };
    default:
      return state;
  }
}
