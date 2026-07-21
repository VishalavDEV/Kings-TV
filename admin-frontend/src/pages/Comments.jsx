import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../utils/axios';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

export default function Comments() {
  const [viewStatus, setViewStatus] = useState('pending'); // 'pending' | 'approved'
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadComments = () => {
    setLoading(true);
    api.get(`/api/admin/comments?status=${viewStatus}`)
      .then(res => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => showError('Failed to load comments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, [viewStatus]);

  const handleApprove = async (item) => {
    try {
      await api.put(`/api/admin/comments/${item.id}/approve`);
      showSuccess('Comment approved successfully');
      loadComments();
    } catch {
      showError('Failed to approve comment');
    }
  };

  const handleReject = async (item) => {
    try {
      await api.put(`/api/admin/comments/${item.id}/reject`);
      showSuccess('Comment rejected');
      loadComments();
    } catch {
      showError('Failed to reject comment');
    }
  };

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/admin/comments/${item.id}`);
      showSuccess('Comment deleted');
      setComments(prev => prev.filter(c => c.id !== item.id));
    } catch {
      showError('Failed to delete comment');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/admin/comments/${id}`)));
      showSuccess(`Deleted ${ids.length} comments`);
      setComments(prev => prev.filter(c => !ids.includes(c.id)));
    } catch {
      showError('Failed to delete selected comments');
    }
  };

  const columns = [
    { key: 'id', label: 'Id', className: 'w-16' },
    { key: 'commentorName', label: 'Name', sortable: true },
    { key: 'commentorEmail', label: 'Email', sortable: true },
    {
      key: 'commentText',
      label: 'Comment',
      sortable: false,
      render: (val) => <span className="line-clamp-2 max-w-xs">{val}</span>
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—')
    }
  ];

  const customRowActions = [
    ...(viewStatus === 'pending'
      ? [{ label: 'Approve', onClick: handleApprove, className: 'text-green-600 font-bold' }]
      : []),
    { label: 'Reject', onClick: handleReject, className: 'text-amber-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header with toggle button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Comments Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Filter, approve, reject, or delete reader comments</p>
        </div>

        {/* Header Toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewStatus('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewStatus === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock size={16} /> Pending Comments
          </button>
          <button
            onClick={() => setViewStatus('approved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewStatus === 'approved' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle size={16} /> Approved Comments
          </button>
        </div>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        columns={columns}
        data={comments}
        loading={loading}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        customRowActions={customRowActions}
        searchableKeys={['commentorName', 'commentorEmail', 'commentText']}
      />
    </div>
  );
}
