import { useState, useMemo, type ReactNode } from "react";
import { Building2, Layers, Phone, UsersRound } from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { generateId } from "../../utils/id";
import { getStaffEmail } from "../../utils/email";
import { getStaffFullName, getStaffMobile } from "../../utils/staff";
import { PageHeader } from "../../components/PageHeader";
import { Badge } from "../../components/Badge";
import { SearchBar } from "../../components/SearchBar";
import { SummaryCards } from "../../components/SummaryCards";
import { PrimaryButton } from "../../components/PrimaryButton";
import { CompanyNumberAssignToType } from "../../types";

interface DirColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface DeptRow {
  id: string;
  name: string;
  phone: string | null;
  allocationId: string | null;
}
interface FnRow {
  id: string;
  name: string;
  department: string;
  type: string;
  phone: string | null;
  email: string | null;
  hasContact: boolean;
  allocationId: string | null;
}
interface StaffRow {
  id: string;
  name: string;
  department: string;
  mobile: string;
  email: string;
  companyPhone: string | null;
  allocationId: string | null;
}

export function ContactManagerPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Allocator state
  const [assignToType, setAssignToType] = useState<CompanyNumberAssignToType>(
    CompanyNumberAssignToType.Staff,
  );
  const [assignToEntityId, setAssignToEntityId] = useState("");
  const [assignNumberId, setAssignNumberId] = useState("");

  // Directory state
  const [dirTab, setDirTab] = useState<"departments" | "functions" | "staff">("departments");
  const [dirSearch, setDirSearch] = useState("");

  // Helpers
  const allocations = state.companyNumberAllocations;
  const allocatedNumberIds = new Set(allocations.map((a) => a.companyNumberId));
  const availableNumbers = state.companyNumbers.filter((n) => !allocatedNumberIds.has(n.id));
  const totalNumbers = state.companyNumbers.length;
  const allocatedCount = allocations.length;

  const deptAllocations = allocations.filter(
    (a) => a.assignToType === CompanyNumberAssignToType.Department,
  );
  const fnAllocations = allocations.filter(
    (a) => a.assignToType === CompanyNumberAssignToType.Function,
  );
  const staffAllocations = allocations.filter(
    (a) => a.assignToType === CompanyNumberAssignToType.Staff,
  );

  // Summary cards
  const cards = [
    {
      icon: <Phone className="w-5 h-5 text-gray-400" />,
      label: "Total / Available",
      value: `${totalNumbers} / ${availableNumbers.length}`,
      sub: `${allocatedCount} allocated`,
    },
    {
      icon: <Building2 className="w-5 h-5 text-gray-400" />,
      label: "Department Lines",
      value: String(deptAllocations.length),
      sub: `of ${state.departments.length} departments`,
    },
    {
      icon: <Layers className="w-5 h-5 text-gray-400" />,
      label: "Function Lines",
      value: String(fnAllocations.length),
      sub: `of ${state.functions.length} functions`,
    },
    {
      icon: <UsersRound className="w-5 h-5 text-gray-400" />,
      label: "Staff Lines",
      value: String(staffAllocations.length),
      sub: `of ${state.staff.length} staff`,
    },
  ];

  // Step 2 dynamic options
  const step2Options = useMemo(() => {
    if (assignToType === CompanyNumberAssignToType.Staff) {
      return state.staff.map((s) => {
        const d = state.departments.find((dep) => dep.id === s.departmentId);
        return { value: s.id, label: `${getStaffFullName(s)} (${d?.name || ""})` };
      });
    }
    if (assignToType === CompanyNumberAssignToType.Function) {
      return state.functions.map((f) => {
        const d = state.departments.find((dep) => dep.id === f.departmentId);
        return { value: f.id, label: `${f.name} (${d?.name || ""})` };
      });
    }
    if (assignToType === CompanyNumberAssignToType.Department) {
      return state.departments.map((d) => ({ value: d.id, label: d.name }));
    }
    return [];
  }, [assignToType, state.staff, state.functions, state.departments]);

  const step2Label =
    assignToType === CompanyNumberAssignToType.Staff
      ? "Staff Member"
      : assignToType === CompanyNumberAssignToType.Function
        ? "Function"
        : "Department";

  const handleAllocate = () => {
    if (!assignToEntityId || !assignNumberId) return;
    const payload = {
      id: generateId(),
      companyNumberId: assignNumberId,
      assignToType: assignToType,
      staffId: assignToType === CompanyNumberAssignToType.Staff ? assignToEntityId : null,
      functionId: assignToType === CompanyNumberAssignToType.Function ? assignToEntityId : null,
      departmentId: assignToType === CompanyNumberAssignToType.Department ? assignToEntityId : null,
    };
    dispatch({ type: "ALLOCATE_NUMBER", payload });
    setAssignToEntityId("");
    setAssignNumberId("");
  };

  const handleRelease = (allocationId: string) => {
    dispatch({ type: "RELEASE_NUMBER", payload: allocationId });
  };

  // Reset step 2 and 3 when assign type changes
  const handleAssignTypeChange = (type: string) => {
    setAssignToType(type as CompanyNumberAssignToType);
    setAssignToEntityId("");
    setAssignNumberId("");
  };

  // --- Contact Directory Data ---

  // Departments tab
  const deptRows = useMemo<DeptRow[]>(() => {
    return state.departments
      .map((d) => {
        const alloc = allocations.find(
          (a) => a.assignToType === CompanyNumberAssignToType.Department && a.departmentId === d.id,
        );
        const num = alloc ? state.companyNumbers.find((n) => n.id === alloc.companyNumberId) : null;
        return {
          id: d.id,
          name: d.name,
          phone: num?.phoneNumber || null,
          allocationId: alloc?.id || null,
        };
      })
      .filter((r) => !dirSearch || r.name.toLowerCase().includes(dirSearch.toLowerCase()));
  }, [state.departments, allocations, state.companyNumbers, dirSearch]);

  // Functions tab
  const fnRows = useMemo<FnRow[]>(() => {
    return state.functions
      .map((f) => {
        const dept = state.departments.find((d) => d.id === f.departmentId);
        const alloc = allocations.find(
          (a) => a.assignToType === CompanyNumberAssignToType.Function && a.functionId === f.id,
        );
        const companyNum = alloc
          ? state.companyNumbers.find((n) => n.id === alloc.companyNumberId)
          : null;
        const phoneDisplay = companyNum?.phoneNumber || f.phone || null;
        const emailDisplay = f.email || null;
        const hasContact = !!(phoneDisplay || emailDisplay);
        return {
          id: f.id,
          name: f.name,
          department: dept?.name || "-",
          type: f.type,
          phone: phoneDisplay,
          email: emailDisplay,
          hasContact,
          allocationId: alloc?.id || null,
        };
      })
      .filter(
        (r) =>
          !dirSearch ||
          r.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
          r.department.toLowerCase().includes(dirSearch.toLowerCase()),
      );
  }, [state.functions, state.departments, allocations, state.companyNumbers, dirSearch]);

  // Staff tab
  const staffRows = useMemo<StaffRow[]>(() => {
    return state.staff
      .map((s) => {
        const dept = state.departments.find((d) => d.id === s.departmentId);
        const alloc = allocations.find(
          (a) => a.assignToType === CompanyNumberAssignToType.Staff && a.staffId === s.id,
        );
        const companyNum = alloc
          ? state.companyNumbers.find((n) => n.id === alloc.companyNumberId)
          : null;
        return {
          id: s.id,
          name: getStaffFullName(s),
          department: dept?.name || "-",
          mobile: getStaffMobile(s),
          email: getStaffEmail(s, state.appSettings),
          companyPhone: companyNum?.phoneNumber || null,
          allocationId: alloc?.id || null,
        };
      })
      .filter(
        (r) =>
          !dirSearch ||
          r.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
          r.department.toLowerCase().includes(dirSearch.toLowerCase()),
      );
  }, [
    state.staff,
    state.departments,
    allocations,
    state.companyNumbers,
    state.appSettings,
    dirSearch,
  ]);

  // --- Directory columns ---
  const deptColumns: DirColumn<DeptRow>[] = [
    {
      key: "name",
      header: "Department",
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="text-sm text-gray-600 font-mono">{row.phone || "-"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.phone ? (
          <Badge variant="info">Assigned</Badge>
        ) : (
          <span className="text-gray-400 text-sm">No number</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) =>
        row.allocationId ? (
          <button
            onClick={() => handleRelease(row.allocationId!)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Release
          </button>
        ) : null,
    },
  ];

  const fnColumns: DirColumn<FnRow>[] = [
    {
      key: "name",
      header: "Function",
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <span className="text-sm text-gray-600">{row.department}</span>,
    },
    { key: "type", header: "Type", render: (row) => <Badge variant="neutral">{row.type}</Badge> },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="text-sm text-gray-600 font-mono">{row.phone || "-"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <span className="text-sm text-gray-600">{row.email || "-"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.hasContact ? (
          <Badge variant="success">Has contact</Badge>
        ) : (
          <span className="text-gray-400 text-sm">No contact</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) =>
        row.allocationId ? (
          <button
            onClick={() => handleRelease(row.allocationId!)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Release
          </button>
        ) : null,
    },
  ];

  const staffColumns: DirColumn<StaffRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => <span className="text-sm text-gray-600">{row.department}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => <span className="text-sm text-gray-600 font-mono">{row.mobile}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <span className="text-sm text-gray-600">{row.email}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) =>
        row.companyPhone ? (
          <Badge variant="info">Assigned</Badge>
        ) : (
          <Badge variant="info">No phone</Badge>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) =>
        row.allocationId ? (
          <button
            onClick={() => handleRelease(row.allocationId!)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Release
          </button>
        ) : null,
    },
  ];

  // Active tab data/columns
  const dirColumns =
    dirTab === "departments" ? deptColumns : dirTab === "functions" ? fnColumns : staffColumns;
  const dirData = dirTab === "departments" ? deptRows : dirTab === "functions" ? fnRows : staffRows;

  return (
    <div>
      <PageHeader
        title="Contact Manager"
        subtitle={`Manage phone number allocations across ${totalNumbers} defined company numbers`}
      />

      {/* Summary Cards */}
      <div className="mb-6">
        <SummaryCards cards={cards} />
      </div>

      {/* Allocate a Number */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Allocate a Number</h3>
        <div className="flex items-end gap-4 flex-wrap">
          {/* Step 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Step 1 - Assign To
            </label>
            <select
              value={assignToType}
              onChange={(e) => handleAssignTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
            >
              <option value={CompanyNumberAssignToType.Staff}>Staff</option>
              <option value={CompanyNumberAssignToType.Function}>Function</option>
              <option value={CompanyNumberAssignToType.Department}>Department</option>
            </select>
          </div>
          {/* Step 2 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Step 2 - {step2Label}
            </label>
            <select
              value={assignToEntityId}
              onChange={(e) => setAssignToEntityId(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            >
              <option value="">Select {step2Label.toLowerCase()}</option>
              {step2Options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {/* Step 3 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Step 3 - Number
            </label>
            <select
              value={assignNumberId}
              onChange={(e) => setAssignNumberId(e.target.value)}
              disabled={availableNumbers.length === 0}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 disabled:opacity-50"
            >
              <option value="">Select number</option>
              {availableNumbers.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.phoneNumber}
                </option>
              ))}
            </select>
          </div>
          {/* Allocate button */}
          <PrimaryButton
            onClick={handleAllocate}
            icon={Phone}
            disabled={!assignToEntityId || !assignNumberId}
          >
            Allocate
          </PrimaryButton>
        </div>
      </div>

      {/* Contact Directory */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Contact Directory</h3>
          <div className="w-52">
            <SearchBar value={dirSearch} onChange={setDirSearch} placeholder="Search..." />
          </div>
        </div>

        {/* Directory tabs */}
        <div className="flex gap-0 mb-4 border-b border-gray-200">
          {[
            { id: "departments" as const, label: `Departments (${state.departments.length})` },
            { id: "functions" as const, label: `Functions (${state.functions.length})` },
            { id: "staff" as const, label: `Staff (${state.staff.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setDirTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${dirTab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Directory table */}
        {dirData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">No results found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {dirColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dirData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  {dirColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {(col as DirColumn<typeof row>).render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
