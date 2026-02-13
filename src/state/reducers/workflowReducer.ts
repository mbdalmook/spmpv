import type { AppState, AppAction } from "../../types";

export function workflowReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_WORKFLOW":
      return {
        ...state,
        workflows: [...state.workflows, action.payload.workflow],
        workflowSteps: [...state.workflowSteps, ...action.payload.steps],
      };
    case "UPDATE_WORKFLOW":
      return {
        ...state,
        workflows: state.workflows.map((w) =>
          w.id === action.payload.workflow.id ? { ...w, ...action.payload.workflow } : w,
        ),
        workflowSteps: [
          ...state.workflowSteps.filter((s) => s.workflowId !== action.payload.workflow.id),
          ...action.payload.steps,
        ],
      };
    case "DELETE_WORKFLOW":
      return {
        ...state,
        workflows: state.workflows.filter((w) => w.id !== action.payload),
        workflowSteps: state.workflowSteps.filter((s) => s.workflowId !== action.payload),
      };
    default:
      return state;
  }
}
