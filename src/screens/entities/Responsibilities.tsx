/**
 * Responsibilities — Entity CRUD screen for organisational responsibilities.
 *
 * Step 6B: Rewired to persist CRUD operations to Supabase.
 * Pattern: setSaving → dataService call → dispatch on success → toast.
 */

import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Check,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import type { Department, OrgFunction, Responsibility, ComplianceTag } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { SummaryCards } from "../../components/SummaryCards";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";

export function ResponsibilitiesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterFunc, setFilterFunc] = useState("all");
  const [filterSop, setFilterSop] = useState("all");
  const [modalMode, setModalMode] = useState<"new" | "edit" | "transfer" | null>(null);
  const [editTarget, setEditTarget] = useState<Responsibility | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFunctionId, setFormFunctionId] = useState("");
  const [formSopLink, setFormSopLink] = useState("");
  const [formIsCompliance, setFormIsCompliance] = useState(true);
  const [formComplianceTagId, setFormComplianceTagId] = useState("");
  // Transfer form
  const [transferDept, setTransferDept] = useState("");
  const [transferFunc, setTransferFunc] = useState("");

  const getFunction = (id: string): OrgFunction | undefined =>
    state.functions.find((f) => f.id === id);
  const getDept = (id: string): Department | undefined =>
    state.departments.find((d) => d.id === id);
  const getDeptForFunction = (fnId: string): Department | undefined => {
    const fn = getFunction(fnId);
    return fn ? getDept(fn.departmentId) : undefined;
  };
  const getComplianceTag = (id: string | null): ComplianceTag | undefined =>
    id ? state.complianceTags.find((t) => t.id === id) : undefined;
  const getWorkflowsForResp = (respId: string) => {
    const stepWfIds = state.workflowSteps
      .filter((s) => s.responsibilityId === respId)
      .map((s) => s.workflowId);
    return state.workflows.filter((w) => stepWfIds.includes(w.id));
  };

  const totalResp = state.responsibilities.length;
  const complianceTagged = state.responsibilities.filter((r) => r.isComplianceTagged).length;
  const withSop = state.responsibilities.filter((r) => r.sopLink && r.sopLink.trim() !== "").length;
  const missingSop = totalResp - withSop;
  const sopCoverage = totalResp > 0 ? Math.round((withSop / totalResp) * 100) : 0;

  const cards = [
    {
      label: "Total Responsibilities",
      value: totalResp,
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
    },
    {
      label: "Compliance Tagged",
      value: complianceTagged,
      icon: <Shield className="w-5 h-5 text-green-500" />,
    },
    { label: "With SOP", value: withSop, icon: <FileText className="w-5 h-5 text-blue-500" /> },
    {
      label: "Missing SOP",
      value: missingSop,
      icon: <CircleAlert className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "SOP Coverage",
      value: `${sopCoverage}%`,
      icon: <Check className="w-5 h-5 text-green-500" />,
    },
  ];

  const filtered = useMemo(() => {
    return state.responsibilities.filter((r) => {
      const fn = getFunction(r.functionId);
      const dept = fn ? getDept(fn.departmentId) : undefined;
      if (
        search &&
        !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !(r.description || "").toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (filterDept !== "all" && dept?.id !== filterDept) return false;
      if (filterFunc !== "all" && r.functionId !== filterFunc) return false;
      if (filterSop === "has" && (!r.sopLink || r.sopLink.trim() === "")) return false;
      if (filterSop === "missing" && r.sopLink && r.sopLink.trim() !== "") return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.responsibilities,
    state.functions,
    state.departments,
    search,
    filterDept,
    filterFunc,
    filterSop,
  ]);

  const openNew = () => {
    setFormName("");
    setFormDesc("");
    setFormFunctionId(state.functions[0]?.id || "");
    setFormSopLink("");
    setFormIsCompliance(false);
    setFormComplianceTagId(state.complianceTags[0]?.id || "");
    setModalMode("new");
    setEditTarget(null);
  };

  const openEdit = (r: Responsibility) => {
    setFormName(r.name);
    setFormDesc(r.description || "");
    setFormFunctionId(r.functionId);
    setFormSopLink(r.sopLink || "");
    setFormIsCompliance(r.isComplianceTagged);
    setFormComplianceTagId(r.complianceTagId || "");
    setModalMode("edit");
    setEditTarget(r);
  };

  const openTransfer = (r: Responsibility) => {
    const fn = getFunction(r.functionId);
    setTransferDept(fn?.departmentId || "");
    setTransferFunc("");
    setModalMode("transfer");
    setEditTarget(r);
  };

  const closeModal = () => {
    if (saving) return;
    setModalMode(null);
    setEditTarget(null);
  };

  // ── Add / Edit ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formName.trim() || !formFunctionId) return;

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      functionId: formFunctionId,
      sopLink: formSopLink.trim(),
      isComplianceTagged: formIsCompliance,
      complianceTagId: formIsCompliance ? formComplianceTagId || null : null,
    };

    setSaving(true);

    if (modalMode === "new") {
      const { data, error } = await dataService.create<Responsibility>('responsibility', payload);
      setSaving(false);

      if (error || !data) {
        showToast(`Failed to add responsibility: ${error ?? 'Unknown error'}`, 'error');
        return;
      }

      dispatch({ type: "ADD_RESPONSIBILITY", payload: data });
      showToast('Responsibility added', 'success');
    } else if (editTarget) {
      const { data, error } = await dataService.update<Responsibility>(
        'responsibility',
        editTarget.id,
        payload,
      );
      setSaving(false);

      if (error || !data) {
        showToast(`Failed to update responsibility: ${error ?? 'Unknown error'}`, 'error');
        return;
      }

      dispatch({ type: "UPDATE_RESPONSIBILITY", payload: data });
      showToast('Responsibility updated', 'success');
    } else {
      setSaving(false);
    }

    closeModal();
  };

  // ── Transfer ──────────────────────────────────────────────────────────
  const handleTransfer = async () => {
    if (!transferFunc || !editTarget) return;
    setSaving(true);

    const { data, error } = await dataService.update<Responsibility>(
      'responsibility',
      editTarget.id,
      { functionId: transferFunc },
    );
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to transfer responsibility: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({
      type: "TRANSFER_RESPONSIBILITY",
      payload: { id: editTarget.id, newFunctionId: transferFunc },
    });
    showToast('Responsibility transferred', 'success');
    closeModal();
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (r: Responsibility) => {
    const inWorkflow = state.workflowSteps.some((s) => s.responsibilityId === r.id);
    if (inWorkflow) {
      showToast("Cannot delete — this responsibility is used in a workflow.", "error");
      return;
    }
    setSaving(true);

    const { error } = await dataService.remove('responsibility', r.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete responsibility: ${error}`, 'error');
      return;
    }

    dispatch({ type: "DELETE_RESPONSIBILITY", payload: r.id });
    showToast('Responsibility deleted', 'success');
  };

  const transferFunctions = useMemo(() => {
    if (!transferDept) return [];
    return state.functions.filter((f) => f.departmentId === transferDept);
  }, [transferDept, state.functions]);

  const columns: Column<Responsibility>[] = [
    {
      key: "uid",
      header: "UID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Responsibility",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{row.name}</p>
          {row.description && <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>}
        </div>
      ),
    },
    {
      key: "function",
      header: "Function",
      render: (row) => <span className="text-sm">{getFunction(row.functionId)?.name || "-"}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <span className="text-sm">{getDeptForFunction(row.functionId)?.name || "-"}</span>
      ),
    },
    {
      key: "compliance",
      header: "Compliance",
      render: (row) =>
        row.isComplianceTagged ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <X className="w-4 h-4 text-red-400" />
        ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => {
        if (!row.isComplianceTagged) return <span className="text-gray-300">-</span>;
        const tag = getComplianceTag(row.complianceTagId);
        if (!tag) return <span className="text-gray-300">-</span>;
        return <Badge variant={tag.name === "Annual" ? "info" : "warning"}>{tag.name}</Badge>;
      },
    },
    {
      key: "sop",
      header: "SOP",
      render: (row) =>
        row.sopLink && row.sopLink.trim() !== "" ? (
          <a
            href={row.sopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ) : (
          <X className="w-4 h-4 text-red-400" />
        ),
    },
    {
      key: "workflows",
      header: "Workflows",
      render: (row) => {
        const wfs = getWorkflowsForResp(row.id);
        if (wfs.length === 0) return <span className="text-gray-300">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {wfs.map((w) => (
              <Badge key={w.id} variant="info">
                {w.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton icon={ArrowLeftRight} onClick={() => openTransfer(row)} title="Transfer" />
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

  const formFunctionOptions = state.functions.map((f) => {
    const dept = getDept(f.departmentId);
    return { id: f.id, label: `${f.name} (${dept?.name || ""})` };
  });

  return (
    <div>
      <PageHeader
        title="Responsibilities"
        subtitle="All responsibilities across functions"
        action={
          <PrimaryButton onClick={openNew} icon={Plus}>
            Add Responsibility
          </PrimaryButton>
        }
      />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search responsibilities..." />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {state.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Function:</span>
          <select
            value={filterFunc}
            onChange={(e) => setFilterFunc(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {state.functions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">SOP:</span>
          <select
            value={filterSop}
            onChange={(e) => setFilterSop(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="has">Has SOP</option>
            <option value="missing">Missing</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No responsibilities found." />

      {/* New / Edit Modal */}
      <Modal
        isOpen={modalMode === "new" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "new" ? "New Responsibility" : "Edit Responsibility"}
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={!formName.trim() || !formFunctionId || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving
                ? "Saving..."
                : modalMode === "new"
                  ? "Add Responsibility"
                  : "Save Changes"}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Responsibility name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Brief description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Function</label>
            <select
              value={formFunctionId}
              onChange={(e) => setFormFunctionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              {formFunctionOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">SOP Link</label>
            <input
              type="text"
              value={formSopLink}
              onChange={(e) => setFormSopLink(e.target.value)}
              placeholder="https://sop.seamless.ae/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormIsCompliance(!formIsCompliance)}
              className={`w-10 h-5 rounded-full transition-colors relative ${formIsCompliance ? "bg-blue-600" : "bg-gray-300"}`}
              disabled={saving}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${formIsCompliance ? "left-5" : "left-0.5"}`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">Compliance required</span>
          </div>
          {formIsCompliance && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Compliance Type
              </label>
              <select
                value={formComplianceTagId}
                onChange={(e) => setFormComplianceTagId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Select type</option>
                {state.complianceTags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={modalMode === "transfer"}
        onClose={closeModal}
        title="Transfer Responsibility"
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleTransfer}
              icon={ArrowLeftRight}
              disabled={!transferFunc || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Transferring..." : "Transfer"}
            </PrimaryButton>
          </>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="font-medium text-gray-900 text-sm">{editTarget.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Currently in: {getFunction(editTarget.functionId)?.name || "-"} (
                {getDeptForFunction(editTarget.functionId)?.name || "-"})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Target Department
              </label>
              <select
                value={transferDept}
                onChange={(e) => {
                  setTransferDept(e.target.value);
                  setTransferFunc("");
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                {state.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Target Function
              </label>
              <select
                value={transferFunc}
                onChange={(e) => setTransferFunc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Select function</option>
                {transferFunctions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
