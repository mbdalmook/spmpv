/**
 * ComplianceTags — Admin screen for managing compliance tag labels.
 *
 * Step 6: Rewired to persist CRUD operations to Supabase.
 */

import { useState } from 'react';
import { Tag, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { ComplianceTag } from '../../types/entities';
import { PageHeader } from '../../components/PageHeader';
import { SummaryCards } from '../../components/SummaryCards';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';

export function ComplianceTagsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<ComplianceTag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComplianceTag | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const tags = state.complianceTags;

  const usedTagIds = new Set(
    state.responsibilities.filter((r) => r.complianceTagId).map((r) => r.complianceTagId)
  );

  const summaryCards = [
    { icon: <Tag className="w-5 h-5" />, label: 'Total Tags', value: tags.length },
    { label: 'Active', value: tags.filter((t) => usedTagIds.has(t.id)).length, sub: 'In use by responsibilities' },
    { label: 'Unused', value: tags.filter((t) => !usedTagIds.has(t.id)).length },
  ];

  function openAdd() {
    setName('');
    setShowAddModal(true);
  }

  function openEdit(tag: ComplianceTag) {
    setName(tag.name);
    setEditingTag(tag);
  }

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);

    const { data, error } = await dataService.create<ComplianceTag>('compliance_tag', {
      name: name.trim(),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to add tag: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'ADD_COMPLIANCE_TAG', payload: data });
    showToast('Compliance tag added', 'success');
    setShowAddModal(false);
    setName('');
  }

  async function handleEdit() {
    if (!editingTag || !name.trim()) return;
    setSaving(true);

    const { data, error } = await dataService.update<ComplianceTag>(
      'compliance_tag',
      editingTag.id,
      { name: name.trim() }
    );
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to update tag: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'UPDATE_COMPLIANCE_TAG', payload: data });
    showToast('Compliance tag updated', 'success');
    setEditingTag(null);
    setName('');
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);

    const { error } = await dataService.remove('compliance_tag', deleteTarget.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete tag: ${error}`, 'error');
      return;
    }

    dispatch({ type: 'DELETE_COMPLIANCE_TAG', payload: deleteTarget.id });
    showToast('Compliance tag deleted', 'success');
    setDeleteTarget(null);
  }

  const columns = [
    { header: 'Tag Name', accessor: (tag: ComplianceTag) => tag.name },
    {
      header: 'Status',
      accessor: (tag: ComplianceTag) =>
        usedTagIds.has(tag.id) ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Unused</Badge>,
    },
    {
      header: 'Actions',
      accessor: (tag: ComplianceTag) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(tag)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(tag)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete"
            disabled={usedTagIds.has(tag.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Tags"
        subtitle="Manage compliance type labels used by responsibilities"
        action={
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </button>
        }
      />
      <SummaryCards cards={summaryCards} />
      <DataTable columns={columns} data={tags} emptyMessage="No compliance tags defined" />

      {showAddModal && (
        <Modal title="Add Compliance Tag" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Annual, Transactional" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleAdd} disabled={!name.trim() || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Add Tag'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingTag && (
        <Modal title="Edit Compliance Tag" onClose={() => setEditingTag(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingTag(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleEdit} disabled={!name.trim() || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Compliance Tag" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
