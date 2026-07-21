import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import api from '../utils/axios';

export default function Comments() {
  const [viewStatus, setViewStatus] = useState('pending'); // 'pending' | 'approved'
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadComments = () => {
    setLoading(true);
    api.get(`/api/admin/comments?status=${viewStatus}`)
      .then(res => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, [viewStatus]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/comments/${id}/approve`);
      showToast('Comment approved');
      loadComments();
    } catch {
      showToast('Failed to approve comment');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/admin/comments/${id}/reject`);
      showToast('Comment rejected');
      loadComments();
    } catch {
      showToast('Failed to reject comment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/admin/comments/${id}`);
      showToast('Comment deleted');
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {
      showToast('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header with toggle button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Comments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage reader comments and approvals</p>
        </div>

        {/* Toggle Button in Header */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewStatus('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewStatus === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={16} />
            Pending Comments
          </button>
          <button
            onClick={() => setViewStatus('approved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewStatus === 'approved'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle size={16} />
            Approved Comments
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No {viewStatus} comments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600 text-left">
                  <th className="px-4 py-3 font-semibold w-14">ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold min-w-[200px]">Comment</th>
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{comment.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{comment.commentorName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{comment.commentorEmail || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 leading-relaxed max-w-xs">{comment.commentText}</td>
                    <td className="px-4 py-3 text-xs text-[#B3732A] font-medium">
                      {comment.articleTitle ? comment.articleTitle : `Post #${comment.articleId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {viewStatus === 'pending' && (
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                            title="Approve"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {viewStatus === 'pending' && (
                          <button
                            onClick={() => handleReject(comment.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors"
                            title="Reject"
                          >
                            <X size={14} /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
