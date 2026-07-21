import React, { useState, useEffect } from 'react';
import { Search, Save, Globe, RefreshCw, AlertTriangle, Terminal } from 'lucide-react';
import api from '../../utils/axios';

export default function SeoTools() {
  const [seoSettings, setSeoSettings] = useState({
    siteTitle: '',
    homeTitle: '',
    siteDescription: '',
    keywords: '',
    googleAnalyticsCode: ''
  });

  const [sitemapSettings, setSitemapSettings] = useState({
    frequency: 'daily',
    lastModification: 'server_response',
    priority: 'auto'
  });

  const [loading, setLoading] = useState(true);
  const [savingSeo, setSavingSeo] = useState(false);
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [sitemapResult, setSitemapResult] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = () => {
    setLoading(true);
    api.get('/api/admin/seo-tools')
      .then(res => {
        if (res.data?.seoSettings) setSeoSettings(res.data.seoSettings);
        if (res.data?.sitemapSettings) setSitemapSettings(res.data.sitemapSettings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSeo = async () => {
    setSavingSeo(true);
    try {
      await api.put('/api/admin/seo-tools', { seoSettings, sitemapSettings });
      showToast('SEO & Sitemap settings saved successfully');
    } catch {
      showToast('Failed to save SEO settings');
    } finally {
      setSavingSeo(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const res = await api.post('/api/admin/seo-tools/generate-sitemap');
      setSitemapResult(res.data);
      showToast('Sitemap generated successfully');
    } catch {
      showToast('Failed to generate sitemap');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">SEO Tools & Sitemap</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage search engine optimization parameters, Google Analytics, and sitemap generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: SEO Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Search size={18} className="text-[#B3732A]" />
              <h3 className="font-bold text-gray-800">SEO Meta Settings</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Site Title *</label>
              <input
                type="text"
                value={seoSettings.siteTitle || ''}
                onChange={(e) => setSeoSettings(s => ({ ...s, siteTitle: e.target.value }))}
                placeholder="Kings TV"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Home Title *</label>
              <input
                type="text"
                value={seoSettings.homeTitle || ''}
                onChange={(e) => setSeoSettings(s => ({ ...s, homeTitle: e.target.value }))}
                placeholder="Kings TV - News & Entertainment Portal"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Site Description</label>
              <textarea
                rows={3}
                value={seoSettings.siteDescription || ''}
                onChange={(e) => setSeoSettings(s => ({ ...s, siteDescription: e.target.value }))}
                placeholder="Leading Tamil and English News portal delivering top stories…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Keywords (Comma separated)</label>
              <input
                type="text"
                value={seoSettings.keywords || ''}
                onChange={(e) => setSeoSettings(s => ({ ...s, keywords: e.target.value }))}
                placeholder="news, tamil news, kings tv, breaking news"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Google Analytics Code / Measurement ID</label>
              <input
                type="text"
                value={seoSettings.googleAnalyticsCode || ''}
                onChange={(e) => setSeoSettings(s => ({ ...s, googleAnalyticsCode: e.target.value }))}
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {savingSeo ? 'Saving…' : 'Save SEO Settings'}
            </button>
          </div>
        </div>

        {/* Right Card: Sitemap Generator & Cron Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Globe size={18} className="text-[#B3732A]" />
              <h3 className="font-bold text-gray-800">Sitemap Generator & Cron Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Frequency</label>
                <select
                  value={sitemapSettings.frequency || 'daily'}
                  onChange={(e) => setSitemapSettings(s => ({ ...s, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Last Modification</label>
                <select
                  value={sitemapSettings.lastModification || 'server_response'}
                  onChange={(e) => setSitemapSettings(s => ({ ...s, lastModification: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                >
                  <option value="none">None</option>
                  <option value="server_response">Server Response</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                <select
                  value={sitemapSettings.priority || 'auto'}
                  onChange={(e) => setSitemapSettings(s => ({ ...s, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                >
                  <option value="none">None</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleGenerateSitemap}
                disabled={generatingSitemap}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={generatingSitemap ? 'animate-spin' : ''} />
                {generatingSitemap ? 'Generating…' : 'Generate Sitemap'}
              </button>

              {sitemapResult && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg">
                  Generated {sitemapResult.urlCount} URLs
                </span>
              )}
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Note:</strong> Sitemaps containing more than 50,000 URLs will be automatically chunked into multiple index files according to standard search engine sitemap protocols.
              </p>
            </div>

            {/* Cron Job Info Box */}
            <div className="p-4 bg-gray-900 text-gray-100 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-400 font-sans font-bold">
                <Terminal size={14} /> Cron Job Command Info
              </div>
              <p className="text-gray-400 font-sans text-[11px]">
                To automatically regenerate your sitemap on schedule, set up a cron job on your server using:
              </p>
              <div className="p-2 bg-black/50 rounded text-amber-300 overflow-x-auto select-all">
                0 0 * * * wget -q -O - http://yourdomain.com/cron/update-sitemap &gt;/dev/null 2&gt;&amp;1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
