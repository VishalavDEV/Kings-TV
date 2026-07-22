import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { Cpu, Send, RefreshCw, Check, Trash2, HelpCircle } from 'lucide-react';

const AiContentRewriter = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [style, setStyle] = useState('summarize');
  const [translationDirection, setTranslationDirection] = useState('en2ta');
  const [customTone, setCustomTone] = useState('professional');
  const [suggestedText, setSuggestedText] = useState('');
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

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
      return;
    }
    const art = articles.find(a => a.id === parseInt(id) || a.articleId === parseInt(id));
    if (art) {
      setOriginalText(art.content || art.summary || '');
    }
  };

  const handleGenerate = async () => {
    if (!originalText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please select an article or type some text first.' });
      return;
    }

    setGenerating(true);
    setStatusMsg({ type: '', text: '' });
    setSuggestedText('');

    let requestStyle = style;
    if (style === 'translate') {
      requestStyle = `translate (${translationDirection === 'en2ta' ? 'English to Tamil' : 'Tamil to English'})`;
    } else if (style === 'change-tone') {
      requestStyle = `change tone to ${customTone}`;
    }

    try {
      const res = await api.post('/api/admin/ai/rewrite', {
        content: originalText,
        style: requestStyle
      });
      setSuggestedText(res.data.suggestion || '');
      setStatusMsg({ type: 'success', text: 'AI rewrite suggestion generated successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to generate AI rewrite. Please check prompt settings.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (!suggestedText) return;
    setOriginalText(suggestedText);
    setSuggestedText('');
    setStatusMsg({ type: 'success', text: 'Suggestion applied to the working text!' });
  };

  const handleDiscard = () => {
    setSuggestedText('');
    setStatusMsg({ type: 'info', text: 'AI suggestion discarded.' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Cpu className="text-[#B3732A]" />
          AI Content Rewriter
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select or paste article content, choose an optimization style, and generate dynamic rephrase suggestions.
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

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
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

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Rewrite Style Preset</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
          >
            <option value="summarize">Summarize (Concise Teaser)</option>
            <option value="simplify">Simplify (Easy Readability)</option>
            <option value="expand">Expand (Add context/details)</option>
            <option value="translate">Translate Language</option>
            <option value="change-tone">Change Narrative Tone</option>
          </select>
        </div>

        <div className="flex gap-2">
          {style === 'translate' && (
            <div className="flex-1">
              <select
                value={translationDirection}
                onChange={(e) => setTranslationDirection(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
              >
                <option value="en2ta">English → Tamil</option>
                <option value="ta2en">Tamil → English</option>
              </select>
            </div>
          )}

          {style === 'change-tone' && (
            <div className="flex-1">
              <select
                value={customTone}
                onChange={(e) => setCustomTone(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#B3732A] transition-colors"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
                <option value="humorous">Humorous</option>
                <option value="authoritative">Authoritative</option>
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#B3732A] hover:bg-[#965e20] rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {generating ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
            {generating ? 'Processing...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Workspace Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Text Pane */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[450px]">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm font-semibold text-gray-700">
            <span>Original Working Draft</span>
            <span className="text-[10px] text-gray-400 font-mono">{originalText.length} characters</span>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Type or paste content here..."
            className="flex-1 p-4 text-sm focus:outline-none resize-none"
          />
        </div>

        {/* Suggested Text Pane */}
        <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[450px]">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm font-semibold text-gray-700">
            <span>AI Suggested Rephrase</span>
            {suggestedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                >
                  <Check size={11} />
                  Apply
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
          {generating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2">
              <RefreshCw className="animate-spin text-[#B3732A]" size={28} />
              <span className="text-xs">Generating rewritten copy...</span>
            </div>
          ) : suggestedText ? (
            <div className="flex-1 p-4 text-sm overflow-y-auto whitespace-pre-wrap text-gray-800 bg-amber-50/10">
              {suggestedText}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center text-xs space-y-1">
              <Cpu size={32} />
              <span>No suggestion generated yet.</span>
              <span>Select rewrite options above and click Generate.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiContentRewriter;
