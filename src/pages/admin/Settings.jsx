import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

const API = '/api';

const fields = [
  { key: 'siteName', label: 'Site Name', type: 'text' },
  { key: 'universityName', label: 'University Name', type: 'text' },
  { key: 'vcName', label: 'Vice Chancellor Name', type: 'text' },
  { key: 'vcRole', label: 'Vice Chancellor Role', type: 'text' },
  { key: 'vcMessage', label: 'Vice Chancellor Message', type: 'textarea' },
  { key: 'coordinatorName', label: 'Coordinator Name', type: 'text' },
  { key: 'coordinatorEmail', label: 'Coordinator Email', type: 'email' },
  { key: 'coordinatorPhone', label: 'Coordinator Phone', type: 'tel' },
  { key: 'location', label: 'Location / Address', type: 'text' },
];

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {fields.map((field) => (
          <div key={field.key} className="p-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
            <label className="block text-sm font-medium text-gray-700 sm:pt-2">
              {field.label}
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              {field.type === 'textarea' ? (
                <textarea
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <input
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
