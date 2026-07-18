import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Save, ArrowLeft, Send, CheckCircle, MapPin, Image, Video, Link, Copy, Plus } from 'lucide-react';

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
  const [mediaList, setMediaList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState('expand');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [lastSavedTime, setLastSavedTime] = useState(null);

  const [form, setForm] = useState({
    titleTa: '', titleEn: '', contentTa: '', contentEn: '',
    shortDescTa: '', shortDescEn: '', imageUrl: '', featuredImage: '',
    authorName: 'Kings TV News Desk', status: 'draft',
    categoryId: '', subcategoryId: '',
    districtId: '', constituency: '',
    metaTitle: '', metaDescription: '', metaKeywords: '', slug: '', canonicalUrl: '',
    latitude: '', longitude: '', visibilityRadiusKm: '',
    publishedAt: '',
  });

  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Auto-save logic
  useEffect(() => {
    if (!isEdit) {
      const savedDraft = localStorage.getItem('newsEditorDraft');
      if (savedDraft) {
        if (window.confirm('You have an unsaved draft. Do you want to restore it?')) {
          try {
            const parsed = JSON.parse(savedDraft);
            setForm(parsed);
          } catch (e) {
            console.error('Failed to parse draft', e);
          }
        } else {
          localStorage.removeItem('newsEditorDraft');
        }
      }
    }
  }, [isEdit]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (!isEdit && (formRef.current.titleTa || formRef.current.contentTa)) {
        localStorage.setItem('newsEditorDraft', JSON.stringify(formRef.current));
        setLastSavedTime(new Date());
      }
    }, 30000); // 30 seconds
    return () => clearInterval(autoSaveInterval);
  }, [isEdit]);

  // Load Categories & Districts Data
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
    api.get('/districts').then(r => setDistricts(r.data || [])).catch(() => {});
    
    if (isEdit) {
      api.get(`/articles/${id}`).then(r => {
        const a = r.data;
        const formObj = {
          titleTa: a.titleTa || '', titleEn: a.titleEn || '',
          contentTa: a.contentTa || '', contentEn: a.contentEn || '',
          shortDescTa: a.shortDescTa || '', shortDescEn: a.shortDescEn || '',
          imageUrl: a.imageUrl || '', featuredImage: a.featuredImage || '',
          authorName: a.authorName || 'Kings TV News Desk', status: a.status || 'draft',
          categoryId: a.categoryId || '', subcategoryId: a.subcategoryId || '',
          districtId: a.districtId || '', constituency: a.constituency || '',
          metaTitle: a.metaTitle || '', metaDescription: a.metaDescription || '',
          metaKeywords: a.metaKeywords || '', slug: a.slug || '', canonicalUrl: a.canonicalUrl || '',
          latitude: a.latitude || '', longitude: a.longitude || '',
          visibilityRadiusKm: a.visibilityRadiusKm || '',
          publishedAt: a.publishedAt ? a.publishedAt.substring(0, 16) : '',
        };
        setForm(formObj);
        
        // Sync TinyMCE content if ready
        if (window.tinymce) {
          const editorTa = window.tinymce.get('tinymce-contentTa');
          if (editorTa) editorTa.setContent(a.contentTa || '');
          const editorEn = window.tinymce.get('tinymce-contentEn');
          if (editorEn) editorEn.setContent(a.contentEn || '');
        }
      }).catch(() => {});
    }
  }, [id, isEdit]);

  // Dynamically load subcategories when category changes
  useEffect(() => {
    if (form.categoryId) {
      api.get(`/subcategories/getAllWeb?categoryId=${form.categoryId}`)
        .then(r => {
          if (r.data && r.data.content) {
            setSubCategories(r.data.content);
          } else if (Array.isArray(r.data)) {
            setSubCategories(r.data);
          } else {
            setSubCategories([]);
          }
        })
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
    }
  }, [form.categoryId]);

  // Initialize TinyMCE editors
  useEffect(() => {
    let active = true;
    
    const initTinyMCE = () => {
      if (!window.tinymce) return;

      // Clean up previous editors to prevent duplicate key errors
      if (window.tinymce.get('tinymce-contentTa')) {
        window.tinymce.get('tinymce-contentTa').destroy();
      }
      if (window.tinymce.get('tinymce-contentEn')) {
        window.tinymce.get('tinymce-contentEn').destroy();
      }

      const imagesUploadHandler = (blobInfo, progress) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        const baseApi = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
        xhr.open('POST', `${baseApi}/articles/upload`);
        
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.upload.onprogress = (e) => {
          progress(e.loaded / e.total * 100);
        };

        xhr.onload = () => {
          if (xhr.status === 403 || xhr.status === 401) {
            reject({ message: 'HTTP Error: ' + xhr.status, remove: true });
            return;
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            reject('HTTP Error: ' + xhr.status);
            return;
          }
          const json = JSON.parse(xhr.responseText);
          if (!json || typeof json.url !== 'string') {
            reject('Invalid JSON: ' + xhr.responseText);
            return;
          }
          const serverBase = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1')
            .replace(/\/api\/v1\/?$/, '')
            .replace(/\/api\/?$/, '');
          resolve(serverBase + json.url);
        };

        xhr.onerror = () => {
          reject('Image upload failed due to a network error.');
        };

        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        xhr.send(formData);
      });

      const commonConfig = {
        height: 600,
        menubar: 'file edit view insert format tools table help',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount',
          'emoticons', 'codesample', 'quickbars', 'directionality', 'nonbreaking',
          'pagebreak', 'accordion', 'visualchars', 'template'
        ],
        toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
        toolbar2: 'bullist numlist outdent indent | link image media table | emoticons charmap | removeformat fullscreen preview | template',
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',
        contextmenu: 'link image table',
        templates: [
          { title: 'Breaking News', description: 'Standard breaking news layout', content: '<h3><strong>BREAKING NEWS</strong></h3><p>[Lead paragraph goes here. Keep it punchy and to the point.]</p><p>[Additional details.]</p>' },
          { title: 'Press Release', description: 'Formal press release format', content: '<h3><strong>PRESS RELEASE</strong></h3><p><strong>FOR IMMEDIATE RELEASE</strong></p><p>[City, Date] &mdash; [Company/Organization] today announced...</p>' },
          { title: 'Interview / Q&A', description: 'Q&A format', content: '<p><strong>Interviewer:</strong> [Question here]</p><p><strong>Guest:</strong> [Answer here]</p>' }
        ],
        skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
        content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
        content_style: 'body { font-family:Inter,Outfit,-apple-system,BlinkMacSystemFont,sans-serif; font-size:16px; line-height: 1.6; background-color: var(--bg-surface); color: var(--text-primary); } img { border-radius: 8px; }',
        images_upload_handler: imagesUploadHandler,
        image_advtab: true,
        image_caption: true,
        toolbar_sticky: true,
        toolbar_sticky_offset: 60
      };

      window.tinymce.init({
        ...commonConfig,
        selector: '#tinymce-contentTa',
        setup: (editor) => {
          editor.on('change keyup blur', () => {
            setForm(f => ({ ...f, contentTa: editor.getContent() }));
          });
        },
        init_instance_callback: (editor) => {
          if (active && formRef.current.contentTa) {
            editor.setContent(formRef.current.contentTa);
          }
        }
      });

      window.tinymce.init({
        ...commonConfig,
        selector: '#tinymce-contentEn',
        setup: (editor) => {
          editor.on('change keyup blur', () => {
            setForm(f => ({ ...f, contentEn: editor.getContent() }));
          });
        },
        init_instance_callback: (editor) => {
          if (active && formRef.current.contentEn) {
            editor.setContent(formRef.current.contentEn);
          }
        }
      });
    };

    const checkInterval = setInterval(() => {
      if (window.tinymce) {
        clearInterval(checkInterval);
        initTinyMCE();
      }
    }, 100);

    return () => {
      active = false;
      clearInterval(checkInterval);
      if (window.tinymce) {
        if (window.tinymce.get('tinymce-contentTa')) {
          window.tinymce.get('tinymce-contentTa').destroy();
        }
        if (window.tinymce.get('tinymce-contentEn')) {
          window.tinymce.get('tinymce-contentEn').destroy();
        }
      }
    };
  }, []);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadProgress(0);
    const uploadedItems = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await api.post('/articles/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.url) {
          const serverBase = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1')
            .replace(/\/api\/v1\/?$/, '')
            .replace(/\/api\/?$/, '');
          uploadedItems.push({
            name: file.name,
            url: serverBase + res.data.url,
            type: file.type
          });
        }
      } catch (err) {
        console.error("Upload failed for file", file.name, err);
      }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }
    
    setMediaList(prev => [...prev, ...uploadedItems]);
    setUploadProgress(null);
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/articles/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.url) {
        const serverBase = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1')
          .replace(/\/api\/v1\/?$/, '')
          .replace(/\/api\/?$/, '');
        set('imageUrl', serverBase + res.data.url);
        showMsg('Featured image uploaded successfully!');
      }
    } catch (err) {
      showMsg('Failed to upload featured image.', true);
    }
  };

  const insertMediaIntoTinyMCE = (url, type) => {
    if (!window.tinymce) return;
    const activeEditorId = activeTab === 0 ? 'tinymce-contentTa' : 'tinymce-contentEn';
    const editor = window.tinymce.get(activeEditorId);
    if (!editor) {
      showMsg('Please click inside the Tamil or English editor first.', true);
      return;
    }
    
    let html = '';
    if (type.startsWith('video/')) {
      html = `<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;"><source src="${url}" type="${type}">Your browser does not support the video tag.</video><p>&nbsp;</p>`;
    } else {
      html = `<img src="${url}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" /><p>&nbsp;</p>`;
    }
    editor.insertContent(html);
    
    // update form state immediately
    if (activeTab === 0) {
      set('contentTa', editor.getContent());
    } else {
      set('contentEn', editor.getContent());
    }
    showMsg('Media inserted successfully!');
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const autoSlug = () => {
    if (!form.slug && form.titleEn) set('slug', slugify(form.titleEn));
  };

  const runAiAction = async () => {
    if (!aiPrompt && !['seo', 'tags'].includes(aiAction)) {
      showMsg('Please provide some text or context for the AI.', true);
      return;
    }
    
    setAiLoading(true);
    setAiResult('');
    
    let textToProcess = aiPrompt;
    if (aiAction === 'seo' || aiAction === 'tags') {
       textToProcess = form.contentTa || form.contentEn;
       if (!textToProcess) {
         showMsg('Please write some article content first.', true);
         setAiLoading(false);
         return;
       }
    }

    try {
      const res = await api.post('/articles/ai-assist', {
        action: aiAction,
        text: textToProcess,
        context: activeTab === 0 ? 'ta' : 'en'
      });
      if (res.data && res.data.result) {
        setAiResult(res.data.result);
      }
    } catch (err) {
      setAiResult('Error generating AI content. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 4000);
  };

  const save = async (statusOverride) => {
    let payload = { ...form };
    if (statusOverride) payload.status = statusOverride;
    if (isEdit) payload.id = parseInt(id);
    if (!payload.slug && payload.titleEn) payload.slug = slugify(payload.titleEn);
    if (!payload.titleTa) { showMsg('Tamil title is required.', true); setActiveTab(0); return; }

    setSaving(true);
    
    // Auto-SEO on publish
    if (payload.status === 'published') {
      try {
        let seoUpdates = {};
        let needsSeo = false;
        if (!payload.metaTitle) {
          seoUpdates.metaTitle = payload.titleEn || payload.titleTa;
          needsSeo = true;
        }
        if (!payload.metaDescription && payload.contentTa) {
          const res = await api.post('/articles/ai-assist', { action: 'summarize', text: payload.contentTa, context: 'ta' });
          if (res.data?.result) seoUpdates.metaDescription = res.data.result;
          needsSeo = true;
        }
        if (!payload.metaKeywords && payload.contentTa) {
          const res = await api.post('/articles/ai-assist', { action: 'tags', text: payload.contentTa, context: 'ta' });
          if (res.data?.result) seoUpdates.metaKeywords = res.data.result.split(',').map(s=>s.trim()).filter(s=>s).join(', ');
          needsSeo = true;
        }
        
        if (needsSeo) {
           payload = { ...payload, ...seoUpdates };
           setForm(f => ({ ...f, ...seoUpdates }));
           showMsg('AI auto-generated SEO fields.', false);
        }
      } catch (err) {
        console.warn('Auto-SEO failed', err);
      }
    }

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

  const calcStats = (html) => {
    if (!html) return { words: 0, chars: 0, readingTime: 0 };
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute avg
    return { words, chars, readingTime };
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
    color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const taStyle = { ...inputStyle, minHeight: '140px', resize: 'vertical', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/news')}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ marginBottom: '0.15rem' }}>{isEdit ? '✏️ Edit Article' : '📝 Create Article'}</h1>
            <p className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEdit ? `Editing ID #${id}` : 'New article — Tamil required'}
              {lastSavedTime && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                  Autosaved at {lastSavedTime.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', background: aiPanelOpen ? 'var(--primary)' : '', color: aiPanelOpen ? '#fff' : '' }}>
            ✨ AI Assistant
          </button>
          <button onClick={() => save('draft')} disabled={saving}
            className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Save size={15} /> Save Draft
          </button>
          <button onClick={() => save('pending')} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem',
              borderRadius: '8px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
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
          padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
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
              padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              background: 'transparent', borderBottom: activeTab === i ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === i ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '-2px', transition: 'all 0.2s'
            }}>
            {tab === 'Tamil' && '🇮🇳 '}{tab === 'English' && '🌐 '}{tab === 'SEO' && '🔍 '}{tab === 'Settings' && '⚙️ '}{tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: aiPanelOpen ? '1fr 320px 320px' : '1fr 320px', gap: '1.5rem', alignItems: 'start', transition: 'grid-template-columns 0.3s' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '12px', position: 'relative', minHeight: '500px' }}>
            {/* Tamil Tab */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              visibility: activeTab === 0 ? 'visible' : 'hidden',
              height: activeTab === 0 ? 'auto' : 0,
              overflow: activeTab === 0 ? 'visible' : 'hidden',
              position: activeTab === 0 ? 'relative' : 'absolute',
              width: '100%',
              left: 0,
              top: activeTab === 0 ? 0 : '1.75rem',
              padding: activeTab === 0 ? 0 : '0 1.75rem',
              boxSizing: 'border-box',
              opacity: activeTab === 0 ? 1 : 0
            }}>
              <div>
                <label style={labelStyle}>Tamil Title <span style={{ color: '#EF4444' }}>*</span></label>
                <input style={inputStyle} value={form.titleTa}
                  onChange={e => set('titleTa', e.target.value)} placeholder="தமிழ் தலைப்பு..." />
              </div>
              <div>
                <label style={labelStyle}>Short Description (Tamil)</label>
                <textarea style={taStyle} value={form.shortDescTa}
                  onChange={e => set('shortDescTa', e.target.value)} placeholder="சுருக்கமான விளக்கம்..." rows={3} />
              </div>
              <div>
                <label style={labelStyle}>Content (Tamil) <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea id="tinymce-contentTa" style={{ ...taStyle, minHeight: '350px' }} value={form.contentTa}
                  onChange={e => set('contentTa', e.target.value)} placeholder="செய்தி உள்ளடக்கம்..." />
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <span>📊 {calcStats(form.contentTa).words} words</span>
                  <span>📖 ~{calcStats(form.contentTa).readingTime} min read</span>
                  <span>🔤 {calcStats(form.contentTa).chars} characters</span>
                </div>
              </div>
            </div>

            {/* English Tab */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              visibility: activeTab === 1 ? 'visible' : 'hidden',
              height: activeTab === 1 ? 'auto' : 0,
              overflow: activeTab === 1 ? 'visible' : 'hidden',
              position: activeTab === 1 ? 'relative' : 'absolute',
              width: '100%',
              left: 0,
              top: activeTab === 1 ? 0 : '1.75rem',
              padding: activeTab === 1 ? 0 : '0 1.75rem',
              boxSizing: 'border-box',
              opacity: activeTab === 1 ? 1 : 0
            }}>
              <div>
                <label style={labelStyle}>English Title</label>
                <input style={inputStyle} value={form.titleEn}
                  onChange={e => { set('titleEn', e.target.value); if (!form.slug) set('slug', slugify(e.target.value)); }}
                  placeholder="English headline..." />
              </div>
              <div>
                <label style={labelStyle}>Short Description (English)</label>
                <textarea style={taStyle} value={form.shortDescEn}
                  onChange={e => set('shortDescEn', e.target.value)} placeholder="Brief summary..." rows={3} />
              </div>
              <div>
                <label style={labelStyle}>Content (English)</label>
                <textarea id="tinymce-contentEn" style={{ ...taStyle, minHeight: '350px' }} value={form.contentEn}
                  onChange={e => set('contentEn', e.target.value)} placeholder="Full article content..." />
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <span>📊 {calcStats(form.contentEn).words} words</span>
                  <span>📖 ~{calcStats(form.contentEn).readingTime} min read</span>
                  <span>🔤 {calcStats(form.contentEn).chars} characters</span>
                </div>
              </div>
            </div>

            {/* SEO Tab */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              visibility: activeTab === 2 ? 'visible' : 'hidden',
              height: activeTab === 2 ? 'auto' : 0,
              overflow: activeTab === 2 ? 'visible' : 'hidden',
              position: activeTab === 2 ? 'relative' : 'absolute',
              width: '100%',
              left: 0,
              top: activeTab === 2 ? 0 : '1.75rem',
              padding: activeTab === 2 ? 0 : '0 1.75rem',
              boxSizing: 'border-box',
              opacity: activeTab === 2 ? 1 : 0
            }}>
              <div>
                <label style={labelStyle}>SEO Title <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(max 60 chars)</span></label>
                <input style={inputStyle} value={form.metaTitle}
                  onChange={e => set('metaTitle', e.target.value)} placeholder="SEO optimized title..." maxLength={60} />
                <div style={{ fontSize: '0.75rem', color: form.metaTitle.length > 55 ? '#F59E0B' : 'var(--text-muted)', marginTop: '4px' }}>
                  {form.metaTitle.length}/60 characters
                </div>
              </div>
              <div>
                <label style={labelStyle}>Meta Description <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(max 160 chars)</span></label>
                <textarea style={{ ...taStyle, minHeight: '80px' }} value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)} placeholder="Meta description for search engines..." maxLength={160} />
                <div style={{ fontSize: '0.75rem', color: form.metaDescription.length > 150 ? '#F59E0B' : 'var(--text-muted)', marginTop: '4px' }}>
                  {form.metaDescription.length}/160 characters
                </div>
              </div>
              <div>
                <label style={labelStyle}>Meta Keywords / Search Tags</label>
                <input style={inputStyle} value={form.metaKeywords}
                  onChange={e => set('metaKeywords', e.target.value)} placeholder="news, tamil, politics..." />
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

            {/* Settings Tab */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              visibility: activeTab === 3 ? 'visible' : 'hidden',
              height: activeTab === 3 ? 'auto' : 0,
              overflow: activeTab === 3 ? 'visible' : 'hidden',
              position: activeTab === 3 ? 'relative' : 'absolute',
              width: '100%',
              left: 0,
              top: activeTab === 3 ? 0 : '1.75rem',
              padding: activeTab === 3 ? 0 : '0 1.75rem',
              boxSizing: 'border-box',
              opacity: activeTab === 3 ? 1 : 0
            }}>
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
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ ...labelStyle, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
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
          </div>

          {/* Media Assets Library Panel for Journalists */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Image size={18} style={{ color: 'var(--primary)' }} /> Media Helper Library
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Upload article-specific multiple images & videos, then insert them directly at the editor cursor.
                </p>
              </div>
              <div>
                <label htmlFor="media-helper-upload" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                  <Plus size={14} /> Add Media Files
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  onChange={handleMediaUpload} 
                  style={{ display: 'none' }} 
                  id="media-helper-upload" 
                />
              </div>
            </div>

            {uploadProgress !== null && (
              <div style={{ width: '100%', background: 'var(--border-color)', height: '6px', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.2s' }} />
              </div>
            )}

            {mediaList.length === 0 ? (
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                No additional media files uploaded yet. Add multiple images & videos for news composition.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                {mediaList.map((item, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ height: '90px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.type.startsWith('image/') ? (
                        <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Video size={32} style={{ color: '#fff' }} />
                      )}
                    </div>
                    <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                        {item.name}
                      </span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button 
                          onClick={() => insertMediaIntoTinyMCE(item.url, item.type)}
                          style={{ flex: 1, padding: '3px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Insert
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showMsg('URL copied to clipboard!');
                          }}
                          style={{ padding: '3px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          title="Copy Link"
                        >
                          <Copy size={10} />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Delete this media item?')) {
                              setMediaList(mediaList.filter((_, i) => i !== idx));
                            }
                          }}
                          style={{ padding: '3px 6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', color: '#EF4444' }}
                          title="Remove from list"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft" style={{ color: '#000000', backgroundColor: '#ffffff' }}>📝 Draft</option>
              <option value="pending" style={{ color: '#000000', backgroundColor: '#ffffff' }}>⏳ Pending Review</option>
              <option value="published" style={{ color: '#000000', backgroundColor: '#ffffff' }}>✅ Published</option>
              <option value="rejected" style={{ color: '#000000', backgroundColor: '#ffffff' }}>❌ Rejected</option>
              <option value="archived" style={{ color: '#000000', backgroundColor: '#ffffff' }}>📦 Archived</option>
            </select>
          </div>

          {/* Category */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>— Select Category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Subcategory</label>
            <select 
              style={{ ...inputStyle, cursor: 'pointer' }} 
              value={form.subcategoryId} 
              onChange={e => set('subcategoryId', e.target.value)}
              disabled={!form.categoryId}
            >
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>— Select Subcategory —</option>
              {subCategories.map(sc => (
                <option key={sc.subcategoryId} value={sc.subcategoryId} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{sc.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>District</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.districtId} onChange={e => set('districtId', e.target.value)}>
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>— Select District —</option>
              {districts.map(d => (
                <option key={d.id} value={d.id} style={{ color: '#000000', backgroundColor: '#ffffff' }}>{d.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Constituency */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Constituency</label>
            <input 
              style={inputStyle} 
              value={form.constituency}
              onChange={e => set('constituency', e.target.value)} 
              placeholder="e.g. Coimbatore South" 
            />
          </div>

          {/* Featured Image */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Featured Image</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input style={{ ...inputStyle, flex: 1 }} value={form.imageUrl}
                onChange={e => set('imageUrl', e.target.value)} placeholder="Image URL..." />
              <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 0.75rem', borderRadius: '8px' }}>
                <Plus size={16} /> Upload
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFeaturedImageUpload} />
              </label>
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display = 'none'}
                style={{ width: '100%', borderRadius: '8px', marginTop: '0.75rem', maxHeight: '140px', objectFit: 'cover' }} />
            )}
          </div>

          {/* News Tags */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>News Tags (comma-separated)</label>
            <input 
              style={inputStyle} 
              value={form.metaKeywords}
              onChange={e => set('metaKeywords', e.target.value)} 
              placeholder="e.g. Budget, Assembly, Chennai" 
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {(form.metaKeywords || '').split(',').map(s => s.trim()).filter(Boolean).map((t, idx) => (
                <span key={idx} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Save actions */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '12px' }}>
            <button onClick={() => save()} disabled={saving}
              className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => navigate('/admin/news')}
              className="btn btn-secondary" style={{ width: '100%' }}>Cancel</button>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {aiPanelOpen && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem', borderRadius: '12px', border: '2px solid var(--primary)', background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              ✨ AI Assistant
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Use AI to generate headlines, expand text, check grammar, or generate SEO metadata.
            </p>

            <div>
              <label style={labelStyle}>Action</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={aiAction} onChange={e => setAiAction(e.target.value)}>
                <option value="headlines">🪄 Generate Headlines</option>
                <option value="expand">✍️ Expand Text</option>
                <option value="summarize">📝 Summarize</option>
                <option value="grammar">🔤 Grammar Check</option>
                <option value="tags">🏷️ Generate Tags</option>
                <option value="seo">🔍 SEO Optimizer</option>
                <option value="translate">🌐 Translate (Ta↔En)</option>
              </select>
            </div>

            {['headlines', 'expand', 'summarize', 'grammar', 'translate'].includes(aiAction) && (
              <div>
                <label style={labelStyle}>Input Text / Idea</label>
                <textarea 
                  style={{ ...taStyle, minHeight: '100px' }} 
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)} 
                  placeholder="Enter text or rough idea..." 
                />
              </div>
            )}

            <button 
              onClick={runAiAction} 
              disabled={aiLoading}
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {aiLoading ? '🤖 Generating...' : '🚀 Run AI Action'}
            </button>

            {aiResult && (
              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label style={labelStyle}>AI Output</label>
                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
                  {aiResult}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    showMsg('AI Output copied to clipboard!');
                  }}
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem' }}
                >
                  <Copy size={12} style={{ display: 'inline', marginRight: '4px' }} /> Copy Output
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsEditor;