import React, { useState } from 'react';
import { X, Globe, Calendar, Eye, MapPin, Tag } from 'lucide-react';

const ArticlePreviewModal = ({ form, categories, districts, onClose }) => {
  const [lang, setLang] = useState(form.contentTa ? 'ta' : 'en');

  const title = lang === 'ta' ? (form.titleTa || form.titleEn) : (form.titleEn || form.titleTa);
  const excerpt = lang === 'ta' ? (form.shortDescTa || form.shortDescEn) : (form.shortDescEn || form.shortDescTa);
  const content = lang === 'ta' ? (form.contentTa || form.contentEn) : (form.contentEn || form.contentTa);
  const catObj = categories.find(c => String(c.id) === String(form.categoryId));
  const distObj = districts.find(d => String(d.id) === String(form.districtId));

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-primary, #ffffff)', borderRadius: '12px',
        width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', overflow: 'hidden', border: '1px solid var(--border-color, #cbd5e1)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color, #e2e8f0)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary, #f8fafc)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Article Preview</span>
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '16px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setLang('ta')}
                style={{
                  padding: '0.2rem 0.65rem', border: 'none', borderRadius: '14px',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: lang === 'ta' ? '#0057FF' : 'transparent',
                  color: lang === 'ta' ? '#ffffff' : '#475569'
                }}
              >
                🇮🇳 தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                style={{
                  padding: '0.2rem 0.65rem', border: 'none', borderRadius: '14px',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: lang === 'en' ? '#0057FF' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#475569'
                }}
              >
                🌐 English
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Article Body Preview */}
        <div style={{ padding: '1.5rem 2rem', overflowY: 'auto', flex: 1 }}>
          {/* Category & District Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
            {catObj && (
              <span style={{ background: '#0057FF', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                {lang === 'ta' && catObj.nameTa ? catObj.nameTa : catObj.name}
              </span>
            )}
            {distObj && (
              <span style={{ background: 'rgba(0, 87, 255, 0.1)', color: '#0057FF', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <MapPin size={12} /> {lang === 'ta' && distObj.nameTa ? distObj.nameTa : distObj.nameEn}
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {title || 'Untitled Article'}
          </h1>

          {/* Author & Timestamp Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
            <span>By <strong>{form.authorName || 'Kings TV Desk'}</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {new Date().toLocaleDateString()}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Eye size={13} /> 0 views</span>
          </div>

          {/* Featured Image */}
          {(form.imageUrl || form.featuredImage) && (
            <div style={{ marginBottom: '1.25rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '380px' }}>
              <img src={form.imageUrl || form.featuredImage} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Short Description */}
          {excerpt && (
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem', fontStyle: 'italic', paddingLeft: '1rem', borderLeft: '3px solid #0057FF' }}>
              {excerpt}
            </div>
          )}

          {/* Main Rich Content */}
          <div 
            style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: content || '<p style="color: #94a3b8;">No article content entered yet.</p>' }}
          />

          {/* Tags */}
          {form.metaKeywords && (
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag size={14} style={{ color: 'var(--text-muted)' }} />
              {form.metaKeywords.split(',').map((t, idx) => (
                <span key={idx} style={{ background: 'var(--bg-secondary, #f1f5f9)', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlePreviewModal;
