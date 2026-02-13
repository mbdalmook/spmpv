/**
 * Departments — Entity CRUD screen for organisational departments.
 *
 * Step 6B: Rewired to persist CRUD operations to Supabase.
 * Pattern: setSaving → dataService call → dispatch on success → toast.
 */

import { useState } from "react";
import {
  Building2,
  Check,
  CircleAlert,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import { getDepartmentStatus } from "../../utils/department";
import { getStaffFullName } from "../../utils/staff";
import { DepartmentStatus } from "../../types/enums";
import type { Department, Staff, Grade } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import type { BadgeVariant } from "../../components/Badge";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { SummaryCards } from "../../components/SummaryCards";
import { Modal } from "../../components/Modal";
import { CustomSelect } from "../../components/CustomSelect";

export function DepartmentsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [assignManagerDeptId, setAssignManagerDeptId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getHeadcount = (deptId: string): number =>
    state.staff.filter((s) => s.departmentId === deptId).length;
  const getFunctionCount = (deptId: string): number =>
    state.functions.filter((f) => f.departmentId === deptId).length;
  const getResponsibilityCount = (deptId: string): number => {
    const fnIds = state.functions.filter((f) => f.departmentId === deptId).map((f) => f.id);
    return state.responsibilities.filter((r) => fnIds.includes(r.functionId)).length;
  };
  const getTeamCount = (deptId: string): number =>
    state.crossFunctionalTeams.filter((t) => t.reportingDepartmentId === deptId).length;
  const getManager = (managerId: string | null): Staff | undefined =>
    managerId ? state.staff.find((s) => s.id === managerId) : undefined;
  const getGrade = (gradeId: string | null): Grade | undefined =>
    gradeId ? state.grades.find((g) => g.id === gradeId) : undefined;

  const managedCount = state.departments.filter(
    (d) =>
      getDepartmentStatus(d, state.staff, state.grades, state.appSettings.maxManagerGradeLevel) ===
      DepartmentStatus.Managed,
  ).length;
  const actingCount = state.departments.filter(
    (d) =>
      getDepartmentStatus(d, state.staff, state.grades, state.appSettings.maxManagerGradeLevel) ===
      DepartmentStatus.Acting,
  ).length;
  const unmanagedCount = state.departments.filter(
    (d) =>
      getDepartmentStatus(d, state.staff, state.grades, state.appSettings.maxManagerGradeLevel) ===
      DepartmentStatus.Unmanaged,
  ).length;

  // ── Add ──────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setSaving(true);

    const { data, error } = await dataService.create<Department>('department', {
      name: trimmed,
      managerId: null,
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to add department: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: "ADD_DEPARTMENT", payload: data });
    showToast('Department added', 'success');
    setNewName("");
    setShowAdd(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (dept: Department) => {
    if (getHeadcount(dept.id) > 0) {
      showToast("Cannot delete — staff are assigned to this department.", "error");
      return;
    }
    if (getFunctionCount(dept.id) > 0) {
      showToast("Cannot delete — functions exist in this department.", "error");
      return;
    }
    setSaving(true);

    const { error } = await dataService.remove('department', dept.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete department: ${error}`, 'error');
      return;
    }

    dispatch({ type: "DELETE_DEPARTMENT", payload: dept.id });
    showToast('Department deleted', 'success');
  };

  // ── Inline Edit ──────────────────────────────────────────────────────
  const startEdit = (d: Department) => {
    setEditingId(d.id);
    setEditName(d.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };
  const saveEdit = async () => {
    if (!editName.trim() || !editingId) return;
    setSaving(true);

    const { data, error } = await dataService.update<Department>('department', editingId, {
      name: editName.trim(),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to update department: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: "UPDATE_DEPARTMENT", payload: data });
    showToast('Department updated', 'success');
    cancelEdit();
  };

  // ── Assign Manager ───────────────────────────────────────────────────
  const handleAssignManager = async (staffId: string) => {
    if (!assignManagerDeptId) return;
    setSaving(true);

    const newManagerId = staffId || null;
    const { data, error } = await dataService.update<Department>('department', assignManagerDeptId, {
      managerId: newManagerId,
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to assign manager: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({
      type: "ASSIGN_MANAGER",
      payload: { departmentId: assignManagerDeptId, staffId: newManagerId },
    });
    showToast('Manager updated', 'success');
    setAssignManagerDeptId(null);
  };

  // ── Summary Cards ────────────────────────────────────────────────────
  const cards = [
    {
      label: "Total Departments",
      value: state.departments.length,
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
    },
    { label: "Managed", value: managedCount, icon: <Check className="w-5 h-5 text-green-500" /> },
    {
      label: "Acting",
      value: actingCount,
      icon: <CircleAlert className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "Unmanaged",
      value: unmanagedCount,
      icon: <CircleAlert className="w-5 h-5 text-red-500" />,
    },
  ];

  const statusVariant = (s: DepartmentStatus): BadgeVariant =>
    s === DepartmentStatus.Managed
      ? "success"
      : s === DepartmentStatus.Acting
        ? "warning"
        : "error";

  // ── Table Columns ────────────────────────────────────────────────────
  const columns: Column<Department>[] = [
    {
      key: "uid",
      header: "UID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Department",
      render: (row) =>
        editingId === row.id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="px-3 py-1.5 border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              autoFocus
              disabled={saving}
            />
            <button onClick={saveEdit} className="text-gray-500 hover:text-green-600" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button onClick={cancelEdit} className="text-gray-500 hover:text-red-600" disabled={saving}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="font-semibold text-gray-900">{row.name}</span>
        ),
    },
    {
      key: "manager",
      header: "Manager",
      render: (row) => {
        const mgr = getManager(row.managerId);
        if (!mgr) return <span className="text-gray-400 italic text-sm">No manager</span>;
        const grade = getGrade(mgr.gradeId);
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
              {mgr.firstName[0]}
              {mgr.lastName[0]}
            </div>
            <div>
              <span className="text-sm text-gray-900">{getStaffFullName(mgr)}</span>
              {grade && <span className="text-xs text-gray-400 ml-1">({grade.name})</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "headcount",
      header: "Headcount",
      render: (row) => <span className="text-sm">{getHeadcount(row.id)}</span>,
    },
    {
      key: "functions",
      header: "Functions",
      render: (row) => <span className="text-sm">{getFunctionCount(row.id)}</span>,
    },
    {
      key: "responsibilities",
      header: "Responsibilities",
      render: (row) => <span className="text-sm">{getResponsibilityCount(row.id)}</span>,
    },
    {
      key: "teams",
      header: "Teams",
      render: (row) => <span className="text-sm">{getTeamCount(row.id)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = getDepartmentStatus(
          row,
          state.staff,
          state.grades,
          state.appSettings.maxManagerGradeLevel,
        );
        return <Badge variant={statusVariant(s)}>{s}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton
            icon={UserCircle}
            onClick={() => setAssignManagerDeptId(row.id)}
            variant="primary"
            title="Assign Manager"
          />
          <IconButton icon={Pencil} onClick={() => startEdit(row)} title="Edit" />
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

  const assignDept = state.departments.find((d) => d.id === assignManagerDeptId);

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage organisational departments and their managers"
        action={
          <div className="relative">
            <PrimaryButton onClick={() => setShowAdd(!showAdd)} icon={Plus}>
              Add Department
            </PrimaryButton>
            {showAdd && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                <p className="text-sm font-medium text-gray-700 mb-2">New department name</p>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter department name..."
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full px-3 py-2 border border-blue-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  autoFocus
                  disabled={saving}
                />
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Adding...' : 'Add'}
                </button>
              </div>
            )}
          </div>
        }
      />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>
      <DataTable
        columns={columns}
        data={state.departments}
        emptyMessage="No departments defined."
      />

      {/* Assign Manager Modal */}
      <Modal
        isOpen={!!assignManagerDeptId}
        onClose={() => !saving && setAssignManagerDeptId(null)}
        title={`Assign Manager - ${assignDept?.name || ""}`}
        footer={null}
      >
        <div>
          {saving ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          ) : (
            <CustomSelect
              value={assignDept?.managerId || ""}
              onChange={(val) => handleAssignManager(val)}
              placeholder="No manager"
              options={[
                { value: "", label: "No manager" },
                ...state.staff
                  .filter((s) => {
                    const grade = getGrade(s.gradeId);
                    return grade && grade.level <= state.appSettings.maxManagerGradeLevel;
                  })
                  .map((s) => {
                    const grade = getGrade(s.gradeId);
                    return {
                      value: s.id,
                      label: `${getStaffFullName(s)} (${grade?.name || "No Grade"})`,
                    };
                  }),
              ]}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
