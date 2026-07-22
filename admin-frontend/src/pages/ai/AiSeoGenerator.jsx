import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Cpu, Send, RefreshCw, Check, Trash2, HelpCircle, FileText, ArrowRight } from 'lucide-react';

const AiSeoGenerator = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Fields
  const [originalSeo, setOriginalSeo] = useState({
    title: '',
    description: '',
    slug: '',
    keywords: '',
    tags: ''
  });

  const [suggestedSeo, setSuggestedSeo] = useState({
    title: '',
    description: '',
    slug: '',
    keywords: '',
    tags: ''
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const res = await api.get('/api/admin/articles?size=50');
      if (res.data && res.data.content) {
        setArticles(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load articles', err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleArticleSelect = (e) => {
    const id = e.target.value;
    setSelectedArticleId(id);
    if (!id) {
      setOriginalText('');
      setOriginalSeo({ title: '', description: '', slug: '', keywords: '', tags: '' });
      return;
    }
    const art = articles.find(a => a.id === parseInt(id) || a.articleId === parseInt(id));
    if (art) {
      setOriginalText(art.content || '');
      setOriginalSeo({
        title: art.titleEn || art.title || '',
        description: art.summary || art.metaDescription || '',
        slug: art.slug || '',
        keywords: art.focusKeywords || '',
        tags: art.tags || ''
      });
    }
  };

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please select an article or type some text first.' });
      return;
    }

    setGenerating(true);
    setStatusMsg({ type: '', text: '' });
    setSuggestedSeo({ title: '', description: '', slug: '', keywords: '', tags: '' });

    try {
      const res = await api.post('/api/admin/ai/seo-generate', {
        content: originalText
      });
      setSuggestedSeo({
        title: res.data.title || '',
        description: res.data.description || '',
        slug: res.data.slug || '',
        keywords: res.data.keywords || '',
        tags: res.data.tags || ''
      });
      setStatusMsg({ type: 'success', text: 'AI SEO metadata suggestions generated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to generate SEO suggestions. Check prompt settings.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyField = (field) => {
    if (!suggestedSeo[field]) return;
    setOriginalSeo(prev => ({
      ...prev,
      [field]: suggestedSeo[field]
    }));
    // Clear suggested field to denote action completed
    setSuggestedSeo(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleApplyAll = () => {
    setOriginalSeo({
      title: suggestedSeo.title || originalSeo.title,
      description: suggestedSeo.description || originalSeo.description,
      slug: suggestedSeo.slug || originalSeo.slug,
      keywords: suggestedSeo.keywords || originalSeo.keywords,
      tags: suggestedSeo.tags || originalSeo.tags
    });
    setSuggestedSeo({ title: '', description: '', slug: '', keywords: '', tags: '' });
    setStatusMsg({ type: 'success', text: 'All AI SEO suggested parameters applied!' });
  };

  const handleDiscard = () => {
    setSuggestedSeo({ title: '', description: '', slug: '', keywords: '', tags: '' });
    setStatusMsg({ type: 'info', text: 'SEO suggestions discarded.' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Cpu className="text-[#B3732A]" />
          AI SEO Generator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, generate, and fine-tune SEO meta titles, meta descriptions, slugs, keywords, and tags.
        </p>
      </div>

      {statusMsg.text && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          statusMsg.type === 'error' ? 'bg-red-50 text-red-700' :
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
        }`}>
          <HelpCircle size={16} />
          {statusMsg.text}
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Load Existing Article</label>
          <select
            value={selectedArticleId}
            onChange={handleArticleSelect}
            disabled={loadingArticles}
            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
          >
            <option value="">-- Paste Custom Text / Select Article --</option>
            {articles.map(art => (
              <option key={art.id || art.articleId} value={art.id || art.articleId}>
                {art.titleEn || art.title || 'Untitled'} ({art.language})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !originalText}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-[#B3732A] hover:bg-[#965e20] rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {generating ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
          {generating ? 'Processing...' : 'Generate SEO Tags'}
        </button>
      </div>

      {/* Side-By-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working copy fields */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText size={16} className="text-gray-400" />
            <span>Active SEO Settings</span>
          </div>
          <div className="p-5 space-y-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">SEO Title</label>
              <input
                type="text"
                value={originalSeo.title}
                onChange={(e) => setOriginalSeo({ ...originalSeo, title: e.target.value })}
                placeholder="Meta title..."
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={originalSeo.description}
                onChange={(e) => setOriginalSeo({ ...originalSeo, description: e.target.value })}
                placeholder="Brief content snippet..."
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">URL Slug</label>
              <input
                type="text"
                value={originalSeo.slug}
                onChange={(e) => setOriginalSeo({ ...originalSeo, slug: e.target.value })}
                placeholder="url-friendly-hyphen-slug"
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Focus Keywords</label>
              <input
                type="text"
                value={originalSeo.keywords}
                onChange={(e) => setOriginalSeo({ ...originalSeo, keywords: e.target.value })}
                placeholder="keywords, comma, separated"
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tags</label>
              <input
                type="text"
                value={originalSeo.tags}
                onChange={(e) => setOriginalSeo({ ...originalSeo, tags: e.target.value })}
                placeholder="tag, comma, separated"
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* AI Suggested pane */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-2">
              <Cpu size={16} className="text-[#B3732A]" />
              Suggested SEO Values
            </span>
            {Object.values(suggestedSeo).some(Boolean) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyAll}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  <Check size={11} />
                  Apply All
                </button>
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Trash2 size={11} />
                  Discard
                </button>
              </div>
            )}
          </div>
          <div className="p-5 space-y-4 flex-1 bg-amber-50/5">
            {generating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-20">
                <RefreshCw className="animate-spin text-[#B3732A]" size={28} />
                <span className="text-xs">Generating suggested metadata...</span>
              </div>
            ) : Object.values(suggestedSeo).some(Boolean) ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">Suggested Title</span>
                    {suggestedSeo.title && (
                      <button
                        onClick={() => handleApplyField('title')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                      >
                        Apply <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-2 border border-dashed border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                    {suggestedSeo.title || <span className="text-gray-400 italic">No suggestion</span>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">Suggested Meta Description</span>
                    {suggestedSeo.description && (
                      <button
                        onClick={() => handleApplyField('description')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                      >
                        Apply <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-2 border border-dashed border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 whitespace-pre-wrap">
                    {suggestedSeo.description || <span className="text-gray-400 italic">No suggestion</span>}
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">Suggested Slug</span>
                    {suggestedSeo.slug && (
                      <button
                        onClick={() => handleApplyField('slug')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                      >
                        Apply <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-2 border border-dashed border-gray-200 rounded-lg text-xs font-mono bg-gray-50 text-gray-700">
                    {suggestedSeo.slug || <span className="text-gray-400 italic">No suggestion</span>}
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">Suggested Keywords</span>
                    {suggestedSeo.keywords && (
                      <button
                        onClick={() => handleApplyField('keywords')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                      >
                        Apply <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-2 border border-dashed border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                    {suggestedSeo.keywords || <span className="text-gray-400 italic">No suggestion</span>}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500">Suggested Tags</span>
                    {suggestedSeo.tags && (
                      <button
                        onClick={() => handleApplyField('tags')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5"
                      >
                        Apply <ArrowRight size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-2 border border-dashed border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                    {suggestedSeo.tags || <span className="text-gray-400 italic">No suggestion</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 p-8 text-center text-xs space-y-1 py-20">
                <Cpu size={32} />
                <span>No suggestions generated yet.</span>
                <span>Select an article or paste text, then click Generate.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSeoGenerator;
