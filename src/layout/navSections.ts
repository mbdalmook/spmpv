import type { ComponentType, SVGProps } from "react";
import {
  Building2,
  Users,
  Shield,
  GitBranch,
  Layers,
  Network,
  ClipboardList,
  GraduationCap,
  UserCircle,
  UsersRound,
  Settings,
  Mail,
  Phone,
  Tags,
  Gauge,
  Building,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "VIEWS",
    items: [
      { id: "org-chart", label: "Org Chart", icon: Network },
      { id: "compliance", label: "Compliance", icon: Shield },
      { id: "workflows", label: "Workflows", icon: GitBranch },
    ],
  },
  {
    label: "PEOPLE & STRUCTURE",
    items: [
      { id: "departments", label: "Departments", icon: Building2 },
      { id: "functions", label: "Functions", icon: Layers },
      { id: "responsibilities", label: "Responsibilities", icon: ClipboardList },
      { id: "grades", label: "Grades", icon: GraduationCap },
      { id: "staff", label: "Staff", icon: UserCircle },
      { id: "cross-functional-teams", label: "Cross-Functional Teams", icon: UsersRound },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { id: "workflow-manager", label: "Workflow Manager", icon: Settings },
      { id: "email-card-creator", label: "Email & Card Creator", icon: Mail },
      { id: "contact-manager", label: "Contact Manager", icon: Phone },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { id: "user-management", label: "User Management", icon: Users },
      { id: "email-format", label: "Email Format", icon: Mail },
      { id: "company-numbers", label: "Company Numbers", icon: Phone },
      { id: "compliance-tags", label: "Compliance Tags", icon: Tags },
      { id: "manager-threshold", label: "Manager Threshold", icon: Gauge },
      { id: "company-profile", label: "Company Profile", icon: Building },
    ],
  },
];
