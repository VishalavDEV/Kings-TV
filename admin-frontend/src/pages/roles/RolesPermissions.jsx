import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ShieldCheck, ChevronRight } from 'lucide-react';
import axiosInstance from '../../utils/axios';

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/v1/admin/roles');
      setRoles(res.data.roles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const handleAdd = async () => {
    if (!newRoleName.trim()) return;
    setAdding(true);
    try {
      await axiosInstance.post('/api/v1/admin/roles', { name: newRoleName });
      setNewRoleName('');
      setShowAdd(false);
      fetchRoles();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create role');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/admin/roles/${id}`);
      setDeleteId(null);
      fetchRoles();
    } catch (e) {
      alert(e.response?.data?.message || 'Cannot delete this role');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Roles & Permissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage roles and their module access</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      {/* Add Role Quick Form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">New Role</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Role name (e.g. Content Editor)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="px-4 py-2.5 bg-[#B3732A] hover:bg-[#9c6323] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {adding ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Permissions</th>
              <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">No roles found</td></tr>
            ) : roles.map(role => (
              <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#B3732A]/10 flex items-center justify-center">
                      <ShieldCheck size={15} className="text-[#B3732A]" />
                    </div>
                    <span className="font-semibold text-gray-800">{role.name?.replace(/_/g, ' ')}</span>
                    {['SUPER_ADMIN', 'CHIEF_EDITOR', 'DISTRICT_ADMIN', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN', 'READER'].includes(role.name) && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                        System Default
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500 text-sm">{role.description || '—'}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {role.permissions?.length || 0} permissions
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/roles-permissions/${role.id}/edit`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#B3732A] hover:bg-[#B3732A]/5 rounded-lg transition-colors border border-gray-200"
                    >
                      <Edit size={13} />
                      Edit
                    </button>
                    {!['SUPER_ADMIN', 'CHIEF_EDITOR', 'DISTRICT_ADMIN', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN', 'READER'].includes(role.name) && (
                      <button
                        onClick={() => setDeleteId(role.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete Role?</h3>
            <p className="text-sm text-gray-500 mb-6">Users assigned this role may lose access. This cannot be undone.</p>
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
