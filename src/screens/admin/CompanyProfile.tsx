/**
 * CompanyProfile — Admin screen for editing company information.
 *
 * Step 6: Rewired to persist to Supabase via company_profile singleton.
 */

import { useState, useEffect } from 'react';
import { Building2, Loader2, Globe, MapPin } from 'lucide-react';
import { useAppState, useAppDispatch } from '../../state/context';
import { useShowToast } from '../../components/ToastContext';
import { dataService } from '../../services/dataService';
import type { CompanyProfile } from '../../types/entities';
import { PageHeader } from '../../components/PageHeader';

export function CompanyProfilePage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useShowToast();

  const profile = state.companyProfile;

  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [website, setWebsite] = useState(profile.website);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setLocation(profile.location);
    setWebsite(profile.website);
    setLogoUrl(profile.logoUrl);
  }, [profile.name, profile.location, profile.website, profile.logoUrl]);

  const hasChanges =
    name !== profile.name ||
    location !== profile.location ||
    website !== profile.website ||
    logoUrl !== profile.logoUrl;

  async function handleSave() {
    setSaving(true);

    const { data, error } = await dataService.upsertSingleton<CompanyProfile>(
      'company_profile',
      {
        name: name.trim(),
        location: location.trim(),
        website: website.trim(),
        logoUrl: logoUrl.trim(),
      }
    );
    setSaving(false);

    if (error || !data) {
      showToast(`Failed to save: ${error ?? 'Unknown error'}`, 'error');
      return;
    }

    dispatch({ type: 'UPDATE_COMPANY_PROFILE', payload: data });
    showToast('Company profile saved', 'success');
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" subtitle="Manage your organisation's basic information" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corporation" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Abu Dhabi, UAE" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.company.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://www.company.com/logo.png" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={!hasChanges || saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Preview</h3>
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{name || 'Company Name'}</h2>
              {location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </p>
              )}
              {website && (
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <Globe className="w-3.5 h-3.5" />
                  {website}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
