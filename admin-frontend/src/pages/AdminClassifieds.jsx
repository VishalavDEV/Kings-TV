import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminClassifieds.css';

const AdminClassifieds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Queue filtering status
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Classified for inspection
  const [selectedAd, setSelectedAd] = useState(null);

  // Recategorize local state
  const [newCategory, setNewCategory] = useState('');

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/classifieds');
      if (Array.isArray(data)) {
        setAds(data);
      }
    } catch (e) {
      console.error("Could not load classifieds queue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleApprove = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/classifieds/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Classified listing approved and is active.');
      if (selectedAd && selectedAd.id === id) {
        setSelectedAd(prev => ({ ...prev, status: 'active' }));
      }
      loadAds();
    } catch (e) {
      setErrorMsg('Failed to approve listing.');
    }
  };

  const handleSuspend = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/classifieds/${id}/suspend`, { method: 'PUT' });
      setSuccessMsg('Classified listing suspended.');
      if (selectedAd && selectedAd.id === id) {
        setSelectedAd(prev => ({ ...prev, status: 'suspended' }));
      }
      loadAds();
    } catch (e) {
      setErrorMsg('Failed to suspend listing.');
    }
  };

  const handleRecategorize = async () => {
    if (!newCategory) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/classifieds/${selectedAd.id}/recategorize`, {
        method: 'PUT',
        body: JSON.stringify({ category: newCategory })
      });
      setSuccessMsg('Listing category reassigned successfully.');
      setSelectedAd(prev => ({ ...prev, category: newCategory }));
      setNewCategory('');
      loadAds();
    } catch (e) {
      setErrorMsg('Failed to recategorize listing.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/classifieds/${id}`, { method: 'DELETE' });
      setSuccessMsg('Classified listing deleted successfully.');
      setSelectedAd(null);
      loadAds();
    } catch (e) {
      setErrorMsg('Failed to delete listing.');
    }
  };

  const filteredAds = ads.filter(ad => {
    if (statusFilter === 'all') return true;
    return ad.status === statusFilter;
  });

  const categoriesList = ['Electronics', 'Properties', 'Jobs', 'Vehicles', 'Services', 'Others'];

  return (
    <div className="admin-classifieds-container">
      <div className="posts-header">
        <h1>Classified Listings Queue</h1>
        <p className="subtitle">Moderate peer-to-peer advertising posts, suspend violations, and recategorize listings</p>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="classifieds-layout" style={{ display: 'grid', gridTemplateColumns: selectedAd ? '3fr 2fr' : '1fr', gap: '20px' }}>
        {/* Main List Column */}
        <div className="classifieds-list-col">
          <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Filter Queue:</span>
            {['all', 'pending', 'active', 'suspended'].map(st => (
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
            <div className="loading-state">Loading classifieds catalog...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Seller Info</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">No classified listings found in this filter view.</td>
                    </tr>
                  ) : (
                    filteredAds.map(ad => (
                      <tr
                        key={ad.id}
                        className={`classified-row ${selectedAd?.id === ad.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAd(ad)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{ad.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ad.location}</div>
                        </td>
                        <td><span className="category-tag">{ad.category}</span></td>
                        <td><strong style={{ color: '#16a34a' }}>₹{ad.price}</strong></td>
                        <td>{ad.location}</td>
                        <td>{ad.contactInfo || ad.contactPhone}</td>
                        <td>
                          <span className={`status-badge ${ad.status}`}>
                            {ad.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAd(ad);
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Column */}
        {selectedAd && (
          <div className="classifieds-inspection-col">
            <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Inspect Advertisement</h3>
                <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedAd(null)}>×</button>
              </div>

              <div className="detail-body">
                {adImage(selectedAd) && (
                  <img src={adImage(selectedAd)} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                )}

                <h4 style={{ margin: '0 0 4px 0' }}>{selectedAd.title}</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', marginBottom: '1rem' }}>
                  ₹{selectedAd.price} {selectedAd.negotiable && <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Negotiable)</span>}
                </div>

                <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#1e293b' }}>Description</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{selectedAd.description}</p>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Classification</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedAd.category}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Seller Info</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedAd.contactInfo || selectedAd.contactPhone}</strong>
                  </div>
                </div>

                {/* Recategorization Form */}
                <div className="recategorize-section" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#334155' }}>Reassign Category</h5>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{ flexGrow: 1, padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="">-- Select Category --</option>
                      {categoriesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button className="btn btn-primary" onClick={handleRecategorize} style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#B3732A', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Apply
                    </button>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedAd.status !== 'active' && (
                    <button className="btn btn-approve" onClick={() => handleApprove(selectedAd.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Approve (Active)
                    </button>
                  )}
                  {selectedAd.status !== 'suspended' && (
                    <button className="btn btn-reject" onClick={() => handleSuspend(selectedAd.id)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Suspend Listing
                    </button>
                  )}
                  <button className="btn btn-delete" onClick={() => handleDelete(selectedAd.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
  );
};

// Helper for image URLs
const adImage = (ad) => {
  return ad.imageUrl || ad.image || null;
};

export default AdminClassifieds;
