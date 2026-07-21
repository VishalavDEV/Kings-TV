import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Key, Shield, CheckCircle, XCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

const DEFAULT_ROLES = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'DISTRICT_ADMIN', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN'];

export default function Administrators() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', role: '', isActive: true, profileImage: '' });

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = () => {
    setLoading(true);
    api.get('/api/admin/users/administrators')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => showError('Failed to load administrators'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/admin/users/${item.id}`);
      showSuccess('Administrator deleted');
      setUsers(prev => prev.filter(u => u.id !== item.id));
    } catch {
      showError('Failed to delete administrator');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/admin/users/${id}`)));
      showSuccess(`Deleted ${ids.length} administrators`);
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    } catch {
      showError('Failed to delete selected administrators');
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || '',
      role: user.role || 'CHIEF_EDITOR',
      isActive: user.isActive !== false,
      profileImage: user.profileImage || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.put(`/api/admin/users/${editUser.id}`, editForm);
      showSuccess('Administrator updated');
      setEditModalOpen(false);
      loadData();
    } catch {
      showError('Failed to update administrator');
    }
  };

  const openReset = (user) => {
    setResetUserId(user.id);
    setNewPassword('');
    setResetModalOpen(true);
  };

  const handleSaveReset = async (e) => {
    e.preventDefault();
    if (!resetUserId || !newPassword) return;
    try {
      await api.put(`/api/admin/users/administrators/${resetUserId}/reset-password`, { newPassword });
      showSuccess('Password reset successfully');
      setResetModalOpen(false);
    } catch {
      showError('Failed to reset password');
    }
  };

  const columns = [
    { key: 'id', label: 'Id', className: 'w-16' },
    {
      key: 'fullName',
      label: 'Admin User',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.profileImage ? (
            <img src={row.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-100 text-[#B3732A] flex items-center justify-center font-bold text-xs">
              {(val || 'A').charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800 text-xs">{val || 'Admin'}</div>
            <div className="text-[11px] text-gray-400">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className="px-2.5 py-1 bg-amber-50 text-[#B3732A] border border-amber-200/60 rounded-lg text-xs font-semibold uppercase">
          {(val || 'ADMIN').replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${val !== false ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const customRowActions = [
    { label: 'Reset Password', onClick: openReset, className: 'text-amber-600 font-semibold' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Administrators</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage system admin accounts, roles, and password resets</p>
        </div>

        <button
          onClick={() => navigate('/users/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors w-fit"
        >
          <Plus size={16} /> Add Administrator
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        customRowActions={customRowActions}
        searchableKeys={['fullName', 'email', 'role']}
      />

      {/* Edit Administrator Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-base">Edit Administrator</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  {DEFAULT_ROLES.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Profile Image URL</label>
                <input
                  type="text"
                  value={editForm.profileImage}
                  onChange={(e) => setEditForm(f => ({ ...f, profileImage: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">Account Active Status</span>
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${editForm.isActive ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${editForm.isActive ? 'left-[21px]' : 'left-[3px]'}`} />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-[#B3732A]" />
                <h3 className="font-bold text-gray-800 text-base">Reset Password</h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323]"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
