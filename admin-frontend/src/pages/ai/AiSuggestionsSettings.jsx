import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle } from 'lucide-react';

const AiSuggestionsSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem('ai_inline_assistant_enabled');
    if (val !== null) {
      setEnabled(val === 'true');
    }
  }, []);

  const handleToggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    localStorage.setItem('ai_inline_assistant_enabled', newVal ? 'true' : 'false');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Cpu className="text-[#B3732A]" />
          AI Assistant Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable the real-time inline AI writing assistant during article drafting.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <span>Inline AI Writing Assistant settings updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <h4 className="font-semibold text-sm text-gray-900">Enable Inline AI Suggestions Panel</h4>
            <p className="text-xs text-gray-500 leading-normal">
              When writing or editing a post, displays an assistant widget on the right sidebar suggesting 3 alternative headlines and generating tag keywords based on your draft content.
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
              enabled ? 'bg-[#B3732A]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#B3732A] rounded-full" />
            <span>Works inline in Add Post and Edit Post layout forms.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#B3732A] rounded-full" />
            <span>Reads configuration details from "ai_prompt_templates" Suggestions template.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionsSettings;
