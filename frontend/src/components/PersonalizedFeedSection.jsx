import React, { useEffect, useState } from 'react';
import { readerService } from '../services/readerService';
import { Link } from 'react-router-dom';

export default function PersonalizedFeedSection({ token }) {
  const [feed, setFeed] = useState([]);
  const [readerInfo, setReaderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const data = await readerService.getPersonalizedFeed(token);
        if (data.feed) {
          setFeed(data.feed);
          setReaderInfo(data.reader);
        } else if (Array.isArray(data)) {
          setFeed(data);
        }
      } catch (err) {
        console.error("Failed to load personalized feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
        Loading your personalized news feed...
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '24px',
      margin: '30px 0',
      color: '#ffffff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: 'var(--primary, #B3732A)', textTransform: 'uppercase' }}>
            Recommended For You
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0 0' }}>
            Personalized Feed
          </h2>
          {readerInfo?.preferredLocation && (
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Filtered by: {readerInfo.preferredLocation}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {feed.slice(0, 6).map(item => (
          <div
            key={item.id}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, borderColor 0.2s'
            }}
          >
            {item.imageUrl && (
              <div style={{ height: '150px', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.4, color: '#ffffff' }}>
                  {item.titleTa || item.titleEn || item.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.summary || item.shortDescTa || item.shortDescEn || item.content}
                </p>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Just now'}
                </span>
                <Link
                  to={`/news/${item.slug || item.id}`}
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary, #B3732A)', textDecoration: 'none' }}
                >
                  Read →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
