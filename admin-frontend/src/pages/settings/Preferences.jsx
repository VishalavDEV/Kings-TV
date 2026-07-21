import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, X } from 'lucide-react';
import api from '../../utils/axios';

export default function Preferences() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [preferences, setPreferences] = useState({
    general: { site_name: '', admin_email: '', posts_per_page: '10', enable_comments: 'true', enable_registration: 'true', enable_author_bio: 'true' },
    homepage: {
      show_featured_section: 'true',
      show_latest_on_homepage: 'true',
      show_news_ticker: 'true',
      show_latest_on_slider: 'true',
      show_latest_on_featured: 'true',
      sort_slider_by: 'date',
      sort_featured_by: 'date'
    },
    posts: { show_author: 'true', show_date: 'true', show_reading_time: 'true', show_share_buttons: 'true', show_related_posts: 'true', show_view_count: 'true', enable_print_button: 'true', show_tags: 'true' },
    postFormats: { enable_video_post: 'true', enable_gallery_post: 'true', enable_audio_post: 'true', enable_quote_post: 'true', enable_link_post: 'true', enable_review_post: 'true' }
  });

  const [loading, setLoading] = useState(true);
  const [savingTab, setSavingTab] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadPreferences = () => {
    setLoading(true);
    api.get('/api/admin/preferences')
      .then(res => {
        if (res.data) {
          setPreferences(prev => ({
            general: { ...prev.general, ...res.data.general },
            homepage: { ...prev.homepage, ...res.data.homepage },
            posts: { ...prev.posts, ...res.data.posts },
            postFormats: { ...prev.postFormats, ...res.data.postFormats }
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const handleToggle = (groupKey, fieldKey, val) => {
    setPreferences(prev => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [fieldKey]: val }
    }));
  };

  const handleSaveTab = async (groupKey) => {
    setSavingTab(groupKey);
    try {
      await api.put('/api/admin/preferences', { [groupKey]: preferences[groupKey] });
      showToast('Preferences updated successfully');
    } catch {
      showToast('Failed to save preferences');
    } finally {
      setSavingTab('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  const renderRadioRow = (groupKey, fieldKey, label, description) => {
    const currentVal = preferences[groupKey]?.[fieldKey] ?? 'true';
    const isYes = currentVal === 'true' || currentVal === '1' || currentVal === 'yes';

    return (
      <div key={fieldKey} className="py-4 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => handleToggle(groupKey, fieldKey, 'true')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isYes ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleToggle(groupKey, fieldKey, 'false')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isYes ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            No
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Preferences</h2>
        <p className="text-sm text-gray-500 mt-0.5">Control layout displays, post options, and site-wide post format toggles</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {[
          { id: 'general', label: 'General' },
          { id: 'homepage', label: 'Homepage' },
          { id: 'posts', label: 'Posts' },
          { id: 'postFormats', label: 'Post Formats' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-[#B3732A] text-[#B3732A] bg-amber-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">General Preferences</h3>
            {renderRadioRow('general', 'enable_comments', 'Enable Site Comments', 'Allow readers to submit comments on articles')}
            {renderRadioRow('general', 'enable_registration', 'Enable Public User Registration', 'Allow visitors to create reader accounts')}
            {renderRadioRow('general', 'enable_author_bio', 'Show Author Bio Box', 'Display author biography at bottom of posts')}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('general')}
                disabled={savingTab === 'general'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {savingTab === 'general' ? 'Saving…' : 'Save General Preferences'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'homepage' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Homepage Display Toggles</h3>
            {renderRadioRow('homepage', 'show_featured_section', 'Show Featured Section', 'Display featured grid on homepage')}
            {renderRadioRow('homepage', 'show_latest_on_homepage', 'Show Latest Posts on Homepage', 'Display main latest news grid')}
            {renderRadioRow('homepage', 'show_news_ticker', 'Show News Ticker', 'Display breaking news ticker header')}
            {renderRadioRow('homepage', 'show_latest_on_slider', 'Show Latest Posts on Main Slider', 'Include latest articles in main slider')}
            {renderRadioRow('homepage', 'show_latest_on_featured', 'Show Latest Posts on Featured Grid', 'Include latest articles in featured grid')}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Main Slider By</label>
                <select
                  value={preferences.homepage?.sort_slider_by || 'date'}
                  onChange={(e) => handleToggle('homepage', 'sort_slider_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="order">Display Order</option>
                  <option value="date">Publish Date</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Featured Grid By</label>
                <select
                  value={preferences.homepage?.sort_featured_by || 'date'}
                  onChange={(e) => handleToggle('homepage', 'sort_featured_by', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="order">Display Order</option>
                  <option value="date">Publish Date</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('homepage')}
                disabled={savingTab === 'homepage'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {savingTab === 'homepage' ? 'Saving…' : 'Save Homepage Preferences'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Single Post Details</h3>
            {renderRadioRow('posts', 'show_author', 'Show Author Name', 'Display author byline on single posts')}
            {renderRadioRow('posts', 'show_date', 'Show Publish Date', 'Display publish timestamp on posts')}
            {renderRadioRow('posts', 'show_reading_time', 'Show Estimated Reading Time', 'Calculate and show reading time')}
            {renderRadioRow('posts', 'show_share_buttons', 'Show Social Share Buttons', 'Enable floating social share icons')}
            {renderRadioRow('posts', 'show_related_posts', 'Show Related Posts Section', 'Display recommended articles at bottom')}
            {renderRadioRow('posts', 'show_view_count', 'Show Post View Counter', 'Display total pageview count')}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('posts')}
                disabled={savingTab === 'posts'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {savingTab === 'posts' ? 'Saving…' : 'Save Posts Preferences'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'postFormats' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Site-wide Post Formats Toggles</h3>
            {renderRadioRow('postFormats', 'enable_video_post', 'Video Post Format', 'Allow creating video posts with YouTube/Vimeo embeds')}
            {renderRadioRow('postFormats', 'enable_gallery_post', 'Gallery Post Format', 'Allow multi-image gallery slideshow posts')}
            {renderRadioRow('postFormats', 'enable_audio_post', 'Audio Post Format', 'Allow podcast/audio player posts')}
            {renderRadioRow('postFormats', 'enable_quote_post', 'Quote Post Format', 'Allow quote block posts')}
            {renderRadioRow('postFormats', 'enable_review_post', 'Review Post Format', 'Allow product review rating posts')}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleSaveTab('postFormats')}
                disabled={savingTab === 'postFormats'}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {savingTab === 'postFormats' ? 'Saving…' : 'Save Post Formats Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
