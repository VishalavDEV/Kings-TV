import React, { useState, useEffect } from 'react';
import { Gift, DollarSign, CreditCard, Save } from 'lucide-react';
import api from '../../utils/axios';

export default function RewardSystem() {
  const [settings, setSettings] = useState({
    status: 'ENABLED',
    rewardAmountPer1000Views: 1.0,
    currencyName: 'Indian Rupee',
    currencySymbol: '₹',
    currencyFormat: '1,234.56',
    symbolPosition: 'BEFORE'
  });

  const [payoutMethods, setPayoutMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingMethods, setSavingMethods] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/reward-system/settings'),
      api.get('/api/admin/reward-system/payout-methods')
    ]).then(([sRes, mRes]) => {
      if (sRes.data) setSettings(sRes.data);
      if (Array.isArray(mRes.data)) setPayoutMethods(mRes.data);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/api/admin/reward-system/settings', settings);
      showToast('Reward settings saved successfully');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveCurrency = async () => {
    setSavingCurrency(true);
    try {
      await api.put('/api/admin/reward-system/settings', settings);
      showToast('Currency settings saved successfully');
    } catch {
      showToast('Failed to save currency settings');
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleToggleMethod = (index) => {
    setPayoutMethods(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const handleMethodDetailChange = (index, value) => {
    setPayoutMethods(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], accountDetails: value };
      return copy;
    });
  };

  const handleSaveMethods = async () => {
    setSavingMethods(true);
    try {
      await api.put('/api/admin/reward-system/payout-methods', payoutMethods);
      showToast('Payout methods saved successfully');
    } catch {
      showToast('Failed to save payout methods');
    } finally {
      setSavingMethods(false);
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
        <h2 className="text-xl font-bold text-gray-800">Reward System Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure author pageview rewards, currency format, and payout methods</p>
      </div>

      {/* 1. Settings Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Reward System Overview</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Reward Status</p>
              <p className="text-xs text-gray-400">Enable or disable pageview rewards for authors</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, status: s.status === 'ENABLED' ? 'DISABLED' : 'ENABLED' }))}
              className={`w-12 h-6 rounded-full relative transition-colors ${settings.status === 'ENABLED' ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${settings.status === 'ENABLED' ? 'left-[26px]' : 'left-[3px]'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Reward Amount per 1,000 Pageviews ({settings.currencySymbol || '₹'})
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.rewardAmountPer1000Views}
              onChange={(e) => setSettings(s => ({ ...s, rewardAmountPer1000Views: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingSettings ? 'Saving…' : 'Save Reward Settings'}
          </button>
        </div>
      </div>

      {/* 2. Currency Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Currency & Formatting</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Currency Name</label>
            <input
              type="text"
              value={settings.currencyName || ''}
              onChange={(e) => setSettings(s => ({ ...s, currencyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol || ''}
              onChange={(e) => setSettings(s => ({ ...s, currencySymbol: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Currency Format</label>
            <select
              value={settings.currencyFormat || '1,234.56'}
              onChange={(e) => setSettings(s => ({ ...s, currencyFormat: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            >
              <option value="1,234.56">1,234.56 (Comma decimal)</option>
              <option value="1.234,56">1.234,56 (Dot decimal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Symbol Position</label>
            <select
              value={settings.symbolPosition || 'BEFORE'}
              onChange={(e) => setSettings(s => ({ ...s, symbolPosition: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            >
              <option value="BEFORE">BEFORE ({settings.currencySymbol || '₹'}100)</option>
              <option value="AFTER">AFTER (100{settings.currencySymbol || '₹'})</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveCurrency}
            disabled={savingCurrency}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingCurrency ? 'Saving…' : 'Save Currency Settings'}
          </button>
        </div>
      </div>

      {/* 3. Payout Methods Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Payout Methods (PayPal / IBAN / SWIFT)</h3>
        </div>

        <div className="space-y-4">
          {payoutMethods.map((pm, idx) => (
            <div key={pm.id || idx} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{pm.methodName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${pm.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {pm.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleMethod(idx)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${pm.enabled ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${pm.enabled ? 'left-[22px]' : 'left-[3px]'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{pm.methodName} Account / Instruction Details</label>
                <input
                  type="text"
                  value={pm.accountDetails || ''}
                  onChange={(e) => handleMethodDetailChange(idx, e.target.value)}
                  placeholder={`Enter ${pm.methodName} instructions or account requirements…`}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveMethods}
            disabled={savingMethods}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {savingMethods ? 'Saving…' : 'Save Payout Methods'}
          </button>
        </div>
      </div>
    </div>
  );
}
