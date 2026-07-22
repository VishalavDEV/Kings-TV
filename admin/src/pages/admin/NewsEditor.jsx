import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
  Save, ArrowLeft, Send, CheckCircle, MapPin, Image as ImageIcon, Video, Copy, Plus, 
  Sparkles, X, RefreshCw, Zap, Eye, UploadCloud, MessageSquare, Link as LinkIcon, 
  Check, AlertCircle, ChevronRight, Sliders, Globe, Search, Tag, FileText, Lock
} from 'lucide-react';
import ImageUploadPreview from '../../components/common/ImageUploadPreview';
import CategorySubcategorySelect from '../../components/common/CategorySubcategorySelect';
import DatePickerInput from '../../components/common/DatePickerInput';
import SuggestionField from '../../components/editor/SuggestionField';
import ArticlePreviewModal from '../../components/editor/ArticlePreviewModal';
import BulkUploadModal from '../../components/editor/BulkUploadModal';
import { useAuth } from '../../context/AuthContext';

// ── Gemini AI helper ─────────────────────────────────────────────────────────
export let activeAiConfig = {
  apiKey: '',
  apiUrl: '',
  model: 'gemini-2.0-flash'
};

export const getGeminiUrl = () => {
  const model = activeAiConfig.model || localStorage.getItem('ai.llm_model') || 'gemini-2.0-flash';
  const apiKey = activeAiConfig.apiKey || localStorage.getItem('ai.llm_api_key') || localStorage.getItem('ai_llm_api_key') || '';
  if (activeAiConfig.apiUrl) {
    return `${activeAiConfig.apiUrl}?key=${apiKey}`;
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
};

const callGemini = async (prompt) => {
  const apiKey = activeAiConfig.apiKey || localStorage.getItem('ai.llm_api_key') || localStorage.getItem('ai_llm_api_key') || '';
  const url = getGeminiUrl();
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['X-goog-api-key'] = apiKey;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let errorMsg = errorData?.error?.message || `HTTP ${res.status}`;
    if (res.status === 429) {
      errorMsg = 'Quota/Rate Limit Exceeded (HTTP 429). Please wait 60 seconds or generate a key on a project with free tier quota.';
    }
    console.error('Gemini API Error:', errorMsg);
    throw new Error(`Gemini ${res.status}: ${errorMsg}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
};

// ── Local Fallback Calculations ─────────────────────────────────────────────
const stripHtml = (html) => (html || '').replace(/<[^>]*>/gm, ' ').replace(/\s+/g, ' ').trim();

const clientSideAiFallback = (action, text, title = '') => {
  const cleanText = stripHtml(text || '');
  const cleanTitle = stripHtml(title || '');

  switch (action) {
    case 'headlines': {
      const base = cleanTitle || cleanText.substring(0, 60);
      return [
        base,
        `Breaking: ${base.substring(0, 55)}`,
        `Update: ${base.substring(0, 50)} — Latest Report`,
        `Exclusive: ${base.substring(0, 50)}`,
      ].filter(Boolean).join('\n');
    }
    case 'summarize': {
      const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      return sentences.slice(0, 3).map(s => s.trim()).join('. ') + (sentences.length > 3 ? '...' : '.');
    }
    case 'tags': {
      const words = cleanText.toLowerCase().split(/\s+/);
      const stopWords = new Set(['the','a','an','is','are','was','were','to','of','in','on','at','and','or','for','with','this','that','it']);
      const freq = {};
      words.forEach(w => {
        const clean = w.replace(/[^\w]/g, '');
        if (clean.length > 3 && !stopWords.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
      });
      return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w).join(', ');
    }
    case 'seo': {
      const title60 = cleanTitle.substring(0, 60) || cleanText.substring(0, 60);
      const desc = cleanText.substring(0, 155) + (cleanText.length > 155 ? '...' : '');
      const kws = clientSideAiFallback('tags', text);
      const slugBase = title60.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `SEO_TITLE:${title60}\nMETA_DESC:${desc}\nKEYWORDS:${kws}\nSLUG:${slugBase}\nTAGS:${kws}`;
    }
    case 'expand': {
      return `${cleanText}\n\n[Additional contextual detail: This report covers verified local updates and statements.]`;
    }
    case 'grammar': {
      return cleanText;
    }
    case 'translate': {
      return cleanText;
    }
    default:
      return cleanText;
  }
};

const calculateReadabilityScore = (text, isTamil) => {
  if (!text) return 0;
  const clean = stripHtml(text);
  const words = clean.split(/\s+/).filter(Boolean).length;
  const sentences = clean.split(/[.!?]+/).filter(Boolean).length || 1;
  const avgWordsPerSentence = words / sentences;
  if (isTamil) {
    if (avgWordsPerSentence < 8) return 90;
    if (avgWordsPerSentence < 14) return 75;
    if (avgWordsPerSentence < 20) return 60;
    return 45;
  } else {
    const chars = clean.replace(/\s+/g, '').length;
    const score = Math.round(206.835 - 1.015 * avgWordsPerSentence - 84.6 * (chars / (words || 1)));
    return Math.max(0, Math.min(100, score));
  }
};

const calculateSeoScore = (form) => {
  let score = 0;
  if (form.titleTa || form.titleEn) score += 20;
  if (form.metaTitle) score += 15;
  if (form.metaDescription) score += 15;
  if (form.metaKeywords) score += 15;
  if (form.focusKeywords) score += 15;
  if (form.slug) score += 10;
  if (form.imageUrl || form.featuredImage) score += 10;
  return Math.min(100, score);
};

const NewsEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form State
  const [form, setForm] = useState({
    titleTa: '',
    titleEn: '',
    contentTa: '',
    contentEn: '',
    shortDescTa: '',
    shortDescEn: '',
    categoryId: '',
    subcategoryId: '',
    districtId: '',
    constituency: '',
    imageUrl: '',
    featuredImage: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    focusKeywords: '',
    slug: '',
    canonicalUrl: '',
    authorName: user?.username || 'Kings TV Desk',
    reporterName: '',
    readabilityScore: '',
    seoScore: '',
    allowComments: true,
    allowPingbacks: true,
    originalLang: 'ta' // 'ta' | 'en'
  });

  // AI Pending Suggestions State (Suggest, Don't Overwrite)
  const [suggestions, setSuggestions] = useState({
    titleTa: '',
    titleEn: '',
    shortDescTa: '',
    shortDescEn: '',
    contentTa: '',
    contentEn: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    focusKeywords: '',
    slug: '',
    tags: ''
  });

  // UI Navigation & Controls
  const [activeTab, setActiveTab] = useState('ta'); // 'ta' | 'en'
  const [showSeoDrawer, setShowSeoDrawer] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // AI Controls State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPipelineStep, setAiPipelineStep] = useState(''); // '' | 'Analyzing' | 'Drafting' | 'Translating' | 'Optimizing SEO'
  const [aiPipelineProgress, setAiPipelineProgress] = useState(0);
  const [aiFallbackBanner, setAiFallbackBanner] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  // Categories & Districts List
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [reporters, setReporters] = useState([]);

  // Tag Input Chip State
  const [tagInput, setTagInput] = useState('');

  // Editor Ref for Selection-Aware Rewriting
  const textareaRef = useRef(null);

  // Load Article & Config Data
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data || [])).catch(() => {});
    api.get('/districts').then(r => setDistricts(r.data || [])).catch(() => {});

    api.get('/admin/users?role=MOBILE_JOURNALIST&size=100').then(r => {
      setReporters(r.data?.users || []);
    }).catch(() => {});

    api.get('/admin/config').then(res => {
      if (Array.isArray(res.data)) {
        res.data.forEach(item => {
          if (item.configKey === 'ai.llm_api_key' && item.configValue) activeAiConfig.apiKey = item.configValue;
          if (item.configKey === 'ai.llm_api_url' && item.configValue) activeAiConfig.apiUrl = item.configValue;
          if (item.configKey === 'ai.llm_model' && item.configValue) activeAiConfig.model = item.configValue;
        });
      }
    }).catch(() => {});

    if (id) {
      api.get(`/articles/${id}`).then(r => {
        if (r.data) {
          setForm(r.data);
          if (r.data.titleEn && !r.data.titleTa) setActiveTab('en');
        }
      }).catch(() => showMsg('Failed to load article', true));
    }
  }, [id]);

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 4000);
  };

  // Helper for Suggestion commit
  const handleUseSuggestion = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      updated.readabilityScore = calculateReadabilityScore(updated.contentTa || updated.contentEn, activeTab === 'ta');
      updated.seoScore = calculateSeoScore(updated);
      return updated;
    });
    setSuggestions(prev => ({ ...prev, [field]: '' }));
    showMsg(`Committed suggestion to ${field}`);
  };

  const handleDiscardSuggestion = (field) => {
    setSuggestions(prev => ({ ...prev, [field]: '' }));
  };

  const handleAcceptAllSuggestions = () => {
    setForm(prev => {
      const updated = { ...prev };
      Object.keys(suggestions).forEach(key => {
        if (suggestions[key]) {
          updated[key] = suggestions[key];
        }
      });
      updated.readabilityScore = calculateReadabilityScore(updated.contentTa || updated.contentEn, activeTab === 'ta');
      updated.seoScore = calculateSeoScore(updated);
      return updated;
    });
    setSuggestions({
      titleTa: '', titleEn: '', shortDescTa: '', shortDescEn: '',
      contentTa: '', contentEn: '', metaTitle: '', metaDescription: '',
      metaKeywords: '', focusKeywords: '', slug: '', tags: ''
    });
    showMsg('✨ Accepted all AI suggestions!');
  };

  // ── Flagship One-Click Action: Auto-Draft Full Article ─────────────────────
  const runAutoDraftPipeline = async () => {
    const rawContent = activeTab === 'ta' ? (form.contentTa || form.titleTa) : (form.contentEn || form.titleEn);
    if (!rawContent || !rawContent.trim()) {
      showMsg('Please enter some text, notes, or title first to auto-draft.', true);
      return;
    }

    setAiFallbackBanner(null);
    setAiPipelineStep('Analyzing source content...');
    setAiPipelineProgress(15);

    try {
      // Step 1: Detect & Clean Source Draft
      setAiPipelineStep('Drafting Title, Excerpt & Content...');
      setAiPipelineProgress(35);

      const draftPrompt = `Analyze this news content and format a clean news article in ${activeTab === 'ta' ? 'Tamil' : 'English'}.
Return EXACTLY in this JSON format:
{
  "title": "compelling headline under 60 chars",
  "shortDesc": "concise summary under 160 chars",
  "content": "detailed 3 paragraph HTML news content with <p> tags"
}
Content: "${stripHtml(rawContent)}"`;

      let parsedDraft = {};
      try {
        const rawRes = await callGemini(draftPrompt);
        parsedDraft = JSON.parse(rawRes.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsedDraft = {
          title: form.titleTa || form.titleEn || 'Breaking News',
          shortDesc: clientSideAiFallback('summarize', rawContent),
          content: `<p>${stripHtml(rawContent)}</p>`
        };
        setAiFallbackBanner("Running on backup analysis — Gemini credentials inactive or rate limited.");
      }

      // Step 2: Translate to counterpart language
      setAiPipelineStep('Translating to counterpart language...');
      setAiPipelineProgress(65);

      const translatePrompt = `Translate this news draft to ${activeTab === 'ta' ? 'English' : 'Tamil'}.
Return EXACTLY in this JSON format:
{
  "title": "translated headline",
  "shortDesc": "translated excerpt",
  "content": "translated HTML content with <p> tags"
}
Headline: "${parsedDraft.title}"
Excerpt: "${parsedDraft.shortDesc}"
Content: "${stripHtml(parsedDraft.content)}"`;

      let parsedTrans = {};
      try {
        const transRes = await callGemini(translatePrompt);
        parsedTrans = JSON.parse(transRes.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsedTrans = {
          title: parsedDraft.title,
          shortDesc: parsedDraft.shortDesc,
          content: parsedDraft.content
        };
      }

      // Step 3: Optimize SEO & Tags
      setAiPipelineStep('Optimizing SEO & Metadata...');
      setAiPipelineProgress(90);

      const seoPrompt = `Generate SEO fields for news headline "${parsedDraft.title}".
Return EXACTLY this JSON format:
{
  "metaTitle": "SEO title under 60 chars",
  "metaDescription": "Meta description under 155 chars",
  "metaKeywords": "comma separated keywords",
  "focusKeywords": "focus keyphrases",
  "slug": "url-slug-format",
  "tags": "news, local, update"
}`;

      let parsedSeo = {};
      try {
        const seoRes = await callGemini(seoPrompt);
        parsedSeo = JSON.parse(seoRes.replace(/```json|```/g, '').trim());
      } catch (e) {
        const fallbackRaw = clientSideAiFallback('seo', rawContent, parsedDraft.title);
        parsedSeo = {
          metaTitle: parsedDraft.title.substring(0, 60),
          metaDescription: parsedDraft.shortDesc.substring(0, 155),
          metaKeywords: 'news, Tamil, update',
          focusKeywords: 'breaking news',
          slug: parsedDraft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tags: 'news, update'
        };
      }

      // Populate as "Suggest, don't overwrite" pending suggestions
      setSuggestions({
        titleTa: activeTab === 'ta' ? parsedDraft.title : parsedTrans.title,
        titleEn: activeTab === 'en' ? parsedDraft.title : parsedTrans.title,
        shortDescTa: activeTab === 'ta' ? parsedDraft.shortDesc : parsedTrans.shortDesc,
        shortDescEn: activeTab === 'en' ? parsedDraft.shortDesc : parsedTrans.shortDesc,
        contentTa: activeTab === 'ta' ? parsedDraft.content : parsedTrans.content,
        contentEn: activeTab === 'en' ? parsedDraft.content : parsedTrans.content,
        metaTitle: parsedSeo.metaTitle,
        metaDescription: parsedSeo.metaDescription,
        metaKeywords: parsedSeo.metaKeywords,
        focusKeywords: parsedSeo.focusKeywords,
        slug: parsedSeo.slug,
        tags: parsedSeo.tags
      });

      setAiPipelineProgress(100);
      showMsg('✨ Auto-Draft completed! Review & click Use or Accept All.');
    } catch (err) {
      showMsg(`Auto-Draft error: ${err.message}`, true);
    } finally {
      setTimeout(() => {
        setAiPipelineStep('');
        setAiPipelineProgress(0);
      }, 1000);
    }
  };

  // ── One-Click Single Field Translation ────────────────────────────────────
  const handleTranslateField = async (fieldKey, text, targetLang) => {
    if (!text || !text.trim()) {
      showMsg('Field is empty to translate', true);
      return;
    }
    showMsg(`Translating ${fieldKey}...`);
    try {
      const prompt = `Translate this text accurately into ${targetLang === 'en' ? 'English' : 'Tamil'}. Return ONLY the translated string:\n\n"${stripHtml(text)}"`;
      const res = await callGemini(prompt);
      const targetField = fieldKey.replace(/Ta$/, 'En').replace(/En$/, targetLang === 'en' ? 'En' : 'Ta');
      setSuggestions(prev => ({ ...prev, [targetField]: res }));
      showMsg(`Generated ${targetLang.toUpperCase()} suggestion for ${fieldKey}`);
    } catch (err) {
      const fallback = clientSideAiFallback('translate', text);
      const targetField = fieldKey.replace(/Ta$/, 'En').replace(/En$/, targetLang === 'en' ? 'En' : 'Ta');
      setSuggestions(prev => ({ ...prev, [targetField]: fallback }));
    }
  };

  // ── Selection-Aware Content Editor Actions ────────────────────────────────
  const handleSelectionRewrite = async (actionType) => {
    const textToUse = form[activeTab === 'ta' ? 'contentTa' : 'contentEn'];
    if (!textToUse || !textToUse.trim()) {
      showMsg('Write some content first to rephrase/expand/summarize.', true);
      return;
    }

    showMsg(`Running ${actionType}...`);
    try {
      let prompt = '';
      if (actionType === 'summarize') prompt = `Summarize this news text in 2-3 concise paragraphs: "${stripHtml(textToUse)}"`;
      else if (actionType === 'expand') prompt = `Expand this news text professionally into a detailed, factual 4-paragraph report: "${stripHtml(textToUse)}"`;
      else if (actionType === 'rephrase') prompt = `Rephrase this news text keeping the exact same meaning and facts: "${stripHtml(textToUse)}"`;
      
      const res = await callGemini(prompt);
      const targetField = activeTab === 'ta' ? 'contentTa' : 'contentEn';
      setSuggestions(prev => ({ ...prev, [targetField]: `<p>${res.replace(/\n\n/g, '</p><p>')}</p>` }));
      showMsg(`Generated ${actionType} suggestion!`);
    } catch (err) {
      const fallback = clientSideAiFallback(actionType, textToUse);
      const targetField = activeTab === 'ta' ? 'contentTa' : 'contentEn';
      setSuggestions(prev => ({ ...prev, [targetField]: `<p>${fallback.replace(/\n\n/g, '</p><p>')}</p>` }));
    }
  };

  // ── Save Article Handler ──────────────────────────────────────────────────
  const handleSave = async (statusOverride) => {
    if (!form.titleTa && !form.titleEn) {
      showMsg('Please provide a title in Tamil or English', true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status || 'draft',
        imageUrl: form.imageUrl || form.featuredImage,
        featuredImage: form.imageUrl || form.featuredImage,
        readabilityScore: calculateReadabilityScore(form.contentTa || form.contentEn, activeTab === 'ta'),
        seoScore: calculateSeoScore(form)
      };

      let res;
      if (form.id) {
        res = await api.put('/articles/saveUpdate', payload);
      } else {
        res = await api.post('/articles/saveUpdate', payload);
      }

      setForm(res.data);
      showMsg(`Article ${res.data.status} successfully!`);
      if (!form.id && res.data?.id) {
        navigate(`/admin/editor/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to save article', true);
    } finally {
      setSaving(false);
    }
  };

  // Check if any suggestions are pending
  const hasPendingSuggestions = Object.values(suggestions).some(Boolean);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* ── 1. Header & Status Stepper ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1.25rem', background: 'var(--bg-secondary, #ffffff)',
        borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-color, #e2e8f0)',
        marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.6rem' }}
            onClick={() => navigate('/admin/articles')}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {form.titleTa || form.titleEn || 'Create Article'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {form.id ? `Editing Article #${form.id}` : 'New Bilingual Draft'}
            </div>
          </div>
        </div>

        {/* Stepper & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary, #f1f5f9)', borderRadius: '20px', padding: '3px 8px' }}>
            {['draft', 'review', 'published'].map((st, idx) => (
              <React.Fragment key={st}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '14px',
                  background: (form.status || 'draft') === st ? '#0057FF' : 'transparent',
                  color: (form.status || 'draft') === st ? '#ffffff' : 'var(--text-muted)',
                  textTransform: 'capitalize'
                }}>
                  {st}
                </span>
                {idx < 2 && <ChevronRight size={12} style={{ color: 'var(--text-muted)', margin: '0 2px' }} />}
              </React.Fragment>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={() => setShowPreviewModal(true)}>
            <Eye size={15} /> Live Preview
          </button>

          <button className="btn btn-secondary" disabled={saving} onClick={() => handleSave('draft')}>
            <Save size={15} /> Save Draft
          </button>

          <button 
            className="btn btn-primary" 
            disabled={saving} 
            onClick={() => handleSave('published')}
            style={{ background: '#0057FF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {saving ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
            {form.status === 'published' ? 'Update Published' : 'Publish Article'}
          </button>
        </div>
      </div>

      {/* ── 2. Global AI Toolbar ───────────────────────────────────────────── */}
      <div style={{
        padding: '0.85rem 1.25rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)',
        borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} /> AI NEWSROOM TOOLBAR
          </span>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} />
            AI Enabled
          </label>

          <button 
            className="btn btn-secondary"
            onClick={() => setShowBulkUploadModal(true)}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <UploadCloud size={14} /> Bulk Upload Queue
          </button>
        </div>

        {/* AI Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {hasPendingSuggestions && (
            <button
              onClick={handleAcceptAllSuggestions}
              style={{
                padding: '0.4rem 0.85rem', borderRadius: '20px', background: '#16a34a', color: '#fff',
                border: 'none', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              <CheckCircle size={14} /> Accept All Suggestions
            </button>
          )}

          <button
            onClick={runAutoDraftPipeline}
            disabled={!aiEnabled || !!aiPipelineStep}
            style={{
              padding: '0.4rem 0.95rem', borderRadius: '20px', background: '#f59e0b', color: '#fff',
              border: 'none', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: '0 2px 4px rgba(245,158,11,0.3)'
            }}
          >
            {aiPipelineStep ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
            Auto-Draft Full Article
          </button>
        </div>
      </div>

      {/* Progress Bar for Multi-Step AI Pipeline */}
      {aiPipelineStep && (
        <div style={{ marginBottom: '1.25rem', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', padding: '0.6rem 1rem', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#b45309', marginBottom: '0.3rem' }}>
            <span>{aiPipelineStep}</span>
            <span>{aiPipelineProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(245,158,11,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${aiPipelineProgress}%`, height: '100%', background: '#f59e0b', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Fallback Warning Banner */}
      {aiFallbackBanner && (
        <div style={{ marginBottom: '1.25rem', padding: '0.65rem 1rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.82rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>ℹ️ {aiFallbackBanner}</span>
          <button onClick={() => setAiFallbackBanner(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8' }}><X size={14} /></button>
        </div>
      )}

      {/* Toast Alert */}
      {msg && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '8px', background: msg.isError ? '#ef4444' : '#0f172a',
          color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {msg.isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {msg.text}
        </div>
      )}

      {/* ── 3. Main 3-Column Layout ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* Left/Center Column: Language Tabbed Editors */}
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* Language Switcher Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('ta')}
                  style={{
                    padding: '0.45rem 1.1rem', borderRadius: '6px', border: 'none',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: activeTab === 'ta' ? '#0057FF' : 'var(--bg-secondary, #f1f5f9)',
                    color: activeTab === 'ta' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  🇮🇳 தமிழ் (Tamil)
                  {form.originalLang === 'ta' && <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)' }}>Original</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  style={{
                    padding: '0.45rem 1.1rem', borderRadius: '6px', border: 'none',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: activeTab === 'en' ? '#0057FF' : 'var(--bg-secondary, #f1f5f9)',
                    color: activeTab === 'en' ? '#ffffff' : 'var(--text-secondary)'
                  }}
                >
                  🌐 English
                  {form.originalLang === 'en' && <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)' }}>Original</span>}
                </button>
              </div>

              {/* Per-field Translate button */}
              <button
                type="button"
                onClick={() => handleTranslateField(activeTab === 'ta' ? 'contentTa' : 'contentEn', form[activeTab === 'ta' ? 'contentTa' : 'contentEn'], activeTab === 'ta' ? 'en' : 'ta')}
                style={{ fontSize: '0.78rem', color: '#0057FF', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Globe size={14} /> Translate this tab to {activeTab === 'ta' ? 'English' : 'Tamil'} →
              </button>
            </div>

            {/* Title Field */}
            <SuggestionField
              label={activeTab === 'ta' ? 'செய்தி தலைப்பு (Tamil Title)' : 'Article Title (English)'}
              value={activeTab === 'ta' ? form.titleTa : form.titleEn}
              suggestion={activeTab === 'ta' ? suggestions.titleTa : suggestions.titleEn}
              onChange={(val) => setForm(f => ({ ...f, [activeTab === 'ta' ? 'titleTa' : 'titleEn']: val }))}
              onUseSuggestion={(val) => handleUseSuggestion(activeTab === 'ta' ? 'titleTa' : 'titleEn', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion(activeTab === 'ta' ? 'titleTa' : 'titleEn')}
              placeholder={activeTab === 'ta' ? 'தலைப்பை உள்ளிடவும்...' : 'Enter article title...'}
              required
            />

            {/* Short Description / Excerpt Field */}
            <SuggestionField
              label={activeTab === 'ta' ? 'சுருக்கமான விளக்கம் (Short Description)' : 'Short Excerpt (English)'}
              value={activeTab === 'ta' ? form.shortDescTa : form.shortDescEn}
              suggestion={activeTab === 'ta' ? suggestions.shortDescTa : suggestions.shortDescEn}
              onChange={(val) => setForm(f => ({ ...f, [activeTab === 'ta' ? 'shortDescTa' : 'shortDescEn']: val }))}
              onUseSuggestion={(val) => handleUseSuggestion(activeTab === 'ta' ? 'shortDescTa' : 'shortDescEn', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion(activeTab === 'ta' ? 'shortDescTa' : 'shortDescEn')}
              multiline
              rows={2}
              placeholder={activeTab === 'ta' ? 'சுருக்கத்தை உள்ளிடவும்...' : 'Brief summary for listing cards...'}
            />

            {/* Selection-Aware Content Editor Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', background: 'var(--bg-secondary, #f8fafc)', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Content Editor</span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleSelectionRewrite('summarize')}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
                >
                  Summarize
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectionRewrite('expand')}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
                >
                  Expand
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectionRewrite('rephrase')}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
                >
                  Rephrase
                </button>
              </div>
            </div>

            {/* Content Textarea */}
            <SuggestionField
              label=""
              value={activeTab === 'ta' ? form.contentTa : form.contentEn}
              suggestion={activeTab === 'ta' ? suggestions.contentTa : suggestions.contentEn}
              onChange={(val) => setForm(f => ({ ...f, [activeTab === 'ta' ? 'contentTa' : 'contentEn']: val }))}
              onUseSuggestion={(val) => handleUseSuggestion(activeTab === 'ta' ? 'contentTa' : 'contentEn', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion(activeTab === 'ta' ? 'contentTa' : 'contentEn')}
              multiline
              rows={14}
              placeholder={activeTab === 'ta' ? 'செய்தி விவரங்களை இங்கு எழுதவும்...' : 'Write full article body content here...'}
            />

            {/* Live Stats Bar */}
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
              <span>Words: <strong>{stripHtml(activeTab === 'ta' ? form.contentTa : form.contentEn).split(/\s+/).filter(Boolean).length}</strong></span>
              <span>Characters: <strong>{stripHtml(activeTab === 'ta' ? form.contentTa : form.contentEn).length}</strong></span>
              <span>Read Time: <strong>{Math.ceil(stripHtml(activeTab === 'ta' ? form.contentTa : form.contentEn).split(/\s+/).filter(Boolean).length / 200)} min</strong></span>
              <span>Readability: <strong>{calculateReadabilityScore(form.contentTa || form.contentEn, activeTab === 'ta')}/100</strong></span>
            </div>

          </div>
        </div>

        {/* Right Column: Persistent Metadata Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* SEO Quick Gauge Badge */}
          <div className="card" style={{ padding: '1rem', background: 'var(--bg-secondary, #f8fafc)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Search size={14} /> SEO & Optimization
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '12px', background: calculateSeoScore(form) >= 70 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: calculateSeoScore(form) >= 70 ? '#16a34a' : '#d97706' }}>
                {calculateSeoScore(form)}/100
              </span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={() => setShowSeoDrawer(!showSeoDrawer)}
            >
              <Sliders size={14} /> {showSeoDrawer ? 'Hide SEO Drawer' : 'Open Full SEO Panel'}
            </button>
          </div>

          {/* Category & Location Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>Category & Regional Placement</h4>
            
            <CategorySubcategorySelect
              categoryId={form.categoryId}
              subcategoryId={form.subcategoryId}
              onChange={({ categoryId, subcategoryId }) => setForm(f => ({ ...f, categoryId, subcategoryId }))}
            />

            <div style={{ marginTop: '0.85rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>District</label>
              <select
                className="form-control"
                value={form.districtId || ''}
                onChange={(e) => setForm(f => ({ ...f, districtId: e.target.value }))}
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
              >
                <option value="">-- All Tamil Nadu --</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameEn} ({d.nameTa})</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '0.85rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Constituency / Local Area</label>
              <input
                type="text"
                className="form-control"
                value={form.constituency || ''}
                onChange={(e) => setForm(f => ({ ...f, constituency: e.target.value }))}
                placeholder="e.g., Royapuram, Harbour"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>Featured Media Image</h4>
            <ImageUploadPreview
              imageUrl={form.imageUrl || form.featuredImage}
              onImageUploaded={(url) => setForm(f => ({ ...f, imageUrl: url, featuredImage: url }))}
            />
          </div>

          {/* Discussion Settings Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={15} /> Discussion Settings
            </h4>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <span>Allow comments on article</span>
              <input
                type="checkbox"
                checked={form.allowComments !== false}
                onChange={(e) => setForm(f => ({ ...f, allowComments: e.target.checked }))}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', cursor: 'pointer' }}>
              <span>Allow pingbacks & trackbacks</span>
              <input
                type="checkbox"
                checked={form.allowPingbacks !== false}
                onChange={(e) => setForm(f => ({ ...f, allowPingbacks: e.target.checked }))}
              />
            </label>
          </div>

        </div>
      </div>

      {/* ── 4. SEO Slide-Over Drawer ───────────────────────────────────────── */}
      {showSeoDrawer && (
        <div className="card" style={{ marginTop: '1.25rem', padding: '1.5rem', border: '2px solid #0057FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={18} style={{ color: '#0057FF' }} /> Complete SEO & Google News Optimization
            </h3>
            <button onClick={() => setShowSeoDrawer(false)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}><X size={16} /></button>
          </div>

          {/* Google Live SERP Preview */}
          <div style={{ padding: '1rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.72rem', color: '#4d5156', marginBottom: '0.2rem' }}>https://king-tv.test-technoprint.online › article › {form.slug || 'url-slug'}</div>
            <div style={{ fontSize: '1.1rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.2rem' }}>
              {form.metaTitle || form.titleTa || form.titleEn || 'Headline Preview | KING 24x7'}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#4d5156', lineHeight: 1.5 }}>
              {form.metaDescription || form.shortDescTa || form.shortDescEn || 'Meta description snippet as it will appear in Google search results...'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <SuggestionField
              label="SEO Title"
              value={form.metaTitle}
              suggestion={suggestions.metaTitle}
              onChange={(val) => setForm(f => ({ ...f, metaTitle: val }))}
              onUseSuggestion={(val) => handleUseSuggestion('metaTitle', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion('metaTitle')}
              placeholder="Primary headline for search engines..."
            />

            <SuggestionField
              label="URL Slug"
              value={form.slug}
              suggestion={suggestions.slug}
              onChange={(val) => setForm(f => ({ ...f, slug: val }))}
              onUseSuggestion={(val) => handleUseSuggestion('slug', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion('slug')}
              placeholder="e.g. chennai-news-update"
            />
          </div>

          <SuggestionField
            label="Meta Description"
            value={form.metaDescription}
            suggestion={suggestions.metaDescription}
            onChange={(val) => setForm(f => ({ ...f, metaDescription: val }))}
            onUseSuggestion={(val) => handleUseSuggestion('metaDescription', val)}
            onDiscardSuggestion={() => handleDiscardSuggestion('metaDescription')}
            multiline
            rows={2}
            placeholder="Search snippet summary under 155 characters..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <SuggestionField
              label="Meta Keywords"
              value={form.metaKeywords}
              suggestion={suggestions.metaKeywords}
              onChange={(val) => setForm(f => ({ ...f, metaKeywords: val }))}
              onUseSuggestion={(val) => handleUseSuggestion('metaKeywords', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion('metaKeywords')}
              placeholder="news, tamil, chennai"
            />

            <SuggestionField
              label="Focus Keyphrases"
              value={form.focusKeywords}
              suggestion={suggestions.focusKeywords}
              onChange={(val) => setForm(f => ({ ...f, focusKeywords: val }))}
              onUseSuggestion={(val) => handleUseSuggestion('focusKeywords', val)}
              onDiscardSuggestion={() => handleDiscardSuggestion('focusKeywords')}
              placeholder="primary target keywords"
            />
          </div>
        </div>
      )}

      {/* ── 5. Modals ──────────────────────────────────────────────────────── */}
      {showPreviewModal && (
        <ArticlePreviewModal
          form={form}
          categories={categories}
          districts={districts}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showBulkUploadModal && (
        <BulkUploadModal
          onClose={() => setShowBulkUploadModal(false)}
          onBatchDraftsCreated={(drafts) => {
            showMsg(`Batch created ${drafts.length} draft articles!`);
            setShowBulkUploadModal(false);
          }}
        />
      )}

    </div>
  );
};

export default NewsEditor;