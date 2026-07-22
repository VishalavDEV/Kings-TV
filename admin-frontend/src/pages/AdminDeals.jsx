import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminDeals.css';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering status for deals
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Deal Detail Modal
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Reject / Request More Info Prompt States
  const [promptMode, setPromptMode] = useState(null); // 'reject' or 'more-info'
  const [promptText, setPromptText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const dealsData = await fetchApi('/admin/deals');
      if (Array.isArray(dealsData)) setDeals(dealsData);

      const bizData = await fetchApi('/admin/business-listings');
      if (Array.isArray(bizData)) setBusinesses(bizData);

      const redemptionsData = await fetchApi('/admin/deals/redemptions');
      if (Array.isArray(redemptionsData)) setRedemptions(redemptionsData);
    } catch (e) {
      console.error("Could not load deals administration data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Deal approved and is now active.');
      if (selectedDeal && selectedDeal.id === id) {
        setSelectedDeal(prev => ({ ...prev, status: 'approved' }));
      }
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve deal.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${selectedDeal.id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: promptText })
      });
      setSuccessMsg('Deal rejected successfully.');
      setSelectedDeal(prev => ({ ...prev, status: 'rejected', rejectionReason: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to reject deal.');
    }
  };

  const handleMoreInfoSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${selectedDeal.id}/more-info`, {
        method: 'PUT',
        body: JSON.stringify({ note: promptText })
      });
      setSuccessMsg('Request for more information sent.');
      setSelectedDeal(prev => ({ ...prev, status: 'pending', moreInfoNote: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to request more info.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${id}`, { method: 'DELETE' });
      setSuccessMsg('Deal deleted successfully.');
      setSelectedDeal(null);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete deal.');
    }
  };

  const filteredDeals = deals.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Filter redemptions for currently selected deal
  const dealRedemptions = redemptions.filter(r => r.dealId === selectedDeal?.id);

  return (
    <div className="admin-deals-container">
      <div className="posts-header">
        <h1>Promotional Deals & Offers</h1>
        <p className="subtitle">Review BOGO offers, percentage discounts, flat deals, and monitor redemptions count</p>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="deals-grid-layout" style={{ display: 'grid', gridTemplateColumns: selectedDeal ? '3fr 2fr' : '1fr', gap: '20px' }}>
        {/* Main List Column */}
        <div className="deals-main-col">
          <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span className="filter-label" style={{ fontWeight: 700, color: '#475569' }}>Filter Queue:</span>
            {['all', 'pending', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? '#B3732A' : '#f1f5f9',
                  color: statusFilter === st ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Loading deals queue...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Deal Title</th>
                    <th>Merchant</th>
                    <th>Discount</th>
                    <th>Redemptions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">No deals in this moderation state.</td>
                    </tr>
                  ) : (
                    filteredDeals.map(deal => {
                      const linkedBiz = businesses.find(b => b.id === deal.listingId);
                      return (
                        <tr
                          key={deal.id}
                          className={`deal-row ${selectedDeal?.id === deal.id ? 'selected' : ''}`}
                          onClick={() => setSelectedDeal(deal)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            {deal.bannerUrl || deal.image ? (
                              <img src={deal.bannerUrl || deal.image} alt={deal.title} style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Banner</span>
                            )}
                          </td>
                          <td>
                            <strong>{deal.title}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Expires: {deal.validUntil ? new Date(deal.validUntil).toLocaleDateString() : 'N/A'}</div>
                          </td>
                          <td>{linkedBiz ? (linkedBiz.businessName || linkedBiz.name) : <span style={{ color: '#64748b' }}>Standalone</span>}</td>
                          <td>
                            <span style={{ fontWeight: '700', color: '#B3732A' }}>
                              {deal.discountType === 'percent' ? `${deal.discountValue}% Off` : deal.discountType === 'flat' ? `₹${deal.discountValue} Off` : 'BOGO'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#0057FF' }}>{deal.redemptionCount || 0}</strong> / {deal.usageLimit || 100}
                          </td>
                          <td>
                            <span className={`status-badge ${deal.status}`}>
                              {deal.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDeal(deal);
                              }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Column */}
        {selectedDeal && (
          <div className="deals-detail-col">
            <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Inspect Deal Details</h3>
                <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedDeal(null)}>×</button>
              </div>

              <div className="detail-body">
                {selectedDeal.bannerUrl && (
                  <img src={selectedDeal.bannerUrl} alt="Banner" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                )}

                <h4 style={{ margin: '0 0 0.5rem 0' }}>{selectedDeal.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>{selectedDeal.terms || selectedDeal.termsConditions}</p>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Coupon Code</span>
                    <strong className="value" style={{ fontSize: '0.9rem', color: '#1e293b' }}>{selectedDeal.couponCode || 'N/A'}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Discount Rate</span>
                    <strong className="value" style={{ fontSize: '0.9rem', color: '#B3732A' }}>
                      {selectedDeal.discountType === 'percent' ? `${selectedDeal.discountValue}% Off` : `₹${selectedDeal.discountValue} Off`}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Validity Period</span>
                    <span className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      {new Date(selectedDeal.validFrom).toLocaleDateString()} - {new Date(selectedDeal.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Usage Count</span>
                    <span className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      {selectedDeal.redemptionCount || 0} / {selectedDeal.usageLimit || 100} redemptions
                    </span>
                  </div>
                </div>

                {selectedDeal.status === 'rejected' && selectedDeal.rejectionReason && (
                  <div className="detail-section reason-alert reject" style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '0.85rem' }}>Rejection Reason</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d' }}>{selectedDeal.rejectionReason}</p>
                  </div>
                )}

                {selectedDeal.moreInfoNote && (
                  <div className="detail-section reason-alert info" style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#1e3a8a', fontSize: '0.85rem' }}>Request Note (More Info)</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#172554' }}>{selectedDeal.moreInfoNote}</p>
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {selectedDeal.status !== 'approved' && (
                    <button className="btn btn-approve" onClick={() => handleApprove(selectedDeal.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Approve
                    </button>
                  )}
                  <button className="btn btn-reject" onClick={() => setPromptMode('reject')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Reject
                  </button>
                  <button className="btn btn-info" onClick={() => setPromptMode('more-info')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Request More Info
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(selectedDeal.id)} style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                </div>

                {/* Prompt Dialog Box */}
                {promptMode && (
                  <div className="prompt-overlay" style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{promptMode === 'reject' ? 'Provide Rejection Reason' : 'Provide Request More Info Note'}</h4>
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Type details..."
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => { setPromptMode(null); setPromptText(''); }} style={{ background: '#e2e8f0', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      <button className="btn btn-primary" onClick={promptMode === 'reject' ? handleRejectSubmit : handleMoreInfoSubmit} style={{ background: '#B3732A', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
                    </div>
                  </div>
                )}

                {/* Coupon Redemptions Log */}
                <div className="redemptions-log-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0' }}><i className="fa-solid fa-receipt"></i> Redemptions History</h4>
                  {dealRedemptions.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No redemptions logged for this coupon yet.</p>
                  ) : (
                    <div className="redemptions-list" style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {dealRedemptions.map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid #f1f5f9' }}>
                          <div>
                            <strong>Reader ID: {r.readerId}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Code: {r.redemptionCode}</div>
                          </div>
                          <span style={{ color: '#64748b' }}>{new Date(r.redeemedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
  );
};

export default AdminDeals;
