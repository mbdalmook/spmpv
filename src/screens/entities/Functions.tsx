import { useState, useMemo } from "react";
import { Building2, Globe, Layers, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { generateId, formatUid } from "../../utils/id";
import { FunctionType } from "../../types/enums";
import type { Department, OrgFunction } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { SummaryCards } from "../../components/SummaryCards";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";

export function FunctionsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [target, setTarget] = useState<OrgFunction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrgFunction | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formType, setFormType] = useState<FunctionType>(FunctionType.Internal);
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  const getDept = (id: string): Department | undefined =>
    state.departments.find((d) => d.id === id);
  const getStaffCount = (fnId: string): number =>
    state.staff.filter(
      (s) =>
        s.primaryFunctionId === fnId ||
        s.secondaryFunctionId === fnId ||
        (s.additionalFunctionIds || []).includes(fnId),
    ).length;
  const getResponsibilityCount = (fnId: string): number =>
    state.responsibilities.filter((r) => r.functionId === fnId).length;
  const hasContact = (fn: OrgFunction): boolean => !!(fn.email || fn.phone);

  const totalFunctions = state.functions.length;
  const internalCount = state.functions.filter((f) => f.type === FunctionType.Internal).length;
  const externalCount = state.functions.filter((f) => f.type === FunctionType.External).length;
  const withContactCount = state.functions.filter((f) => hasContact(f)).length;

  const cards = [
    {
      label: "Total Functions",
      value: totalFunctions,
      icon: <Layers className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Internal",
      value: internalCount,
      icon: <Building2 className="w-5 h-5 text-gray-500" />,
    },
    { label: "External", value: externalCount, icon: <Globe className="w-5 h-5 text-blue-500" /> },
    {
      label: "With Contact",
      value: withContactCount,
      icon: <Phone className="w-5 h-5 text-green-500" />,
    },
  ];

  const filtered = useMemo(() => {
    return state.functions.filter((f) => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.uid.includes(search))
        return false;
      if (filterDept !== "all" && f.departmentId !== filterDept) return false;
      return true;
    });
  }, [state.functions, search, filterDept]);

  const openAdd = () => {
    setFormName("");
    setFormDeptId(state.departments[0]?.id || "");
    setFormType(FunctionType.Internal);
    setFormEmail("");
    setFormPhone("");
    setModalMode("add");
    setTarget(null);
  };

  const openEdit = (fn: OrgFunction) => {
    setFormName(fn.name);
    setFormDeptId(fn.departmentId);
    setFormType(fn.type);
    setFormEmail(fn.email || "");
    setFormPhone(fn.phone || "");
    setModalMode("edit");
    setTarget(fn);
  };

  const closeModal = () => {
    setModalMode(null);
    setTarget(null);
  };

  const handleSave = () => {
    if (!formName.trim() || !formDeptId || !formType) return;
    const data = {
      name: formName.trim(),
      departmentId: formDeptId,
      type: formType,
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
    };
    if (modalMode === "add") {
      const nextUid = formatUid(
        state.functions.length > 0
          ? Math.max(...state.functions.map((f) => parseInt(f.uid))) + 1
          : 1,
      );
      dispatch({ type: "ADD_FUNCTION", payload: { id: generateId(), uid: nextUid, ...data } });
    } else if (target) {
      dispatch({ type: "UPDATE_FUNCTION", payload: { id: target.id, ...data } });
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const staffCount = getStaffCount(deleteTarget.id);
    const respCount = getResponsibilityCount(deleteTarget.id);
    if (staffCount > 0) {
      alert("Cannot delete – staff are assigned to this function.");
      setDeleteTarget(null);
      return;
    }
    if (respCount > 0) {
      alert("Cannot delete – responsibilities are assigned to this function.");
      setDeleteTarget(null);
      return;
    }
    dispatch({ type: "DELETE_FUNCTION", payload: deleteTarget.id });
    setDeleteTarget(null);
  };

  const columns: Column<OrgFunction>[] = [
    {
      key: "uid",
      header: "UID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Function Name",
      render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <span className="text-sm">{getDept(row.departmentId)?.name || "-"}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <Badge variant={row.type === FunctionType.Internal ? "neutral" : "info"}>{row.type}</Badge>
      ),
    },
    {
      key: "staff",
      header: "Staff",
      render: (row) => <span className="text-sm">{getStaffCount(row.id)}</span>,
    },
    {
      key: "responsibilities",
      header: "Responsibilities",
      render: (row) => <span className="text-sm">{getResponsibilityCount(row.id)}</span>,
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) =>
        hasContact(row) ? (
          <Badge variant="success">Has Contact</Badge>
        ) : (
          <span className="text-gray-300 text-sm">–</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton icon={Pencil} onClick={() => openEdit(row)} title="Edit" />
          <IconButton
            icon={Trash2}
            onClick={() => setDeleteTarget(row)}
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
        title="Functions"
        subtitle="Manage functional areas within departments"
        action={
          <PrimaryButton onClick={openAdd} icon={Plus}>
            Add Function
          </PrimaryButton>
        }
      />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search functions..." />
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

      <DataTable columns={columns} data={filtered} emptyMessage="No functions found." />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "add" ? "Add Function" : "Edit Function"}
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={handleSave}>
              {modalMode === "add" ? "Add Function" : "Save Changes"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Function Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter function name..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={formDeptId}
              onChange={(e) => setFormDeptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as FunctionType)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={FunctionType.Internal}>Internal</option>
              <option value={FunctionType.External}>External</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. function@acme.ae"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="e.g. +971 4 555 0000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Function"
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="danger" onClick={handleDelete} icon={Trash2}>
              Delete
            </PrimaryButton>
          </>
        }
      >
        {deleteTarget && (
          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteTarget.name}</span>? This action cannot be
              undone.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
