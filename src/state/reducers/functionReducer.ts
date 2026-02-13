import type { AppState, AppAction } from "../../types";

export function functionReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_FUNCTION":
      return { ...state, functions: [...state.functions, action.payload] };
    case "UPDATE_FUNCTION":
      return {
        ...state,
        functions: state.functions.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload } : f,
        ),
      };
    case "DELETE_FUNCTION":
      return {
        ...state,
        functions: state.functions.filter((f) => f.id !== action.payload),
      };
    default:
      return state;
  }
}
