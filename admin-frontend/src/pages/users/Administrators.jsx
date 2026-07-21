import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const ROLES = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'DISTRICT_ADMIN', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN'];

export default function Administrators() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'CHIEF_EDITOR' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  const PAGE_SIZE = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/admin/users', {
        params: { page, size: PAGE_SIZE, search: search || undefined }
      });
      // Filter to admin roles only
      const adminUsers = (res.data.users || []).filter(u => ROLES.includes(u.role));
      setUsers(adminUsers);
      setTotal(res.data.totalElements || adminUsers.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get('/api/v1/admin/roles');
      setAvailableRoles(res.data.roles || []);
    } catch {
      // fallback to static list
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);
  useEffect(() => { fetchRoles(); }, []);

  const openAdd = () => {
    setEditUser(null);
    setForm({ fullName: '', email: '', password: '', role: 'CHIEF_EDITOR' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ fullName: user.fullName, email: user.email, password: '', role: user.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.email || (!editUser && !form.password)) {
      setError('Name, email, and password are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editUser) {
        const body = { fullName: form.fullName, role: form.role };
        if (form.password) body.password = form.password;
        await axiosInstance.put(`/api/v1/admin/users/${editUser.id}`, body);
      } else {
        await axiosInstance.post('/api/v1/admin/users', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
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

  const roleColor = (role) => {
    const map = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700',
      CHIEF_EDITOR: 'bg-blue-100 text-blue-700',
      DISTRICT_ADMIN: 'bg-green-100 text-green-700',
      MOBILE_JOURNALIST: 'bg-orange-100 text-orange-700',
      INSTITUTION_LOGIN: 'bg-teal-100 text-teal-700',
    };
    return map[role] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Administrators</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin users and their roles</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add User
        </button>
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
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Last Login</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No administrators found</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#B3732A]/10 flex items-center justify-center text-[#B3732A] font-semibold text-sm shrink-0">
                        {user.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-gray-800">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                      {user.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-xs text-gray-500">{total} total administrators</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              ><ChevronLeft size={14} /></button>
              <button
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">{editUser ? 'Edit Administrator' : 'Add Administrator'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!!editUser}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password {editUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  placeholder={editUser ? '••••••••' : 'Min 8 characters'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete Administrator?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
