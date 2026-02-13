import { Check, ChevronRight } from "lucide-react";
import type { Department, OrgFunction, Responsibility, Workflow, WorkflowStep } from "../types";

interface WorkflowFlowDiagramProps {
  workflow: Workflow;
  steps: WorkflowStep[];
  responsibilities: Responsibility[];
  functions: OrgFunction[];
  departments: Department[];
}

export function WorkflowFlowDiagram({
  steps,
  responsibilities,
  functions,
  departments,
}: WorkflowFlowDiagramProps) {
  const sorted = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const getResp = (id: string) => responsibilities.find((r) => r.id === id);
  const getFn = (id: string) => functions.find((f) => f.id === id);
  const getDept = (id: string) => departments.find((d) => d.id === id);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4 px-2">
      {/* START node */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-blue-400 bg-blue-50 text-blue-600 text-xs font-bold whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          START
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
      </div>

      {/* Steps */}
      {sorted.map((step) => {
        const resp = getResp(step.responsibilityId);
        const fn = resp ? getFn(resp.functionId) : null;
        const dept = fn ? getDept(fn.departmentId) : null;
        return (
          <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="border border-blue-200 rounded-lg px-4 py-2.5 bg-white min-w-[180px]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-500 font-semibold">{step.stepOrder}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {resp?.name || "Unknown"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {fn?.name || "-"} - {dept?.name || "-"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </div>
        );
      })}

      {/* END node */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-green-400 bg-green-50 text-green-600 text-xs font-bold whitespace-nowrap flex-shrink-0">
        <Check className="w-3 h-3" />
        END
      </div>
    </div>
  );
}
