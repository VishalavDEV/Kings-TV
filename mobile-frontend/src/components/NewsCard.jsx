import React from 'react';
import { Eye, Clock } from 'lucide-react';

const NewsCard = ({ article }) => {
  return (
    <article className="mobile-card">
      {article.image && (
        <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative' }}>
          <img 
            src={article.image} 
            alt={article.titleTa || article.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span style={{ 
            position: 'absolute', top: '10px', left: '10px', 
            background: 'var(--primary)', color: '#fff', 
            fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', 
            borderRadius: '4px' 
          }}>
            {article.category || 'செய்திகள்'}
          </span>
        </div>
      )}
      <div style={{ padding: '0.85rem 1rem' }}>
        <h3 style={{ fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {article.titleTa || article.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> {article.time || 'இப்போது'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)' }}>
            <Eye size={12} /> {article.views || 0}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
