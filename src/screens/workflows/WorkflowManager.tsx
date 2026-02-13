/**
 * Workflow Manager — Entity CRUD screen for workflows + workflow steps.
 *
 * Step 6B: Rewired to persist CRUD operations to Supabase.
 * Pattern: setSaving → dataService call → dispatch on success → toast.
 *
 * Special handling for child table `workflow_step`:
 *   - Add: create workflow row first, then insert workflow_step rows with returned workflow.id
 *   - Edit: update workflow row, delete old workflow_steps, insert new workflow_step rows
 *   - Delete: delete workflow (CASCADE handles workflow_steps via FK constraint)
 */

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleAlert,
  GitBranch,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import { supabase } from "../../lib/supabase";
import { toCamelCase } from "../../utils/caseMapper";
import { generateId } from "../../utils/id";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/Badge";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import { CustomSelect } from "../../components/CustomSelect";
import { WorkflowFlowDiagram } from "../../components/WorkflowFlowDiagram";
import type { Workflow, WorkflowStep } from "../../types";
import { WorkflowStatus } from "../../types";

interface FormStep {
  tempId: string;
  responsibilityId: string;
  stepOrder: number;
}

export function WorkflowManagerPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Workflow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDeptId, setFormDeptId] = useState("");
  const [formStatus, setFormStatus] = useState<WorkflowStatus>(WorkflowStatus.Draft);
  const [formSteps, setFormSteps] = useState<FormStep[]>([]);
  const [addRespId, setAddRespId] = useState("");

  const getDept = (id: string) => state.departments.find((d) => d.id === id);
  const getResp = (id: string) => state.responsibilities.find((r) => r.id === id);
  const getFn = (id: string) => state.functions.find((f) => f.id === id);
  const getStepsForWorkflow = (wfId: string) =>
    state.workflowSteps.filter((s) => s.workflowId === wfId);

  const filtered = useMemo(() => {
    return state.workflows.filter((w) => {
      if (
        search &&
        !w.name.toLowerCase().includes(search.toLowerCase()) &&
        !w.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [state.workflows, search]);

  const selectedWorkflow = state.workflows.find((w) => w.id === selectedId);
  const selectedSteps = selectedWorkflow ? getStepsForWorkflow(selectedWorkflow.id) : [];

  const openAdd = () => {
    setFormName("");
    setFormDescription("");
    setFormDeptId(state.departments[0]?.id || "");
    setFormStatus(WorkflowStatus.Draft);
    setFormSteps([]);
    setAddRespId("");
    setModalMode("add");
    setEditTarget(null);
  };

  const openEdit = (wf: Workflow) => {
    const steps = getStepsForWorkflow(wf.id).sort((a, b) => a.stepOrder - b.stepOrder);
    setFormName(wf.name);
    setFormDescription(wf.description || "");
    setFormDeptId(wf.ownerDepartmentId);
    setFormStatus(wf.status);
    setFormSteps(
      steps.map((s, i) => ({
        tempId: generateId(),
        responsibilityId: s.responsibilityId,
        stepOrder: i + 1,
      })),
    );
    setAddRespId("");
    setModalMode("edit");
    setEditTarget(wf);
  };

  const closeModal = () => {
    if (saving) return;
    setModalMode(null);
    setEditTarget(null);
  };

  const addStep = () => {
    if (!addRespId) return;
    setFormSteps((prev) => [
      ...prev,
      { tempId: generateId(), responsibilityId: addRespId, stepOrder: prev.length + 1 },
    ]);
    setAddRespId("");
  };

  const removeStep = (tempId: string) => {
    setFormSteps((prev) =>
      prev.filter((s) => s.tempId !== tempId).map((s, i) => ({ ...s, stepOrder: i + 1 })),
    );
  };

  const moveStep = (index: number, direction: number) => {
    const newSteps = [...formSteps];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    const temp = newSteps[index]!;
    newSteps[index] = newSteps[targetIndex]!;
    newSteps[targetIndex] = temp;
    setFormSteps(newSteps.map((s, i) => ({ ...s, stepOrder: i + 1 })));
  };

  // ── Add ─────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!formName.trim() || !formDeptId) return;
    setSaving(true);

    // 1. Create the workflow row
    const { data: wfData, error: wfError } = await dataService.create<Workflow>(
      'workflow',
      {
        name: formName.trim(),
        description: formDescription.trim(),
        ownerDepartmentId: formDeptId,
        status: formStatus,
      },
    );

    if (wfError || !wfData) {
      setSaving(false);
      showToast(`Failed to create workflow: ${wfError ?? 'Unknown error'}`, 'error');
      return;
    }

    // 2. Insert workflow_step rows using returned workflow.id
    let stepRows: WorkflowStep[] = [];
    if (formSteps.length > 0) {
      const stepInserts = formSteps.map((s) => ({
        workflow_id: wfData.id,
        responsibility_id: s.responsibilityId,
        step_order: s.stepOrder,
      }));
      const { data: stepData, error: stepError } = await supabase
        .from('workflow_step')
        .insert(stepInserts)
        .select();

      if (stepError) {
        // Workflow was created but steps failed — inform user, still dispatch workflow
        setSaving(false);
        showToast(`Workflow created, but failed to add steps: ${stepError.message}`, 'error');
        dispatch({ type: "ADD_WORKFLOW", payload: { workflow: wfData, steps: [] } });
        closeModal();
        return;
      }

      stepRows = (stepData as Record<string, unknown>[]).map((row) =>
        toCamelCase<WorkflowStep>(row),
      );
    }

    setSaving(false);
    dispatch({ type: "ADD_WORKFLOW", payload: { workflow: wfData, steps: stepRows } });
    showToast('Workflow created', 'success');
    closeModal();
  };

  // ── Edit ────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!formName.trim() || !formDeptId || !editTarget) return;
    setSaving(true);

    // 1. Update the workflow row
    const { data: wfData, error: wfError } = await dataService.update<Workflow>(
      'workflow',
      editTarget.id,
      {
        name: formName.trim(),
        description: formDescription.trim(),
        ownerDepartmentId: formDeptId,
        status: formStatus,
      },
    );

    if (wfError || !wfData) {
      setSaving(false);
      showToast(`Failed to update workflow: ${wfError ?? 'Unknown error'}`, 'error');
      return;
    }

    // 2. Replace workflow_step rows: delete old, insert new
    const { error: deleteError } = await supabase
      .from('workflow_step')
      .delete()
      .eq('workflow_id', editTarget.id);

    if (deleteError) {
      setSaving(false);
      showToast(`Workflow updated, but failed to update steps: ${deleteError.message}`, 'error');
      return;
    }

    let stepRows: WorkflowStep[] = [];
    if (formSteps.length > 0) {
      const stepInserts = formSteps.map((s) => ({
        workflow_id: editTarget.id,
        responsibility_id: s.responsibilityId,
        step_order: s.stepOrder,
      }));
      const { data: stepData, error: stepError } = await supabase
        .from('workflow_step')
        .insert(stepInserts)
        .select();

      if (stepError) {
        setSaving(false);
        showToast(`Workflow updated, but failed to add steps: ${stepError.message}`, 'error');
        dispatch({ type: "UPDATE_WORKFLOW", payload: { workflow: wfData, steps: [] } });
        closeModal();
        return;
      }

      stepRows = (stepData as Record<string, unknown>[]).map((row) =>
        toCamelCase<WorkflowStep>(row),
      );
    }

    setSaving(false);
    dispatch({ type: "UPDATE_WORKFLOW", payload: { workflow: wfData, steps: stepRows } });
    showToast('Workflow updated', 'success');
    closeModal();
  };

  // ── Save dispatcher ─────────────────────────────────────────────────
  const handleSave = () => {
    if (modalMode === "add") return handleAdd();
    if (modalMode === "edit") return handleEdit();
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (wf: Workflow) => {
    setSaving(true);

    // CASCADE on workflow → workflow_step handles cleanup
    const { error } = await dataService.remove('workflow', wf.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete workflow: ${error}`, 'error');
      return;
    }

    dispatch({ type: "DELETE_WORKFLOW", payload: wf.id });
    if (selectedId === wf.id) setSelectedId(null);
    showToast('Workflow deleted', 'success');
  };

  // Responsibility options for step builder dropdown
  const respOptions = state.responsibilities.map((r) => {
    const fn = getFn(r.functionId);
    const dept = fn ? getDept(fn.departmentId) : null;
    return { value: r.id, label: `${r.name} (${fn?.name || "-"} - ${dept?.name || "-"})` };
  });

  return (
    <div>
      <PageHeader
        title="Workflow Manager"
        subtitle="Create and manage workflow sequences"
        action={
          <PrimaryButton onClick={openAdd} icon={Plus}>
            New Workflow
          </PrimaryButton>
        }
      />

      {/* Info note */}
      <div className="flex items-start gap-2 mb-5 text-sm text-gray-500">
        <CircleAlert className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <span>To create workflows, your grade must be {"<="} Manager (max manager grade)</span>
      </div>

      {/* Diagram area */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 min-h-[120px] flex items-center justify-center">
        {selectedWorkflow ? (
          <WorkflowFlowDiagram
            workflow={selectedWorkflow}
            steps={selectedSteps}
            responsibilities={state.responsibilities}
            functions={state.functions}
            departments={state.departments}
          />
        ) : (
          <div className="text-center py-8">
            <GitBranch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Select a workflow below to view its diagram</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workflows..." />
        </div>
      </div>

      {/* Workflow list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No workflows found.</p>
          </div>
        )}
        {filtered.map((wf) => {
          const stepCount = getStepsForWorkflow(wf.id).length;
          const isSelected = selectedId === wf.id;
          return (
            <div
              key={wf.id}
              onClick={() => setSelectedId(isSelected ? null : wf.id)}
              className={`bg-white rounded-lg border p-4 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? "border-blue-400 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}
            >
              <GitBranch className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{wf.name}</span>
                  <Badge variant="neutral">
                    {stepCount} step{stepCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{wf.description}</p>
              </div>
              <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton icon={Pencil} onClick={() => openEdit(wf)} title="Edit" />
                <IconButton
                  icon={Trash2}
                  onClick={() => handleDelete(wf)}
                  variant="danger"
                  title="Delete"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* New / Edit Workflow Modal */}
      <Modal
        isOpen={modalMode === "add" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "add" ? "New Workflow" : "Edit Workflow"}
        width="max-w-lg"
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </PrimaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={!formName.trim() || !formDeptId || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving
                ? "Saving..."
                : modalMode === "add"
                  ? "Create Workflow"
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
              placeholder="e.g. Tenant Onboarding"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Purpose of this workflow"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              disabled={saving}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Owner Department
            </label>
            <CustomSelect
              value={formDeptId}
              onChange={(val) => setFormDeptId(val)}
              options={state.departments.map((d) => ({ value: d.id, label: d.name }))}
              placeholder="Select department"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
            <CustomSelect
              value={formStatus}
              onChange={(val) => setFormStatus(val as WorkflowStatus)}
              options={[
                { value: WorkflowStatus.Draft, label: "Draft" },
                { value: WorkflowStatus.Active, label: "Active" },
              ]}
              placeholder="Select status"
            />
          </div>

          {/* Steps section */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Steps ({formSteps.length})
            </label>
            <div className="border border-gray-100 rounded-lg">
              {formSteps.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {formSteps.map((step, index) => {
                    const resp = getResp(step.responsibilityId);
                    const fn = resp ? getFn(resp.functionId) : null;
                    const dept = fn ? getDept(fn.departmentId) : null;
                    return (
                      <div key={step.tempId} className="flex items-center gap-3 px-3 py-2.5">
                        <span className="text-xs font-semibold text-gray-400 w-4 text-center">
                          {step.stepOrder}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {resp?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fn?.name || "-"} - {dept?.name || "-"}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => moveStep(index, -1)}
                            disabled={index === 0 || saving}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveStep(index, 1)}
                            disabled={index === formSteps.length - 1 || saving}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeStep(step.tempId)}
                            disabled={saving}
                            className="p-1 text-red-400 hover:text-red-600 ml-1 disabled:opacity-30"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Add step row */}
              <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100">
                <div className="flex-1">
                  <CustomSelect
                    value={addRespId}
                    onChange={(val) => setAddRespId(val)}
                    options={respOptions}
                    placeholder="Select responsibility to add"
                  />
                </div>
                <button
                  onClick={addStep}
                  disabled={!addRespId || saving}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
