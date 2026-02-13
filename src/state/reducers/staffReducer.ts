import type { AppState, AppAction } from "../../types";

export function staffReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_STAFF":
      return { ...state, staff: [...state.staff, action.payload] };
    case "UPDATE_STAFF":
      return {
        ...state,
        staff: state.staff.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s,
        ),
      };
    case "DELETE_STAFF":
      return {
        ...state,
        staff: state.staff.filter((s) => s.id !== action.payload),
      };
    default:
      return state;
  }
}
