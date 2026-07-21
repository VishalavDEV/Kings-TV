import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const TABS = [
  'General', 'Contact', 'Social Media', 'FB Comments',
  'Cookies Warning', 'Custom CSS', 'Custom JS',
];

const SOCIAL_PLATFORMS = [
  { key: 'facebook',  label: 'Facebook',  icon: '📘' },
  { key: 'twitter',   label: 'Twitter/X', icon: '🐦' },
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'pinterest', label: 'Pinterest', icon: '📌' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: '💼' },
  { key: 'vk',        label: 'VKontakte', icon: '🔵' },
  { key: 'telegram',  label: 'Telegram',  icon: '✈️' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️' },
];

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] transition-all"
      />
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  const on = value === 'true' || value === true;
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(on ? 'false' : 'true')}
        className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
      >
        <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${on ? 'left-[22px]' : 'left-[3px]'}`} />
      </button>
    </div>
  );
}

export default function GeneralSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    general: {}, contact: {}, social: {}, fbComments: {},
    cookies: {}, customCss: '', customJs: '', recaptcha: {}, maintenance: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/api/admin/settings/general')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (section, key, value) => {
    setData(d => ({
      ...d,
      [section]: typeof d[section] === 'object' && !Array.isArray(d[section])
        ? { ...d[section], [key]: value }
        : value
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings/general', data);
      setToast('Settings saved!');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Failed to save.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">General Settings</h2>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === i ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* General */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Site Title"    value={data.general?.site_title}    onChange={v => set('general', 'site_title', v)} />
            <Input label="Site Tagline"  value={data.general?.site_tagline}  onChange={v => set('general', 'site_tagline', v)} />
            <Input label="Admin Email"   value={data.general?.admin_email}   onChange={v => set('general', 'admin_email', v)} type="email" />
            <Input label="Site Language" value={data.general?.site_language} onChange={v => set('general', 'site_language', v)} placeholder="en" />
            <Input label="Timezone"      value={data.general?.timezone}      onChange={v => set('general', 'timezone', v)} placeholder="UTC+5:30" />
            <Input label="Date Format"   value={data.general?.date_format}   onChange={v => set('general', 'date_format', v)} placeholder="DD/MM/YYYY" />
          </div>
        )}

        {/* Contact */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Address"     value={data.contact?.address}       onChange={v => set('contact', 'address', v)} />
            <Input label="Phone"       value={data.contact?.phone}         onChange={v => set('contact', 'phone', v)} />
            <Input label="Email"       value={data.contact?.email}         onChange={v => set('contact', 'email', v)} type="email" />
            <div className="sm:col-span-2">
              <Input label="Map Embed URL" value={data.contact?.map_embed_url} onChange={v => set('contact', 'map_embed_url', v)} placeholder="https://maps.google.com/..." />
            </div>
          </div>
        )}

        {/* Social Media */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.key} className="flex items-center gap-2">
                <span className="text-xl">{p.icon}</span>
                <Input
                  label={p.label}
                  value={data.social?.[p.key]}
                  onChange={v => set('social', p.key, v)}
                  placeholder={`https://${p.key}.com/…`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Facebook Comments */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <Toggle
              label="Enable Facebook Comments"
              desc="Replace native comments with Facebook Comments widget"
              value={data.fbComments?.enabled}
              onChange={v => set('fbComments', 'enabled', v)}
            />
            <Input label="Facebook App ID" value={data.fbComments?.app_id}    onChange={v => set('fbComments', 'app_id', v)} />
            <Input label="Number of Posts" value={data.fbComments?.num_posts} onChange={v => set('fbComments', 'num_posts', v)} type="number" />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Order By</label>
              <select
                value={data.fbComments?.order_by || 'social'}
                onChange={e => set('fbComments', 'order_by', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              >
                <option value="social">Top Comments</option>
                <option value="time">Newest</option>
                <option value="reverse_time">Oldest</option>
              </select>
            </div>
          </div>
        )}

        {/* Cookies Warning */}
        {activeTab === 4 && (
          <div className="space-y-4">
            <Toggle
              label="Show Cookies Warning Banner"
              value={data.cookies?.enabled}
              onChange={v => set('cookies', 'enabled', v)}
            />
            <Input label="Banner Message"  value={data.cookies?.message}     onChange={v => set('cookies', 'message', v)} placeholder="We use cookies to…" />
            <Input label="Accept Button Text" value={data.cookies?.button_text} onChange={v => set('cookies', 'button_text', v)} placeholder="Accept" />
            <Input label="Privacy Policy URL" value={data.cookies?.policy_url}  onChange={v => set('cookies', 'policy_url', v)} placeholder="https://…/privacy" />
          </div>
        )}

        {/* Custom CSS */}
        {activeTab === 5 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Custom CSS</label>
            <p className="text-xs text-gray-400">This CSS will be injected into every page of the public site.</p>
            <textarea
              value={data.customCss || ''}
              onChange={e => setData(d => ({ ...d, customCss: e.target.value }))}
              rows={16}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] resize-y bg-gray-50"
              placeholder="/* Add custom CSS here */"
            />
          </div>
        )}

        {/* Custom JS */}
        {activeTab === 6 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Custom JavaScript</label>
            <p className="text-xs text-gray-400">Injected at the end of &lt;body&gt; on every page.</p>
            <textarea
              value={data.customJs || ''}
              onChange={e => setData(d => ({ ...d, customJs: e.target.value }))}
              rows={16}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] resize-y bg-gray-50"
              placeholder="// Add custom JavaScript here"
            />

            {/* reCAPTCHA card at bottom of JS tab */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Google reCAPTCHA</h4>
              <Toggle
                label="Enable reCAPTCHA"
                value={data.recaptcha?.enabled}
                onChange={v => set('recaptcha', 'enabled', v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Site Key"   value={data.recaptcha?.site_key}   onChange={v => set('recaptcha', 'site_key', v)} />
                <Input label="Secret Key" value={data.recaptcha?.secret_key} onChange={v => set('recaptcha', 'secret_key', v)} />
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mt-4">Maintenance Mode</h4>
              <Toggle
                label="Enable Maintenance Mode"
                desc="Visitors will see the maintenance page instead of the site."
                value={data.maintenance?.enabled}
                onChange={v => set('maintenance', 'enabled', v)}
              />
              <Input label="Maintenance Title"   value={data.maintenance?.title}   onChange={v => set('maintenance', 'title', v)} placeholder="We'll be back soon!" />
              <Input label="Maintenance Message" value={data.maintenance?.message} onChange={v => set('maintenance', 'message', v)} placeholder="We are performing scheduled maintenance…" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
