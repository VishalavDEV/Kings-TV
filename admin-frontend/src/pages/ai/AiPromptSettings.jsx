import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Cpu, Save, RefreshCw, AlertCircle, Edit, CheckCircle } from 'lucide-react';

const AiPromptSettings = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/api/admin/ai/prompts');
      setPrompts(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load AI prompt templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingPrompt({ ...p });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingPrompt) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/api/admin/ai/prompts/${editingPrompt.id}`, editingPrompt);
      setSuccessMsg(`Successfully updated prompt template for '${editingPrompt.feature}'`);
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? res.data : p));
      setEditingPrompt(null);
    } catch (err) {
      setErrorMsg('Failed to save prompt configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Cpu className="text-[#B3732A]" />
            AI Prompt Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure prompt templates, model configurations, and thresholds for AI features.
          </p>
        </div>
        <button
          onClick={loadPrompts}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Reload
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-medium text-sm text-gray-700">
              AI Feature Templates
            </div>
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading templates...</div>
            ) : prompts.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No prompt templates configured.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {prompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleEdit(p)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-colors flex flex-col items-start gap-1 ${
                      editingPrompt?.id === p.id ? 'bg-amber-50/50 border-l-4 border-[#B3732A]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-sm capitalize text-gray-900">{p.feature}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono truncate w-full">{p.modelName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="md:col-span-2">
          {editingPrompt ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 capitalize">
                  Configure '{editingPrompt.feature}' Prompt
                </h3>
                <span className="text-xs text-gray-400">ID: #{editingPrompt.id}</span>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Model Name</label>
                    <input
                      type="text"
                      required
                      value={editingPrompt.modelName}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, modelName: e.target.value })}
                      placeholder="gemini-2.0-flash"
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editingPrompt.isActive}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, isActive: e.target.checked })}
                        className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                      />
                      <span className="text-sm font-medium text-gray-700">Is Active</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Temperature ({editingPrompt.temperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.1"
                      value={editingPrompt.temperature}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-[#B3732A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Tokens</label>
                    <input
                      type="number"
                      required
                      value={editingPrompt.maxTokens}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, maxTokens: parseInt(e.target.value) })}
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-600">Prompt Template</label>
                    <span className="text-[10px] text-gray-400">Placeholders: <code>{"{article_content}"}</code>, <code>{"{rewrite_style}"}</code></span>
                  </div>
                  <textarea
                    required
                    rows={8}
                    value={editingPrompt.promptTemplate}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, promptTemplate: e.target.value })}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPrompt(null)}
                    className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#B3732A] hover:bg-[#965e20] rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                  >
                    <Save size={15} />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full bg-white rounded-xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Cpu size={36} className="text-gray-300" />
              <h4 className="font-semibold text-gray-600">No Prompt Selected</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                Select a template from the left-hand menu list to adjust LLM formatting, models, and temperature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiPromptSettings;
