import React, { useState, useEffect } from 'react';
import { Search, Trash2, Mail, X, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axios';

export default function PublicUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const PAGE_SIZE = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/admin/users', {
        params: { page, size: PAGE_SIZE, role: 'READER', search: search || undefined }
      });
      setUsers(res.data.users || []);
      setTotal(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map(u => u.id)));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/admin/users/${id}`);
      setDeleteId(null);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await axiosInstance.post('/api/v1/admin/users/send-email', {
        userIds: Array.from(selected),
        subject: emailForm.subject,
        body: emailForm.body,
      });
      setShowEmailModal(false);
      setSelected(new Set());
      setEmailForm({ subject: '', body: '' });
      alert('Email sent successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Registered Users</h2>
          <p className="text-sm text-gray-500 mt-0.5">Public users who have registered on the site</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Mail size={15} />
            Send Email ({selected.size})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selected.size === users.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-[#B3732A] focus:ring-[#B3732A]"
                  />
                </th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Provider</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Joined</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No registered users found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-300 text-[#B3732A] focus:ring-[#B3732A]"
                    />
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs font-mono">#{user.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs shrink-0">
                        {user.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-gray-800">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.provider === 'GOOGLE' ? 'bg-blue-50 text-blue-600' :
                      user.provider === 'FACEBOOK' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {user.provider || 'LOCAL'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setDeleteId(user.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <span className="text-xs text-gray-500">{total} total users</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={14} /></button>
            <span className="px-3 py-1.5 text-xs text-gray-600">Page {page + 1}</span>
            <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Send Email</h3>
                <p className="text-sm text-gray-500 mt-0.5">To {selected.size} selected user{selected.size !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea
                  value={emailForm.body}
                  onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] resize-none"
                  placeholder="Write your message..."
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowEmailModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleSendEmail}
                disabled={sending || !emailForm.subject || !emailForm.body}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Mail size={15} />
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
