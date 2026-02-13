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
  User,
  Workflow,
  WorkflowStep,
} from "./entities";

export interface AppState {
  companyProfile: CompanyProfile;
  appSettings: AppSettings;
  grades: Grade[];
  complianceTags: ComplianceTag[];
  departments: Department[];
  functions: OrgFunction[];
  staff: Staff[];
  responsibilities: Responsibility[];
  crossFunctionalTeams: CrossFunctionalTeam[];
  teamMembers: TeamMember[];
  workflows: Workflow[];
  workflowSteps: WorkflowStep[];
  companyNumbers: CompanyNumber[];
  companyNumberAllocations: CompanyNumberAllocation[];
  users: User[];
}
