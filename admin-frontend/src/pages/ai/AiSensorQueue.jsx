import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Cpu, RefreshCw, AlertTriangle, ShieldCheck, XCircle, Trash, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AiSensorQueue = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionModal, setActionModal] = useState(null); // flag details to action
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadFlags(0, statusFilter);
  }, [statusFilter]);

  const loadFlags = async (page = 0, status = statusFilter) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/api/admin/ai/sensor/flags?status=${status}&page=${page}&size=15`);
      setFlags(res.data.flags || []);
      setTotalPages(res.data.totalPages || 0);
      setCurrentPage(res.data.currentPage || 0);
    } catch (err) {
      setErrorMsg('Failed to load sensor queue');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (flag) => {
    setActionModal(flag);
    setNotes('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleResolveFlag = async (action) => {
    if (!actionModal) return;
    setProcessingId(actionModal.id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post(`/api/admin/ai/sensor/flags/${actionModal.id}/action`, {
        action: action, // dismiss or take_action
        reviewedBy: user?.id || 1,
        notes: notes
      });
      setSuccessMsg(`Flag resolved successfully with action: ${action}`);
      setActionModal(null);
      loadFlags(currentPage, statusFilter);
    } catch (err) {
      setErrorMsg('Failed to update flag status');
    } finally {
      setProcessingId(null);
    }
  };

  const getReasonBadge = (reason) => {
    const map = {
      'plagiarism': 'bg-red-50 text-red-700 border-red-100',
      'duplicate': 'bg-amber-50 text-amber-700 border-amber-100',
      'low-quality': 'bg-blue-50 text-blue-700 border-blue-100',
      'off-topic': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return map[reason] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Cpu className="text-[#B3732A]" />
            AI Sensor Queue
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Moderation review queue for articles and submissions flagged by automated scan heuristics.
          </p>
        </div>
        <button
          onClick={() => loadFlags(currentPage)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
          <ShieldCheck size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tabs / Filter Row */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-2">
          {['pending_review', 'dismissed', 'actioned'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-amber-50 text-[#B3732A] border border-amber-200'
                  : 'text-gray-500 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">Total Flagged Items: {flags.length}</span>
      </div>

      {/* Table queue */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-[#B3732A]" size={24} />
            <span className="text-xs">Loading queue items...</span>
          </div>
        ) : flags.length === 0 ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <ShieldCheck size={36} className="text-emerald-500" />
            <h4 className="font-semibold text-gray-700">Queue is Clear!</h4>
            <p className="text-xs max-w-xs mx-auto">
              No submissions are currently flagged for review in this category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-6 py-3.5">Content Type</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Flag Reason</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5">Flagged Date</th>
                  {statusFilter === 'pending_review' && <th className="px-6 py-3.5 text-right">Options</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {flags.map(flag => (
                  <tr key={flag.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-500">
                      {flag.contentType}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{flag.contentTitle || 'Untitled'}</div>
                      <div className="text-[10px] text-gray-400">ID: #{flag.contentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getReasonBadge(flag.flagReason)}`}>
                        {flag.flagReason.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {(flag.confidenceScore * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(flag.createdAt).toLocaleString()}
                    </td>
                    {statusFilter === 'pending_review' && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleActionClick(flag)}
                          className="px-3 py-1.5 text-xs text-white bg-[#B3732A] hover:bg-[#965e20] rounded-md transition-colors"
                        >
                          Review Flag
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 pb-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => loadFlags(i)}
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

      {/* Review Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={18} />
                Action AI Flag #{actionModal.id}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Title:</strong> {actionModal.contentTitle}</p>
              <p><strong>Reason:</strong> <span className="capitalize">{actionModal.flagReason}</span></p>
              <p><strong>AI Confidence:</strong> {(actionModal.confidenceScore * 100).toFixed(0)}%</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs font-mono max-h-32 overflow-y-auto">
                {actionModal.flagDescription}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Resolution Review Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe action justification..."
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveFlag('dismiss')}
                disabled={processingId === actionModal.id}
                className="flex items-center gap-1 px-4 py-2 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-medium"
              >
                <Check size={14} />
                Dismiss Flag
              </button>
              <button
                onClick={() => handleResolveFlag('take_action')}
                disabled={processingId === actionModal.id}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium shadow-sm"
              >
                <Trash size={14} />
                Block Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSensorQueue;
