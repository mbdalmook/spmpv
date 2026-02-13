import type { AppState, AppAction } from "../../types";

export function departmentReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_DEPARTMENT":
      return { ...state, departments: [...state.departments, action.payload] };
    case "UPDATE_DEPARTMENT":
      return {
        ...state,
        departments: state.departments.map((d) =>
          d.id === action.payload.id ? { ...d, ...action.payload } : d,
        ),
      };
    case "DELETE_DEPARTMENT":
      return {
        ...state,
        departments: state.departments.filter((d) => d.id !== action.payload),
      };
    case "ASSIGN_MANAGER":
      return {
        ...state,
        departments: state.departments.map((d) =>
          d.id === action.payload.departmentId ? { ...d, managerId: action.payload.staffId } : d,
        ),
      };
    default:
      return state;
  }
}
