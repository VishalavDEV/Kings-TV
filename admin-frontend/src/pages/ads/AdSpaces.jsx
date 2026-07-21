import React, { useState, useEffect } from 'react';
import { MonitorPlay, Code, Save, Wand2, Check } from 'lucide-react';
import api from '../../utils/axios';

export default function AdSpaces() {
  const [adSpaces, setAdSpaces] = useState([]);
  const [adsenseCode, setAdsenseCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [savingAdsense, setSavingAdsense] = useState(false);
  const [toast, setToast] = useState('');

  // Helper Modal State
  const [helperOpenKey, setHelperOpenKey] = useState(null);
  const [helperImageUrl, setHelperImageUrl] = useState('');
  const [helperAdUrl, setHelperAdUrl] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/ad-spaces'),
      api.get('/api/admin/ad-spaces/adsense-code')
    ]).then(([spacesRes, adsenseRes]) => {
      setAdSpaces(Array.isArray(spacesRes.data) ? spacesRes.data : []);
      if (adsenseRes.data?.adsenseActivationCode) {
        setAdsenseCode(adsenseRes.data.adsenseActivationCode);
      }
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = (placementKey, field, value) => {
    setAdSpaces(prev => prev.map(space =>
      space.placementKey === placementKey ? { ...space, [field]: value } : space
    ));
  };

  const handleSavePlacement = async (placementKey) => {
    setSavingKey(placementKey);
    const space = adSpaces.find(s => s.placementKey === placementKey);
    if (!space) return;

    try {
      await api.put(`/api/admin/ad-spaces/${placementKey}`, space);
      showToast(`${space.placementLabel || placementKey} updated successfully`);
    } catch {
      showToast(`Failed to update ${placementKey}`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleGenerateAdCode = (placementKey) => {
    if (!helperImageUrl || !helperAdUrl) {
      alert('Please fill in both Image URL and Target Ad Destination URL');
      return;
    }
    const generated = `<a href="${helperAdUrl}" target="_blank" rel="noopener noreferrer"><img src="${helperImageUrl}" alt="Advertisement" style="max-width: 100%; height: auto;" /></a>`;
    handleFieldChange(placementKey, 'adCode', generated);
    handleFieldChange(placementKey, 'adImageUrl', helperImageUrl);
    handleFieldChange(placementKey, 'adUrl', helperAdUrl);
    setHelperOpenKey(null);
    setHelperImageUrl('');
    setHelperAdUrl('');
    showToast('Ad Code generated & inserted into text area');
  };

  const handleSaveAdsense = async () => {
    setSavingAdsense(true);
    try {
      await api.put('/api/admin/ad-spaces/adsense-code', { adsenseActivationCode: adsenseCode });
      showToast('AdSense Activation Code saved successfully');
    } catch {
      showToast('Failed to save AdSense activation code');
    } finally {
      setSavingAdsense(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Ad Spaces & AdSense Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage placement ad codes, custom banners, and site-wide Google AdSense integration</p>
      </div>

      {/* Placement Cards */}
      <div className="space-y-6">
        {adSpaces.map((space) => {
          const isSaving = savingKey === space.placementKey;
          const isHelperOpen = helperOpenKey === space.placementKey;

          return (
            <div key={space.placementKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <MonitorPlay size={18} className="text-[#B3732A]" />
                  <h3 className="font-bold text-gray-800">{space.placementLabel || space.placementKey.toUpperCase()}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHelperOpenKey(isHelperOpen ? null : space.placementKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-[#B3732A] hover:bg-amber-100 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Wand2 size={14} /> Create Ad Code Helper
                  </button>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={space.isActive !== false}
                      onChange={(e) => handleFieldChange(space.placementKey, 'isActive', e.target.checked)}
                      className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                    />
                    Active
                  </label>
                </div>
              </div>

              {/* Helper Form Drawer/Box */}
              {isHelperOpen && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-3 animate-fade-in">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Wand2 size={14} /> Generate Custom Banner Code Helper
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Banner Image URL *</label>
                      <input
                        type="text"
                        value={helperImageUrl}
                        onChange={(e) => setHelperImageUrl(e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Target Ad Destination URL *</label>
                      <input
                        type="text"
                        value={helperAdUrl}
                        onChange={(e) => setHelperAdUrl(e.target.value)}
                        placeholder="https://advertiser.com/landing-page"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHelperOpenKey(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenerateAdCode(space.placementKey)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#B3732A] text-white rounded-lg text-xs font-semibold hover:bg-[#9c6323]"
                    >
                      <Check size={14} /> Generate & Insert Snippet
                    </button>
                  </div>
                </div>
              )}

              {/* Textarea for Raw HTML/JS Ad Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Code (HTML / JavaScript Script Tag / Google AdSense Tag)</label>
                <textarea
                  rows={4}
                  value={space.adCode || ''}
                  onChange={(e) => handleFieldChange(space.placementKey, 'adCode', e.target.value)}
                  placeholder={`<!-- Paste your ${space.placementLabel || space.placementKey} ad code HTML or JS snippet here -->`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSavePlacement(space.placementKey)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
                >
                  <Save size={14} />
                  {isSaving ? 'Saving…' : `Save ${space.placementLabel || space.placementKey}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google AdSense Activation Code Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Code size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Google AdSense Activation Code (Site-wide Footer Script)</h3>
        </div>

        <p className="text-xs text-gray-500">
          Paste your Google AdSense publisher script (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">&lt;script async src="https://pagead2.googlesyndication.com/..."&gt;&lt;/script&gt;</code>) to activate Google Ads across all site pages automatically.
        </p>

        <textarea
          rows={5}
          value={adsenseCode}
          onChange={(e) => setAdsenseCode(e.target.value)}
          placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX' crossorigin='anonymous'></script>"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
        />

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSaveAdsense}
            disabled={savingAdsense}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingAdsense ? 'Saving…' : 'Save AdSense Activation Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
