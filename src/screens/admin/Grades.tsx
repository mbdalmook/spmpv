/**
 * Grades — Admin screen for managing organisational grade levels.
 *
 * Step 6: Rewired to persist CRUD operations to Supabase.
 */

import { useState } from 'react';
import { Award, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { Grade } from '../../types/entities';
import { PageHeader } from '../../components/PageHeader';
import { SummaryCards } from '../../components/SummaryCards';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';

export function GradesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [saving, setSaving] = useState(false);

  const grades = [...state.grades].sort((a, b) => a.level - b.level);

  const gradeStaffCount = (gradeId: string) => state.staff.filter((s) => s.gradeId === gradeId).length;

  const gradeDeptCount = (gradeId: string) => {
    const deptIds = new Set(state.staff.filter((s) => s.gradeId === gradeId).map((s) => s.departmentId));
    return deptIds.size;
  };

  const summaryCards = [
    { icon: <Award className="w-5 h-5" />, label: 'Total Grades', value: grades.length },
    { label: 'Active', value: grades.filter((g) => gradeStaffCount(g.id) > 0).length, sub: 'With assigned staff' },
    { label: 'Unused', value: grades.filter((g) => gradeStaffCount(g.id) === 0).length },
  ];

  function openAdd() {
    setName('');
    setLevel('');
    setShowAddModal(true);
  }

  function openEdit(grade: Grade) {
    setName(grade.name);
    setLevel(String(grade.level));
    setEditingGrade(grade);
  }

  async function handleAdd() {
    if (!name.trim() || level === '') return;
    setSaving(true);

    const { data, error } = await dataService.create<Grade>('grade', {
      name: name.trim(),
      level: Number(level),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to add grade: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'ADD_GRADE', payload: data });
    showToast('Grade added', 'success');
    setShowAddModal(false);
  }

  async function handleEdit() {
    if (!editingGrade || !name.trim() || level === '') return;
    setSaving(true);

    const { data, error } = await dataService.update<Grade>('grade', editingGrade.id, {
      name: name.trim(),
      level: Number(level),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to update grade: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'UPDATE_GRADE', payload: data });
    showToast('Grade updated', 'success');
    setEditingGrade(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);

    const { error } = await dataService.remove('grade', deleteTarget.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete grade: ${error}`, 'error');
      return;
    }

    dispatch({ type: 'DELETE_GRADE', payload: deleteTarget.id });
    showToast('Grade deleted', 'success');
    setDeleteTarget(null);
  }

  const columns = [
    { header: 'Level', accessor: (g: Grade) => g.level },
    { header: 'Grade Name', accessor: (g: Grade) => g.name },
    { header: 'Headcount', accessor: (g: Grade) => gradeStaffCount(g.id) },
    { header: 'Departments', accessor: (g: Grade) => gradeDeptCount(g.id) },
    {
      header: 'Status',
      accessor: (g: Grade) =>
        gradeStaffCount(g.id) > 0 ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Unused</Badge>,
    },
    {
      header: 'Actions',
      accessor: (g: Grade) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(g)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteTarget(g)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete" disabled={gradeStaffCount(g.id) > 0}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grades"
        subtitle="Manage organisational grade levels"
        action={
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Grade
          </button>
        }
      />
      <SummaryCards cards={summaryCards} />
      <DataTable columns={columns} data={grades} emptyMessage="No grades defined" />

      {showAddModal && (
        <Modal title="Add Grade" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Manager, Senior, Staff" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level <span className="text-red-500">*</span></label>
              <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="0 = highest (MD), 1, 2..." min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleAdd} disabled={!name.trim() || level === '' || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Add Grade'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingGrade && (
        <Modal title="Edit Grade" onClose={() => setEditingGrade(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Name <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level <span className="text-red-500">*</span></label>
              <input type="number" value={level} onChange={(e) => setLevel(e.target.value)} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingGrade(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleEdit} disabled={!name.trim() || level === '' || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete Grade" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete grade <span className="font-medium text-gray-900">"{deleteTarget.name}" (Level {deleteTarget.level})</span>? This action cannot be undone.
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
