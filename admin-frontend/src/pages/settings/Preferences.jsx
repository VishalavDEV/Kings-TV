import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const TABS = ['General', 'Homepage', 'Posts', 'Post Formats'];

const HOMEPAGE_FIELDS = [
  { key: 'show_featured_section',  label: 'Show Featured Section' },
  { key: 'show_latest_on_homepage',label: 'Show Latest on Homepage' },
  { key: 'show_news_ticker',       label: 'Show News Ticker' },
  { key: 'show_latest_on_slider',  label: 'Show Latest on Slider' },
  { key: 'show_latest_on_featured',label: 'Show Latest on Featured' },
];

const HOMEPAGE_SELECT = [
  { key: 'sort_slider_by',   label: 'Sort Slider By',   opts: ['order', 'date'] },
  { key: 'sort_featured_by', label: 'Sort Featured By', opts: ['order', 'date'] },
];

const POSTS_FIELDS = [
  { key: 'show_author',       label: 'Show Author Name' },
  { key: 'show_date',         label: 'Show Published Date' },
  { key: 'show_reading_time', label: 'Show Reading Time' },
  { key: 'show_share_buttons',label: 'Show Share Buttons' },
  { key: 'show_related_posts',label: 'Show Related Posts' },
  { key: 'show_view_count',   label: 'Show View Count' },
  { key: 'enable_print_button',label: 'Enable Print Button' },
  { key: 'show_tags',         label: 'Show Tags' },
];

const POST_FORMAT_FIELDS = [
  { key: 'enable_video_post',   label: 'Video Post' },
  { key: 'enable_gallery_post', label: 'Gallery Post' },
  { key: 'enable_audio_post',   label: 'Audio Post' },
  { key: 'enable_quote_post',   label: 'Quote Post' },
  { key: 'enable_link_post',    label: 'Link Post' },
  { key: 'enable_review_post',  label: 'Review Post' },
];

const GENERAL_FIELDS = [
  { key: 'site_name',    label: 'Site Name',     type: 'text' },
  { key: 'admin_email',  label: 'Admin Email',   type: 'email' },
  { key: 'posts_per_page', label: 'Posts Per Page', type: 'number' },
  { key: 'enable_comments',     label: 'Enable Comments', type: 'bool' },
  { key: 'enable_registration', label: 'Enable Registration', type: 'bool' },
  { key: 'enable_author_bio',   label: 'Enable Author Bio', type: 'bool' },
];

function RadioYesNo({ value, onChange }) {
  return (
    <div className="flex gap-4">
      {['yes', 'no'].map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            value === opt ? 'border-green-500 bg-green-500' : 'border-gray-300 group-hover:border-green-400'
          }`}>
            {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className={`text-sm font-medium capitalize ${value === opt ? 'text-green-700' : 'text-gray-600'}`}>
            {opt === 'yes' ? '✓ Yes' : 'No'}
          </span>
        </label>
      ))}
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-700 w-64">{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

export default function Preferences() {
  const [activeTab, setActiveTab] = useState(0);
  const [prefs, setPrefs] = useState({ general: {}, homepage: {}, posts: {}, postFormats: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/api/admin/preferences')
      .then(r => setPrefs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setField = (section, key, value) => {
    setPrefs(p => ({ ...p, [section]: { ...p[section], [key]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        general:     prefs.general,
        homepage:    prefs.homepage,
        posts:       prefs.posts,
        postFormats: prefs.postFormats,
      };
      await api.put('/api/admin/preferences', payload);
      setToast('Preferences saved!');
      setTimeout(() => setToast(''), 3000);
    } catch {
      setToast('Failed to save. Please try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Preferences</h2>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* General Tab */}
        {activeTab === 0 && (
          <div className="space-y-0">
            {GENERAL_FIELDS.map(f => (
              <FieldRow key={f.key} label={f.label}>
                {f.type === 'bool' ? (
                  <RadioYesNo
                    value={prefs.general[f.key] || 'yes'}
                    onChange={v => setField('general', f.key, v)}
                  />
                ) : (
                  <input
                    type={f.type}
                    value={prefs.general[f.key] || ''}
                    onChange={e => setField('general', f.key, e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                )}
              </FieldRow>
            ))}
          </div>
        )}

        {/* Homepage Tab */}
        {activeTab === 1 && (
          <div className="space-y-0">
            {HOMEPAGE_FIELDS.map(f => (
              <FieldRow key={f.key} label={f.label}>
                <RadioYesNo
                  value={prefs.homepage[f.key] || 'yes'}
                  onChange={v => setField('homepage', f.key, v)}
                />
              </FieldRow>
            ))}
            {HOMEPAGE_SELECT.map(f => (
              <FieldRow key={f.key} label={f.label}>
                <div className="flex gap-4">
                  {f.opts.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        (prefs.homepage[f.key] || 'order') === opt ? 'border-[#B3732A] bg-[#B3732A]' : 'border-gray-300'
                      }`}>
                        {(prefs.homepage[f.key] || 'order') === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-medium capitalize text-gray-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>
            ))}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 2 && (
          <div className="space-y-0">
            {POSTS_FIELDS.map(f => (
              <FieldRow key={f.key} label={f.label}>
                <RadioYesNo
                  value={prefs.posts[f.key] || 'yes'}
                  onChange={v => setField('posts', f.key, v)}
                />
              </FieldRow>
            ))}
          </div>
        )}

        {/* Post Formats Tab */}
        {activeTab === 3 && (
          <div className="space-y-0">
            <p className="text-xs text-gray-500 mb-4">Enable or disable specific post format types available to authors.</p>
            {POST_FORMAT_FIELDS.map(f => (
              <FieldRow key={f.key} label={f.label}>
                <RadioYesNo
                  value={prefs.postFormats[f.key] || 'yes'}
                  onChange={v => setField('postFormats', f.key, v)}
                />
              </FieldRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
