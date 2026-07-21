import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminComments.css';

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [statusTab, setStatusTab] = useState('pending'); // pending, approved, rejected
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadComments = async (status) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/admin/comments?status=${status}`);
      if (Array.isArray(res)) {
        setComments(res);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(statusTab);
  }, [statusTab]);

  const handleApprove = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetchApi(`/admin/comments/${id}/approve`, { method: 'PUT' });
      if (res && res.message) {
        setSuccessMsg(res.message);
        loadComments(statusTab);
      }
    } catch (err) {
      setErrorMsg('Failed to approve comment');
    }
  };

  const handleReject = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetchApi(`/admin/comments/${id}/reject`, { method: 'PUT' });
      if (res && res.message) {
        setSuccessMsg(res.message);
        loadComments(statusTab);
      }
    } catch (err) {
      setErrorMsg('Failed to reject comment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/comments/${id}`, { method: 'DELETE' });
      setSuccessMsg('Comment deleted permanently');
      loadComments(statusTab);
    } catch (err) {
      setErrorMsg('Failed to delete comment');
    }
  };

  return (
    <div className="admin-comments-container">
      <div className="pages-header">
        <h1>Comments Moderation Queue</h1>
        <p className="subtitle">Review, approve, or reject user article comments and discussions</p>
      </div>

      <div className="tab-control-bar mb-4">
        <button
          type="button"
          className={`tab-btn ${statusTab === 'pending' ? 'active' : ''}`}
          onClick={() => setStatusTab('pending')}
        >
          Pending Comments Queue
        </button>
        <button
          type="button"
          className={`tab-btn ${statusTab === 'approved' ? 'active' : ''}`}
          onClick={() => setStatusTab('approved')}
        >
          Approved Comments
        </button>
        <button
          type="button"
          className={`tab-btn ${statusTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setStatusTab('rejected')}
        >
          Rejected Comments
        </button>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="table-panel">
        <div className="table-header-controls">
          <h2 className="capitalize">{statusTab} Comments List ({comments.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">Loading comments queue...</div>
        ) : (
          <div className="table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th width="60">ID</th>
                  <th width="120">Article ID</th>
                  <th>Commentor</th>
                  <th>Comment Content</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table">
                      No {statusTab} comments found.
                    </td>
                  </tr>
                ) : (
                  comments.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                          Post #{c.articleId}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{c.commentorName}</span>
                          <span className="text-xs text-gray-500">{c.commentorEmail || 'No Email'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="max-w-md text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {c.commentText}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${c.status ? c.status.toLowerCase() : 'pending'}`}>
                          {c.status || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {c.status !== 'approved' && (
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleApprove(c.id)}
                              title="Approve Comment"
                            >
                              <i className="fa-solid fa-check"></i> Approve
                            </button>
                          )}
                          {c.status !== 'rejected' && (
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleReject(c.id)}
                              title="Reject Comment"
                            >
                              <i className="fa-solid fa-xmark"></i> Reject
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-btn delete-btn text-xs"
                            onClick={() => handleDelete(c.id)}
                            title="Delete Permanently"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComments;
