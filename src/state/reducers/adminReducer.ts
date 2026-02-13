import type { AppState, AppAction } from "../../types";

export function adminReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ----- Compliance tags -----
    case "ADD_COMPLIANCE_TAG":
      return {
        ...state,
        complianceTags: [...state.complianceTags, action.payload],
      };
    case "UPDATE_COMPLIANCE_TAG":
      return {
        ...state,
        complianceTags: state.complianceTags.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t,
        ),
      };
    case "DELETE_COMPLIANCE_TAG":
      return {
        ...state,
        complianceTags: state.complianceTags.filter((t) => t.id !== action.payload),
      };

    // ----- Company numbers -----
    case "ADD_COMPANY_NUMBER":
      return {
        ...state,
        companyNumbers: [...state.companyNumbers, ...action.payload],
      };
    case "DELETE_COMPANY_NUMBER":
      return {
        ...state,
        companyNumbers: state.companyNumbers.filter((n) => n.id !== action.payload),
        companyNumberAllocations: state.companyNumberAllocations.filter(
          (a) => a.companyNumberId !== action.payload,
        ),
      };
    case "ALLOCATE_NUMBER":
      return {
        ...state,
        companyNumberAllocations: [...state.companyNumberAllocations, action.payload],
      };
    case "RELEASE_NUMBER":
      return {
        ...state,
        companyNumberAllocations: state.companyNumberAllocations.filter(
          (a) => a.id !== action.payload,
        ),
      };

    // ----- Settings & profile -----
    case "UPDATE_APP_SETTINGS":
      return {
        ...state,
        appSettings: { ...state.appSettings, ...action.payload },
      };
    case "UPDATE_COMPANY_PROFILE":
      return {
        ...state,
        companyProfile: { ...state.companyProfile, ...action.payload },
      };

    // ----- Grades -----
    case "ADD_GRADE":
      return { ...state, grades: [...state.grades, action.payload] };
    case "UPDATE_GRADE":
      return {
        ...state,
        grades: state.grades.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g,
        ),
      };
    case "DELETE_GRADE":
      return {
        ...state,
        grades: state.grades.filter((g) => g.id !== action.payload),
      };

    // ----- User roles -----
    case "UPDATE_USER_ROLE":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.userId ? { ...u, role: action.payload.role } : u,
        ),
      };

    default:
      return state;
  }
}
