import type { AppState, AppAction } from "../types";
import { departmentReducer } from "./reducers/departmentReducer";
import { staffReducer } from "./reducers/staffReducer";
import { functionReducer } from "./reducers/functionReducer";
import { responsibilityReducer } from "./reducers/responsibilityReducer";
import { workflowReducer } from "./reducers/workflowReducer";
import { teamReducer } from "./reducers/teamReducer";
import { adminReducer } from "./reducers/adminReducer";

/**
 * All domain reducers chained in sequence.
 * Each receives the full AppState and returns it (potentially updated).
 * Only one will actually modify state for any given action type; the rest
 * pass it through via their `default` branch.
 */
const domainReducers: ReadonlyArray<(state: AppState, action: AppAction) => AppState> = [
  departmentReducer,
  staffReducer,
  functionReducer,
  responsibilityReducer,
  workflowReducer,
  teamReducer,
  adminReducer,
];

export function rootReducer(state: AppState, action: AppAction): AppState {
  return domainReducers.reduce((currentState, reducer) => reducer(currentState, action), state);
}
