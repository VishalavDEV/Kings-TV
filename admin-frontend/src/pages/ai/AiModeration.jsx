import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Cpu, RefreshCw, Shield, Trash2, Plus, AlertCircle, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AiModeration = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('audit'); // audit or dictionary
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tab 1: Audit Log
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Tab 2: Profanity Dictionary
  const [words, setWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newLang, setNewLang] = useState('ALL');

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs(0);
    } else {
      loadDictionary();
    }
  }, [activeTab]);

  // --- Audit Log Loader ---
  const loadAuditLogs = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/api/admin/ai/moderation/logs?page=${page}&size=15`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(res.data.currentPage || 0);
    } catch (err) {
      setErrorMsg('Failed to load moderation logs');
    } finally {
      setLoading(false);
    }
  };

  // --- Dictionary Loader ---
  const loadDictionary = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/api/v1/admin/profanity');
      setWords(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load profanity dictionary');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/api/v1/admin/profanity', {
        term: newWord.trim(),
        language: newLang
      });
      setSuccessMsg(`Added term "${newWord.trim()}" to dictionary.`);
      setNewWord('');
      setWords([...words, res.data]);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to add term');
    }
  };

  const handleDeleteWord = async (id, term) => {
    if (!window.confirm(`Are you sure you want to remove the term "${term}"?`)) return;

    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/api/v1/admin/profanity/${id}`);
      setSuccessMsg(`Term "${term}" deleted.`);
      setWords(words.filter(w => w.id !== id));
    } catch (err) {
      setErrorMsg('Failed to remove term');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Cpu className="text-[#B3732A]" />
            AI Moderation Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Access automated review audit logs and manage terms registered in the profanity censorship dictionary.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'audit'
                ? 'bg-amber-50 text-[#B3732A] border border-amber-200'
                : 'text-gray-500 hover:bg-gray-50 border border-transparent'
            }`}
          >
            Audit Log Trail
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'dictionary'
                ? 'bg-amber-50 text-[#B3732A] border border-amber-200'
                : 'text-gray-500 hover:bg-gray-50 border border-transparent'
            }`}
          >
            Profanity Dictionary Manager
          </button>
        </div>
        <span className="text-xs text-gray-400">
          {activeTab === 'audit' ? `Audited entries: ${logs.length}` : `Dictionary terms: ${words.length}`}
        </span>
      </div>

      {activeTab === 'audit' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin text-[#B3732A]" size={24} />
              <span className="text-xs">Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Shield size={36} className="text-gray-300" />
              <h4 className="font-semibold text-gray-700">No Audits Mapped</h4>
              <p className="text-xs max-w-xs mx-auto">
                No moderation actions or system warnings have been processed yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-6 py-3.5">Content Type</th>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Flagged Details</th>
                    <th className="px-6 py-3.5">Action Taken</th>
                    <th className="px-6 py-3.5">Reviewed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-500">
                        {log.contentType}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{log.contentTitle || 'Untitled'}</div>
                        <div className="text-[10px] text-gray-400">ID: #{log.contentId}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-600 max-w-xs truncate">
                        {log.flaggedTerms || 'None'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border uppercase ${
                          log.actionTaken?.includes('BLOCKED') ? 'bg-red-50 text-red-700 border-red-100' :
                          log.actionTaken?.includes('DISMISSED') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {log.actionTaken}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(log.reviewedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 p-4 border-t border-gray-50">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => loadAuditLogs(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium border transition-colors ${
                    currentPage === i
                      ? 'bg-[#B3732A] text-white border-[#B3732A]'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-base text-gray-900 border-b border-gray-50 pb-2">
                Add Censored Term
              </h3>
              <form onSubmit={handleAddWord} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Censored Word/Term</label>
                  <input
                    type="text"
                    required
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter inappropriate word..."
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Language Scope</label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
                  >
                    <option value="ALL">ALL (Any language)</option>
                    <option value="TA">Tamil only</option>
                    <option value="EN">English only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-white bg-[#B3732A] hover:bg-[#965e20] rounded-lg transition-colors font-medium shadow-sm"
                >
                  <Plus size={15} />
                  Add Word
                </button>
              </form>
            </div>
          </div>

          {/* Words List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-sm text-gray-700">
                Registered Dictionary Terms
              </div>
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-400">Loading terms...</div>
              ) : words.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">Censorship dictionary is empty.</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[450px] overflow-y-auto">
                  {words.map(w => (
                    <div key={w.id} className="px-4 py-3.5 hover:bg-gray-50/50 flex justify-between items-center transition-colors">
                      <div>
                        <span className="font-medium text-gray-900 text-sm font-mono">{w.term}</span>
                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-200">
                          {w.language}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteWord(w.id, w.term)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete term"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiModeration;
