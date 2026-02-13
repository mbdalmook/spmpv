/**
 * CompanyNumbers — Admin screen for managing the phone number pool.
 *
 * Step 6: Rewired to persist to Supabase.
 */

import { useState } from 'react';
import { Phone, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { CompanyNumber } from '../../types/entities';
import { PageHeader } from '../../components/PageHeader';
import { SummaryCards } from '../../components/SummaryCards';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { SearchBar } from '../../components/SearchBar';
import { Badge } from '../../components/Badge';

type AddMode = 'single' | 'range';

export function CompanyNumbersPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('single');
  const [singleNumber, setSingleNumber] = useState('');
  const [rangePrefix, setRangePrefix] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CompanyNumber | null>(null);
  const [saving, setSaving] = useState(false);

  const numbers = state.companyNumbers;
  const allocations = state.companyNumberAllocations;

  const isAllocated = (numberId: string) => allocations.some((a) => a.companyNumberId === numberId);

  const filtered = numbers.filter((n) => n.phoneNumber.toLowerCase().includes(search.toLowerCase()));

  const allocatedCount = numbers.filter((n) => isAllocated(n.id)).length;
  const summaryCards = [
    { icon: <Phone className="w-5 h-5" />, label: 'Total Numbers', value: numbers.length },
    { label: 'Allocated', value: allocatedCount },
    { label: 'Available', value: numbers.length - allocatedCount },
  ];

  function openAdd() {
    setSingleNumber('');
    setRangePrefix('');
    setRangeStart('');
    setRangeEnd('');
    setAddMode('single');
    setShowAddModal(true);
  }

  async function handleAddSingle() {
    if (!singleNumber.trim()) return;
    setSaving(true);

    const { data, error } = await dataService.create<CompanyNumber>('company_number', {
      phoneNumber: singleNumber.trim(),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to add number: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    // ADD_COMPANY_NUMBER payload is CompanyNumber[] (array)
    dispatch({ type: 'ADD_COMPANY_NUMBER', payload: [data] });
    showToast('Number added', 'success');
    setShowAddModal(false);
  }

  async function handleAddRange() {
    if (!rangePrefix.trim() || !rangeStart || !rangeEnd) return;

    const start = Number(rangeStart);
    const end = Number(rangeEnd);
    if (start > end || end - start > 999) {
      showToast('Invalid range (max 1000 numbers at a time)', 'error');
      return;
    }

    setSaving(true);

    const created: CompanyNumber[] = [];
    const errors: string[] = [];

    for (let i = start; i <= end; i++) {
      const phoneNumber = `${rangePrefix.trim()}${String(i).padStart(4, '0')}`;
      const { data, error } = await dataService.create<CompanyNumber>('company_number', { phoneNumber });

      if (error || !data) {
        errors.push(phoneNumber);
      } else {
        created.push(data);
      }
    }

    setSaving(false);

    if (created.length > 0) {
      // ADD_COMPANY_NUMBER payload is CompanyNumber[] (array)
      dispatch({ type: 'ADD_COMPANY_NUMBER', payload: created });
    }

    if (errors.length > 0) {
      showToast(
        `Added ${created.length} numbers. ${errors.length} failed (possibly duplicates).`,
        errors.length === end - start + 1 ? 'error' : 'success'
      );
    } else {
      showToast(`Added ${created.length} numbers`, 'success');
    }

    setShowAddModal(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);

    const { error } = await dataService.remove('company_number', deleteTarget.id);
    setSaving(false);

    if (error) {
      showToast(`Failed to delete: ${error}`, 'error');
      return;
    }

    // DELETE_COMPANY_NUMBER payload is string (id)
    dispatch({ type: 'DELETE_COMPANY_NUMBER', payload: deleteTarget.id });
    showToast('Number deleted', 'success');
    setDeleteTarget(null);
  }

  const columns: import('../../components/DataTable').Column<CompanyNumber>[] = [
    { key: 'phoneNumber', header: 'Phone Number', render: (n) => <span className="font-mono text-sm">{n.phoneNumber}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (n) =>
        isAllocated(n.id) ? <Badge variant="info">Allocated</Badge> : <Badge variant="success">Available</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (n) => (
        <button onClick={() => setDeleteTarget(n)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete" disabled={isAllocated(n.id)}>
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Numbers"
        subtitle="Manage the pool of phone numbers available for allocation"
        action={
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Add Numbers
          </button>
        }
      />
      <SummaryCards cards={summaryCards} />
      <div className="max-w-xs">
        <SearchBar value={search} onChange={setSearch} placeholder="Search numbers..." />
      </div>
      <DataTable columns={columns} data={filtered} emptyMessage="No company numbers defined" />

      <Modal isOpen={showAddModal} title="Add Company Numbers" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div className="flex border-b border-gray-200">
              <button onClick={() => setAddMode('single')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${addMode === 'single' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Single Number
              </button>
              <button onClick={() => setAddMode('range')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${addMode === 'range' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Range of Numbers
              </button>
            </div>

            {addMode === 'single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={singleNumber} onChange={(e) => setSingleNumber(e.target.value)} placeholder="e.g. 045555501" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number Prefix</label>
                  <input type="text" value={rangePrefix} onChange={(e) => setRangePrefix(e.target.value)} placeholder="e.g. 04555" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                    <input type="number" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} placeholder="e.g. 5501" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                    <input type="number" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} placeholder="e.g. 5510" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                {rangePrefix && rangeStart && rangeEnd && (
                  <p className="text-xs text-gray-500">
                    Will create {Math.max(0, Number(rangeEnd) - Number(rangeStart) + 1)} numbers from {rangePrefix}{String(Number(rangeStart)).padStart(4, '0')} to {rangePrefix}{String(Number(rangeEnd)).padStart(4, '0')}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button
                onClick={addMode === 'single' ? handleAddSingle : handleAddRange}
                disabled={saving || (addMode === 'single' && !singleNumber.trim()) || (addMode === 'range' && (!rangePrefix.trim() || !rangeStart || !rangeEnd))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </Modal>

      <Modal isOpen={!!deleteTarget} title="Delete Number" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-mono font-medium text-gray-900">{deleteTarget?.phoneNumber}</span>? This action cannot be undone.
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
    </div>
  );
}
