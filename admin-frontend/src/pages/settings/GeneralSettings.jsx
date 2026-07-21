import React, { useState, useEffect } from 'react';
import { Settings, Save, Mail, Share2, Code, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../utils/axios';

export default function GeneralSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: { site_title: '', site_tagline: '', admin_email: '', site_language: 'en', timezone: 'UTC' },
    contact: { email: '', phone: '', address: '' },
    social: { facebook: '', twitter: '', instagram: '', pinterest: '', linkedin: '', vk: '', telegram: '', youtube: '' },
    fbComments: { app_id: '', num_posts: '5' },
    cookies: { enabled: 'true', text: '' },
    customCss: '',
    customJs: '',
    recaptcha: { site_key: '', secret_key: '' },
    maintenance: { enabled: 'false', title: 'Maintenance Mode', message: 'We are currently performing scheduled maintenance.' }
  });

  const [loading, setLoading] = useState(true);
  const [savingTab, setSavingTab] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadSettings = () => {
    setLoading(true);
    api.get('/api/admin/settings/general')
      .then(res => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveTab = async (tabKey) => {
    setSavingTab(tabKey);
    try {
      await api.put('/api/admin/settings/general', settings);
      showToast('Settings saved successfully');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSavingTab('');
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
        <h2 className="text-xl font-bold text-gray-800">General Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure site information, contact info, social links, custom codes, and maintenance mode</p>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'general', label: 'General' },
          { id: 'contact', label: 'Contact' },
          { id: 'social', label: 'Social Media' },
          { id: 'fbComments', label: 'Facebook Comments' },
          { id: 'cookies', label: 'Cookies Warning' },
          { id: 'customCss', label: 'Custom CSS' },
          { id: 'customJs', label: 'Custom JS' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-[#B3732A] text-[#B3732A] bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">General Site Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Site Title</label>
                <input
                  type="text"
                  value={settings.general?.site_title || ''}
                  onChange={(e) => setSettings(s => ({ ...s, general: { ...s.general, site_title: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Email</label>
                <input
                  type="email"
                  value={settings.general?.admin_email || ''}
                  onChange={(e) => setSettings(s => ({ ...s, general: { ...s.general, admin_email: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Timezone</label>
                <select
                  value={settings.general?.timezone || 'UTC'}
                  onChange={(e) => setSettings(s => ({ ...s, general: { ...s.general, timezone: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('general')}
                disabled={savingTab === 'general'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                <Save size={16} /> Save General Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Contact Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contact?.email || ''}
                  onChange={(e) => setSettings(s => ({ ...s, contact: { ...s.contact, email: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.contact?.phone || ''}
                  onChange={(e) => setSettings(s => ({ ...s, contact: { ...s.contact, phone: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={settings.contact?.address || ''}
                  onChange={(e) => setSettings(s => ({ ...s, contact: { ...s.contact, address: e.target.value } }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('contact')}
                disabled={savingTab === 'contact'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save Contact Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Social Media URLs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['facebook', 'twitter', 'instagram', 'pinterest', 'linkedin', 'vk', 'telegram', 'youtube'].map(network => (
                <div key={network}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{network} URL</label>
                  <input
                    type="text"
                    value={settings.social?.[network] || ''}
                    onChange={(e) => setSettings(s => ({ ...s, social: { ...s.social, [network]: e.target.value } }))}
                    placeholder={`https://${network}.com/yourpage`}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('social')}
                disabled={savingTab === 'social'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save Social Media Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'fbComments' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Facebook Comments Configuration</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Facebook App ID</label>
              <input
                type="text"
                value={settings.fbComments?.app_id || ''}
                onChange={(e) => setSettings(s => ({ ...s, fbComments: { ...s.fbComments, app_id: e.target.value } }))}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('fbComments')}
                disabled={savingTab === 'fbComments'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save FB Comments Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Cookies Warning Banner</h3>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Enable Cookies Warning Banner</span>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, cookies: { ...s.cookies, enabled: s.cookies?.enabled === 'true' ? 'false' : 'true' } }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${settings.cookies?.enabled === 'true' ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${settings.cookies?.enabled === 'true' ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Warning Text</label>
              <textarea
                rows={3}
                value={settings.cookies?.text || ''}
                onChange={(e) => setSettings(s => ({ ...s, cookies: { ...s.cookies, text: e.target.value } }))}
                placeholder="We use cookies to ensure that we give you the best experience on our website…"
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('cookies')}
                disabled={savingTab === 'cookies'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save Cookies Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'customCss' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Custom CSS Codes</h3>
            <textarea
              rows={8}
              value={settings.customCss || ''}
              onChange={(e) => setSettings(s => ({ ...s, customCss: e.target.value }))}
              placeholder="/* Add custom CSS styles here */"
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-gray-50 focus:bg-white"
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('customCss')}
                disabled={savingTab === 'customCss'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save Custom CSS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'customJs' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Custom JavaScript Codes</h3>
            <textarea
              rows={8}
              value={settings.customJs || ''}
              onChange={(e) => setSettings(s => ({ ...s, customJs: e.target.value }))}
              placeholder="// Add custom JS code here"
              className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-gray-50 focus:bg-white"
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('customJs')}
                disabled={savingTab === 'customJs'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
              >
                <Save size={16} /> Save Custom JS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Separate Card 1: Google reCAPTCHA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <ShieldCheck size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Google reCAPTCHA Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Site Key</label>
            <input
              type="text"
              value={settings.recaptcha?.site_key || ''}
              onChange={(e) => setSettings(s => ({ ...s, recaptcha: { ...s.recaptcha, site_key: e.target.value } }))}
              className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Secret Key</label>
            <input
              type="password"
              value={settings.recaptcha?.secret_key || ''}
              onChange={(e) => setSettings(s => ({ ...s, recaptcha: { ...s.recaptcha, secret_key: e.target.value } }))}
              className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSaveTab('recaptcha')}
            disabled={savingTab === 'recaptcha'}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
          >
            <Save size={16} /> Save reCAPTCHA Settings
          </button>
        </div>
      </div>

      {/* Separate Card 2: Maintenance Mode */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-[#B3732A]" />
            <h3 className="font-bold text-gray-800">Maintenance Mode</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Status:</span>
            <button
              type="button"
              onClick={() => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, enabled: s.maintenance?.enabled === 'true' ? 'false' : 'true' } }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${settings.maintenance?.enabled === 'true' ? 'bg-red-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${settings.maintenance?.enabled === 'true' ? 'left-[22px]' : 'left-[3px]'}`} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Maintenance Title</label>
          <input
            type="text"
            value={settings.maintenance?.title || ''}
            onChange={(e) => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, title: e.target.value } }))}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Maintenance Message</label>
          <textarea
            rows={3}
            value={settings.maintenance?.message || ''}
            onChange={(e) => setSettings(s => ({ ...s, maintenance: { ...s.maintenance, message: e.target.value } }))}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleSaveTab('maintenance')}
            disabled={savingTab === 'maintenance'}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323]"
          >
            <Save size={16} /> Save Maintenance Settings
          </button>
        </div>
      </div>
    </div>
  );
}
