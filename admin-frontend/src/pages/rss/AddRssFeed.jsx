import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Rss } from 'lucide-react';
import api from '../../utils/axios';

export default function AddRssFeed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    sourceName: '',
    sourceUrl: '',
    logoUrl: '',
    categoryId: '',
    categoryName: '',
    autoImportEnabled: true,
    importIntervalMinutes: 180,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/admin/rss-feeds/${id}`)
        .then(r => setForm(r.data))
        .catch(() => setError('Failed to load feed'));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/api/admin/rss-feeds/${id}`, form);
      } else {
        await api.post('/api/admin/rss-feeds', form);
      }
      navigate('/rss-feeds');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feed source');
    } finally {
      setSaving(false);
    }
  };

  const INTERVALS = [
    { label: '30 minutes',  value: 30 },
    { label: '1 hour',      value: 60 },
    { label: '3 hours',     value: 180 },
    { label: '6 hours',     value: 360 },
    { label: '12 hours',    value: 720 },
    { label: '24 hours',    value: 1440 },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/rss-feeds')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Feed Source' : 'Add Feed Source'}</h2>
          <p className="text-sm text-gray-500">RSS/Atom feed that will be automatically imported</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {error && (
          <div className="px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Source Name *</label>
          <input
            required
            type="text"
            value={form.sourceName}
            onChange={e => set('sourceName', e.target.value)}
            placeholder="e.g. BBC News Tamil"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Feed URL *</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#B3732A]/20 focus-within:border-[#B3732A]">
            <div className="flex items-center pl-3 text-gray-400">
              <Rss size={16} />
            </div>
            <input
              required
              type="url"
              value={form.sourceUrl}
              onChange={e => set('sourceUrl', e.target.value)}
              placeholder="https://example.com/rss.xml"
              className="flex-1 px-2 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="url"
            value={form.logoUrl}
            onChange={e => set('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          />
          {form.logoUrl && (
            <img src={form.logoUrl} alt="Logo preview" className="h-8 object-contain mt-1 rounded"
              onError={e => e.target.style.display='none'} />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Import Interval</label>
          <select
            value={form.importIntervalMinutes}
            onChange={e => set('importIntervalMinutes', parseInt(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          >
            {INTERVALS.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Auto Import</p>
            <p className="text-xs text-gray-400">Automatically import on schedule</p>
          </div>
          <button
            type="button"
            onClick={() => set('autoImportEnabled', !form.autoImportEnabled)}
            className={`w-11 h-6 rounded-full relative transition-colors ${form.autoImportEnabled ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
          >
            <div className={`absolute w-[18px] h-[18px] bg-white rounded-full top-[3px] transition-all shadow-sm ${form.autoImportEnabled ? 'left-[22px]' : 'left-[3px]'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Active</p>
            <p className="text-xs text-gray-400">Inactive feeds are skipped</p>
          </div>
          <button
            type="button"
            onClick={() => set('isActive', !form.isActive)}
            className={`w-11 h-6 rounded-full relative transition-colors ${form.isActive ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
          >
            <div className={`absolute w-[18px] h-[18px] bg-white rounded-full top-[3px] transition-all shadow-sm ${form.isActive ? 'left-[22px]' : 'left-[3px]'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/rss-feeds')}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323] disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Update Feed' : 'Add Feed Source'}
          </button>
        </div>
      </form>
    </div>
  );
}
