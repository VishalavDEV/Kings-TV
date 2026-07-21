import React, { useState, useEffect } from 'react';
import { Navigation, Save, AlertTriangle } from 'lucide-react';
import api from '../../utils/axios';

const ROUTE_LABELS = {
  posts: 'Posts List Route Slug',
  search: 'Search Route Slug',
  rss_feeds: 'RSS Feeds Route Slug',
  gallery_album: 'Gallery Album Route Slug',
  earnings: 'Author Earnings Route Slug',
  payouts: 'Payouts History Route Slug',
  set_payout_account: 'Set Payout Account Route Slug',
  logout: 'User Logout Route Slug'
};

export default function RouteSettings() {
  const [routes, setRoutes] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadRoutes = () => {
    setLoading(true);
    api.get('/api/admin/route-settings')
      .then(res => setRoutes(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleChange = (key, value) => {
    setErrorMsg('');
    setRoutes(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    // Validate special characters locally before submitting
    for (const [key, slug] of Object.entries(routes)) {
      if (slug && !/^[a-zA-Z0-9_-]+$/.test(slug)) {
        setErrorMsg(`Invalid slug "${slug}" for route "${key}". Special characters and spaces are not allowed!`);
        return;
      }
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await api.put('/api/admin/route-settings', routes);
      showToast('Route settings saved successfully');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save route settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Route Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize public system URL-slug mapping per module</p>
      </div>

      {/* Red Warning Box */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-xs leading-relaxed">
        <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-950 mb-0.5">Special Character Restriction Warning!</p>
          <p>
            Do NOT use special characters, symbols, or spaces in custom route slugs (e.g. <code>? &amp; % $ # @ !</code>).
            Only lowercase letters, numbers, hyphens (<code>-</code>), and underscores (<code>_</code>) are valid.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Route List Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Navigation size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">System Modules URL Slugs</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {Object.keys(routes).map((key) => (
            <div key={key} className="py-3.5 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">{ROUTE_LABELS[key] || key.replace('_', ' ').toUpperCase()}</p>
                <p className="text-xs text-gray-400 font-mono">System Key: {key}</p>
              </div>
              <div>
                <input
                  type="text"
                  value={routes[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Route Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
