import React, { useState, useEffect } from 'react';
import { Palette, Image, Save, Upload } from 'lucide-react';
import api from '../../utils/axios';

export default function VisualSettings() {
  const [visual, setVisual] = useState({
    site_color: '#B3732A',
    header_color: '#1a1a1a',
    post_list_style: 'vertical',
    logo_url: '',
    logo_footer_url: '',
    logo_email_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingStyle, setSavingStyle] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadVisual = () => {
    setLoading(true);
    api.get('/api/admin/settings/visual')
      .then(res => {
        if (res.data) setVisual(prev => ({ ...prev, ...res.data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVisual();
  }, []);

  const handleSaveStyle = async () => {
    setSavingStyle(true);
    try {
      await api.put('/api/admin/settings/visual', visual);
      showToast('Style settings saved successfully');
    } catch {
      showToast('Failed to save style settings');
    } finally {
      setSavingStyle(false);
    }
  };

  const handleSaveLogo = async () => {
    setSavingLogo(true);
    try {
      await api.put('/api/admin/settings/visual', visual);
      showToast('Logo settings saved successfully');
    } catch {
      showToast('Failed to save logo settings');
    } finally {
      setSavingLogo(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Visual Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize theme colors, post list layouts, and portal branding logos</p>
      </div>

      {/* 1. Style Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Palette size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Theme Colors & Layout Style</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Site Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={visual.site_color || '#B3732A'}
                onChange={(e) => setVisual(v => ({ ...v, site_color: e.target.value }))}
                className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={visual.site_color || '#B3732A'}
                onChange={(e) => setVisual(v => ({ ...v, site_color: e.target.value }))}
                className="px-3 py-2 border rounded-xl text-sm font-mono uppercase w-32"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Header & Block Heads Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={visual.header_color || '#1a1a1a'}
                onChange={(e) => setVisual(v => ({ ...v, header_color: e.target.value }))}
                className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={visual.header_color || '#1a1a1a'}
                onChange={(e) => setVisual(v => ({ ...v, header_color: e.target.value }))}
                className="px-3 py-2 border rounded-xl text-sm font-mono uppercase w-32"
              />
            </div>
          </div>
        </div>

        {/* Post Item List Style Radio & Live Thumbnails */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Post Item List Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vertical Preview Card */}
            <div
              onClick={() => setVisual(v => ({ ...v, post_list_style: 'vertical' }))}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                visual.post_list_style === 'vertical'
                  ? 'border-[#B3732A] bg-amber-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Vertical Card Style</span>
                <input
                  type="radio"
                  name="post_list_style"
                  checked={visual.post_list_style === 'vertical'}
                  onChange={() => setVisual(v => ({ ...v, post_list_style: 'vertical' }))}
                  className="text-[#B3732A] focus:ring-[#B3732A]"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                <div className="h-16 bg-gray-200 rounded-lg w-full" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>

            {/* Horizontal Preview Card */}
            <div
              onClick={() => setVisual(v => ({ ...v, post_list_style: 'horizontal' }))}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                visual.post_list_style === 'horizontal'
                  ? 'border-[#B3732A] bg-amber-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Horizontal List Style</span>
                <input
                  type="radio"
                  name="post_list_style"
                  checked={visual.post_list_style === 'horizontal'}
                  onChange={() => setVisual(v => ({ ...v, post_list_style: 'horizontal' }))}
                  className="text-[#B3732A] focus:ring-[#B3732A]"
                />
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200 flex gap-2 items-center">
                <div className="h-12 w-16 bg-gray-200 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-300 rounded w-full" />
                  <div className="h-2 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveStyle}
            disabled={savingStyle}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Save Style Settings
          </button>
        </div>
      </div>

      {/* 2. Logo Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Image size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Branding Logos (Accepted formats: .png, .jpg, .svg)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Main Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">Main Site Header Logo</label>
            <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center space-y-2 bg-gray-50">
              {visual.logo_url ? (
                <img src={visual.logo_url} alt="Main Logo" className="h-10 mx-auto object-contain" />
              ) : (
                <div className="h-10 text-xs text-gray-400 flex items-center justify-center">No logo uploaded</div>
              )}
              <input
                type="text"
                value={visual.logo_url || ''}
                onChange={(e) => setVisual(v => ({ ...v, logo_url: e.target.value }))}
                placeholder="Enter logo image URL"
                className="w-full px-2 py-1 border rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Footer Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">Footer Logo</label>
            <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center space-y-2 bg-gray-50">
              {visual.logo_footer_url ? (
                <img src={visual.logo_footer_url} alt="Footer Logo" className="h-10 mx-auto object-contain" />
              ) : (
                <div className="h-10 text-xs text-gray-400 flex items-center justify-center">No footer logo</div>
              )}
              <input
                type="text"
                value={visual.logo_footer_url || ''}
                onChange={(e) => setVisual(v => ({ ...v, logo_footer_url: e.target.value }))}
                placeholder="Enter footer logo URL"
                className="w-full px-2 py-1 border rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Email Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600">Email Notification Logo</label>
            <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center space-y-2 bg-gray-50">
              {visual.logo_email_url ? (
                <img src={visual.logo_email_url} alt="Email Logo" className="h-10 mx-auto object-contain" />
              ) : (
                <div className="h-10 text-xs text-gray-400 flex items-center justify-center">No email logo</div>
              )}
              <input
                type="text"
                value={visual.logo_email_url || ''}
                onChange={(e) => setVisual(v => ({ ...v, logo_email_url: e.target.value }))}
                placeholder="Enter email logo URL"
                className="w-full px-2 py-1 border rounded text-xs bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveLogo}
            disabled={savingLogo}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} /> Save Logo Settings
          </button>
        </div>
      </div>
    </div>
  );
}
