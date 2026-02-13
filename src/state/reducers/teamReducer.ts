import type { AppState, AppAction } from "../../types";

export function teamReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_TEAM":
      return {
        ...state,
        crossFunctionalTeams: [...state.crossFunctionalTeams, action.payload.team],
        teamMembers: [...state.teamMembers, ...action.payload.members],
      };
    case "UPDATE_TEAM":
      return {
        ...state,
        crossFunctionalTeams: state.crossFunctionalTeams.map((t) =>
          t.id === action.payload.team.id ? { ...t, ...action.payload.team } : t,
        ),
        teamMembers: [
          ...state.teamMembers.filter((m) => m.teamId !== action.payload.team.id),
          ...action.payload.members,
        ],
      };
    case "DELETE_TEAM":
      return {
        ...state,
        crossFunctionalTeams: state.crossFunctionalTeams.filter((t) => t.id !== action.payload),
        teamMembers: state.teamMembers.filter((m) => m.teamId !== action.payload),
      };
    default:
      return state;
  }
}
