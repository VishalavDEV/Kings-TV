import React, { useState } from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import api from '../../utils/axios';

const CACHE_TYPES = [
  { icon: '🗄️', label: 'Database Query Cache',  desc: 'Cached database results and query plans' },
  { icon: '🖼️', label: 'Image Cache',            desc: 'Cached image thumbnails and transformations' },
  { icon: '📄', label: 'Page Cache',             desc: 'Pre-rendered page HTML responses' },
  { icon: '🔑', label: 'Session Cache',          desc: 'User session data (will log out active users)' },
];

export default function CacheSystem() {
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const clearCache = async () => {
    setClearing(true);
    setResult(null);
    setError('');
    try {
      const r = await api.post('/api/admin/cache/clear');
      setResult(r.data);
    } catch {
      setError('Failed to clear cache. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Cache System</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Clear server-side caches to force fresh data across the site
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-[#B3732A]" />
          <h3 className="font-semibold text-gray-800">Cache Overview</h3>
        </div>

        <div className="space-y-3">
          {CACHE_TYPES.map(c => (
            <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <span className="text-xl">{c.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-700">{c.label}</p>
                <p className="text-xs text-gray-400">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {result && (
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">{result.message}</p>
              {result.clearedCaches?.length > 0 && (
                <p className="text-xs text-green-600 mt-0.5">
                  Cleared: {result.clearedCaches.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={clearCache}
          disabled={clearing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#B3732A] text-white rounded-xl font-medium hover:bg-[#9c6323] disabled:opacity-50 transition-colors shadow-sm"
        >
          <Zap size={16} className={clearing ? 'animate-pulse' : ''} />
          {clearing ? 'Clearing Cache…' : 'Clear All Cache'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Clearing cache may cause a brief slowdown as the site rebuilds cached content.
        </p>
      </div>
    </div>
  );
}
