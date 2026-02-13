import { useState, useMemo } from "react";
import { Building2, Check, FileText, GitBranch } from "lucide-react";
import { useAppState } from "../../state/context";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { SearchBar } from "../../components/SearchBar";
import { SummaryCards } from "../../components/SummaryCards";
import { Modal } from "../../components/Modal";
import { WorkflowFlowDiagram } from "../../components/WorkflowFlowDiagram";
import type { Workflow } from "../../types";
import { WorkflowStatus } from "../../types";

export function WorkflowsViewPage() {
  const state = useAppState();
  const [search, setSearch] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const getDept = (id: string) => state.departments.find((d) => d.id === id);
  const getStepsForWorkflow = (wfId: string) =>
    state.workflowSteps.filter((s) => s.workflowId === wfId);

  const activeCount = state.workflows.filter((w) => w.status === WorkflowStatus.Active).length;
  const draftCount = state.workflows.filter((w) => w.status === WorkflowStatus.Draft).length;
  const deptCount = new Set(state.workflows.map((w) => w.ownerDepartmentId)).size;

  const cards = [
    {
      label: "Total Workflows",
      value: state.workflows.length,
      icon: <GitBranch className="w-5 h-5 text-blue-500" />,
    },
    { label: "Active", value: activeCount, icon: <Check className="w-5 h-5 text-green-500" /> },
    { label: "Drafts", value: draftCount, icon: <FileText className="w-5 h-5 text-gray-400" /> },
    {
      label: "Departments",
      value: deptCount,
      icon: <Building2 className="w-5 h-5 text-blue-500" />,
    },
  ];

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

  const columns: Column<Workflow>[] = [
    {
      key: "uid",
      header: "UID",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <button
          onClick={() => setSelectedWorkflow(row)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline text-left"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (row) => <span className="text-sm text-gray-600">{row.description}</span>,
    },
    {
      key: "ownerDept",
      header: "Owner Dept",
      render: (row) => (
        <span className="text-sm">{getDept(row.ownerDepartmentId)?.name || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === WorkflowStatus.Active ? "success" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "steps",
      header: "Steps",
      render: (row) => (
        <span className="text-sm text-gray-600">{getStepsForWorkflow(row.id).length}</span>
      ),
    },
  ];

  const selected = selectedWorkflow;
  const selectedSteps = selected ? getStepsForWorkflow(selected.id) : [];

  return (
    <div>
      <PageHeader title="Workflows" subtitle="Overview of all workflows across departments" />
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search workflows..." />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No workflows found." />

      {/* Workflow Detail Card Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedWorkflow(null)}
        title="Workflow Details"
        width="max-w-2xl"
        footer={null}
      >
        {selected && (
          <div>
            <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{selected.description}</p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400" />
                {getDept(selected.ownerDepartmentId)?.name || "-"}
              </div>
              <Badge variant={selected.status === WorkflowStatus.Active ? "success" : "warning"}>
                {selected.status}
              </Badge>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <WorkflowFlowDiagram
                workflow={selected}
                steps={selectedSteps}
                responsibilities={state.responsibilities}
                functions={state.functions}
                departments={state.departments}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
