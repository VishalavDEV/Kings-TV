import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import { Building2, CheckCircle, XCircle, Clock, Loader2, Eye, Filter } from 'lucide-react';

const STATUS_TABS = [
  { key: '',           label: 'All',       color: '#64748b' },
  { key: 'submitted',  label: 'Pending',   color: '#f59e0b' },
  { key: 'published',  label: 'Published', color: '#16a34a' },
  { key: 'rejected',   label: 'Rejected',  color: '#ef4444' },
];

const STATUS_BADGE = {
  submitted:  { bg: '#fef9c3', color: '#92400e', label: 'Pending' },
  published:  { bg: '#dcfce7', color: '#166534', label: 'Published' },
  rejected:   { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

export default function InstitutionNewsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/api/v1/admin/institution-news?${params}`);
      const data = res.data;
      if (data.content) {
        setPosts(data.content);
        setTotalPages(data.totalPages || 1);
      } else {
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await api.put(`/api/v1/admin/institution-news/${id}/approve`);
      load();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const reject = async (id) => {
    setActionLoading(id + '-reject');
    try {
      await api.put(`/api/v1/admin/institution-news/${id}/reject`);
      load();
    } catch (e) { console.error(e); }
    setActionLoading(null);
  };

  const badge = (status) => {
    const s = STATUS_BADGE[status] || { bg: '#f1f5f9', color: '#475569', label: status };
    return (
      <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>{s.label}</span>
    );
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Building2 size={22} style={{ color: '#B3732A' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Institution News</h1>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} /> Filter by status
        </span>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setStatusFilter(t.key); setPage(0); }}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: statusFilter === t.key ? t.color : '#f1f5f9',
              color: statusFilter === t.key ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Title', 'Institution', 'Category', 'Status', 'Published At', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', maxWidth: 280 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title || post.titleEn || 'Untitled'}
                    </div>
                    {post.slug && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>{post.slug}</div>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>{post.institutionName || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                    {post.categoryId ? `#${post.categoryId}` : '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{badge(post.status)}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Approve */}
                      {post.status !== 'published' && (
                        <button
                          onClick={() => approve(post.id)}
                          disabled={actionLoading === post.id + '-approve'}
                          title="Approve"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          {actionLoading === post.id + '-approve' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />} Approve
                        </button>
                      )}
                      {/* Reject */}
                      {post.status !== 'rejected' && (
                        <button
                          onClick={() => reject(post.id)}
                          disabled={actionLoading === post.id + '-reject'}
                          title="Reject"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          {actionLoading === post.id + '-reject' ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={14} />} Reject
                        </button>
                      )}
                      {/* View */}
                      {post.slug && (
                        <a href={`${import.meta.env.VITE_PUBLIC_SITE_URL || 'https://kings-tv.vercel.app'}/news/${post.slug}`} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#64748b' }}>
                          <Eye size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    {statusFilter === 'submitted' ? 'No pending institution posts.' : 'No institution posts found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', color: '#475569' }}>Previous</button>
          <span style={{ padding: '0.4rem 0.75rem', color: '#64748b', fontSize: '0.9rem' }}>Page {page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', color: '#475569' }}>Next</button>
        </div>
      )}
    </div>
  );
}
