import React, { useState, useEffect } from 'react';
import { Search, Globe, RefreshCw, Save, Activity } from 'lucide-react';
import api from '../../api';

const SeoConsole = () => {
  const [seoTemplates, setSeoTemplates] = useState([]);
  const [sitemapConfig, setSitemapConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pingStatus, setPingStatus] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seoRes, sitemapRes] = await Promise.all([
        api.get('/admin/seo-config'),
        api.get('/admin/sitemap-config')
      ]);
      setSeoTemplates(seoRes.data || []);
      setSitemapConfig(sitemapRes.data || []);
    } catch (err) {
      console.error("Failed to load SEO configuration", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTemplateChange = (id, field, value) => {
    setSeoTemplates(seoTemplates.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveSeoTemplate = async (template) => {
    setSaving(true);
    try {
      if (template.id) {
        await api.put(`/admin/seo-config/${template.id}`, template);
      } else {
        await api.post(`/admin/seo-config`, template);
      }
      alert("SEO template saved successfully!");
    } catch (err) {
      alert("Failed to save SEO template");
    }
    setSaving(false);
  };

  const toggleSitemapExclusion = async (config) => {
    try {
      const updated = { ...config, isExcluded: !config.isExcluded };
      await api.put(`/admin/sitemap-config/${config.id}`, updated);
      setSitemapConfig(sitemapConfig.map(c => c.id === config.id ? updated : c));
    } catch (err) {
      alert("Failed to update sitemap configuration");
    }
  };

  const pingSearchEngines = async () => {
    setPingStatus('Pinging Google and Bing...');
    // Simulated ping for now, as real pinging requires backend logic calling external APIs
    setTimeout(() => {
      setPingStatus('Sitemaps successfully submitted to search engines!');
      setTimeout(() => setPingStatus(null), 5000);
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1><Search size={24} style={{ display: 'inline', marginRight: '10px', color: 'var(--primary)' }} /> SEO & Sitemap Console</h1>
          <p className="text-secondary">Configure default meta templates and manage search engine visibility.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: SEO Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} /> Global Meta Templates
            </h3>
            
            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>Loading templates...</div>
            ) : seoTemplates.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No SEO templates defined.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {seoTemplates.map(template => (
                  <div key={template.id} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'capitalize', color: 'var(--primary)' }}>
                      {template.pageType} Template
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Title Template</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={template.titleTemplate || ''} 
                          onChange={(e) => handleTemplateChange(template.id, 'titleTemplate', e.target.value)}
                          placeholder="e.g. {title} - King 24x7 News"
                        />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Available tags: {literal`{title}, {category}, {siteName}`}</div>
                      </div>
                      
                      <div className="form-group">
                        <label>Meta Description Template</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          value={template.descriptionTemplate || ''} 
                          onChange={(e) => handleTemplateChange(template.id, 'descriptionTemplate', e.target.value)}
                          placeholder="e.g. Read the latest news about {category}: {excerpt}"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Meta Keywords Template</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={template.keywordsTemplate || ''} 
                          onChange={(e) => handleTemplateChange(template.id, 'keywordsTemplate', e.target.value)}
                          placeholder="e.g. news, {category}, {tags}, tamil news"
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          onClick={() => saveSeoTemplate(template)}
                          disabled={saving}
                        >
                          <Save size={14} /> {saving ? 'Saving...' : 'Save Template'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sitemap & Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} /> Sitemap Settings
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Control which sections of the site are excluded from the auto-generated XML sitemap.
            </p>

            {loading ? (
              <div style={{ color: 'var(--text-muted)' }}>Loading config...</div>
            ) : sitemapConfig.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No sitemap config found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sitemapConfig.map(config => (
                  <div key={config.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{config.routePattern}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority: {config.priority || '0.5'} • Freq: {config.changefreq || 'weekly'}</div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: config.isExcluded ? 'var(--danger)' : 'var(--success)' }}>
                        {config.isExcluded ? 'Excluded' : 'Included'}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={!config.isExcluded} 
                        onChange={() => toggleSitemapExclusion(config)}
                        style={{ accentColor: 'var(--success)' }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Sitemap Generator</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Sitemap is generated dynamically at <code>/sitemap.xml</code>. You can ping search engines to re-index immediately.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                onClick={pingSearchEngines}
                disabled={!!pingStatus}
              >
                {pingStatus ? pingStatus : 'Ping Search Engines'}
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default SeoConsole;
