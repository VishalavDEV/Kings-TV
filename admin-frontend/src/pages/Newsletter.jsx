import React, { useState, useEffect } from 'react';
import { Send, Trash2, Mail, Settings, Users, CheckSquare, Square, X } from 'lucide-react';
import api from '../utils/axios';

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [settings, setSettings] = useState({ newsletterEnabled: true, popupEnabled: true });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState('');

  // Email Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/newsletter/subscribers'),
      api.get('/api/admin/newsletter/settings')
    ]).then(([subsRes, settingsRes]) => {
      setSubscribers(subsRes.data.subscribers || []);
      setRegisteredUsers(subsRes.data.registeredUsers || []);
      setSettings(settingsRes.data || { newsletterEnabled: true, popupEnabled: true });
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelectEmail = (email) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedEmails(next);
  };

  const toggleSelectAllSubs = () => {
    const next = new Set(selectedEmails);
    const allSubEmails = subscribers.map(s => s.email);
    const allSelected = allSubEmails.every(e => next.has(e));
    if (allSelected) {
      allSubEmails.forEach(e => next.delete(e));
    } else {
      allSubEmails.forEach(e => next.add(e));
    }
    setSelectedEmails(next);
  };

  const toggleSelectAllUsers = () => {
    const next = new Set(selectedEmails);
    const allUserEmails = registeredUsers.map(u => u.email);
    const allSelected = allUserEmails.every(e => next.has(e));
    if (allSelected) {
      allUserEmails.forEach(e => next.delete(e));
    } else {
      allUserEmails.forEach(e => next.add(e));
    }
    setSelectedEmails(next);
  };

  const handleDeleteSubscriber = async (id, email) => {
    if (!window.confirm(`Delete subscriber ${email}?`)) return;
    try {
      await api.delete(`/api/admin/newsletter/subscribers/${id}`);
      showToast('Subscriber deleted');
      setSubscribers(prev => prev.filter(s => s.subscriberId !== id));
      const next = new Set(selectedEmails);
      next.delete(email);
      setSelectedEmails(next);
    } catch {
      showToast('Failed to delete subscriber');
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/api/admin/newsletter/settings', settings);
      showToast('Newsletter settings saved');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    if (selectedEmails.size === 0) {
      showToast('Please select at least one recipient');
      return;
    }
    setSendingEmail(true);
    try {
      const payload = {
        recipients: Array.from(selectedEmails),
        subject: emailSubject,
        message: emailMessage
      };
      const res = await api.post('/api/admin/newsletter/send-email', payload);
      showToast(res.data.message || 'Email sent successfully');
      setModalOpen(false);
      setEmailSubject('');
      setEmailMessage('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Newsletter</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage newsletter subscribers, broadcast emails, and popup settings</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={selectedEmails.size === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50 shadow-sm"
        >
          <Send size={16} />
          Send Email ({selectedEmails.size})
        </button>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-[#B3732A]" />
          <h3 className="font-bold text-gray-800">Newsletter Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800">Status</p>
              <p className="text-xs text-gray-400">Enable or disable newsletter subscription feature</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, newsletterEnabled: !s.newsletterEnabled }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${settings.newsletterEnabled ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${settings.newsletterEnabled ? 'left-[22px]' : 'left-[3px]'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800">Newsletter Popup</p>
              <p className="text-xs text-gray-400">Enable or disable subscription popup modal on site</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, popupEnabled: !s.popupEnabled }))}
              className={`w-11 h-6 rounded-full relative transition-colors ${settings.popupEnabled ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
            >
              <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${settings.popupEnabled ? 'left-[22px]' : 'left-[3px]'}`} />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          >
            {savingSettings ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Subscribers Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Newsletter Subscribers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-[#B3732A]" />
                <h3 className="font-bold text-gray-800">Subscribers ({subscribers.length})</h3>
              </div>
              <button
                onClick={toggleSelectAllSubs}
                className="text-xs text-[#B3732A] font-semibold hover:underline"
              >
                Select All
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No newsletter subscribers found.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto pr-1">
                {subscribers.map((sub) => {
                  const isChecked = selectedEmails.has(sub.email);
                  return (
                    <div key={sub.subscriberId} className="flex items-center justify-between py-2.5 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleSelectEmail(sub.email)} className="text-gray-400 hover:text-[#B3732A]">
                          {isChecked ? <CheckSquare size={16} className="text-[#B3732A]" /> : <Square size={16} />}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{sub.name || 'Anonymous Subscriber'}</p>
                          <p className="text-xs text-gray-400">{sub.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSubscriber(sub.subscriberId, sub.email)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete subscriber"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Table 2: Registered Users / Admins */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#B3732A]" />
                <h3 className="font-bold text-gray-800">Registered Users & Admins ({registeredUsers.length})</h3>
              </div>
              <button
                onClick={toggleSelectAllUsers}
                className="text-xs text-[#B3732A] font-semibold hover:underline"
              >
                Select All
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
              </div>
            ) : registeredUsers.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No registered users found.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto pr-1">
                {registeredUsers.map((user) => {
                  const isChecked = selectedEmails.has(user.email);
                  return (
                    <div key={user.id} className="flex items-center justify-between py-2.5 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleSelectEmail(user.email)} className="text-gray-400 hover:text-[#B3732A]">
                          {isChecked ? <CheckSquare size={16} className="text-[#B3732A]" /> : <Square size={16} />}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium uppercase">
                        {user.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-base">Send Broadcast Email</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Recipients ({selectedEmails.size})</label>
                <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600 max-h-20 overflow-y-auto">
                  {Array.from(selectedEmails).join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Type your email message here…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-medium hover:bg-[#9c6323] disabled:opacity-50"
                >
                  <Send size={14} />
                  {sendingEmail ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
