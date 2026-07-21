import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminDeals.css';

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [listingId, setListingId] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [terms, setTerms] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [status, setStatus] = useState('pending');

  const loadData = async () => {
    setLoading(true);
    try {
      const dealsData = await fetchApi('/admin/deals');
      if (Array.isArray(dealsData)) setDeals(dealsData);

      const bizData = await fetchApi('/admin/business-listings');
      if (Array.isArray(bizData)) setBusinesses(bizData);
    } catch (e) {
      console.error(e);
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
      setSuccessMsg('Deal approved and live.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve deal.');
    }
  };

  const handleReject = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${id}/reject`, { method: 'PUT' });
      setSuccessMsg('Deal rejected.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to reject deal.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/deals/${id}`, { method: 'DELETE' });
      setSuccessMsg('Deal deleted successfully.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete deal.');
    }
  };

  const handleEdit = (deal) => {
    setEditingId(deal.id);
    setTitle(deal.title || '');
    setListingId(deal.listingId || '');
    setDiscountType(deal.discountType || 'percent');
    setDiscountValue(deal.discountValue || '');
    setOriginalPrice(deal.originalPrice || '');
    setDiscountedPrice(deal.discountedPrice || '');
    setTerms(deal.terms || deal.termsConditions || '');
    setBannerUrl(deal.bannerUrl || deal.image || '');
    setValidFrom(deal.validFrom ? deal.validFrom.substring(0, 16) : '');
    setValidUntil(deal.validUntil ? deal.validUntil.substring(0, 16) : '');
    setStatus(deal.status || 'pending');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setListingId('');
    setDiscountType('percent');
    setDiscountValue('');
    setOriginalPrice('');
    setDiscountedPrice('');
    setTerms('');
    setBannerUrl('');
    setValidFrom('');
    setValidUntil('');
    setStatus('pending');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      title,
      listingId: listingId ? parseInt(listingId) : null,
      businessId: listingId ? parseInt(listingId) : null,
      discountType,
      discountValue: parseFloat(discountValue) || 0.0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      terms,
      termsConditions: terms,
      bannerUrl,
      image: bannerUrl,
      validFrom: validFrom ? validFrom + ":00" : null,
      validUntil: validUntil ? validUntil + ":00" : null,
      status
    };

    try {
      if (editingId) {
        await fetchApi(`/admin/deals/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Deal updated successfully.');
      } else {
        await fetchApi('/admin/deals', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Deal published successfully.');
      }
      resetForm();
      loadData();
    } catch (err) {
      setErrorMsg('Failed to save deal.');
    }
  };

  return (
    <div className="admin-deals-container">
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Promotional Deals & Offers</h1>
          <p className="subtitle">Publish BOGO offers, percentage discounts, flat deals, and link them to Business Directory merchants</p>
        </div>
        <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? 'Close Form' : '+ Add Deal / Offer'}
        </button>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3>{editingId ? 'Edit Promotional Deal' : 'Publish New Deal'}</h3>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Deal Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Link to Merchant Business (Optional)</label>
              <select value={listingId} onChange={(e) => setListingId(e.target.value)}>
                <option value="">Standalone Deal (No linked business)</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.businessName || b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Discount Type *</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="percent">Percent Discount (%)</option>
                <option value="flat">Flat Discount (Amount)</option>
                <option value="BOGO">BOGO (Buy One Get One)</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Discount Value *</label>
              <input type="number" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Original Price (Optional)</label>
              <input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Discounted Price (Optional)</label>
              <input type="number" step="0.01" value={discountedPrice} onChange={(e) => setDiscountedPrice(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Valid From</label>
              <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Valid Until *</label>
              <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Image/Banner URL</label>
              <input type="text" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved (Active)</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Terms & Conditions / Description *</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows="3" required></textarea>
          </div>

          <button type="submit" className="btn btn-primary">{editingId ? 'Update Deal' : 'Publish Deal'}</button>
        </form>
      )}

      {loading ? (
        <div className="loading-state">Syncing deals catalog...</div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Deal Title</th>
                <th>Merchant</th>
                <th>Discount</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">No deals published yet.</td>
                </tr>
              ) : (
                deals.map(deal => {
                  const linkedBiz = businesses.find(b => b.id === deal.listingId);
                  return (
                    <tr key={deal.id}>
                      <td>
                        {deal.bannerUrl || deal.image ? (
                          <img src={deal.bannerUrl || deal.image} alt={deal.title} style={{ width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No Banner</span>
                        )}
                      </td>
                      <td>
                        <strong>{deal.title}</strong>
                      </td>
                      <td>{linkedBiz ? (linkedBiz.businessName || linkedBiz.name) : <span style={{ color: '#64748b' }}>Standalone</span>}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontWeight: '700' }}>
                          {deal.discountType === 'percent' ? `${deal.discountValue}% Off` : deal.discountType === 'flat' ? `₹${deal.discountValue} Off` : 'BOGO'}
                        </span>
                      </td>
                      <td>{deal.validUntil ? new Date(deal.validUntil).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: deal.status === 'approved' ? '#dcfce7' : deal.status === 'expired' ? '#fee2e2' : '#fef3c7',
                          color: deal.status === 'approved' ? '#166534' : deal.status === 'expired' ? '#991b1b' : '#854d0e'
                        }}>
                          {deal.status === 'approved' ? 'Active' : deal.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {deal.status === 'pending' && (
                            <>
                              <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApprove(deal.id)}>Approve</button>
                              <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#dc2626' }} onClick={() => handleReject(deal.id)}>Reject</button>
                            </>
                          )}
                          <button className="action-btn edit-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleEdit(deal)}>Edit</button>
                          <button className="action-btn delete-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleDelete(deal.id)}>Delete</button>
                        </div>
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
  );
};

export default AdminDeals;
