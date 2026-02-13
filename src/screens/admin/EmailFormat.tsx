/**
 * EmailFormat — Admin screen for configuring email generation settings.
 *
 * Step 6: Rewired to persist to Supabase via app_settings singleton.
 */

import { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { AppSettings } from '../../types/entities';
import { EmailFormat } from '../../types/enums';
import { PageHeader } from '../../components/PageHeader';

const FORMAT_OPTIONS = [
  { value: EmailFormat.FirstnameL, label: 'firstname.L', example: 'jane.d@company.com' },
  { value: EmailFormat.FLastname, label: 'F.lastname', example: 'j.doe@company.com' },
];

export function EmailFormatPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const settings = state.appSettings;
  const [emailDomain, setEmailDomain] = useState(settings.emailDomain);
  const [emailFormat, setEmailFormat] = useState<EmailFormat>(settings.emailFormat);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEmailDomain(settings.emailDomain);
    setEmailFormat(settings.emailFormat);
  }, [settings.emailDomain, settings.emailFormat]);

  const hasChanges = emailDomain !== settings.emailDomain || emailFormat !== settings.emailFormat;

  const exampleEmail =
    emailFormat === EmailFormat.FirstnameL
      ? `jane.d@${emailDomain || 'domain.com'}`
      : `j.doe@${emailDomain || 'domain.com'}`;

  async function handleSave() {
    setSaving(true);

    const { data, error } = await dataService.upsertSingleton<AppSettings>('app_settings', {
      emailDomain: emailDomain.trim(),
      emailFormat,
      maxManagerGradeLevel: settings.maxManagerGradeLevel,
    });
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to save: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'UPDATE_APP_SETTINGS', payload: data });
    showToast('Email format settings saved', 'success');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Email Format" subtitle="Configure how staff email addresses are generated" />

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Domain</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">@</span>
              <input type="text" value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} placeholder="company.com" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Format</label>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    emailFormat === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" name="emailFormat" value={opt.value} checked={emailFormat === opt.value} onChange={() => setEmailFormat(opt.value)} className="text-blue-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    <span className="text-xs text-gray-500 ml-2">e.g. {opt.example}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Preview</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{exampleEmail}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!hasChanges || !emailDomain.trim() || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
