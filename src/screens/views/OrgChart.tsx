import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Globe,
  Layers,
  Network,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";
import { useAppState } from "../../state/context";
import { getDepartmentStatus } from "../../utils/department";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/Badge";
import { PrimaryButton } from "../../components/PrimaryButton";
import type { CrossFunctionalTeam, Department } from "../../types";
import { DepartmentStatus, FunctionType } from "../../types";
import { getStaffFullName } from "../../utils/staff";

type DeptWithStatus = Department & { status: DepartmentStatus };

export function OrgChartPage() {
  const state = useAppState();
  const [expanded, setExpanded] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const getDept = (id: string) => state.departments.find((d) => d.id === id);
  const getStaff = (id: string) => state.staff.find((s) => s.id === id);
  const getFunctionsForDept = (deptId: string) =>
    state.functions.filter((f) => f.departmentId === deptId);
  const getStaffForDept = (deptId: string) => state.staff.filter((s) => s.departmentId === deptId);
  const getRespForDept = (deptId: string) => {
    const fnIds = getFunctionsForDept(deptId).map((f) => f.id);
    return state.responsibilities.filter((r) => fnIds.includes(r.functionId));
  };
  const getTeamMembers = (teamId: string) => state.teamMembers.filter((m) => m.teamId === teamId);

  // Find MD — grade level 0
  const mdGrade = state.grades.find((g) => g.level === 0);
  const mdStaff = mdGrade ? state.staff.find((s) => s.gradeId === mdGrade.id) : null;

  // Split departments into managed vs unmanaged
  const deptWithStatus: DeptWithStatus[] = state.departments.map((d) => {
    const status = getDepartmentStatus(
      d,
      state.staff,
      state.grades,
      state.appSettings.maxManagerGradeLevel,
    );
    return { ...d, status };
  });
  const managedDepts = deptWithStatus.filter(
    (d) => d.status === DepartmentStatus.Managed || d.status === DepartmentStatus.Acting,
  );
  const unmanagedDepts = deptWithStatus.filter((d) => d.status === DepartmentStatus.Unmanaged);

  const toggleExpandAll = () => {
    if (expanded) {
      setExpandedDepts({});
      setExpanded(false);
    } else {
      const all: Record<string, boolean> = {};
      state.departments.forEach((d) => {
        all[d.id] = true;
      });
      setExpandedDepts(all);
      setExpanded(true);
    }
  };

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const DeptCard = ({ dept, isManaged }: { dept: DeptWithStatus; isManaged: boolean }) => {
    const manager = dept.managerId ? getStaff(dept.managerId) : null;
    const fns = getFunctionsForDept(dept.id);
    const staffList = getStaffForDept(dept.id);
    const resps = getRespForDept(dept.id);
    const isExpanded = expandedDepts[dept.id] || false;

    return (
      <div
        className={`bg-white rounded-lg border ${isManaged ? "border-gray-200" : "border-red-200 border-dashed"} overflow-hidden`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isManaged ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-xs text-gray-400 font-mono">{dept.uid}</span>
            </div>
            <Badge variant={isManaged ? "success" : "error"}>
              {isManaged ? "managed" : "unmanaged"}
            </Badge>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{dept.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {manager ? getStaffFullName(manager) : "No manager"}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {fns.length}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {staffList.length}
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList className="w-3 h-3" />
              {resps.length}
            </span>
          </div>
        </div>
        {/* Expand/collapse functions */}
        <button
          onClick={() => toggleDept(dept.id)}
          className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-100 text-xs text-gray-400 hover:bg-gray-50 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {isExpanded ? "Hide functions" : `${fns.length} functions`}
        </button>
        {isExpanded && fns.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2 space-y-1.5 bg-gray-50/50">
            {fns.map((fn) => (
              <div key={fn.id} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-mono">{fn.uid}</span>
                <span className="text-gray-700">{fn.name}</span>
                {fn.type === FunctionType.External ? (
                  <Globe className="w-3 h-3 text-amber-500 ml-auto" />
                ) : (
                  <Shield className="w-3 h-3 text-gray-400 ml-auto" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TeamCard = ({ team }: { team: CrossFunctionalTeam }) => {
    const lead = team.leadId ? getStaff(team.leadId) : null;
    const members = getTeamMembers(team.id);
    const allStaffIds = [...members.map((m) => m.staffId), team.leadId].filter(Boolean) as string[];
    const fnIds = allStaffIds.flatMap((sid) => {
      const s = getStaff(sid);
      if (!s) return [];
      return [
        s.primaryFunctionId,
        s.secondaryFunctionId,
        ...(s.additionalFunctionIds || []),
      ].filter(Boolean) as string[];
    });
    const teamResps = state.responsibilities.filter((r) => fnIds.includes(r.functionId));

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs text-gray-400 font-mono mb-1">{team.uid}</p>
        <h3 className="font-semibold text-gray-900 text-sm">{team.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Lead: {lead ? getStaffFullName(lead) : "No lead"}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1" title="Members">
            <Users className="w-3 h-3" />
            {members.length + (lead ? 1 : 0)}
          </span>
          <span className="flex items-center gap-1" title="Responsibilities">
            <ClipboardList className="w-3 h-3" />
            {teamResps.length}
          </span>
        </div>
      </div>
    );
  };

  // Group teams by reporting department
  const teamsByDept: Record<string, CrossFunctionalTeam[]> = {};
  state.crossFunctionalTeams.forEach((t) => {
    const dId = t.reportingDepartmentId;
    if (!teamsByDept[dId]) teamsByDept[dId] = [];
    teamsByDept[dId].push(t);
  });

  return (
    <div>
      <PageHeader
        title="Org Chart"
        subtitle="Company hierarchy overview"
        action={
          <PrimaryButton onClick={toggleExpandAll} variant="secondary" icon={Network}>
            {expanded ? "Collapse All" : "Expand All"}
          </PrimaryButton>
        }
      />

      {/* MD Card at top */}
      {mdStaff && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Connector line down */}
            <div className="absolute left-1/2 bottom-0 w-px h-6 bg-gray-200 translate-y-full" />
            <div className="bg-white rounded-xl border-2 border-blue-200 px-10 py-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">
                  {mdStaff.firstName[0]}
                  {mdStaff.lastName[0]}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{getStaffFullName(mdStaff)}</p>
              <p className="text-xs text-gray-400 mt-0.5">MD</p>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal connector line */}
      {managedDepts.length > 0 && (
        <div className="flex justify-center mb-2 mt-6">
          <div className="w-px h-6 bg-gray-200" />
        </div>
      )}

      {/* Managed Departments */}
      {managedDepts.length > 0 && (
        <div className="mb-8">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(managedDepts.length, 5)}, minmax(0, 1fr))`,
            }}
          >
            {managedDepts.map((dept) => (
              <div key={dept.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-200 mb-2" />
                <div className="w-full">
                  <DeptCard dept={dept} isManaged={true} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmanaged Departments */}
      {unmanagedDepts.length > 0 && (
        <div className="mb-8 bg-red-50/40 rounded-xl border border-red-100 border-dashed p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Unmanaged Departments
            </span>
            <Badge variant="error">{unmanagedDepts.length}</Badge>
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(unmanagedDepts.length, 5)}, minmax(0, 1fr))`,
            }}
          >
            {unmanagedDepts.map((dept) => (
              <div key={dept.id} className="flex flex-col items-center">
                <div
                  className="w-px h-4 bg-gray-300 border-dashed mb-2"
                  style={{ borderLeft: "2px dashed #d1d5db" }}
                />
                <div className="w-full">
                  <DeptCard dept={dept} isManaged={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Functional Teams */}
      {state.crossFunctionalTeams.length > 0 && (
        <div className="bg-blue-50/30 rounded-xl border border-blue-100 border-dashed p-5">
          <div className="flex items-center gap-2 mb-4">
            <UsersRound className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Cross-Functional Teams
            </span>
            <Badge variant="info">{state.crossFunctionalTeams.length}</Badge>
          </div>
          {Object.entries(teamsByDept).map(([deptId, teams]) => {
            const dept = getDept(deptId);
            return (
              <div key={deptId} className="mb-4 last:mb-0">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                  <span className="w-px h-3 bg-gray-300 inline-block" />
                  {dept?.name || "Unknown"}
                </p>
                <div className="grid gap-3 grid-cols-3">
                  {teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
