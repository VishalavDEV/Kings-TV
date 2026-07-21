import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import api from '../../utils/axios';

const DEFAULT_ROLES = [
  'SUPER_ADMIN',
  'CHIEF_EDITOR',
  'DISTRICT_ADMIN',
  'MOBILE_JOURNALIST',
  'INSTITUTION_LOGIN'
];

export default function AddUser() {
  const navigate = useNavigate();
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CHIEF_EDITOR',
    isActive: true,
    profileImage: '',
    phoneNumber: '',
    location: ''
  });

  useEffect(() => {
    api.get('/api/v1/admin/roles')
      .then(res => {
        if (Array.isArray(res.data.roles) && res.data.roles.length > 0) {
          setAvailableRoles(res.data.roles.map(r => r.name || r));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/admin/users', form);
      setToast('User created successfully');
      setTimeout(() => navigate('/users/administrators'), 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/users/administrators')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create a new administrator or editor account</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assign Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-11 h-6 rounded-full relative transition-colors ${form.isActive ? 'bg-[#B3732A]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute w-4.5 h-4.5 bg-white rounded-full top-[3px] transition-all shadow-sm ${form.isActive ? 'left-[22px]' : 'left-[3px]'}`} />
                </button>
                <span className="text-xs font-medium text-gray-700">{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Avatar Profile Image URL</label>
            <input
              type="text"
              value={form.profileImage}
              onChange={(e) => setForm(f => ({ ...f, profileImage: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/users/administrators')}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
            >
              <UserPlus size={16} />
              {submitting ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
