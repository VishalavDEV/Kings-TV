import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Target, Save, X, Eye, FileText } from 'lucide-react';
import api from '../../utils/axios';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [detailCampaign, setDetailCampaign] = useState(null);
  const [detailAds, setDetailAds] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toast, setToast] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [advertiserId, setAdvertiserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('draft');
  const [targetPagesCategories, setTargetPagesCategories] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, advertisersRes] = await Promise.all([
        api.get('/api/admin/campaigns'),
        api.get('/api/admin/advertisers')
      ]);
      setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data : []);
      setAdvertisers(Array.isArray(advertisersRes.data) ? advertisersRes.data : []);
    } catch {
      showToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setAdvertiserId(advertisers[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setStatus('draft');
    setTargetPagesCategories('');
    setModalOpen(true);
  };

  const openEditModal = (cam) => {
    setEditId(cam.id);
    setName(cam.name || '');
    setAdvertiserId(cam.advertiser?.id || '');
    setStartDate(cam.startDate ? cam.startDate.substring(0, 16) : '');
    setEndDate(cam.endDate ? cam.endDate.substring(0, 16) : '');
    setBudget(cam.budget || '');
    setStatus(cam.status || 'draft');
    setTargetPagesCategories(cam.targetPagesCategories || '');
    setModalOpen(true);
  };

  const handleViewDetails = async (campaign) => {
    setDetailCampaign(campaign);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/api/admin/campaigns/${campaign.id}`);
      setDetailAds(Array.isArray(res.data?.ads) ? res.data.ads : []);
    } catch {
      showToast('Failed to load campaign ads');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !advertiserId) {
      alert('Campaign Name and Advertiser are required');
      return;
    }

    const payload = {
      name,
      advertiser: { id: advertiserId },
      startDate: startDate ? startDate + ':00' : null,
      endDate: endDate ? endDate + ':00' : null,
      budget: budget ? parseFloat(budget) : null,
      status,
      targetPagesCategories
    };

    try {
      if (editId) {
        await api.put(`/api/admin/campaigns/${editId}`, payload);
        showToast('Campaign updated successfully');
      } else {
        await api.post('/api/admin/campaigns', payload);
        showToast('Campaign created successfully');
      }
      setModalOpen(false);
      loadData();
    } catch {
      showToast('Error saving campaign');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to pause this campaign?')) return;
    try {
      await api.delete(`/api/admin/campaigns/${id}`);
      showToast('Campaign paused');
      loadData();
    } catch {
      showToast('Failed to pause campaign');
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
          <h2 className="text-xl font-bold text-gray-800">Ad Campaigns</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage budget schedules, dates, and target placements for advertisers</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={advertisers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> Add Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Campaign List Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Advertiser</th>
                  <th className="px-5 py-4">Date Range</th>
                  <th className="px-5 py-4">Budget</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((cam) => (
                    <tr key={cam.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {cam.name}
                      </td>
                      <td className="px-5 py-4 text-gray-500 font-medium">
                        {cam.advertiser?.companyName || 'Unknown'}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#B3732A]" />
                          <span>{cam.startDate ? cam.startDate.substring(0, 10) : 'Open'}</span>
                          <span>to</span>
                          <span>{cam.endDate ? cam.endDate.substring(0, 10) : 'Open'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        <div className="flex items-center gap-0.5">
                          <DollarSign size={12} className="text-gray-400" />
                          {cam.budget != null ? cam.budget.toFixed(2) : 'Uncapped'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            cam.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : cam.status === 'paused'
                              ? 'bg-amber-50 text-amber-700'
                              : cam.status === 'completed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cam.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetails(cam)}
                            className="p-1 text-gray-500 hover:text-[#B3732A] hover:bg-amber-50 rounded"
                            title="View Ads & Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(cam)}
                            className="p-1 text-gray-500 hover:text-[#B3732A] hover:bg-amber-50 rounded"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(cam.id)}
                            className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Pause"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Campaign Detail Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#B3732A]" />
              Campaign Details
            </h3>

            {detailCampaign ? (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-gray-800 text-base">{detailCampaign.name}</h4>
                  <p className="text-gray-400 mt-0.5">ID: #{detailCampaign.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Advertiser</span>
                    <p className="font-semibold text-gray-700 truncate">{detailCampaign.advertiser?.companyName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Budget</span>
                    <p className="font-semibold text-gray-700">${detailCampaign.budget != null ? detailCampaign.budget.toFixed(2) : 'Uncapped'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Pages / Categories</span>
                  {detailCampaign.targetPagesCategories ? (
                    <pre className="bg-gray-900 text-emerald-400 text-[10px] p-2 rounded-lg overflow-x-auto font-mono">
                      {detailCampaign.targetPagesCategories}
                    </pre>
                  ) : (
                    <span className="text-gray-400 italic">No custom targeting (All site pages)</span>
                  )}
                </div>

                {/* Ads Associated List */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block border-b border-gray-50 pb-1">
                    Ads under this Campaign ({detailAds.length})
                  </span>

                  {loadingDetail ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
                    </div>
                  ) : detailAds.length === 0 ? (
                    <p className="text-gray-400 italic py-2">No individual ads created under this campaign.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {detailAds.map((ad) => (
                        <div key={ad.id} className="flex items-center justify-between border border-gray-100 p-2.5 rounded-lg hover:bg-gray-50/50">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-gray-700 block capitalize">{ad.type} Ad ({ad.adSlot?.name})</span>
                            {ad.imageUrl ? (
                              <a href={ad.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block">
                                {ad.imageUrl}
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic block">Custom HTML/JS Code</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            ad.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ad.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 italic text-xs">
                Select a campaign from the list to view its configuration and associated ads.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-lg">
                {editId ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Promo 2026"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Advertiser *</label>
                  <select
                    value={advertiserId}
                    required
                    onChange={(e) => setAdvertiserId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                  >
                    {advertisers.map(adv => (
                      <option key={adv.id} value={adv.id}>{adv.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Campaign Budget ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 500.00"
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
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Optional Targeting criteria (JSON object representation)
                </label>
                <textarea
                  rows={3}
                  value={targetPagesCategories}
                  onChange={(e) => setTargetPagesCategories(e.target.value)}
                  placeholder='e.g. { "categories": ["politics", "sports"], "districts": ["Chennai"] }'
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
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
