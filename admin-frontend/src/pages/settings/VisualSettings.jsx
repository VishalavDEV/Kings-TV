import React, { useState, useEffect } from 'react';
import { Upload, Palette } from 'lucide-react';
import api from '../../utils/axios';

const POST_LIST_STYLES = [
  { value: 'vertical',   label: 'Vertical',   preview: '▬\n▬\n▬' },
  { value: 'horizontal', label: 'Horizontal', preview: '▬▬▬' },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 w-36">{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 w-48">
        <input
          type="color"
          value={value || '#B3732A'}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#B3732A"
          className="flex-1 text-sm outline-none text-gray-700 font-mono"
        />
      </div>
    </div>
  );
}

function LogoBox({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-3 bg-gray-50 min-h-[120px] justify-center">
        {value ? (
          <img src={value} alt={label} className="max-h-16 object-contain" onError={e => e.target.style.display='none'} />
        ) : (
          <Upload size={24} className="text-gray-400" />
        )}
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter logo URL or upload…"
          className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#B3732A]/30 focus:border-[#B3732A] text-gray-600"
        />
      </div>
    </div>
  );
}

export default function VisualSettings() {
  const [form, setForm] = useState({
    site_color: '#B3732A',
    header_color: '#1e1e2d',
    post_list_style: 'vertical',
    logo_url: '',
    logo_footer_url: '',
    logo_email_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/api/admin/settings/visual')
      .then(r => setForm(prev => ({ ...prev, ...r.data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings/visual', form);
      setToast('Visual settings saved!');
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
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Visual Settings</h2>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Style Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={18} className="text-[#B3732A]" />
          <h3 className="font-semibold text-gray-800">Style</h3>
        </div>

        <div className="space-y-4">
          <ColorPicker
            label="Site Accent Color"
            value={form.site_color}
            onChange={v => set('site_color', v)}
          />
          <ColorPicker
            label="Header Color"
            value={form.header_color}
            onChange={v => set('header_color', v)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Post List Style</p>
          <div className="flex gap-4">
            {POST_LIST_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => set('post_list_style', s.value)}
                className={`flex-1 border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                  form.post_list_style === s.value
                    ? 'border-[#B3732A] bg-[#B3732A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.value === 'vertical' ? (
                  <div className="flex flex-col gap-1 w-full">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-1.5 items-center">
                        <div className={`w-10 h-7 rounded ${form.post_list_style === 'vertical' ? 'bg-[#B3732A]/30' : 'bg-gray-200'}`} />
                        <div className="flex-1 space-y-1">
                          <div className={`h-2 rounded ${form.post_list_style === 'vertical' ? 'bg-[#B3732A]/20' : 'bg-gray-100'}`} />
                          <div className={`h-2 w-2/3 rounded ${form.post_list_style === 'vertical' ? 'bg-[#B3732A]/10' : 'bg-gray-100'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 w-full">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className={`h-8 rounded ${form.post_list_style === 'horizontal' ? 'bg-[#B3732A]/30' : 'bg-gray-200'}`} />
                        <div className={`h-2 rounded ${form.post_list_style === 'horizontal' ? 'bg-[#B3732A]/20' : 'bg-gray-100'}`} />
                      </div>
                    ))}
                  </div>
                )}
                <span className={`text-xs font-medium ${form.post_list_style === s.value ? 'text-[#B3732A]' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Logos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <LogoBox label="Site Logo"        value={form.logo_url}        onChange={v => set('logo_url', v)} />
          <LogoBox label="Footer Logo"      value={form.logo_footer_url} onChange={v => set('logo_footer_url', v)} />
          <LogoBox label="Email Logo"       value={form.logo_email_url}  onChange={v => set('logo_email_url', v)} />
        </div>
      </div>
    </div>
  );
}
