import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Save, ArrowLeft, Send, CheckCircle, MapPin } from 'lucide-react';

const TABS = ['Tamil', 'English', 'SEO', 'Settings'];

const slugify = (text) =>
  (text || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    titleTa: '', titleEn: '', contentTa: '', contentEn: '',
    shortDescTa: '', shortDescEn: '', imageUrl: '', featuredImage: '',
    authorName: 'Kings TV News Desk', status: 'draft',
    categoryId: '', districtId: '',
    metaTitle: '', metaDescription: '', metaKeywords: '', slug: '', canonicalUrl: '',
    latitude: '', longitude: '', visibilityRadiusKm: '',
    publishedAt: '',
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
    if (isEdit) {
      api.get(`/articles/${id}`).then(r => {
        const a = r.data;
        setForm({
          titleTa: a.titleTa || '', titleEn: a.titleEn || '',
          contentTa: a.contentTa || '', contentEn: a.contentEn || '',
          shortDescTa: a.shortDescTa || '', shortDescEn: a.shortDescEn || '',
          imageUrl: a.imageUrl || '', featuredImage: a.featuredImage || '',
          authorName: a.authorName || 'Kings TV News Desk', status: a.status || 'draft',
          categoryId: a.categoryId || '', districtId: a.districtId || '',
          metaTitle: a.metaTitle || '', metaDescription: a.metaDescription || '',
          metaKeywords: a.metaKeywords || '', slug: a.slug || '', canonicalUrl: a.canonicalUrl || '',
          latitude: a.latitude || '', longitude: a.longitude || '',
          visibilityRadiusKm: a.visibilityRadiusKm || '',
          publishedAt: a.publishedAt ? a.publishedAt.substring(0, 16) : '',
        });
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const autoSlug = () => {
    if (!form.slug && form.titleEn) set('slug', slugify(form.titleEn));
  };

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 4000);
  };

  const save = async (statusOverride) => {
    const payload = { ...form };
    if (statusOverride) payload.status = statusOverride;
    if (isEdit) payload.id = parseInt(id);
    if (!payload.slug && payload.titleEn) payload.slug = slugify(payload.titleEn);
    if (!payload.titleTa) { showMsg('Tamil title is required.', true); setActiveTab(0); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put('/articles/saveUpdate', payload);
        showMsg('Article updated successfully!');
      } else {
        await api.post('/articles/saveUpdate', payload);
        showMsg('Article created successfully!');
        setTimeout(() => navigate('/admin/news'), 1500);
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Save failed.', true);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box',
    outline: 'none', transition: 'border 0.2s',
  };
  const taStyle = { ...inputStyle, minHeight: '140px', resize: 'vertical', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/news')}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ marginBottom: '0.15rem' }}>{isEdit ? '?? Edit Article' : '?? Create Article'}</h1>
            <p className="text-secondary">{isEdit ? `Editing ID #${id}` : 'New article — Tamil required'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => save('draft')} disabled={saving}
            className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Save size={15} /> Save Draft
          </button>
          <button onClick={() => save('pending')} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
              border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}>
            <Send size={15} /> Submit for Review
          </button>
          <button onClick={() => save('published')} disabled={saving}
            className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={15} /> {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div style={{
          padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600,
          background: msg.isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          color: msg.isError ? '#EF4444' : '#10B981',
          border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
        }}>{msg.text}</div>
      )}

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              background: 'transparent', borderBottom: activeTab === i ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === i ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '-2px', transition: 'all 0.2s'
            }}>
            {tab === 'Tamil' && '???? '}{tab === 'English' && '?? '}{tab === 'SEO' && '?? '}{tab === 'Settings' && '?? '}{tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main Content */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          {/* Tamil Tab */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Tamil Title <span style={{ color: '#EF4444' }}>*</span></label>
                <input style={inputStyle} value={form.titleTa}
                  onChange={e => set('titleTa', e.target.value)} placeholder="????? ???????…" />
              </div>
              <div>
                <label style={labelStyle}>Short Description (Tamil)</label>
                <textarea style={taStyle} value={form.shortDescTa}
                  onChange={e => set('shortDescTa', e.target.value)} placeholder="?????????? ????????…" rows={3} />
              </div>
              <div>
                <label style={labelStyle}>Content (Tamil) <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea style={{ ...taStyle, minHeight: '260px' }} value={form.contentTa}
                  onChange={e => set('contentTa', e.target.value)} placeholder="?????? ??????????…" />
              </div>
            </div>
          )}

          {/* English Tab */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>English Title</label>
                <input style={inputStyle} value={form.titleEn}
                  onChange={e => { set('titleEn', e.target.value); if (!form.slug) set('slug', slugify(e.target.value)); }}
                  placeholder="English headline…" />
              </div>
              <div>
                <label style={labelStyle}>Short Description (English)</label>
                <textarea style={taStyle} value={form.shortDescEn}
                  onChange={e => set('shortDescEn', e.target.value)} placeholder="Brief summary…" rows={3} />
              </div>
              <div>
                <label style={labelStyle}>Content (English)</label>
                <textarea style={{ ...taStyle, minHeight: '260px' }} value={form.contentEn}
                  onChange={e => set('contentEn', e.target.value)} placeholder="Full article content…" />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>SEO Title <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(max 60 chars)</span></label>
                <input style={inputStyle} value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)} placeholder="SEO optimized title…" maxLength={60} />
                <div style={{ fontSize: '0.75rem', color: form.metaTitle.length > 55 ? '#F59E0B' : 'var(--text-muted)', marginTop: '4px' }}>
                  {form.metaTitle.length}/60 characters
                </div>
              </div>
              <div>
                <label style={labelStyle}>Meta Description <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(max 160 chars)</span></label>
                <textarea style={{ ...taStyle, minHeight: '80px' }} value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)} placeholder="Meta description for search engines…" maxLength={160} />
                <div style={{ fontSize: '0.75rem', color: form.metaDescription.length > 150 ? '#F59E0B' : 'var(--text-muted)', marginTop: '4px' }}>
                  {form.metaDescription.length}/160 characters
                </div>
              </div>
              <div>
                <label style={labelStyle}>Meta Keywords</label>
                <input style={inputStyle} value={form.metaKeywords}
                  onChange={e => set('metaKeywords', e.target.value)} placeholder="news, tamil, politics, …" />
              </div>
              <div>
                <label style={labelStyle}>URL Slug</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={form.slug}
                    onChange={e => set('slug', e.target.value)} placeholder="auto-generated-from-title" />
                  <button onClick={autoSlug} className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    Auto-generate
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Canonical URL</label>
                <input style={inputStyle} value={form.canonicalUrl}
                  onChange={e => set('canonicalUrl', e.target.value)} placeholder="https://king24x7.com/news/slug" />
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Author Name</label>
                <input style={inputStyle} value={form.authorName}
                  onChange={e => set('authorName', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Schedule Publish Date/Time</label>
                <input type="datetime-local" style={inputStyle} value={form.publishedAt}
                  onChange={e => set('publishedAt', e.target.value)} />
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <label style={{ ...labelStyle, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} /> GPS Visibility (optional)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Latitude</label>
                    <input type="number" style={inputStyle} value={form.latitude}
                      onChange={e => set('latitude', e.target.value)} placeholder="11.0168" step="any" />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Longitude</label>
                    <input type="number" style={inputStyle} value={form.longitude}
                      onChange={e => set('longitude', e.target.value)} placeholder="76.9558" step="any" />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Radius (km)</label>
                    <input type="number" style={inputStyle} value={form.visibilityRadiusKm}
                      onChange={e => set('visibilityRadiusKm', e.target.value)} placeholder="50" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">?? Draft</option>
              <option value="pending">? Pending Review</option>
              <option value="published">? Published</option>
              <option value="rejected">? Rejected</option>
              <option value="archived">?? Archived</option>
            </select>
          </div>

          {/* Category */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">— Select Category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Featured Image */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <label style={labelStyle}>Featured Image URL</label>
            <input style={inputStyle} value={form.imageUrl}
              onChange={e => set('imageUrl', e.target.value)} placeholder="https://…/image.jpg" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display = 'none'}
                style={{ width: '100%', borderRadius: '6px', marginTop: '0.75rem', maxHeight: '140px', objectFit: 'cover' }} />
            )}
          </div>

          {/* Save actions */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => save()} disabled={saving}
              className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={() => navigate('/admin/news')}
              className="btn btn-secondary" style={{ width: '100%' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditor;
