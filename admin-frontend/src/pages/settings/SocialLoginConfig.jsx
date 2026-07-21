import React, { useState, useEffect } from 'react';
import { Share2, Save, Key, ShieldCheck } from 'lucide-react';
import api from '../../utils/axios';

export default function SocialLoginConfig() {
  const [config, setConfig] = useState({
    facebook: { appId: '', appSecret: '' },
    google: { clientId: '', clientSecret: '' },
    vkontakte: { appId: '', secureKey: '' }
  });

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = () => {
    setLoading(true);
    api.get('/api/admin/social-login-config')
      .then(res => {
        if (res.data) setConfig(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProvider = async (provider) => {
    setSavingMap(prev => ({ ...prev, [provider]: true }));
    try {
      const payload = config[provider] || {};
      const res = await api.put(`/api/admin/social-login-config/${provider}`, payload);
      showToast(res.data?.message || `${provider} configuration saved`);
    } catch {
      showToast(`Failed to save ${provider} settings`);
    } finally {
      setSavingMap(prev => ({ ...prev, [provider]: false }));
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
        <h2 className="text-xl font-bold text-gray-800">Social Login Configuration</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure OAuth single sign-on credentials for Facebook, Google, and VKontakte</p>
      </div>

      {/* 1. Facebook Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            f
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Facebook Social Login</h3>
            <p className="text-xs text-gray-400">App credentials for Facebook OAuth login integration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">App ID</label>
            <input
              type="text"
              value={config.facebook?.appId || ''}
              onChange={(e) => setConfig(c => ({ ...c, facebook: { ...c.facebook, appId: e.target.value } }))}
              placeholder="e.g. 123456789012345"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">App Secret</label>
            <input
              type="password"
              value={config.facebook?.appSecret || ''}
              onChange={(e) => setConfig(c => ({ ...c, facebook: { ...c.facebook, appSecret: e.target.value } }))}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleSaveProvider('facebook')}
            disabled={savingMap.facebook}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingMap.facebook ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 2. Google Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-sm">
            G
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Google Social Login</h3>
            <p className="text-xs text-gray-400">OAuth Client ID & Secret from Google Cloud Console</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Client ID</label>
            <input
              type="text"
              value={config.google?.clientId || ''}
              onChange={(e) => setConfig(c => ({ ...c, google: { ...c.google, clientId: e.target.value } }))}
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Client Secret</label>
            <input
              type="password"
              value={config.google?.clientSecret || ''}
              onChange={(e) => setConfig(c => ({ ...c, google: { ...c.google, clientSecret: e.target.value } }))}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleSaveProvider('google')}
            disabled={savingMap.google}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingMap.google ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 3. VKontakte Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
            VK
          </div>
          <div>
            <h3 className="font-bold text-gray-800">VKontakte Social Login</h3>
            <p className="text-xs text-gray-400">Application credentials from VK Developers Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">App ID</label>
            <input
              type="text"
              value={config.vkontakte?.appId || ''}
              onChange={(e) => setConfig(c => ({ ...c, vkontakte: { ...c.vkontakte, appId: e.target.value } }))}
              placeholder="e.g. 51234567"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Secure Key</label>
            <input
              type="password"
              value={config.vkontakte?.secureKey || ''}
              onChange={(e) => setConfig(c => ({ ...c, vkontakte: { ...c.vkontakte, secureKey: e.target.value } }))}
              placeholder="••••••••••••••••••••••••"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={() => handleSaveProvider('vkontakte')}
            disabled={savingMap.vkontakte}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingMap.vkontakte ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
