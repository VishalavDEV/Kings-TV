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

  const getPreviewUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    const serverBase = (api.defaults.baseURL || 'http://localhost:8080/api/v1')
      .replace(/\/api\/v1\/?$/, '')
      .replace(/\/api\/?$/, '');
    const normalizedUrl = url.startsWith('/') ? url : '/' + url;
    return serverBase + normalizedUrl;
  };

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
  
  // AI SEO Assistant state
  const [aiSeoLoading, setAiSeoLoading] = useState(false);
  const [aiSeoSuggestions, setAiSeoSuggestions] = useState(null);
  const [linkSuggestions, setLinkSuggestions] = useState([]);

  const [form, setForm] = useState({
    titleTa: '', titleEn: '', contentTa: '', contentEn: '',
    shortDescTa: '', shortDescEn: '', imageUrl: '', featuredImage: '',
    authorName: 'Kings TV News Desk', status: 'draft',
    categoryId: '', subcategoryId: '',
    districtId: '', constituency: '',
    metaTitle: '', metaDescription: '', metaKeywords: '', focusKeywords: '', slug: '', canonicalUrl: '',
    latitude: '', longitude: '', visibilityRadiusKm: '',
    publishedAt: '',
    showRightColumn: true, isPluggedIn: false, featuredCategory: '',
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
          metaKeywords: a.metaKeywords || '', focusKeywords: a.focusKeywords || '', slug: a.slug || '', canonicalUrl: a.canonicalUrl || '',
          latitude: a.latitude || '', longitude: a.longitude || '',
          visibilityRadiusKm: a.visibilityRadiusKm || '',
          publishedAt: a.publishedAt ? a.publishedAt.substring(0, 16) : '',
          showRightColumn: a.showRightColumn !== false,
          isPluggedIn: a.isPluggedIn === true,
          featuredCategory: a.featuredCategory || '',
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
      // Reset subcategory when category changes
      setForm(prev => ({ ...prev, subcategoryId: '' }));
      // Load up to 200 subcategories to avoid pagination cutoff
      api.get(`/subcategories/getAllWeb?categoryId=${form.categoryId}&size=200`)
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

  // Dynamic Internal Linking Suggestions
  useEffect(() => {
    if (form.focusKeywords) {
      api.get('/articles')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data && Array.isArray(res.data.content) ? res.data.content : []);
          const matchKeywords = form.focusKeywords.toLowerCase().split(/[\s,]+/);
          const suggestions = list.filter(art => {
            if (art.id === parseInt(id)) return false;
            const title = ((art.titleEn || '') + ' ' + (art.titleTa || '')).toLowerCase();
            return matchKeywords.some(kw => kw.length > 2 && title.includes(kw));
          }).slice(0, 4);
          setLinkSuggestions(suggestions);
        })
        .catch(() => {});
    } else {
      setLinkSuggestions([]);
    }
  }, [form.focusKeywords, id]);

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
        const baseApi = api.defaults.baseURL || 'http://localhost:8080/api/v1';
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
          const serverBase = (api.defaults.baseURL || 'http://localhost:8080/api/v1')
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
          const serverBase = (api.defaults.baseURL || 'http://localhost:8080/api/v1')
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
        const serverBase = (api.defaults.baseURL || 'http://localhost:8080/api/v1')
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

  const generateAiSeoSuggestions = async () => {
    const textToAnalyze = form.contentTa || form.contentEn || form.titleTa;
    if (!textToAnalyze) {
      showMsg('Please write some content first to generate SEO suggestions.', true);
      return;
    }
    setAiSeoLoading(true);
    try {
      const [seoRes, headlinesRes, tagsRes] = await Promise.allSettled([
        api.post('/articles/ai-assist', { action: 'seo', text: textToAnalyze }),
        api.post('/articles/ai-assist', { action: 'headlines', text: form.titleTa || form.titleEn || textToAnalyze.substring(0, 100) }),
        api.post('/articles/ai-assist', { action: 'tags', text: textToAnalyze })
      ]);

      const suggestions = { titles: [], descriptions: [], tags: [] };

      if (seoRes.status === 'fulfilled' && seoRes.value.data?.result) {
        const lines = seoRes.value.data.result.split('\n');
        lines.forEach(line => {
          if (line.startsWith('SEO_TITLE:')) {
            suggestions.titles.push(line.replace('SEO_TITLE:', '').trim());
          } else if (line.startsWith('META_DESC:')) {
            suggestions.descriptions.push(line.replace('META_DESC:', '').trim());
          }
        });
      }

      if (headlinesRes.status === 'fulfilled' && headlinesRes.value.data?.result) {
        const lines = headlinesRes.value.data.result.split('\n');
        lines.forEach(line => {
          const cleaned = line.replace(/^\d+\.\s*/, '').trim();
          if (cleaned) {
            const parts = cleaned.split('|');
            const englishHeadline = parts[1] ? parts[1].trim() : parts[0].trim();
            suggestions.titles.push(englishHeadline);
          }
        });
      }

      if (tagsRes.status === 'fulfilled' && tagsRes.value.data?.result) {
        suggestions.tags = tagsRes.value.data.result
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0);
      }

      suggestions.titles = [...new Set(suggestions.titles)].filter(t => t.length > 0);
      if (suggestions.descriptions.length === 0) {
        suggestions.descriptions.push(textToAnalyze.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...');
      }

      setAiSeoSuggestions(suggestions);
      showMsg('Successfully generated AI SEO suggestions!');
    } catch (err) {
      showMsg('Failed to fetch AI recommendations.', true);
    } finally {
      setAiSeoLoading(false);
    }
  };

  // Auto-generate tags/keywords on entering SEO tab
  useEffect(() => {
    if (activeTab === 2 && !form.metaKeywords && (form.contentTa || form.contentEn)) {
      const autoGenTags = async () => {
        try {
          const res = await api.post('/articles/ai-assist', { 
            action: 'tags', 
            text: form.contentTa || form.contentEn 
          });
          if (res.data?.result) {
            const cleanedTags = res.data.result.split(',').map(s=>s.trim()).filter(s=>s).join(', ');
            set('metaKeywords', cleanedTags);
            showMsg('AI automatically generated keywords/tags for you!', false);
          }
        } catch (e) {
          console.warn('Auto-generation of keywords failed', e);
        }
      };
      autoGenTags();
    }
  }, [activeTab]);

  const autoFillSeoWithAi = async () => {
    const textToAnalyze = form.contentTa || form.contentEn || form.titleTa;
    if (!textToAnalyze) {
      showMsg('Please write some content first to generate SEO suggestions.', true);
      return;
    }
    setAiSeoLoading(true);
    try {
      const res = await api.post('/articles/ai-assist', { action: 'seo', text: textToAnalyze });
      if (res.data && res.data.result) {
        const lines = res.data.result.split('\n');
        let updates = {};
        lines.forEach(line => {
          if (line.startsWith('SEO_TITLE:')) {
            updates.metaTitle = line.replace('SEO_TITLE:', '').trim();
          } else if (line.startsWith('META_DESC:')) {
            updates.metaDescription = line.replace('META_DESC:', '').trim();
          } else if (line.startsWith('SLUG:')) {
            updates.slug = line.replace('SLUG:', '').trim();
          } else if (line.startsWith('KEYWORDS:')) {
            updates.focusKeywords = line.replace('KEYWORDS:', '').trim();
          } else if (line.startsWith('TAGS:')) {
            updates.metaKeywords = line.replace('TAGS:', '').trim();
          }
        });

        setForm(f => {
          const newForm = { ...f, ...updates };
          formRef.current = newForm;
          return newForm;
        });

        showMsg('✨ AI successfully auto-filled all 5 SEO fields!', false);
      } else {
        showMsg('AI returned invalid response.', true);
      }
    } catch (err) {
      showMsg('Failed to auto-fill SEO fields via AI.', true);
    } finally {
      setAiSeoLoading(false);
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
    if (!html) return { words: 0, chars: 0, readingTime: 0, readability: { score: 0, label: 'N/A', color: 'gray' } };
    const text = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200); // 200 words per minute avg

    const sentences = text.split(/[.!?]+/).length || 1;
    const syllables = text.length / 3; // rough estimate
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / (words || 1));
    const normalized = Math.max(0, Math.min(100, score));
    let readability = { score: Math.round(normalized), label: 'Difficult', color: '#EF4444' };
    if (normalized > 70) readability = { score: Math.round(normalized), label: 'Easy to Read', color: '#10B981' };
    else if (normalized > 50) readability = { score: Math.round(normalized), label: 'Standard', color: '#F59E0B' };

    return { words, chars, readingTime, readability };
  };

  const getDensity = () => {
    const kw = form.focusKeywords ? form.focusKeywords.trim().toLowerCase() : '';
    if (!kw) return { count: 0, percent: 0, status: 'Neutral', color: 'gray' };
    const text = ((form.contentTa || '') + ' ' + (form.contentEn || '')).toLowerCase();
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = words.length || 1;
    
    let count = 0;
    let pos = cleanText.indexOf(kw);
    while (pos !== -1) {
      count++;
      pos = cleanText.indexOf(kw, pos + kw.length);
    }
    
    const percent = parseFloat(((count / wordCount) * 100).toFixed(2));
    let status = 'Good';
    let color = '#10B981';
    if (percent < 0.5) {
      status = 'Too Low (<0.5%)';
      color = '#F59E0B';
    } else if (percent > 2.5) {
      status = 'Keyword Stuffing (>2.5%)';
      color = '#EF4444';
    }
    return { count, percent, status, color, wordCount };
  };

  const density = getDensity();

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
    color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const taStyle = { ...inputStyle, minHeight: '140px', resize: 'vertical', fontFamily: 'inherit' };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' };

  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const renderPipeline = () => {
    const steps = [
      { id: 'draft', label: 'Draft' },
      { id: 'pending', label: 'Review' },
      { id: 'published', label: 'Published' }
    ];
    let currentStepIdx = steps.findIndex(s => s.id === form.status);
    if (currentStepIdx === -1) currentStepIdx = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 2 }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: idx <= currentStepIdx ? 'var(--primary)' : 'var(--bg-secondary)',
                color: idx <= currentStepIdx ? '#fff' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 'bold', border: `2px solid ${idx <= currentStepIdx ? 'var(--primary)' : 'var(--border-color)'}`
              }}>
                {idx < currentStepIdx ? '✓' : idx + 1}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: idx <= currentStepIdx ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: '3px', background: idx < currentStepIdx ? 'var(--primary)' : 'var(--border-color)', margin: '0 -4px', alignSelf: 'center', marginBottom: '18px', zIndex: 1 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

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
                  <span style={{ color: calcStats(form.contentTa).readability.color, fontWeight: 600 }}>🧠 {calcStats(form.contentTa).readability.label}</span>
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
                  <span style={{ color: calcStats(form.contentEn).readability.color, fontWeight: 600 }}>🧠 {calcStats(form.contentEn).readability.label}</span>
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
              {/* AI SEO Assistant Widget */}
              <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(179, 115, 42, 0.08)', border: '1px solid var(--primary)', borderRadius: '10px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                  ✨ AI News SEO Assistant
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1rem 0' }}>
                  Analyze your article to automatically suggest titles, meta descriptions, and search tags.
                </p>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={autoFillSeoWithAi} disabled={aiSeoLoading} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {aiSeoLoading ? 'Auto-filling...' : '✨ One-Click AI Auto-Fill (All Fields)'}
                  </button>
                  <button onClick={generateAiSeoSuggestions} disabled={aiSeoLoading} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                    🔍 Generate & Suggest Options
                  </button>
                </div>

                {aiSeoSuggestions && (
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    {aiSeoSuggestions.titles && aiSeoSuggestions.titles.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>🎯 Suggested SEO Titles:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {aiSeoSuggestions.titles.map((t, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', gap: '1rem' }}>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>{t}</span>
                              <button onClick={() => { set('metaTitle', t); showMsg('Meta Title updated!'); }} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Use</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSeoSuggestions.descriptions && aiSeoSuggestions.descriptions.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>📝 Suggested Meta Descriptions:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {aiSeoSuggestions.descriptions.map((d, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', gap: '1rem' }}>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{d}</span>
                              <button onClick={() => { set('metaDescription', d); showMsg('Meta Description updated!'); }} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Use</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSeoSuggestions.tags && aiSeoSuggestions.tags.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>🏷️ Suggested Search Tags:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {aiSeoSuggestions.tags.map((tag, idx) => (
                            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '15px', border: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
                              <span>#{tag}</span>
                              <button onClick={() => {
                                const currentTags = form.metaKeywords ? form.metaKeywords.split(',').map(s=>s.trim()).filter(s=>s) : [];
                                if (!currentTags.includes(tag)) {
                                  const newTags = [...currentTags, tag].join(', ');
                                  set('metaKeywords', newTags);
                                  showMsg(`Added tag #${tag}`);
                                }
                              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: '0.8rem' }}>+</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Live Google Search Preview</label>
                <div style={{ padding: '1rem', background: document.documentElement.classList.contains('dark') ? '#202124' : '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 1px 6px rgba(32,33,36,.1)', width: '600px', maxWidth: '100%', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>K</div>
                    <div>
                      <div style={{ fontSize: '14px', color: document.documentElement.classList.contains('dark') ? '#dadce0' : '#202124', lineHeight: '1.2' }}>King 24x7</div>
                      <div style={{ fontSize: '12px', color: document.documentElement.classList.contains('dark') ? '#bdc1c6' : '#5f6368', lineHeight: '1.2' }}>https://king24x7.com › news › {form.slug || 'article-slug'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', color: document.documentElement.classList.contains('dark') ? '#8ab4f8' : '#1a0dab', textDecoration: 'none', marginBottom: '0.25rem', fontWeight: 400 }}>
                    {form.metaTitle || form.titleEn || form.titleTa || 'SEO Title Preview'}
                  </div>
                  <div style={{ fontSize: '14px', color: document.documentElement.classList.contains('dark') ? '#bdc1c6' : '#4d5156', lineHeight: '1.58' }}>
                    {form.metaDescription || 'Meta description preview will appear here. This gives users a summary of what they will find when they click the link in search results.'}
                  </div>
                </div>
              </div>
              
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
                <label style={labelStyle}>Focus Keywords</label>
                <input style={inputStyle} value={form.focusKeywords}
                  onChange={e => set('focusKeywords', e.target.value)} placeholder="e.g. புதிய இந்திய அணி, இளம் வீரர்கள்..." />
                {form.focusKeywords && (
                  <div style={{ marginTop: '0.75rem', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600 }}>Focus Keyword Density:</span>
                      <span style={{ color: density.color, fontWeight: 'bold' }}>{density.percent}% ({density.status})</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Found {density.count} occurrences in {density.wordCount} words. Target: 0.5% - 2.5%
                    </div>
                  </div>
                )}
                {linkSuggestions.length > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Suggested Internal Links:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {linkSuggestions.map(art => (
                        <div key={art.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px', color: 'var(--text-primary)' }}>
                            {art.titleEn || art.titleTa}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(`/news/${art.slug}`);
                              showMsg('Internal link copied to clipboard!');
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                          >
                            Copy Link
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <div style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ ...labelStyle, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  Layout & Featured Controls
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={form.showRightColumn}
                      onChange={e => set('showRightColumn', e.target.checked)} />
                    Show Right Sidebar (Ads & Widgets)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={form.isPluggedIn}
                      onChange={e => set('isPluggedIn', e.target.checked)} />
                    Plug into Homepage Top Banner
                  </label>
                  <div>
                    <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Featured Section Override (Optional)</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.featuredCategory} onChange={e => set('featuredCategory', e.target.value)}>
                      <option value="">None</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nameTa ? `${c.nameTa} / ${c.name}` : c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button 
              onClick={() => setMediaModalOpen(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px' }}
            >
              <Image size={18} /> Open Media Insert Library
            </button>
          </div>
        </div>

        {/* Media Assets Library Modal */}
        {mediaModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Image size={20} style={{ color: 'var(--primary)' }} /> Insert Media
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    Upload images & videos, then insert them into your article content.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div>
                    <label htmlFor="media-helper-upload" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                      <Plus size={14} /> Upload Files
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
                  <button onClick={() => setMediaModalOpen(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    Close
                  </button>
                </div>
              </div>

              {uploadProgress !== null && (
                <div style={{ width: '100%', background: 'var(--border-color)', height: '6px', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.2s' }} />
                </div>
              )}

              {mediaList.length === 0 ? (
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No media files available. Upload files to use them in the editor.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                  {mediaList.map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div style={{ height: '120px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {item.type.startsWith('image/') ? (
                          <img src={getPreviewUrl(item.url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Video size={32} style={{ color: '#fff' }} />
                        )}
                      </div>
                      <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                          {item.name}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button 
                              onClick={() => {
                                insertMediaIntoTinyMCE(item.url, item.type);
                                setMediaModalOpen(false);
                              }}
                              style={{ flex: 1, padding: '4px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Insert
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(item.url);
                                showMsg('URL copied to clipboard!');
                              }}
                              style={{ padding: '4px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              title="Copy Link"
                            >
                              <Copy size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if(window.confirm('Delete this media item?')) {
                                  setMediaList(mediaList.filter((_, i) => i !== idx));
                                }
                              }}
                              style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', color: '#EF4444' }}
                              title="Remove from list"
                            >
                              ✕
                            </button>
                          </div>
                          {item.type && item.type.startsWith('image/') && (
                            <button 
                              onClick={() => { set('imageUrl', item.url); showMsg('✅ Set as featured image!'); }}
                              style={{ width: '100%', padding: '6px', background: form.imageUrl === item.url ? '#10B981' : 'rgba(16,185,129,0.15)', color: form.imageUrl === item.url ? '#fff' : '#10B981', border: '1px solid #10B981', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
                              title="Set as Featured Image"
                            >
                              {form.imageUrl === item.url ? '✅ Featured Image' : '⭐ Set as Featured Image'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            {renderPipeline()}
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
                <option key={c.id} value={c.id} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                  {c.icon ? c.icon + ' ' : ''}{c.nameTa ? `${c.nameTa} / ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>Subcategory {!form.categoryId && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(select category first)</span>}</label>
            <select 
              style={{ ...inputStyle, cursor: form.categoryId ? 'pointer' : 'not-allowed', opacity: form.categoryId ? 1 : 0.5 }} 
              value={form.subcategoryId} 
              onChange={e => set('subcategoryId', e.target.value)}
              disabled={!form.categoryId}
            >
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>— Select Subcategory —</option>
              {subCategories.map(sc => (
                <option key={sc.subcategoryId} value={sc.subcategoryId} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                  {sc.nameTa ? `${sc.nameTa} / ${sc.name}` : sc.name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <label style={labelStyle}>District</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.districtId} onChange={e => set('districtId', e.target.value)}>
              <option value="" style={{ color: '#000000', backgroundColor: '#ffffff' }}>— Select District —</option>
              {districts.map(d => (
                <option key={d.id} value={d.id} style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                  {d.nameTa ? `${d.nameTa} / ${d.nameEn}` : d.nameEn}
                </option>
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
              <img src={getPreviewUrl(form.imageUrl)} alt="preview" onError={e => e.target.style.display = 'none'}
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
    );
};

export default NewsEditor;