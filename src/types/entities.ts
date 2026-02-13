import {
  CompanyNumberAssignToType,
  EmailFormat,
  FunctionType,
  UserRole,
  WorkflowStatus,
} from "./enums";

// ---------------------------------------------------------------------------
// Entity 1: Department
// ---------------------------------------------------------------------------
export interface Department {
  id: string;
  uid: string;
  name: string;
  managerId: string | null;
}

// ---------------------------------------------------------------------------
// Entity 2: Function
// ---------------------------------------------------------------------------
export interface OrgFunction {
  id: string;
  uid: string;
  name: string;
  departmentId: string;
  type: FunctionType;
  email: string | null;
  phone: string | null;
}

// ---------------------------------------------------------------------------
// Entity 3: Responsibility
// ---------------------------------------------------------------------------
export interface Responsibility {
  id: string;
  uid: string;
  name: string;
  description: string;
  functionId: string;
  sopLink: string;
  isComplianceTagged: boolean;
  complianceTagId: string | null;
}

// ---------------------------------------------------------------------------
// Entity 4: Grade
// ---------------------------------------------------------------------------
export interface Grade {
  id: string;
  level: number;
  name: string;
}

// ---------------------------------------------------------------------------
// Entity 5: Staff
// ---------------------------------------------------------------------------
export interface Staff {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  gradeId: string | null;
  primaryFunctionId: string;
  secondaryFunctionId: string | null;
  additionalFunctionIds: string[];
}

// ---------------------------------------------------------------------------
// Entity 6: CrossFunctionalTeam
// ---------------------------------------------------------------------------
export interface CrossFunctionalTeam {
  id: string;
  uid: string;
  name: string;
  purpose: string;
  reportingDepartmentId: string;
  leadId: string | null;
}

// ---------------------------------------------------------------------------
// Entity 7: TeamMember (join table)
// ---------------------------------------------------------------------------
export interface TeamMember {
  id: string;
  teamId: string;
  staffId: string;
}

// ---------------------------------------------------------------------------
// Entity 8: Workflow
// ---------------------------------------------------------------------------
export interface Workflow {
  id: string;
  uid: string;
  name: string;
  description: string;
  ownerDepartmentId: string;
  status: WorkflowStatus;
}

// ---------------------------------------------------------------------------
// Entity 9: WorkflowStep (join table)
// ---------------------------------------------------------------------------
export interface WorkflowStep {
  id: string;
  workflowId: string;
  responsibilityId: string;
  stepOrder: number;
}

// ---------------------------------------------------------------------------
// Entity 10: ComplianceTag
// ---------------------------------------------------------------------------
export interface ComplianceTag {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Entity 11: CompanyNumber
// ---------------------------------------------------------------------------
export interface CompanyNumber {
  id: string;
  phoneNumber: string;
}

// ---------------------------------------------------------------------------
// Entity 12: CompanyNumberAllocation
// ---------------------------------------------------------------------------
export interface CompanyNumberAllocation {
  id: string;
  companyNumberId: string;
  assignToType: CompanyNumberAssignToType;
  staffId: string | null;
  functionId: string | null;
  departmentId: string | null;
}

// ---------------------------------------------------------------------------
// Entity 13: User
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  staffId: string | null;
}

// ---------------------------------------------------------------------------
// Entity 14: CompanyProfile (singleton)
// ---------------------------------------------------------------------------
export interface CompanyProfile {
  id: string;
  name: string;
  location: string;
  website: string;
  logoUrl: string;
}

// ---------------------------------------------------------------------------
// Entity 15: AppSettings (singleton)
// ---------------------------------------------------------------------------
export interface AppSettings {
  id: string;
  emailDomain: string;
  emailFormat: EmailFormat;
  maxManagerGradeLevel: number;
}
