/**
 * User Management — Manage user roles and permissions.
 *
 * Step 6B: Rewired to persist role changes to Supabase.
 * Pattern: setSaving → dataService.update on `app_user` → dispatch on success → toast.
 *
 * Only UPDATE_USER_ROLE is needed (no add/delete from this screen).
 */

import { useState, useMemo } from "react";
import { Check, Loader2, Users, X } from "lucide-react";
import { useAppState, useAppDispatch } from "../../state/context";
import { useShowToast } from "../../components/ToastContext";
import { dataService } from "../../services/dataService";
import { UserRole } from "../../types/enums";
import type { User } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { SearchBar } from "../../components/SearchBar";
import { Modal } from "../../components/Modal";
import { CustomSelect } from "../../components/CustomSelect";

export function UserManagementPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();
  const [search, setSearch] = useState("");
  const [assignUserId, setAssignUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return state.users.filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      if (u.username && u.username.toLowerCase().includes(q)) return true;
      if (u.email && u.email.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [state.users, search]);

  const assignUser = state.users.find((u) => u.id === assignUserId);

  // ── Update role (shared handler for modal + inline X buttons) ──────
  const handleUpdateRole = async (userId: string, role: UserRole) => {
    setSaving(true);

    const { error } = await dataService.update<User>('app_user', userId, { role });

    setSaving(false);

    if (error) {
      showToast(`Failed to update role: ${error}`, 'error');
      return;
    }

    dispatch({ type: "UPDATE_USER_ROLE", payload: { userId, role } });
    showToast('Role updated', 'success');
    setAssignUserId(null);
  };

  const handleAssignRole = (role: string) => {
    if (!assignUserId) return;
    handleUpdateRole(assignUserId, role as UserRole);
  };

  const roleOptions = [
    { value: UserRole.Admin, label: "Admin" },
    { value: UserRole.SuperAdmin, label: "Super Admin" },
  ];

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (row) => <span className="text-sm text-gray-900">{row.username || "-"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (row) => <span className="text-sm text-gray-500">{row.email || "-"}</span>,
    },
    {
      key: "roles",
      header: "Roles",
      render: (row) => {
        if (row.role === UserRole.SuperAdmin) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Check className="w-3 h-3" />
              {row.role}
              <button
                onClick={() => handleUpdateRole(row.id, UserRole.Staff)}
                disabled={saving}
                className="ml-0.5 hover:text-blue-900 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        }
        if (row.role === UserRole.Admin) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <Check className="w-3 h-3" />
              {row.role}
              <button
                onClick={() => handleUpdateRole(row.id, UserRole.Staff)}
                disabled={saving}
                className="ml-0.5 hover:text-amber-900 transition-colors disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        }
        return <span className="text-sm text-gray-400">{row.role}</span>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => setAssignUserId(row.id)}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Users className="w-3.5 h-3.5" />
          Role
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage user roles and permissions" />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-52">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No users found." />

      {/* Assign Role Modal */}
      <Modal
        isOpen={!!assignUserId}
        onClose={() => !saving && setAssignUserId(null)}
        title="Assign Role"
        footer={null}
      >
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Role</label>
          {saving ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating role...
            </div>
          ) : (
            <CustomSelect
              value={assignUser?.role || UserRole.Staff}
              onChange={(val) => handleAssignRole(val)}
              options={roleOptions}
              placeholder="Select role..."
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
