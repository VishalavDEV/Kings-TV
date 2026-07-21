import { useI18n } from '../../context/I18nContext';
import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, AlertOctagon, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import api from '../../api';

const CommentsModeration = () => {
  const { t } = useI18n();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/comments');
      // Sort newest first
      const sorted = (res.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(sorted);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleStatusChange = async (id, newStatus, currentComment) => {
    try {
      await api.put(`/comments/${id}`, { ...currentComment, status: newStatus });
      setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert(t("failedUpdateStatus"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("confirmDeleteComment"))) {
      try {
        await api.delete(`/comments/${id}`);
        setComments(comments.filter(c => c.id !== id));
      } catch (err) {
        alert(t("failedDeleteComment"));
      }
    }
  };

  const filteredComments = comments.filter(c => (c.status || 'pending') === activeTab);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1><MessageSquare size={24} style={{ display: 'inline', marginRight: '10px' }} /> {t('commentsModeration')}</h1>
          <p className="text-secondary">{t('commentsModerationDesc')}</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchComments}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <button 
            className={`btn-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
            style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'pending' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'pending' ? 600 : 400, borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : 'none' }}
          >
            {t('pending')} ({comments.filter(c => (c.status || 'pending') === 'pending').length})
          </button>
          <button 
            className={`btn-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
            style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'approved' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'approved' ? 'var(--success)' : 'var(--text-secondary)', fontWeight: activeTab === 'approved' ? 600 : 400, borderBottom: activeTab === 'approved' ? '2px solid var(--success)' : 'none' }}
          >
            {t('approved')} ({comments.filter(c => c.status === 'approved').length})
          </button>
          <button 
            className={`btn-tab ${activeTab === 'spam' ? 'active' : ''}`}
            onClick={() => setActiveTab('spam')}
            style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'spam' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'spam' ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: activeTab === 'spam' ? 600 : 400, borderBottom: activeTab === 'spam' ? '2px solid var(--danger)' : 'none' }}
          >
            {t('spam')} ({comments.filter(c => c.status === 'spam').length})
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div>{t('loadingComments')}</div>
          ) : filteredComments.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>{t('noRecords')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredComments.map(c => (
                <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.commentorName}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({c.commentorEmail})</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t('articleId')}: {c.articleId} • {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {activeTab !== 'approved' && (
                        <button onClick={() => handleStatusChange(c.id, 'approved', c)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', color: 'var(--success)' }} title="Approve">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {activeTab !== 'spam' && (
                        <button onClick={() => handleStatusChange(c.id, 'spam', c)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', color: 'var(--warning)' }} title="Mark as Spam">
                          <AlertOctagon size={14} />
                        </button>
                      )}
                      {activeTab !== 'pending' && (
                        <button onClick={() => handleStatusChange(c.id, 'pending', c)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', color: 'var(--text-secondary)' }} title="Move to Pending">
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} title="Delete Permanently">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {c.commentText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModeration;
