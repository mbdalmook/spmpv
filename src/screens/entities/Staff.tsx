/**
 * Staff — Entity CRUD screen for managing staff members.
 *
 * Step 6B: Rewired to persist CRUD operations to Supabase.
 * Pattern: setSaving → dataService call → dispatch on success → toast.
 */

import { useState, useMemo } from "react";
import {
  Building2,
  Eye,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCircle,
  Users,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import { generateEmail, getStaffEmail } from "../../utils/email";
import { CompanyNumberAssignToType } from "../../types/enums";
import type { Department, OrgFunction, Grade, Staff } from "../../types";
import type { BadgeVariant } from "../../components/Badge";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { SummaryCards } from "../../components/SummaryCards";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";
import { getStaffFullName } from "../../utils/staff";

export function StaffPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [target, setTarget] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formGradeId, setFormGradeId] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formPrimaryFnId, setFormPrimaryFnId] = useState("");
  const [formSecondaryFnId, setFormSecondaryFnId] = useState("");
  const [formAdditionalFnIds, setFormAdditionalFnIds] = useState<string[]>([]);

  const getDept = (id: string): Department | undefined =>
    state.departments.find((d) => d.id === id);
  const getGrade = (id: string | null): Grade | undefined =>
    id ? state.grades.find((g) => g.id === id) : undefined;
  const getFunction = (id: string | null): OrgFunction | undefined =>
    id ? state.functions.find((f) => f.id === id) : undefined;
  const getGradeBadgeVariant = (gradeId: string | null): BadgeVariant => {
    const g = getGrade(gradeId);
    if (!g) return "neutral";
    const name = g.name.toLowerCase();
    if (name === "md") return "md";
    if (name === "manager") return "manager";
    if (name === "senior") return "senior";
    return "staff";
  };

  const totalStaff = state.staff.length;
  const deptCount = state.departments.length;
  const gradeCount = new Set(state.staff.filter((s) => s.gradeId).map((s) => s.gradeId)).size;
  const managerCount = state.staff.filter((s) => {
    const g = getGrade(s.gradeId);
    return g && g.level <= state.appSettings.maxManagerGradeLevel;
  }).length;

  const cards = [
    { label: "Total Staff", value: totalStaff, icon: <Users className="w-5 h-5 text-blue-500" /> },
    {
      label: "Departments",
      value: deptCount,
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Grade Levels",
      value: gradeCount,
      icon: <GraduationCap className="w-5 h-5 text-green-500" />,
    },
    {
      label: "Managers",
      value: managerCount,
      icon: <UserCircle className="w-5 h-5 text-amber-500" />,
    },
  ];

  const filtered = useMemo(() => {
    return state.staff.filter((s) => {
      const name = getStaffFullName(s).toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      if (filterDept !== "all" && s.departmentId !== filterDept) return false;
      return true;
    });
  }, [state.staff, search, filterDept]);

  const deptFunctions = useMemo(() => {
    if (!formDeptId) return [];
    return state.functions.filter((f) => f.departmentId === formDeptId);
  }, [formDeptId, state.functions]);

  const autoEmail = useMemo(() => {
    if (!formFirstName.trim() || !formLastName.trim()) return "";
    return generateEmail(formFirstName.trim(), formLastName.trim(), state.appSettings);
  }, [formFirstName, formLastName, state.appSettings]);

  const openAdd = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormGradeId("");
    setFormDeptId(state.departments[0]?.id || "");
    setFormPrimaryFnId("");
    setFormSecondaryFnId("");
    setFormAdditionalFnIds([]);
    setModalMode("add");
    setTarget(null);
  };

  const openEdit = (s: Staff) => {
    setFormFirstName(s.firstName);
    setFormLastName(s.lastName);
    setFormGradeId(s.gradeId || "");
    setFormDeptId(s.departmentId);
    setFormPrimaryFnId(s.primaryFunctionId);
    setFormSecondaryFnId(s.secondaryFunctionId || "");
    setFormAdditionalFnIds(s.additionalFunctionIds || []);
    setModalMode("edit");
    setTarget(s);
  };

  const openView = (s: Staff) => {
    setModalMode("view");
    setTarget(s);
  };
  const closeModal = () => {
    setModalMode(null);
    setTarget(null);
  };

  // ── Save (Add / Edit) ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!formFirstName.trim() || !formLastName.trim() || !formDeptId || !formPrimaryFnId) return;

    const payload = {
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      departmentId: formDeptId,
      gradeId: formGradeId || null,
      primaryFunctionId: formPrimaryFnId,
      secondaryFunctionId: formSecondaryFnId || null,
      additionalFunctionIds: formAdditionalFnIds,
    };

    setSaving(true);

    if (modalMode === "add") {
      const { data, error } = await dataService.create<Staff>('staff', payload);
      setSaving(false);

      if (error || !data) {
        showToast(`Failed to add staff: ${error ?? 'Unknown error'}`, 'error');
        return;
      }

      dispatch({ type: "ADD_STAFF", payload: data });
      showToast('Staff member added', 'success');
    } else if (target) {
      const { data, error } = await dataService.update<Staff>('staff', target.id, payload);
      setSaving(false);

      if (error || !data) {
        showToast(`Failed to update staff: ${error ?? 'Unknown error'}`, 'error');
        return;
      }

      dispatch({ type: "UPDATE_STAFF", payload: data });
      showToast('Staff member updated', 'success');
    } else {
      setSaving(false);
    }

    closeModal();
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (s: Staff) => {
    const isManager = state.departments.some((d) => d.managerId === s.id);
    if (isManager) {
      showToast("Cannot delete — this person is assigned as a department manager.", "error");
      return;
    }
    const isTeamLead = state.crossFunctionalTeams.some((t) => t.leadId === s.id);
    const isTeamMember = state.teamMembers.some((m) => m.staffId === s.id);
    if (isTeamLead || isTeamMember) {
      showToast("Cannot delete — this person is part of a cross-functional team.", "error");
      return;
    }
    setSaving(true);

    const { error } = await dataService.remove('staff', s.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete staff: ${error}`, 'error');
      return;
    }

    dispatch({ type: "DELETE_STAFF", payload: s.id });
    showToast('Staff member deleted', 'success');
  };

  const toggleAdditionalFn = (fnId: string) => {
    setFormAdditionalFnIds((prev) =>
      prev.includes(fnId) ? prev.filter((id) => id !== fnId) : [...prev, fnId],
    );
  };

  const additionalFnOptions = deptFunctions.filter(
    (f) => f.id !== formPrimaryFnId && f.id !== formSecondaryFnId,
  );

  // View profile computed data
  const viewStaffPhone = useMemo(() => {
    if (!target) return null;
    const alloc = state.companyNumberAllocations.find(
      (a) => a.assignToType === CompanyNumberAssignToType.Staff && a.staffId === target.id,
    );
    if (!alloc) return null;
    const num = state.companyNumbers.find((n) => n.id === alloc.companyNumberId);
    return num?.phoneNumber || null;
  }, [target, state.companyNumberAllocations, state.companyNumbers]);

  const viewStaffResponsibilities = useMemo(() => {
    if (!target) return [];
    const fnIds = [
      target.primaryFunctionId,
      target.secondaryFunctionId,
      ...(target.additionalFunctionIds || []),
    ].filter(Boolean) as string[];
    return state.responsibilities.filter((r) => fnIds.includes(r.functionId));
  }, [target, state.responsibilities]);

  const columns: Column<Staff>[] = [
    {
      key: "uid",
      header: "ID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-semibold text-gray-900">{getStaffFullName(row)}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (row) => {
        const grade = getGrade(row.gradeId);
        const fn = getFunction(row.primaryFunctionId);
        return (
          <span className="text-sm text-gray-600">
            {grade?.name || "-"}, {fn?.name || "-"}
          </span>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <span className="text-sm">{getDept(row.departmentId)?.name || "-"}</span>,
    },
    {
      key: "grade",
      header: "Grade",
      render: (row) => {
        const g = getGrade(row.gradeId);
        return g ? (
          <Badge variant={getGradeBadgeVariant(row.gradeId)}>{g.name}</Badge>
        ) : (
          <span className="text-gray-300">-</span>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-sm text-gray-500">{getStaffEmail(row, state.appSettings)}</span>
      ),
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
            title="View Profile"
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
        title="Staff Directory"
        subtitle="Manage staff profiles, grades, and function assignments"
        action={
          <PrimaryButton onClick={openAdd} icon={Plus}>
            Add Staff
          </PrimaryButton>
        }
      />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name..." />
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

      <DataTable columns={columns} data={filtered} emptyMessage="No staff found." />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        onClose={() => !saving && closeModal()}
        title={modalMode === "add" ? "Add Staff" : "Edit Staff"}
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={!formFirstName.trim() || !formLastName.trim() || !formDeptId || !formPrimaryFnId || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : modalMode === "add" ? "Add Staff" : "Save Changes"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Email (auto-generated)
            </label>
            <input
              type="text"
              value={autoEmail}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Grade</label>
              <select
                value={formGradeId}
                onChange={(e) => setFormGradeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">No Grade</option>
                {[...state.grades]
                  .sort((a, b) => a.level - b.level)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formDeptId}
                onChange={(e) => {
                  setFormDeptId(e.target.value);
                  setFormPrimaryFnId("");
                  setFormSecondaryFnId("");
                  setFormAdditionalFnIds([]);
                }}
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
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Primary Function <span className="text-red-500">*</span>
            </label>
            <select
              value={formPrimaryFnId}
              onChange={(e) => setFormPrimaryFnId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">Select function</option>
              {deptFunctions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Secondary Function
            </label>
            <select
              value={formSecondaryFnId}
              onChange={(e) => setFormSecondaryFnId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">None</option>
              {deptFunctions
                .filter((f) => f.id !== formPrimaryFnId)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </div>
          {additionalFnOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Additional Functions
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {additionalFnOptions.map((f) => {
                  const dept = getDept(f.departmentId);
                  return (
                    <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formAdditionalFnIds.includes(f.id)}
                        onChange={() => toggleAdditionalFn(f.id)}
                        className="rounded border-gray-300 text-blue-600 accent-blue-600"
                        disabled={saving}
                      />
                      <span className="text-sm text-gray-700">
                        {f.name} <span className="text-gray-400">({dept?.name})</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal isOpen={modalMode === "view"} onClose={closeModal} title="Staff Profile" footer={null}>
        {target &&
          (() => {
            const grade = getGrade(target.gradeId);
            const dept = getDept(target.departmentId);
            const primaryFn = getFunction(target.primaryFunctionId);
            const initials = `${target.firstName[0]}${target.lastName[0]}`.toUpperCase();
            const email = getStaffEmail(target, state.appSettings);
            const phone = viewStaffPhone;
            return (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {getStaffFullName(target)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {grade?.name || "-"}, {primaryFn?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Department</p>
                    <p className="text-sm font-medium text-gray-900">{dept?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Grade</p>
                    <p className="text-sm font-medium text-gray-900">{grade?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="text-sm text-gray-700">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="text-sm text-gray-700">{phone || "-"}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Assigned Functions</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">Primary: {primaryFn?.name || "-"}</Badge>
                    {target.secondaryFunctionId && (
                      <Badge variant="neutral">
                        Secondary: {getFunction(target.secondaryFunctionId)?.name || "-"}
                      </Badge>
                    )}
                    {(target.additionalFunctionIds || []).map((fid) => (
                      <Badge key={fid} variant="neutral">
                        {getFunction(fid)?.name || "-"}
                      </Badge>
                    ))}
                  </div>
                </div>
                {viewStaffResponsibilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Responsibilities</p>
                    <ul className="space-y-1.5">
                      {viewStaffResponsibilities.map((r) => (
                        <li key={r.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {r.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
