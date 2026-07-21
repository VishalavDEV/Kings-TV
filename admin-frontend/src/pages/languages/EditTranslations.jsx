import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/axios';

export default function EditTranslations() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [translations, setTranslations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadTranslations = () => {
    setLoading(true);
    api.get(`/api/admin/languages/${id}/translations`)
      .then(res => setTranslations(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTranslations();
  }, [id]);

  const handleValueChange = (key, value) => {
    setTranslations(prev => ({ ...prev, [key]: value }));
  };

  const handleAddKey = (e) => {
    e.preventDefault();
    if (!newKey) return;
    setTranslations(prev => ({ ...prev, [newKey]: newValue }));
    setNewKey('');
    setNewValue('');
    showToast('New key added');
  };

  const handleDeleteKey = (key) => {
    setTranslations(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/admin/languages/${id}/translations`, translations);
      showToast('Translations saved successfully');
    } catch {
      showToast('Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  const filteredKeys = Object.keys(translations).filter(k =>
    k.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (translations[k] && translations[k].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/languages')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Translation Table</h2>
            <p className="text-sm text-gray-500 mt-0.5">Edit key-value string pairs for Language ID #{id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search translation key or value…"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] w-56 sm:w-64"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Add New Key Bar */}
      <form onSubmit={handleAddKey} className="bg-amber-50/60 border border-amber-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          required
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="New Key (e.g. read_more)"
          className="w-full sm:w-1/3 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Translation Value (e.g. Read More)"
          className="w-full sm:w-1/2 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
        />
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] shrink-0"
        >
          <Plus size={14} /> Add Key
        </button>
      </form>

      {/* Translation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No translation keys match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold w-1/3">Translation Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((key) => (
                  <tr key={key} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-[#B3732A] font-semibold">{key}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={translations[key] || ''}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteKey(key)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Key"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
