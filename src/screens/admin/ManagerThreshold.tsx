/**
 * ManagerThreshold — Admin screen for configuring the manager grade threshold.
 *
 * Step 6: Rewired to persist to Supabase via app_settings singleton.
 */

import { useState, useEffect } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { AppSettings } from '../../types/entities';
import { PageHeader } from '../../components/PageHeader';

export function ManagerThresholdPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const settings = state.appSettings;
  const grades = [...state.grades].sort((a, b) => a.level - b.level);

  const [threshold, setThreshold] = useState(String(settings.maxManagerGradeLevel));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setThreshold(String(settings.maxManagerGradeLevel));
  }, [settings.maxManagerGradeLevel]);

  const hasChanges = Number(threshold) !== settings.maxManagerGradeLevel;

  const thresholdGrade = grades.find((g) => g.level === Number(threshold));

  const affectedDepts = state.departments.filter((dept) => {
    if (!dept.managerId) return false;
    const manager = state.staff.find((s) => s.id === dept.managerId);
    if (!manager?.gradeId) return false;
    const grade = state.grades.find((g) => g.id === manager.gradeId);
    return grade && grade.level > Number(threshold);
  });

  async function handleSave() {
    setSaving(true);

    const { data, error } = await dataService.upsertSingleton<AppSettings>('app_settings', {
      emailDomain: settings.emailDomain,
      emailFormat: settings.emailFormat,
      maxManagerGradeLevel: Number(threshold),
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to save: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'UPDATE_APP_SETTINGS', payload: data });
    showToast('Manager threshold updated', 'success');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Manager Threshold" subtitle="Set the minimum grade level required for a department manager to be considered 'Managed'" />

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Manager Grade Level</label>
            <p className="text-xs text-gray-500 mb-3">Managers at or below this level count as "Managed". Above this level shows as "Acting".</p>

            {grades.length > 0 ? (
              <select value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {grades.map((g) => (
                  <option key={g.id} value={g.level}>Level {g.level} — {g.name}</option>
                ))}
              </select>
            ) : (
              <div>
                <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} min={0} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">No grades defined yet — enter a numeric level</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Threshold: {thresholdGrade ? `Level ${thresholdGrade.level} (${thresholdGrade.name})` : `Level ${threshold}`}
              </span>
            </div>
            {affectedDepts.length > 0 && (
              <p className="text-xs text-amber-600">{affectedDepts.length} department{affectedDepts.length > 1 ? 's' : ''} would show as "Acting" with this threshold</p>
            )}
            {affectedDepts.length === 0 && state.departments.length > 0 && (
              <p className="text-xs text-green-600">All managed departments qualify as "Managed" at this threshold</p>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
