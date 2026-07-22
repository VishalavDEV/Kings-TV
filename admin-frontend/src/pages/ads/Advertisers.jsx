import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Building2, Save, X, Activity } from 'lucide-react';
import api from '../../utils/axios';

export default function Advertisers() {
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('active');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadAdvertisers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/advertisers');
      setAdvertisers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast('Failed to load advertisers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisers();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setCompanyName('');
    setContactEmail('');
    setContactPhone('');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (adv) => {
    setEditId(adv.id);
    setCompanyName(adv.companyName || '');
    setContactEmail(adv.contactEmail || '');
    setContactPhone(adv.contactPhone || '');
    setStatus(adv.status || 'active');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !contactEmail) {
      alert('Company Name and Contact Email are required');
      return;
    }

    const payload = { companyName, contactEmail, contactPhone, status };

    try {
      if (editId) {
        await api.put(`/api/admin/advertisers/${editId}`, payload);
        showToast('Advertiser updated successfully');
      } else {
        await api.post('/api/admin/advertisers', payload);
        showToast('Advertiser created successfully');
      }
      setModalOpen(false);
      loadAdvertisers();
    } catch {
      showToast('Error saving advertiser');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this advertiser?')) return;
    try {
      await api.delete(`/api/admin/advertisers/${id}`);
      showToast('Advertiser deactivated');
      loadAdvertisers();
    } catch {
      showToast('Failed to deactivate advertiser');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Advertisers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage advertiser companies, contacts, and active statuses</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors"
        >
          <Plus size={16} /> Add Advertiser
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase">
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Campaigns</th>
                <th className="px-6 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {advertisers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No advertisers found. Click "Add Advertiser" to create one.
                  </td>
                </tr>
              ) : (
                advertisers.map((adv) => (
                  <tr key={adv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#B3732A]" />
                        {adv.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} /> {adv.contactEmail}
                        </div>
                        {adv.contactPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={12} /> {adv.contactPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          adv.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        <Activity size={10} />
                        {adv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {adv.activeCampaignsCount || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(adv)}
                          className="p-1.5 text-gray-500 hover:text-[#B3732A] hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(adv.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-lg">
                {editId ? 'Edit Advertiser' : 'Add Advertiser'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. marketing@acme.com"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
