import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { Cpu, Send, RefreshCw, Check } from 'lucide-react';

const AiInlineAssistant = ({ draftContent, onApplyHeadline, onApplyTags }) => {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const val = localStorage.getItem('ai_inline_assistant_enabled');
    setEnabled(val !== 'false');
  }, []);

  if (!enabled) return null;

  const handleSuggest = async () => {
    if (!draftContent || !draftContent.trim() || draftContent.replace(/<[^>]*>/g, '').trim().length < 10) {
      setError('Please write at least a few sentences in the editor first.');
      return;
    }

    setLoading(true);
    setError('');
    setHeadlines([]);
    setTags([]);

    try {
      const res = await api.post('/api/admin/ai/suggestions', {
        content: draftContent.replace(/<[^>]*>/g, '') // strip html tags
      });
      setHeadlines(res.data.headlines || []);
      setTags(res.data.tags || []);
    } catch (err) {
      setError('Failed to fetch suggestions from AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50/20 border border-amber-200/60 rounded-xl p-4 space-y-3.5 shadow-sm">
      <div className="flex items-center justify-between border-b border-amber-200/30 pb-2">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Cpu className="text-[#B3732A]" size={16} />
          AI Writing Assistant
        </h4>
        <span className="text-[10px] text-[#B3732A] bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium">
          Suggestions
        </span>
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}

      {!headlines.length && !loading && (
        <button
          type="button"
          onClick={handleSuggest}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-[#B3732A] hover:bg-[#965e20] rounded-lg transition-colors shadow-sm"
        >
          <Send size={12} />
          Analyze Draft & Suggest
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-4 text-gray-400 gap-1.5">
          <RefreshCw className="animate-spin text-[#B3732A]" size={20} />
          <span className="text-[11px]">Analyzing draft text...</span>
        </div>
      )}

      {(headlines.length > 0 || tags.length > 0) && (
        <div className="space-y-3.5">
          {/* Headlines suggestions */}
          {headlines.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Suggested Headlines</span>
              <div className="space-y-1.5">
                {headlines.map((hl, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-xs hover:border-amber-200 transition-colors">
                    <span className="text-gray-700 leading-normal">{hl}</span>
                    <button
                      type="button"
                      onClick={() => onApplyHeadline(hl)}
                      className="shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Apply as Title"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags suggestions */}
          {tags.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Tags</span>
                <button
                  type="button"
                  onClick={() => onApplyTags(tags.join(', '))}
                  className="text-[10px] text-emerald-600 hover:underline font-semibold"
                >
                  Apply Tags
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tg, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-white border border-gray-100 rounded-md text-gray-600 font-medium">
                    {tg}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSuggest}
            className="w-full text-center text-[10px] text-[#B3732A] hover:underline font-semibold flex items-center justify-center gap-1 pt-1.5 border-t border-dashed border-gray-200/50"
          >
            <RefreshCw size={10} />
            Regenerate Suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default AiInlineAssistant;
