import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Link, Image as ImageIcon, Code, Save, X, Eye, FileCode } from 'lucide-react';
import api from '../../utils/axios';

export default function AdsList({ type = 'banner' }) {
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState('');

  // Form states
  const [campaignId, setCampaignId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Popup-specific
  const [displayFrequency, setDisplayFrequency] = useState('session'); // session, visit
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [closeButtonRequired, setCloseButtonRequired] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [adsRes, campaignsRes, slotsRes] = await Promise.all([
        api.get(`/api/admin/ads?type=${type}`),
        api.get('/api/admin/campaigns'),
        api.get('/api/admin/ad-slots')
      ]);
      setAds(Array.isArray(adsRes.data) ? adsRes.data : []);
      // Filter active campaigns for ads creation
      setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data.filter(c => c.status === 'active') : []);
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
    } catch {
      showToast('Failed to load advertisements data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

  const openAddModal = () => {
    setEditId(null);
    setCampaignId(campaigns[0]?.id || '');
    // Select default slot matching placement type
    const matchingSlot = slots.find(s => s.placement === (type === 'banner' ? 'header' : type));
    setSlotId(matchingSlot?.id || slots[0]?.id || '');
    setImageUrl('');
    setHtmlCode('');
    setClickUrl('');
    setStatus('active');
    setStartDate('');
    setEndDate('');
    setDisplayFrequency('session');
    setDelaySeconds(0);
    setCloseButtonRequired(true);
    setModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditId(ad.id);
    setCampaignId(ad.campaign?.id || '');
    setSlotId(ad.adSlot?.id || '');
    setImageUrl(ad.imageUrl || '');
    setHtmlCode(ad.htmlCode || '');
    setClickUrl(ad.clickUrl || '');
    setStatus(ad.status || 'active');
    setStartDate(ad.startDate ? ad.startDate.substring(0, 16) : '');
    setEndDate(ad.endDate ? ad.endDate.substring(0, 16) : '');
    setDisplayFrequency(ad.displayFrequency || 'session');
    setDelaySeconds(ad.delaySeconds || 0);
    setCloseButtonRequired(ad.closeButtonRequired !== false);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignId || !slotId) {
      alert('Campaign and Ad Slot are required');
      return;
    }
    if (!imageUrl && !htmlCode) {
      alert('Please specify either an Image URL or custom HTML Code');
      return;
    }

    const payload = {
      campaign: { id: campaignId },
      adSlot: { id: slotId },
      type,
      imageUrl,
      htmlCode,
      clickUrl,
      status,
      startDate: startDate ? startDate + ':00' : null,
      endDate: endDate ? endDate + ':00' : null,
      displayFrequency: type === 'popup' ? displayFrequency : null,
      delaySeconds: type === 'popup' ? parseInt(delaySeconds) : 0,
      closeButtonRequired: type === 'popup' ? closeButtonRequired : true
    };

    try {
      if (editId) {
        await api.put(`/api/admin/ads/${editId}`, payload);
        showToast('Ad updated successfully');
      } else {
        await api.post('/api/admin/ads', payload);
        showToast('Ad created successfully');
      }
      setModalOpen(false);
      loadData();
    } catch {
      showToast('Error saving advertisement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return;
    try {
      await api.delete(`/api/admin/ads/${id}`);
      showToast('Ad deleted');
      loadData();
    } catch {
      showToast('Failed to delete ad');
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
          <h2 className="text-xl font-bold text-gray-800 capitalize">{type} Ads</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage creative files, target click paths, and display properties for {type} ad slots</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={campaigns.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-xs font-semibold hover:bg-[#9c6323] transition-colors disabled:opacity-50"
          title={campaigns.length === 0 ? "You must have at least one active Campaign to add an ad." : ""}
        >
          <Plus size={16} /> Add {type.toUpperCase()} Ad
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
                <th className="px-5 py-4">Preview / Type</th>
                <th className="px-5 py-4">Campaign Name</th>
                <th className="px-5 py-4">Placement Slot</th>
                <th className="px-5 py-4">Date Schedule</th>
                <th className="px-5 py-4">Stats (Imps / Clicks)</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-400">
                    No {type} ads found. Click Add to create one.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      {ad.imageUrl ? (
                        <div className="w-16 h-10 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative group">
                          <img src={ad.imageUrl} alt="preview" className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => window.open(ad.imageUrl, '_blank')}>
                            <Eye size={12} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-10 bg-slate-800 border border-gray-200 rounded-lg flex items-center justify-center text-slate-400" title="Custom HTML/JS Code">
                          <FileCode size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      <div>{ad.campaign?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-gray-400 font-medium">Adv: {ad.campaign?.advertiser?.companyName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-700">{ad.adSlot?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{ad.adSlot?.dimensions}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#B3732A]" />
                        <span>{ad.startDate ? ad.startDate.substring(0, 10) : 'Open'}</span>
                        <span>to</span>
                        <span>{ad.endDate ? ad.endDate.substring(0, 10) : 'Open'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div><span className="font-bold text-gray-600">Imps:</span> {ad.impressions || 0}</div>
                        <div><span className="font-bold text-gray-600">Clicks:</span> {ad.clicks || 0}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          ad.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(ad)}
                          className="p-1 text-gray-500 hover:text-[#B3732A] hover:bg-amber-50 rounded"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
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
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-lg">
                {editId ? `Edit ${type.toUpperCase()} Ad` : `Add ${type.toUpperCase()} Ad`}
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Active Campaign *</label>
                  <select
                    value={campaignId}
                    required
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                  >
                    <option value="" disabled>-- Select Campaign --</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.advertiser?.companyName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Target Ad Slot *</label>
                  <select
                    value={slotId}
                    required
                    onChange={(e) => setSlotId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                  >
                    <option value="" disabled>-- Select Slot --</option>
                    {slots.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.placement} - {s.dimensions})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Creative Option: Banner Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Alternative Creative Option: Custom HTML / JavaScript Code
                </label>
                <textarea
                  rows={3}
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!-- Raw HTML code (e.g. AdSense iframe/script block) -->"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Destination Target URL</label>
                <input
                  type="text"
                  value={clickUrl}
                  onChange={(e) => setClickUrl(e.target.value)}
                  placeholder="https://advertiser.com/landing-page"
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ad Start Date</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ad End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
                  />
                </div>
              </div>

              {/* POPUP CONFIGURATIONS */}
              {type === 'popup' && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl space-y-3">
                  <span className="font-bold text-amber-900 text-xs block">Popup Ads Parameters</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-800 mb-1">Display Frequency</label>
                      <select
                        value={displayFrequency}
                        onChange={(e) => setDisplayFrequency(e.target.value)}
                        className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-xs bg-white focus:outline-none"
                      >
                        <option value="session">Once per Session</option>
                        <option value="visit">Every Visit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-800 mb-1">Delay Seconds</label>
                      <input
                        type="number"
                        min="0"
                        value={delaySeconds}
                        onChange={(e) => setDelaySeconds(e.target.value)}
                        className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="closeButtonRequired"
                      checked={closeButtonRequired}
                      onChange={(e) => setCloseButtonRequired(e.target.checked)}
                      className="rounded text-[#B3732A] focus:ring-[#B3732A]"
                    />
                    <label htmlFor="closeButtonRequired" className="text-xs font-semibold text-amber-850 cursor-pointer">
                      Close Button Required for Compliance
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] bg-white"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
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
