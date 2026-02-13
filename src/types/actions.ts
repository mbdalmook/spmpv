import type {
  AppSettings,
  CompanyNumber,
  CompanyNumberAllocation,
  CompanyProfile,
  ComplianceTag,
  CrossFunctionalTeam,
  Department,
  OrgFunction,
  Grade,
  Responsibility,
  Staff,
  TeamMember,
  Workflow,
  WorkflowStep,
} from "./entities";
import type { UserRole } from "./enums";

// ---------------------------------------------------------------------------
// Department actions
// ---------------------------------------------------------------------------
export interface AddDepartmentAction {
  type: "ADD_DEPARTMENT";
  payload: Department;
}

export interface UpdateDepartmentAction {
  type: "UPDATE_DEPARTMENT";
  payload: Partial<Department> & { id: string };
}

export interface DeleteDepartmentAction {
  type: "DELETE_DEPARTMENT";
  payload: string; // department id
}

export interface AssignManagerAction {
  type: "ASSIGN_MANAGER";
  payload: { departmentId: string; staffId: string | null };
}

// ---------------------------------------------------------------------------
// Function actions
// ---------------------------------------------------------------------------
export interface AddFunctionAction {
  type: "ADD_FUNCTION";
  payload: OrgFunction;
}

export interface UpdateFunctionAction {
  type: "UPDATE_FUNCTION";
  payload: Partial<OrgFunction> & { id: string };
}

export interface DeleteFunctionAction {
  type: "DELETE_FUNCTION";
  payload: string; // function id
}

// ---------------------------------------------------------------------------
// Grade actions
// ---------------------------------------------------------------------------
export interface AddGradeAction {
  type: "ADD_GRADE";
  payload: Grade;
}

export interface UpdateGradeAction {
  type: "UPDATE_GRADE";
  payload: Partial<Grade> & { id: string };
}

export interface DeleteGradeAction {
  type: "DELETE_GRADE";
  payload: string; // grade id
}

// ---------------------------------------------------------------------------
// Staff actions
// ---------------------------------------------------------------------------
export interface AddStaffAction {
  type: "ADD_STAFF";
  payload: Staff;
}

export interface UpdateStaffAction {
  type: "UPDATE_STAFF";
  payload: Partial<Staff> & { id: string };
}

export interface DeleteStaffAction {
  type: "DELETE_STAFF";
  payload: string; // staff id
}

// ---------------------------------------------------------------------------
// Responsibility actions
// ---------------------------------------------------------------------------
export interface AddResponsibilityAction {
  type: "ADD_RESPONSIBILITY";
  payload: Responsibility;
}

export interface UpdateResponsibilityAction {
  type: "UPDATE_RESPONSIBILITY";
  payload: Partial<Responsibility> & { id: string };
}

export interface DeleteResponsibilityAction {
  type: "DELETE_RESPONSIBILITY";
  payload: string; // responsibility id
}

export interface TransferResponsibilityAction {
  type: "TRANSFER_RESPONSIBILITY";
  payload: { id: string; newFunctionId: string };
}

// ---------------------------------------------------------------------------
// Compliance tag actions
// ---------------------------------------------------------------------------
export interface AddComplianceTagAction {
  type: "ADD_COMPLIANCE_TAG";
  payload: ComplianceTag;
}

export interface UpdateComplianceTagAction {
  type: "UPDATE_COMPLIANCE_TAG";
  payload: Partial<ComplianceTag> & { id: string };
}

export interface DeleteComplianceTagAction {
  type: "DELETE_COMPLIANCE_TAG";
  payload: string; // tag id
}

// ---------------------------------------------------------------------------
// Cross-functional team actions
// ---------------------------------------------------------------------------
export interface AddTeamAction {
  type: "ADD_TEAM";
  payload: { team: CrossFunctionalTeam; members: TeamMember[] };
}

export interface UpdateTeamAction {
  type: "UPDATE_TEAM";
  payload: { team: CrossFunctionalTeam; members: TeamMember[] };
}

export interface DeleteTeamAction {
  type: "DELETE_TEAM";
  payload: string; // team id
}

// ---------------------------------------------------------------------------
// Workflow actions
// ---------------------------------------------------------------------------
export interface AddWorkflowAction {
  type: "ADD_WORKFLOW";
  payload: { workflow: Workflow; steps: WorkflowStep[] };
}

export interface UpdateWorkflowAction {
  type: "UPDATE_WORKFLOW";
  payload: { workflow: Workflow; steps: WorkflowStep[] };
}

export interface DeleteWorkflowAction {
  type: "DELETE_WORKFLOW";
  payload: string; // workflow id
}

// ---------------------------------------------------------------------------
// Company number actions
// ---------------------------------------------------------------------------
export interface AddCompanyNumberAction {
  type: "ADD_COMPANY_NUMBER";
  payload: CompanyNumber[];
}

export interface DeleteCompanyNumberAction {
  type: "DELETE_COMPANY_NUMBER";
  payload: string; // company number id
}

export interface AllocateNumberAction {
  type: "ALLOCATE_NUMBER";
  payload: CompanyNumberAllocation;
}

export interface ReleaseNumberAction {
  type: "RELEASE_NUMBER";
  payload: string; // allocation id
}

// ---------------------------------------------------------------------------
// Settings & profile actions
// ---------------------------------------------------------------------------
export interface UpdateAppSettingsAction {
  type: "UPDATE_APP_SETTINGS";
  payload: Partial<AppSettings>;
}

export interface UpdateCompanyProfileAction {
  type: "UPDATE_COMPANY_PROFILE";
  payload: Partial<CompanyProfile>;
}

// ---------------------------------------------------------------------------
// User actions
// ---------------------------------------------------------------------------
export interface UpdateUserRoleAction {
  type: "UPDATE_USER_ROLE";
  payload: { userId: string; role: UserRole };
}

// ---------------------------------------------------------------------------
// Discriminated union of all actions
// ---------------------------------------------------------------------------
export type AppAction =
  | AddDepartmentAction
  | UpdateDepartmentAction
  | DeleteDepartmentAction
  | AssignManagerAction
  | AddFunctionAction
  | UpdateFunctionAction
  | DeleteFunctionAction
  | AddGradeAction
  | UpdateGradeAction
  | DeleteGradeAction
  | AddStaffAction
  | UpdateStaffAction
  | DeleteStaffAction
  | AddResponsibilityAction
  | UpdateResponsibilityAction
  | DeleteResponsibilityAction
  | TransferResponsibilityAction
  | AddComplianceTagAction
  | UpdateComplianceTagAction
  | DeleteComplianceTagAction
  | AddTeamAction
  | UpdateTeamAction
  | DeleteTeamAction
  | AddWorkflowAction
  | UpdateWorkflowAction
  | DeleteWorkflowAction
  | AddCompanyNumberAction
  | DeleteCompanyNumberAction
  | AllocateNumberAction
  | ReleaseNumberAction
  | UpdateAppSettingsAction
  | UpdateCompanyProfileAction
  | UpdateUserRoleAction;
