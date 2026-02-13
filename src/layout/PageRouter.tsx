import { useAppState } from "../state/context";
import { PageHeader } from "../components/PageHeader";

// Admin screens (Step 4-C)
import { ComplianceTagsPage } from "../screens/admin/ComplianceTags";
import { GradesPage } from "../screens/admin/Grades";
import { EmailFormatPage } from "../screens/admin/EmailFormat";
import { ManagerThresholdPage } from "../screens/admin/ManagerThreshold";
import { CompanyNumbersPage } from "../screens/admin/CompanyNumbers";
import { CompanyProfilePage } from "../screens/admin/CompanyProfile";

// Entity screens (Step 4-D)
import { DepartmentsPage } from "../screens/entities/Departments";
import { FunctionsPage } from "../screens/entities/Functions";
import { ResponsibilitiesPage } from "../screens/entities/Responsibilities";
import { StaffPage } from "../screens/entities/Staff";
import { CrossFunctionalTeamsPage } from "../screens/entities/CrossFunctionalTeams";

// User screens (Step 4-D)
import { UserManagementPage } from "../screens/user/UserManagement";

// View screens (Step 4-E)
import { OrgChartPage } from "../screens/views/OrgChart";
import { CompliancePage } from "../screens/views/Compliance";

// Workflow screens (Step 4-E)
import { WorkflowsViewPage } from "../screens/workflows/WorkflowsView";
import { WorkflowManagerPage } from "../screens/workflows/WorkflowManager";

// Tool screens (Step 4-E)
import { EmailCardCreatorPage } from "../screens/tools/EmailCardCreator";
import { ContactManagerPage } from "../screens/tools/ContactManager";

// ---------------------------------------------------------------------------
// Page title map
// ---------------------------------------------------------------------------

interface PageInfo {
  title: string;
  subtitle: string;
}

const PAGE_TITLES: Record<string, PageInfo> = {
  "org-chart": { title: "Org Chart", subtitle: "Company hierarchy overview" },
  compliance: { title: "Compliance", subtitle: "All compliance-tagged obligations" },
  workflows: { title: "Workflows", subtitle: "Overview of all workflows across departments" },
  departments: {
    title: "Departments",
    subtitle: "Manage organisational departments and their managers",
  },
  functions: { title: "Functions", subtitle: "Manage functional areas within departments" },
  responsibilities: {
    title: "Responsibilities",
    subtitle: "All responsibilities across functions",
  },
  staff: {
    title: "Staff Directory",
    subtitle: "Manage staff profiles, grades, and function assignments",
  },
  "cross-functional-teams": {
    title: "Cross-Functional Teams",
    subtitle: "Manage teams that span across departments",
  },
  "workflow-manager": {
    title: "Workflow Manager",
    subtitle: "Create and manage workflow sequences",
  },
  "email-card-creator": {
    title: "Email & Card Creator",
    subtitle: "Generate business cards and email signatures for staff",
  },
  "contact-manager": { title: "Contact Manager", subtitle: "Manage phone number allocations" },
  "user-management": { title: "User Management", subtitle: "Manage user roles and permissions" },
};

// ---------------------------------------------------------------------------
// Router map — all screens wired, zero placeholders
// ---------------------------------------------------------------------------

type PageComponent = React.ComponentType;

const PAGES: Record<string, PageComponent> = {
  // Views (Step 4-E)
  "org-chart": OrgChartPage,
  compliance: CompliancePage,
  // Workflows (Step 4-E)
  workflows: WorkflowsViewPage,
  "workflow-manager": WorkflowManagerPage,
  // Entity (Step 4-D)
  departments: DepartmentsPage,
  functions: FunctionsPage,
  responsibilities: ResponsibilitiesPage,
  staff: StaffPage,
  "cross-functional-teams": CrossFunctionalTeamsPage,
  // Tools (Step 4-E)
  "email-card-creator": EmailCardCreatorPage,
  "contact-manager": ContactManagerPage,
  // Admin (Step 4-C)
  "compliance-tags": ComplianceTagsPage,
  grades: GradesPage,
  "email-format": EmailFormatPage,
  "manager-threshold": ManagerThresholdPage,
  "company-numbers": CompanyNumbersPage,
  "company-profile": CompanyProfilePage,
  // User (Step 4-D)
  "user-management": UserManagementPage,
};

interface PageRouterProps {
  pageId: string;
}

export function PageRouter({ pageId }: PageRouterProps) {
  const Component = PAGES[pageId];
  if (Component) return <Component />;
  return <UnknownPage pageId={pageId} />;
}

function UnknownPage({ pageId }: { pageId: string }) {
  useAppState();
  const info = PAGE_TITLES[pageId] ?? { title: pageId, subtitle: "" };
  return (
    <div>
      <PageHeader title={info.title} subtitle={info.subtitle} />
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">Page not found: {pageId}</p>
      </div>
    </div>
  );
}
