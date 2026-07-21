import React, { useState, useEffect } from 'react';
import { Globe, Plus, Upload, Download, Edit3, Trash2, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

export default function Languages() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Add Language Form State
  const [addForm, setAddForm] = useState({
    name: '',
    shortForm: '',
    languageCode: '',
    isDefault: false,
    isActive: true
  });
  const [adding, setAdding] = useState(false);

  // Import JSON State
  const [selectedLangId, setSelectedLangId] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  const loadLanguages = () => {
    setLoading(true);
    api.get('/api/admin/languages')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        setLanguages(list);
        if (list.length > 0 && !selectedLangId) {
          setSelectedLangId(list[0].id);
        }
      })
      .catch(() => showError('Failed to load languages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.languageCode) {
      showError('Name and Language Code are required');
      return;
    }
    setAdding(true);
    try {
      await api.post('/api/admin/languages', addForm);
      showSuccess('Language added successfully');
      setAddForm({ name: '', shortForm: '', languageCode: '', isDefault: false, isActive: true });
      loadLanguages();
    } catch {
      showError('Failed to add language');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/admin/languages/${item.id}`);
      showSuccess('Language deleted');
      setLanguages(prev => prev.filter(l => l.id !== item.id));
    } catch {
      showError('Failed to delete language');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/admin/languages/${id}`)));
      showSuccess(`Deleted ${ids.length} languages`);
      setLanguages(prev => prev.filter(l => !ids.includes(l.id)));
    } catch {
      showError('Failed to delete selected languages');
    }
  };

  const handleExportJson = async (langId, langName) => {
    try {
      const res = await api.get(`/api/admin/languages/${langId}/export`);
      const jsonStr = JSON.stringify(res.data || {}, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${langName.toLowerCase()}_translations.json`;
      a.click();
      showSuccess(`Exported ${langName} translations`);
    } catch {
      showError('Failed to export translations');
    }
  };

  const handleImportJson = async (e) => {
    e.preventDefault();
    if (!selectedLangId || !importJsonText) {
      showError('Please select a language and paste JSON translations');
      return;
    }
    setImporting(true);
    try {
      const parsed = JSON.parse(importJsonText);
      await api.post(`/api/admin/languages/${selectedLangId}/import`, parsed);
      showSuccess('Translations imported successfully');
      setImportJsonText('');
    } catch (err) {
      showError('Invalid JSON format or import failed');
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Id', className: 'w-16' },
    {
      key: 'name',
      label: 'Language Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2 font-bold text-gray-800">
          <span>{val}</span>
          {row.isDefault && (
            <span className="px-2 py-0.5 bg-[#B3732A]/10 text-[#B3732A] rounded text-[10px] uppercase font-extrabold">
              Default
            </span>
          )}
        </div>
      )
    },
    { key: 'shortForm', label: 'Short Form', sortable: true },
    { key: 'languageCode', label: 'Code', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${val !== false ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const customRowActions = [
    {
      label: 'Edit Translations',
      onClick: (row) => navigate(`/languages/${row.id}/translations`),
      className: 'text-[#B3732A] font-bold'
    },
    {
      label: 'Export JSON',
      onClick: (row) => handleExportJson(row.id, row.name),
      className: 'text-gray-700'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Languages & Translations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage system languages, translation strings, JSON import & export</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <DataTable
            columns={columns}
            data={languages}
            loading={loading}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            customRowActions={customRowActions}
            searchableKeys={['name', 'shortForm', 'languageCode']}
          />

          {/* Reference Resource */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#B3732A]" />
              <span>Standard ISO 639-1 Language Codes Reference</span>
            </div>
            <a
              href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#B3732A] hover:underline"
            >
              ISO Reference <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Forms Column */}
        <div className="space-y-6">
          {/* Add Language Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Plus size={16} className="text-[#B3732A]" />
              <h3 className="font-bold text-gray-800 text-sm">Add New Language</h3>
            </div>

            <form onSubmit={handleAddLanguage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Language Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tamil"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Short Form</label>
                  <input
                    type="text"
                    value={addForm.shortForm}
                    onChange={(e) => setAddForm(f => ({ ...f, shortForm: e.target.value }))}
                    placeholder="TA"
                    className="w-full px-3 py-2 border rounded-xl text-xs uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ISO Code *</label>
                  <input
                    type="text"
                    required
                    value={addForm.languageCode}
                    onChange={(e) => setAddForm(f => ({ ...f, languageCode: e.target.value }))}
                    placeholder="ta"
                    className="w-full px-3 py-2 border rounded-xl text-xs lowercase font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <span className="text-xs font-semibold text-gray-700">Set as Default Language</span>
                <input
                  type="checkbox"
                  checked={addForm.isDefault}
                  onChange={(e) => setAddForm(f => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 bg-[#B3732A] text-white rounded-xl text-xs font-bold hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding…' : 'Add Language'}
              </button>
            </form>
          </div>

          {/* Import Language JSON Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Upload size={16} className="text-[#B3732A]" />
              <h3 className="font-bold text-gray-800 text-sm">Import Language JSON</h3>
            </div>

            <form onSubmit={handleImportJson} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Target Language</label>
                <select
                  value={selectedLangId}
                  onChange={(e) => setSelectedLangId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                >
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.shortForm})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">JSON Translation Content</label>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{ "welcome": "வணக்கம்", "submit": "சமர்ப்பி" }'
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono bg-gray-50 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={importing}
                className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Upload size={14} /> {importing ? 'Importing…' : 'Import JSON'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
