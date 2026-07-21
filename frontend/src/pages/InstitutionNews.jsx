import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * InstitutionNews — Public page listing approved institution news articles.
 * Endpoint: GET /api/v1/public/institution-news
 */
export default function InstitutionNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/public/institution-news?page=${page}&size=15`)
      .then(r => r.json())
      .then(data => {
        if (data.content) {
          setArticles(data.content);
          setTotalPages(data.totalPages || 1);
        } else {
          setArticles(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => { setError('Could not load institution news.'); setLoading(false); });
  }, [page]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '3px solid #B3732A', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#B3732A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Institution</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '0.25rem 0 0' }}>Institution News</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Official updates and announcements from partner institutions and organizations.</p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', borderRadius: '12px', height: 110, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background: '#fef2f2', color: '#991b1b', borderRadius: '10px', padding: '1rem 1.25rem', fontSize: '0.9rem' }}>{error}</div>
      )}

      {/* Articles */}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {articles.map(article => (
              <Link
                key={article.id}
                to={`/news/${article.slug || article.id}`}
                style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                {article.thumbnailUrl && (
                  <img src={article.thumbnailUrl} alt={article.title} style={{ width: 160, height: 110, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ padding: '0.9rem 1.1rem 0.9rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: '20px', padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>
                        🏛️ {article.institutionName || 'Institution'}
                      </span>
                      {article.districtId && (
                        <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: '20px', padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 600 }}>
                          District #{article.districtId}
                        </span>
                      )}
                    </div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.45, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.title || article.titleEn}
                    </h2>
                    {article.metaDescription && (
                      <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0.4rem 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {article.metaDescription}
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </div>
                </div>
              </Link>
            ))}

            {articles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                No institution news available.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '7px', padding: '0.5rem 1.25rem', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>← Previous</button>
              <span style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>Page {page + 1} of {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '7px', padding: '0.5rem 1.25rem', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
