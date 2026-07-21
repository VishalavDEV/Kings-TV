import { useI18n } from '../../context/I18nContext';
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, FileText, Download, Copy, Trash2, Search, Filter } from 'lucide-react';
import api from '../../api';

const MediaLibrary = () => {
  const { t } = useI18n();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Since there is no dedicated backend endpoint for listing media in the current implementation,
    // this acts as a visual placeholder/mock structure for the Media Library as per the prompt requirements.
    // In a real scenario, this would fetch from an S3 bucket or local `/uploads` dir via an API endpoint.
    setTimeout(() => {
      setMediaList([
        { id: 1, name: 'election_rally_2026.jpg', type: 'image', size: '1.2 MB', url: '/uploads/images/election_rally_2026.jpg', uploadedAt: '2026-07-20T10:00:00', usage: 2 },
        { id: 2, name: 'interview_clip.mp4', type: 'video', size: '15 MB', url: '/uploads/videos/interview_clip.mp4', uploadedAt: '2026-07-19T14:30:00', usage: 1 },
        { id: 3, name: 'press_release.pdf', type: 'document', size: '400 KB', url: '/uploads/docs/press_release.pdf', uploadedAt: '2026-07-18T09:15:00', usage: 0 },
        { id: 4, name: 'breaking_news_bg.png', type: 'image', size: '2.5 MB', url: '/uploads/images/breaking_news_bg.png', uploadedAt: '2026-07-17T11:45:00', usage: 5 }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert(t("copied"));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon size={32} color="var(--primary)" />;
      case 'video': return <Film size={32} color="var(--warning)" />;
      default: return <FileText size={32} color="var(--text-muted)" />;
    }
  };

  const filtered = mediaList
    .filter(m => filterType === 'all' || m.type === filterType)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1><ImageIcon size={24} style={{ display: 'inline', marginRight: '10px' }} /> {t('mediaLibrary')}</h1>
          <p className="text-secondary">{t('mediaLibraryDesc')}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder={t("searchMediaPlaceholder")} 
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ minWidth: '150px' }}>
            <option value="all">{t('allTypes')}</option>
            <option value="image">{t('images')}</option>
            <option value="video">{t('videos')}</option>
            <option value="document">{t('documents')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>{t('loadingMedia')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(media => (
            <div key={media.id} style={{ background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ height: '150px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                {getIcon(media.type)}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={media.name}>
                  {media.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <span>{media.size}</span>
                  <span style={{ color: media.usage > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                    {t('usage')}: {media.usage}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => copyToClipboard(media.url)} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                    <Copy size={14} /> {t('copyUrl')}
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.4rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
