/**
 * Cross-Functional Teams — Entity CRUD screen.
 *
 * Step 6B: Rewired to persist CRUD operations to Supabase.
 * Pattern: setSaving → dataService call → dispatch on success → toast.
 *
 * Special handling for junction table `team_member`:
 *   - Add: create team row first, then insert team_member rows with returned team.id
 *   - Edit: update team row, delete old team_members, insert new team_member rows
 *   - Delete: delete team (CASCADE handles team_members via FK constraint)
 */

import { useState, useMemo } from "react";
import {
  Check,
  ClipboardList,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import { supabase } from "../../lib/supabase";
import { toCamelCase } from "../../utils/caseMapper";
import type {
  CrossFunctionalTeam,
  Department,
  OrgFunction,
  Grade,
  Staff,
  TeamMember,
} from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { SummaryCards } from "../../components/SummaryCards";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";
import { getStaffFullName } from "../../utils/staff";

export function CrossFunctionalTeamsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [target, setTarget] = useState<CrossFunctionalTeam | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formReportingDeptId, setFormReportingDeptId] = useState("");
  const [formLeadId, setFormLeadId] = useState("");
  const [formMemberIds, setFormMemberIds] = useState<string[]>([]);

  const getDept = (id: string): Department | undefined =>
    state.departments.find((d) => d.id === id);
  const getStaff = (id: string | null): Staff | undefined =>
    id ? state.staff.find((s) => s.id === id) : undefined;
  const getGrade = (id: string | null): Grade | undefined =>
    id ? state.grades.find((g) => g.id === id) : undefined;
  const getFunction = (id: string | null): OrgFunction | undefined =>
    id ? state.functions.find((f) => f.id === id) : undefined;
  const getTeamMembers = (teamId: string): TeamMember[] =>
    state.teamMembers.filter((m) => m.teamId === teamId);
  const getTeamResponsibilities = (teamId: string) => {
    const members = getTeamMembers(teamId);
    const lead = state.crossFunctionalTeams.find((t) => t.id === teamId)?.leadId;
    const staffIds = [...members.map((m) => m.staffId), lead].filter(Boolean) as string[];
    const fnIds = staffIds.flatMap((sid) => {
      const s = getStaff(sid);
      if (!s) return [];
      return [
        s.primaryFunctionId,
        s.secondaryFunctionId,
        ...(s.additionalFunctionIds || []),
      ].filter(Boolean) as string[];
    });
    return state.responsibilities.filter((r) => fnIds.includes(r.functionId));
  };

  const totalTeams = state.crossFunctionalTeams.length;
  const withLead = state.crossFunctionalTeams.filter((t) => t.leadId).length;
  const totalMembers = state.teamMembers.length;
  const teamResp = state.crossFunctionalTeams.reduce(
    (sum, t) => sum + getTeamResponsibilities(t.id).length,
    0,
  );

  const cards = [
    {
      label: "Total Teams",
      value: totalTeams,
      icon: <UsersRound className="w-5 h-5 text-blue-500" />,
    },
    { label: "With Lead", value: withLead, icon: <Check className="w-5 h-5 text-green-500" /> },
    {
      label: "Total Members",
      value: totalMembers,
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Team Responsibilities",
      value: teamResp,
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
    },
  ];

  const filtered = useMemo(() => {
    return state.crossFunctionalTeams.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterDept !== "all" && t.reportingDepartmentId !== filterDept) return false;
      return true;
    });
  }, [state.crossFunctionalTeams, search, filterDept]);

  const openAdd = () => {
    setFormName("");
    setFormPurpose("");
    setFormReportingDeptId(state.departments[0]?.id || "");
    setFormLeadId("");
    setFormMemberIds([]);
    setModalMode("add");
    setTarget(null);
  };

  const openEdit = (t: CrossFunctionalTeam) => {
    const members = getTeamMembers(t.id);
    setFormName(t.name);
    setFormPurpose(t.purpose || "");
    setFormReportingDeptId(t.reportingDepartmentId);
    setFormLeadId(t.leadId || "");
    setFormMemberIds(members.map((m) => m.staffId));
    setModalMode("edit");
    setTarget(t);
  };

  const openView = (t: CrossFunctionalTeam) => {
    setModalMode("view");
    setTarget(t);
  };

  const closeModal = () => {
    if (saving) return;
    setModalMode(null);
    setTarget(null);
  };

  const toggleMember = (staffId: string) => {
    setFormMemberIds((prev) =>
      prev.includes(staffId) ? prev.filter((id) => id !== staffId) : [...prev, staffId],
    );
  };

  // ── Add ─────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!formName.trim() || !formReportingDeptId) return;
    setSaving(true);

    // 1. Create the team row
    const { data: teamData, error: teamError } = await dataService.create<CrossFunctionalTeam>(
      'cross_functional_team',
      {
        name: formName.trim(),
        purpose: formPurpose.trim(),
        reportingDepartmentId: formReportingDeptId,
        leadId: formLeadId || null,
      },
    );

    if (teamError || !teamData) {
      setSaving(false);
      showToast(`Failed to create team: ${teamError ?? 'Unknown error'}`, 'error');
      return;
    }

    // 2. Insert team_member rows using returned team.id
    let memberRows: TeamMember[] = [];
    if (formMemberIds.length > 0) {
      const memberInserts = formMemberIds.map((staffId) => ({
        team_id: teamData.id,
        staff_id: staffId,
      }));
      const { data: memberData, error: memberError } = await supabase
        .from('team_member')
        .insert(memberInserts)
        .select();

      if (memberError) {
        // Team was created but members failed — inform user, still dispatch team
        setSaving(false);
        showToast(`Team created, but failed to add members: ${memberError.message}`, 'error');
        dispatch({ type: "ADD_TEAM", payload: { team: teamData, members: [] } });
        closeModal();
        return;
      }

      memberRows = (memberData as Record<string, unknown>[]).map((row) =>
        toCamelCase<TeamMember>(row),
      );
    }

    setSaving(false);
    dispatch({ type: "ADD_TEAM", payload: { team: teamData, members: memberRows } });
    showToast('Team created', 'success');
    closeModal();
  };

  // ── Edit ────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!formName.trim() || !formReportingDeptId || !target) return;
    setSaving(true);

    // 1. Update the team row
    const { data: teamData, error: teamError } = await dataService.update<CrossFunctionalTeam>(
      'cross_functional_team',
      target.id,
      {
        name: formName.trim(),
        purpose: formPurpose.trim(),
        reportingDepartmentId: formReportingDeptId,
        leadId: formLeadId || null,
      },
    );

    if (teamError || !teamData) {
      setSaving(false);
      showToast(`Failed to update team: ${teamError ?? 'Unknown error'}`, 'error');
      return;
    }

    // 2. Replace team_member rows: delete old, insert new
    const { error: deleteError } = await supabase
      .from('team_member')
      .delete()
      .eq('team_id', target.id);

    if (deleteError) {
      setSaving(false);
      showToast(`Team updated, but failed to update members: ${deleteError.message}`, 'error');
      return;
    }

    let memberRows: TeamMember[] = [];
    if (formMemberIds.length > 0) {
      const memberInserts = formMemberIds.map((staffId) => ({
        team_id: target.id,
        staff_id: staffId,
      }));
      const { data: memberData, error: memberError } = await supabase
        .from('team_member')
        .insert(memberInserts)
        .select();

      if (memberError) {
        setSaving(false);
        showToast(`Team updated, but failed to add members: ${memberError.message}`, 'error');
        dispatch({ type: "UPDATE_TEAM", payload: { team: teamData, members: [] } });
        closeModal();
        return;
      }

      memberRows = (memberData as Record<string, unknown>[]).map((row) =>
        toCamelCase<TeamMember>(row),
      );
    }

    setSaving(false);
    dispatch({ type: "UPDATE_TEAM", payload: { team: teamData, members: memberRows } });
    showToast('Team updated', 'success');
    closeModal();
  };

  // ── Save dispatcher ─────────────────────────────────────────────────
  const handleSave = () => {
    if (modalMode === "add") return handleAdd();
    if (modalMode === "edit") return handleEdit();
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (t: CrossFunctionalTeam) => {
    setSaving(true);

    // CASCADE on cross_functional_team → team_member handles cleanup
    const { error } = await dataService.remove('cross_functional_team', t.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete team: ${error}`, 'error');
      return;
    }

    dispatch({ type: "DELETE_TEAM", payload: t.id });
    showToast('Team deleted', 'success');
  };

  const columns: Column<CrossFunctionalTeam>[] = [
    {
      key: "uid",
      header: "UID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Team Name",
      render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    {
      key: "dept",
      header: "Reporting Dept",
      render: (row) => (
        <span className="text-sm">{getDept(row.reportingDepartmentId)?.name || "-"}</span>
      ),
    },
    {
      key: "lead",
      header: "Lead",
      render: (row) => {
        const lead = getStaff(row.leadId);
        if (!lead) return <span className="text-gray-400 italic text-sm">No lead</span>;
        const initials = `${lead.firstName[0]}${lead.lastName[0]}`.toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
              {initials}
            </div>
            <span className="text-sm text-gray-900">{getStaffFullName(lead)}</span>
          </div>
        );
      },
    },
    {
      key: "members",
      header: "Members",
      render: (row) => {
        const count = getTeamMembers(row.id).length;
        return (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm">{count}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon={Eye}
            onClick={() => openView(row)}
            variant="primary"
            title="View Details"
          />
          <IconButton icon={Pencil} onClick={() => openEdit(row)} title="Edit" />
          <IconButton
            icon={Trash2}
            onClick={() => handleDelete(row)}
            variant="danger"
            title="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Cross-Functional Teams"
        subtitle="Manage teams that span across departments"
        action={
          <PrimaryButton onClick={openAdd} icon={Plus}>
            Add Team
          </PrimaryButton>
        }
      />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search teams..." />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {state.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No teams found." />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "add" ? "Create Team" : "Edit Team"}
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={!formName.trim() || !formReportingDeptId || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving
                ? "Saving..."
                : modalMode === "add"
                  ? "Create Team"
                  : "Save Changes"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Team name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Purpose</label>
            <textarea
              value={formPurpose}
              onChange={(e) => setFormPurpose(e.target.value)}
              placeholder="Team purpose"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Reporting Department <span className="text-red-500">*</span>
            </label>
            <select
              value={formReportingDeptId}
              onChange={(e) => setFormReportingDeptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">Select department</option>
              {state.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Team Lead</label>
            <select
              value={formLeadId}
              onChange={(e) => setFormLeadId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">No lead</option>
              {state.staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {getStaffFullName(s)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Members</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg p-3">
              {state.staff.map((s) => {
                const dept = getDept(s.departmentId);
                return (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMemberIds.includes(s.id)}
                      onChange={() => toggleMember(s.id)}
                      className="rounded border-gray-300 text-blue-600 accent-blue-600"
                      disabled={saving}
                    />
                    <span className="text-sm text-gray-700">
                      {getStaffFullName(s)} <span className="text-gray-400">({dept?.name})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={modalMode === "view"} onClose={closeModal} title="Team Details" footer={null}>
        {target &&
          (() => {
            const dept = getDept(target.reportingDepartmentId);
            const lead = getStaff(target.leadId);
            const leadGrade = lead ? getGrade(lead.gradeId) : undefined;
            const leadFn = lead ? getFunction(lead.primaryFunctionId) : undefined;
            const members = getTeamMembers(target.id);
            return (
              <div>
                <h3 className="text-lg font-bold text-gray-900">{target.name}</h3>
                {target.purpose && <p className="text-sm text-gray-500 mt-1">{target.purpose}</p>}
                <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Reporting Department</p>
                    <p className="text-sm font-medium text-gray-900">{dept?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">UID</p>
                    <p className="text-sm font-medium text-gray-900">{target.uid}</p>
                  </div>
                </div>

                {/* Team Lead */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Team Lead</p>
                  {lead ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                        {lead.firstName[0]}
                        {lead.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {getStaffFullName(lead)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {leadGrade?.name || "-"}, {leadFn?.name || "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No lead assigned</p>
                  )}
                </div>

                {/* Members */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Members ({members.length})
                  </p>
                  <div className="space-y-2">
                    {members.map((m) => {
                      const s = getStaff(m.staffId);
                      if (!s) return null;
                      const sDept = getDept(s.departmentId);
                      return (
                        <div key={m.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
                            {s.firstName[0]}
                            {s.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{getStaffFullName(s)}</p>
                            <p className="text-xs text-gray-500">{sDept?.name || "-"}</p>
                          </div>
                        </div>
                      );
                    })}
                    {members.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No members</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
