import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Calendar } from 'lucide-react';
import api from '../utils/axios';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadMessages = () => {
    setLoading(true);
    api.get('/api/admin/contact-messages')
      .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      await api.delete(`/api/admin/contact-messages/${id}`);
      showToast('Contact message deleted');
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch {
      showToast('Failed to delete contact message');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
        <p className="text-sm text-gray-500 mt-0.5">Read-only inbox for messages sent via site contact form</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Mail size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No contact messages received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold w-14">Id</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold min-w-[240px]">Message</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{msg.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{msg.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <a href={`mailto:${msg.email}`} className="hover:underline text-[#B3732A]">
                        {msg.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700 leading-relaxed max-w-sm">
                      {msg.subject && <span className="font-semibold block text-xs text-gray-900 mb-0.5">{msg.subject}</span>}
                      {msg.message}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
