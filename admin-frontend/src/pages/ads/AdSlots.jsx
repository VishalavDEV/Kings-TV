import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layout, Sliders, CheckSquare, Save, X } from 'lucide-react';
import api from '../../utils/axios';

export default function AdSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('header');
  const [dimensions, setDimensions] = useState('');
  const [maxConcurrentAds, setMaxConcurrentAds] = useState(1);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/ad-slots');
      setSlots(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('Failed to load ad slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setPlacement('header');
    setDimensions('728x90');
    setMaxConcurrentAds(1);
    setModalOpen(true);
  };

  const openEditModal = (slot) => {
    setEditId(slot.id);
    setName(slot.name || '');
    setPlacement(slot.placement || 'header');
    setDimensions(slot.dimensions || '');
    setMaxConcurrentAds(slot.maxConcurrentAds || 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !placement || !dimensions) {
      alert('Name, Placement, and Dimensions are required');
      return;
    }

    const payload = {
      name,
      placement,
      dimensions,
      maxConcurrentAds: parseInt(maxConcurrentAds)
    };

    try {
      if (editId) {
        await api.put(`/api/admin/ad-slots/${editId}`, payload);
        showToast('Ad Slot updated successfully');
      } else {
        await api.post('/api/admin/ad-slots', payload);
        showToast('Ad Slot created successfully');
      }
      setModalOpen(false);
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving ad slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad slot?')) return;
    try {
      await api.delete(`/api/admin/ad-slots/${id}`);
      showToast('Ad Slot deleted');
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete ad slot');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Ad Slots (Placements)</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure available positions, target sizes, and layout concurrent limits</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors"
        >
          <Plus size={16} /> Add Slot Placement
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
                <th className="px-6 py-4">Slot Name</th>
                <th className="px-6 py-4">Placement Key</th>
                <th className="px-6 py-4">Target Dimensions</th>
                <th className="px-6 py-4">Max Concurrent Ads</th>
                <th className="px-6 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No placements found.
                  </td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <Layout size={16} className="text-[#B3732A]" />
                        {slot.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 capitalize">
                      {slot.placement}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {slot.dimensions}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {slot.maxConcurrentAds || 1}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(slot)}
                          className="p-1.5 text-gray-500 hover:text-[#B3732A] hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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
                {editId ? 'Edit Ad Slot' : 'Add Ad Slot'}
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Slot Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Header Banner Place"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Placement Key *</label>
                <select
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                >
                  <option value="header">Header</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="in-article">In-Article</option>
                  <option value="footer">Footer</option>
                  <option value="popup">Popup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Dimensions *</label>
                <input
                  type="text"
                  required
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 728x90"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Max Concurrent Ads</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxConcurrentAds}
                  onChange={(e) => setMaxConcurrentAds(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
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
