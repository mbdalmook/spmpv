import type { AppState } from "../types/state";
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
} from "../types/entities";
import {
  CompanyNumberAssignToType,
  EmailFormat,
  FunctionType,
  UserRole,
  WorkflowStatus,
} from "../types/enums";
import { generateId } from "../utils/id";

export function buildSeedData(): AppState {
  // -- Singletons ----------------------------------------------------------

  const companyProfile: CompanyProfile = {
    id: generateId(),
    name: "Seamless Distribution",
    location: "Dubai, United Arab Emirates",
    website: "www.seamless.ae",
    logoUrl: "",
  };

  const appSettings: AppSettings = {
    id: generateId(),
    emailDomain: "acme.ae",
    emailFormat: EmailFormat.FirstnameL,
    maxManagerGradeLevel: 1,
  };

  // -- Grades --------------------------------------------------------------

  const grades: Grade[] = [
    { id: generateId(), level: 0, name: "MD" },
    { id: generateId(), level: 1, name: "Manager" },
    { id: generateId(), level: 2, name: "Senior" },
    { id: generateId(), level: 3, name: "Staff" },
  ];

  // -- Compliance Tags -----------------------------------------------------

  const complianceTags: ComplianceTag[] = [
    { id: generateId(), name: "Annual" },
    { id: generateId(), name: "Transactional" },
  ];

  // -- Departments ---------------------------------------------------------

  const departments: Department[] = [
    { id: generateId(), uid: "001", name: "Operations", managerId: null },
    { id: generateId(), uid: "002", name: "Finance", managerId: null },
    { id: generateId(), uid: "003", name: "Human Resources", managerId: null },
    { id: generateId(), uid: "004", name: "Property Management", managerId: null },
    { id: generateId(), uid: "005", name: "Facilities", managerId: null },
    { id: generateId(), uid: "006", name: "IT & Systems", managerId: null },
    { id: generateId(), uid: "007", name: "Legal & Compliance", managerId: null },
    { id: generateId(), uid: "008", name: "Marketing", managerId: null },
  ];

  // -- Functions -----------------------------------------------------------

  const functions: OrgFunction[] = [
    {
      id: generateId(),
      uid: "001",
      name: "Process Management",
      departmentId: departments[0]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "002",
      name: "Vendor Coordination",
      departmentId: departments[0]!.id,
      type: FunctionType.External,
      email: "vendors@acme.ae",
      phone: null,
    },
    {
      id: generateId(),
      uid: "003",
      name: "Accounts Payable",
      departmentId: departments[1]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "004",
      name: "Financial Reporting",
      departmentId: departments[1]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "005",
      name: "Recruitment",
      departmentId: departments[2]!.id,
      type: FunctionType.External,
      email: "careers@acme.ae",
      phone: "+971 4 555 0201",
    },
    {
      id: generateId(),
      uid: "006",
      name: "Employee Relations",
      departmentId: departments[2]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "007",
      name: "Tenant Relations",
      departmentId: departments[3]!.id,
      type: FunctionType.External,
      email: "tenants@acme.ae",
      phone: "+971 4 555 0301",
    },
    {
      id: generateId(),
      uid: "008",
      name: "Lease Administration",
      departmentId: departments[3]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "009",
      name: "Maintenance",
      departmentId: departments[4]!.id,
      type: FunctionType.External,
      email: "maintenance@acme.ae",
      phone: "+971 4 555 0401",
    },
    {
      id: generateId(),
      uid: "010",
      name: "Security Management",
      departmentId: departments[4]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "011",
      name: "IT Support",
      departmentId: departments[5]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "012",
      name: "Contract Review",
      departmentId: departments[6]!.id,
      type: FunctionType.Internal,
      email: null,
      phone: null,
    },
    {
      id: generateId(),
      uid: "013",
      name: "Digital Marketing",
      departmentId: departments[7]!.id,
      type: FunctionType.External,
      email: null,
      phone: null,
    },
  ];

  // -- Staff ---------------------------------------------------------------

  const staff: Staff[] = [
    {
      id: generateId(),
      uid: "001",
      firstName: "Ahmed",
      lastName: "Al Maktoum",
      departmentId: departments[0]!.id,
      gradeId: grades[0]!.id,
      primaryFunctionId: functions[0]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "002",
      firstName: "Fatima",
      lastName: "Hassan",
      departmentId: departments[0]!.id,
      gradeId: grades[1]!.id,
      primaryFunctionId: functions[0]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "003",
      firstName: "Omar",
      lastName: "Khalil",
      departmentId: departments[1]!.id,
      gradeId: grades[1]!.id,
      primaryFunctionId: functions[2]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "004",
      firstName: "Sara",
      lastName: "Ibrahim",
      departmentId: departments[2]!.id,
      gradeId: grades[1]!.id,
      primaryFunctionId: functions[4]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "005",
      firstName: "Khalid",
      lastName: "Rashid",
      departmentId: departments[3]!.id,
      gradeId: grades[1]!.id,
      primaryFunctionId: functions[6]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "006",
      firstName: "Layla",
      lastName: "Ahmed",
      departmentId: departments[4]!.id,
      gradeId: grades[1]!.id,
      primaryFunctionId: functions[8]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "007",
      firstName: "Yusuf",
      lastName: "Noor",
      departmentId: departments[0]!.id,
      gradeId: grades[2]!.id,
      primaryFunctionId: functions[1]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "008",
      firstName: "Mariam",
      lastName: "Sayed",
      departmentId: departments[1]!.id,
      gradeId: grades[2]!.id,
      primaryFunctionId: functions[2]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "009",
      firstName: "Hassan",
      lastName: "Ali",
      departmentId: departments[3]!.id,
      gradeId: grades[3]!.id,
      primaryFunctionId: functions[6]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
    {
      id: generateId(),
      uid: "010",
      firstName: "Nadia",
      lastName: "Farouk",
      departmentId: departments[4]!.id,
      gradeId: grades[3]!.id,
      primaryFunctionId: functions[8]!.id,
      secondaryFunctionId: null,
      additionalFunctionIds: [],
    },
  ];

  // -- Assign managers (after staff created) --------------------------------

  departments[0]!.managerId = staff[1]!.id; // Fatima → Operations
  departments[1]!.managerId = staff[2]!.id; // Omar → Finance
  departments[2]!.managerId = staff[3]!.id; // Sara → HR
  departments[3]!.managerId = staff[4]!.id; // Khalid → Property Mgmt
  departments[4]!.managerId = staff[5]!.id; // Layla → Facilities

  // -- Responsibilities ----------------------------------------------------

  const responsibilities: Responsibility[] = [
    {
      id: generateId(),
      uid: "001",
      name: "Daily Operations Checklist",
      description: "Complete daily ops checklist for all properties",
      functionId: functions[0]!.id,
      sopLink: "https://sop.acme.ae/ops-checklist",
      isComplianceTagged: true,
      complianceTagId: complianceTags[1]!.id,
    },
    {
      id: generateId(),
      uid: "002",
      name: "Vendor Onboarding",
      description: "Vet and onboard new service vendors",
      functionId: functions[1]!.id,
      sopLink: "",
      isComplianceTagged: true,
      complianceTagId: complianceTags[1]!.id,
    },
    {
      id: generateId(),
      uid: "003",
      name: "Invoice Processing",
      description: "Process and approve vendor invoices",
      functionId: functions[2]!.id,
      sopLink: "https://sop.acme.ae/invoice",
      isComplianceTagged: true,
      complianceTagId: complianceTags[1]!.id,
    },
    {
      id: generateId(),
      uid: "004",
      name: "Monthly Financial Report",
      description: "Prepare P&L and cash flow reports",
      functionId: functions[3]!.id,
      sopLink: "https://sop.acme.ae/fin-report",
      isComplianceTagged: true,
      complianceTagId: complianceTags[0]!.id,
    },
    {
      id: generateId(),
      uid: "005",
      name: "Job Posting & Screening",
      description: "Post vacancies and screen applicants",
      functionId: functions[4]!.id,
      sopLink: "",
      isComplianceTagged: false,
      complianceTagId: null,
    },
    {
      id: generateId(),
      uid: "006",
      name: "Tenant Complaint Resolution",
      description: "Handle and resolve tenant complaints within SLA",
      functionId: functions[6]!.id,
      sopLink: "https://sop.acme.ae/tenant-complaint",
      isComplianceTagged: true,
      complianceTagId: complianceTags[1]!.id,
    },
    {
      id: generateId(),
      uid: "007",
      name: "Lease Renewal Processing",
      description: "Process lease renewals 90 days before expiry",
      functionId: functions[7]!.id,
      sopLink: "https://sop.acme.ae/lease-renewal",
      isComplianceTagged: true,
      complianceTagId: complianceTags[0]!.id,
    },
    {
      id: generateId(),
      uid: "008",
      name: "Preventive Maintenance Schedule",
      description: "Execute quarterly preventive maintenance",
      functionId: functions[8]!.id,
      sopLink: "https://sop.acme.ae/maintenance",
      isComplianceTagged: true,
      complianceTagId: complianceTags[0]!.id,
    },
    {
      id: generateId(),
      uid: "009",
      name: "Security Patrol Logs",
      description: "Maintain daily patrol and incident logs",
      functionId: functions[9]!.id,
      sopLink: "",
      isComplianceTagged: true,
      complianceTagId: complianceTags[1]!.id,
    },
    {
      id: generateId(),
      uid: "010",
      name: "Contract Compliance Audit",
      description: "Annual audit of all active contracts",
      functionId: functions[11]!.id,
      sopLink: "https://sop.acme.ae/contract-audit",
      isComplianceTagged: true,
      complianceTagId: complianceTags[0]!.id,
    },
  ];

  // -- Cross-Functional Teams ----------------------------------------------

  const crossFunctionalTeams: CrossFunctionalTeam[] = [
    {
      id: generateId(),
      uid: "001",
      name: "Process & Standards",
      purpose: "Define and maintain company-wide process standards",
      reportingDepartmentId: departments[0]!.id,
      leadId: staff[6]!.id,
    },
  ];

  const teamMembers: TeamMember[] = [
    { id: generateId(), teamId: crossFunctionalTeams[0]!.id, staffId: staff[7]!.id },
    { id: generateId(), teamId: crossFunctionalTeams[0]!.id, staffId: staff[3]!.id },
  ];

  // -- Workflows -----------------------------------------------------------

  const workflows: Workflow[] = [
    {
      id: generateId(),
      uid: "001",
      name: "Dummy Work flow",
      description: "Test test test",
      ownerDepartmentId: departments[0]!.id,
      status: WorkflowStatus.Active,
    },
  ];

  const workflowSteps: WorkflowStep[] = [
    {
      id: generateId(),
      workflowId: workflows[0]!.id,
      responsibilityId: responsibilities[0]!.id,
      stepOrder: 1,
    },
    {
      id: generateId(),
      workflowId: workflows[0]!.id,
      responsibilityId: responsibilities[3]!.id,
      stepOrder: 2,
    },
  ];

  // -- Company Numbers -----------------------------------------------------

  const companyNumbers: CompanyNumber[] = [];
  for (let i = 1; i <= 22; i++) {
    companyNumbers.push({ id: generateId(), phoneNumber: `0455555${String(i).padStart(2, "0")}` });
  }

  const companyNumberAllocations: CompanyNumberAllocation[] = [
    {
      id: generateId(),
      companyNumberId: companyNumbers[1]!.id,
      assignToType: CompanyNumberAssignToType.Department,
      staffId: null,
      functionId: null,
      departmentId: departments[0]!.id,
    },
    {
      id: generateId(),
      companyNumberId: companyNumbers[5]!.id,
      assignToType: CompanyNumberAssignToType.Function,
      staffId: null,
      functionId: functions[1]!.id,
      departmentId: null,
    },
  ];

  // -- Users ---------------------------------------------------------------

  const users: User[] = [
    {
      id: generateId(),
      username: "Majidf",
      email: "mbd@seamless.ae",
      role: UserRole.SuperAdmin,
      staffId: null,
    },
    ...staff.map(
      (s): User => ({
        id: generateId(),
        username: "",
        email: "",
        role: UserRole.Staff,
        staffId: s.id,
      }),
    ),
  ];

  // -- Return full state ---------------------------------------------------

  return {
    companyProfile,
    appSettings,
    grades,
    complianceTags,
    departments,
    functions,
    staff,
    responsibilities,
    crossFunctionalTeams,
    teamMembers,
    workflows,
    workflowSteps,
    companyNumbers,
    companyNumberAllocations,
    users,
  };
}
