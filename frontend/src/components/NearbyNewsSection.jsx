import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const DEFAULT_RADIUS_KM = 15;

/**
 * NearbyNewsSection — shows geo-located news articles closest to the user.
 * Uses browser Geolocation API and GET /api/v1/public/news/nearby.
 */
export default function NearbyNewsSection({ districtId = null, title = '📍 Near You' }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationAllowed, setLocationAllowed] = useState(null);

  useEffect(() => {
    fetchNearbyNews();
  }, [districtId]);

  const fetchNearbyNews = () => {
    setLoading(true);
    setError(null);

    if (districtId) {
      // Fetch by districtId (no geolocation needed)
      fetch(`${API_BASE}/api/v1/public/news/nearby?districtId=${districtId}&limit=10`)
        .then(r => r.json())
        .then(data => { setArticles(Array.isArray(data) ? data : data.content || []); setLoading(false); })
        .catch(() => { setError('Failed to load nearby news.'); setLoading(false); });
      return;
    }

    // Use browser geolocation
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationAllowed(true);
        const { latitude, longitude } = coords;
        fetch(`${API_BASE}/api/v1/public/news/nearby?lat=${latitude}&lng=${longitude}&limit=10`)
          .then(r => r.json())
          .then(data => {
            setArticles(Array.isArray(data) ? data : data.content || []);
            setLoading(false);
          })
          .catch(() => { setError('Failed to load nearby news.'); setLoading(false); });
      },
      () => {
        setLocationAllowed(false);
        setError('Location access denied. Enable location to see nearby news.');
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  if (loading) return (
    <section style={{ padding: '1.5rem 0' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 120, background: '#f1f5f9', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </section>
  );

  if (error) return (
    <section style={{ padding: '1.5rem 0' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>{title}</h2>
      <div style={{ background: '#fef9c3', borderRadius: '10px', padding: '1rem 1.25rem', color: '#92400e', fontSize: '0.9rem' }}>
        {error}
        {locationAllowed === false && (
          <button onClick={fetchNearbyNews} style={{ marginLeft: '1rem', background: '#B3732A', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem' }}>
            Try Again
          </button>
        )}
      </div>
    </section>
  );

  if (articles.length === 0) return null;

  return (
    <section style={{ padding: '1.5rem 0' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {articles.slice(0, 6).map(article => (
          <a
            key={article.id}
            href={`/news/${article.slug || article.id}`}
            style={{ textDecoration: 'none', display: 'block', borderRadius: '10px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', transition: 'transform 0.18s, box-shadow 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; }}
          >
            {article.thumbnailUrl && (
              <img src={article.thumbnailUrl} alt={article.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
            )}
            <div style={{ padding: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#B3732A', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {article.constituency || article.district || 'Local'}
              </div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {article.title || article.titleEn}
              </h3>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
