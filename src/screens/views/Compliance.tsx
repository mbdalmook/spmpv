import { useState, useMemo, useCallback } from "react";
import { CircleAlert, ExternalLink, FileText, Pencil, Shield } from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { SearchBar } from "../../components/SearchBar";
import { SummaryCards } from "../../components/SummaryCards";
import { Modal } from "../../components/Modal";
import { PrimaryButton } from "../../components/PrimaryButton";
import { IconButton } from "../../components/IconButton";
import type { Responsibility } from "../../types";

export function CompliancePage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [editTarget, setEditTarget] = useState<Responsibility | null>(null);

  // Form state for edit modal
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formFunctionId, setFormFunctionId] = useState("");
  const [formSopLink, setFormSopLink] = useState("");
  const [formIsCompliance, setFormIsCompliance] = useState(true);
  const [formComplianceTagId, setFormComplianceTagId] = useState("");

  const getDept = useCallback(
    (id: string) => state.departments.find((d) => d.id === id),
    [state.departments],
  );
  const getFunction = useCallback(
    (id: string) => state.functions.find((f) => f.id === id),
    [state.functions],
  );
  const getComplianceTag = useCallback(
    (id: string | null) => state.complianceTags.find((t) => t.id === id),
    [state.complianceTags],
  );

  // Only compliance-tagged responsibilities
  const complianceResps = useMemo(
    () => state.responsibilities.filter((r) => r.isComplianceTagged),
    [state.responsibilities],
  );

  // Summary stats
  const totalObligations = complianceResps.length;
  const annualTag = state.complianceTags.find((t) => t.name === "Annual");
  const transactionalTag = state.complianceTags.find((t) => t.name === "Transactional");
  const annualCount = annualTag
    ? complianceResps.filter((r) => r.complianceTagId === annualTag.id).length
    : 0;
  const transactionalCount = transactionalTag
    ? complianceResps.filter((r) => r.complianceTagId === transactionalTag.id).length
    : 0;
  const sopCovered = complianceResps.filter((r) => r.sopLink && r.sopLink.trim() !== "").length;
  const sopMissing = totalObligations - sopCovered;

  const cards = [
    {
      label: "Total Obligations",
      value: totalObligations,
      icon: <Shield className="w-5 h-5 text-blue-500" />,
    },
    { label: "Annual", value: annualCount, icon: <Badge variant="info">Annual</Badge> },
    {
      label: "Transactional",
      value: transactionalCount,
      icon: <Badge variant="warning">Transactional</Badge>,
    },
    {
      label: "SOP Coverage",
      value: `${sopCovered}/${totalObligations}`,
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      sub: sopMissing > 0 ? `${sopMissing} missing` : "All covered",
    },
  ];

  // Filtered data
  const filtered = useMemo(() => {
    return complianceResps.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !(r.description || "").toLowerCase().includes(q))
          return false;
      }
      if (filterType !== "all") {
        const tag = getComplianceTag(r.complianceTagId);
        if (!tag || tag.name.toLowerCase() !== filterType.toLowerCase()) return false;
      }
      if (filterDept !== "all") {
        const fn = getFunction(r.functionId);
        if (!fn || fn.departmentId !== filterDept) return false;
      }
      return true;
    });
  }, [complianceResps, search, filterType, filterDept, getComplianceTag, getFunction]);

  const openEdit = (resp: Responsibility) => {
    setEditTarget(resp);
    setFormName(resp.name);
    setFormDesc(resp.description || "");
    setFormFunctionId(resp.functionId);
    setFormSopLink(resp.sopLink || "");
    setFormIsCompliance(resp.isComplianceTagged);
    setFormComplianceTagId(resp.complianceTagId || "");
  };

  const closeEdit = () => {
    setEditTarget(null);
  };

  const handleSave = () => {
    if (!editTarget || !formName.trim()) return;
    dispatch({
      type: "UPDATE_RESPONSIBILITY",
      payload: {
        id: editTarget.id,
        name: formName.trim(),
        description: formDesc.trim(),
        functionId: formFunctionId,
        sopLink: formSopLink.trim(),
        isComplianceTagged: formIsCompliance,
        complianceTagId: formIsCompliance ? formComplianceTagId : null,
      },
    });
    closeEdit();
  };

  const functionOptions = state.functions.map((f) => {
    const dept = getDept(f.departmentId);
    return { id: f.id, label: `${f.name} (${dept?.name || ""})` };
  });

  // Unique compliance tag names for filter
  const complianceTypeOptions = useMemo(() => {
    const names = [
      ...new Set(
        complianceResps
          .map((r) => {
            const tag = getComplianceTag(r.complianceTagId);
            return tag?.name;
          })
          .filter((n): n is string => !!n),
      ),
    ];
    return names;
  }, [complianceResps, getComplianceTag]);

  // Unique departments that have compliance responsibilities
  const complianceDepts = useMemo(() => {
    const deptIds = [
      ...new Set(
        complianceResps
          .map((r) => {
            const fn = getFunction(r.functionId);
            return fn?.departmentId;
          })
          .filter((id): id is string => !!id),
      ),
    ];
    return deptIds.map((id) => getDept(id)).filter((d): d is NonNullable<typeof d> => !!d);
  }, [complianceResps, getFunction, getDept]);

  const columns: Column<Responsibility>[] = [
    {
      key: "uid",
      header: "UID",
      width: "60px",
      render: (row) => <span className="text-gray-400 text-xs font-mono">{row.uid}</span>,
    },
    {
      key: "name",
      header: "Responsibility",
      render: (row) => (
        <div>
          <p className="font-semibold text-blue-600 text-sm">{row.name}</p>
          {row.description && <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>}
        </div>
      ),
    },
    {
      key: "function",
      header: "Function / Team",
      render: (row) => {
        const fn = getFunction(row.functionId);
        return <span className="text-sm text-gray-700">{fn?.name || "\u2014"}</span>;
      },
    },
    {
      key: "department",
      header: "Department",
      render: (row) => {
        const fn = getFunction(row.functionId);
        const dept = fn ? getDept(fn.departmentId) : null;
        return <span className="text-sm text-gray-700">{dept?.name || "\u2014"}</span>;
      },
    },
    {
      key: "complianceType",
      header: "Compliance Type",
      render: (row) => {
        const tag = getComplianceTag(row.complianceTagId);
        if (!tag) return <span className="text-gray-300">{"\u2014"}</span>;
        return <Badge variant={tag.name === "Annual" ? "info" : "warning"}>{tag.name}</Badge>;
      },
    },
    {
      key: "sop",
      header: "SOP",
      width: "80px",
      render: (row) => {
        if (row.sopLink && row.sopLink.trim() !== "") {
          return (
            <a
              href={row.sopLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          );
        }
        return (
          <span className="flex items-center gap-1 text-amber-500 text-xs">
            <CircleAlert className="w-3.5 h-3.5" /> Missing
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "60px",
      render: (row) => <IconButton icon={Pencil} onClick={() => openEdit(row)} title="Edit" />,
    },
  ];

  return (
    <div>
      <PageHeader title="Compliance" subtitle="All compliance-tagged obligations" />

      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search obligations..." />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {complianceTypeOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {complianceDepts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No compliance obligations found."
      />

      {/* Edit Responsibility Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={closeEdit}
        title="Edit Responsibility"
        footer={
          <>
            <PrimaryButton variant="secondary" onClick={closeEdit}>
              Cancel
            </PrimaryButton>
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Function</label>
              <select
                value={formFunctionId}
                onChange={(e) => setFormFunctionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {functionOptions.map((o) => (
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
                placeholder="https://sop.acme.ae/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormIsCompliance(!formIsCompliance)}
                className={`w-10 h-5 rounded-full transition-colors relative ${formIsCompliance ? "bg-blue-600" : "bg-gray-300"}`}
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
        )}
      </Modal>
    </div>
  );
}
