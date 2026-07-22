import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminBusinessDirectory.css';

const AdminBusinessDirectory = () => {
  const [activeTab, setActiveTab] = useState('listings'); // listings / categories
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Status filtering state for listings
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal States
  const [selectedListing, setSelectedListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reject / More-Info Prompt States
  const [promptMode, setPromptMode] = useState(null); // 'reject' or 'more-info'
  const [promptText, setPromptText] = useState('');

  // Category Form States
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const listData = await fetchApi('/admin/business-listings');
      if (Array.isArray(listData)) setListings(listData);

      const catData = await fetchApi('/admin/business-listings/categories');
      if (Array.isArray(catData)) setCategories(catData);
    } catch (e) {
      console.error("Could not load directory listings", e);
    } finally {
      setLoading(true); // wait for a short bit
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
      await fetchApi(`/admin/business-listings/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Business listing approved successfully.');
      if (selectedListing && selectedListing.id === id) {
        setSelectedListing(prev => ({ ...prev, status: 'approved' }));
      }
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve listing.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/${selectedListing.id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: promptText })
      });
      setSuccessMsg('Business listing rejected.');
      setSelectedListing(prev => ({ ...prev, status: 'rejected', rejectionReason: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to reject listing.');
    }
  };

  const handleMoreInfoSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/${selectedListing.id}/more-info`, {
        method: 'PUT',
        body: JSON.stringify({ note: promptText })
      });
      setSuccessMsg('Request for more information sent.');
      setSelectedListing(prev => ({ ...prev, status: 'pending', moreInfoNote: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to send request for more information.');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/${id}`, { method: 'DELETE' });
      setSuccessMsg('Listing deleted successfully.');
      setSelectedListing(null);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete listing.');
    }
  };

  const viewListingDetails = async (item) => {
    setSelectedListing(item);
    setReviews([]);
    setReviewsLoading(true);
    try {
      const reviewList = await fetchApi(`/directory/${item.id}/reviews`);
      if (Array.isArray(reviewList)) setReviews(reviewList);
    } catch (e) {
      console.warn("Could not load reviews for listing", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await fetchApi(`/admin/business-listings/reviews/${reviewId}`, { method: 'DELETE' });
      setSuccessMsg('Review deleted successfully.');
      if (selectedListing) {
        viewListingDetails(selectedListing);
      }
    } catch (e) {
      setErrorMsg('Failed to delete review.');
    }
  };

  // --- Category Sub-Tab CRUD Handlers ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const payload = { name: catName, slug: catSlug, icon: catIcon };

    try {
      if (editingCatId) {
        await fetchApi(`/admin/business-listings/categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Category updated successfully.');
      } else {
        await fetchApi('/admin/business-listings/categories', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Category created successfully.');
      }
      setCatName('');
      setCatSlug('');
      setCatIcon('');
      setEditingCatId(null);
      setShowCatForm(false);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to save category.');
    }
  };

  const handleEditCat = (item) => {
    setEditingCatId(item.id);
    setCatName(item.name || '');
    setCatSlug(item.slug || '');
    setCatIcon(item.icon || '');
    setShowCatForm(true);
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/categories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Category deleted successfully.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete category.');
    }
  };

  const filteredListings = listings.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="admin-business-directory-container">
      <div className="posts-header">
        <h1>Local Business Directory</h1>
        <p className="subtitle">Review and moderate business listings, inspect KYC docs, and manage categories</p>
      </div>

      <div className="tab-menu">
        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('listings'); setSelectedListing(null); }}
        >
          <i className="fa-solid fa-list"></i> Directory Moderation Queue
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); setShowCatForm(false); }}
        >
          <i className="fa-solid fa-tags"></i> Directory Categories
        </button>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      {activeTab === 'listings' && (
        <div className="listings-grid-layout">
          {/* Main List Column */}
          <div className="listings-main-col">
            <div className="filters-container">
              <span className="filter-label">Filter Status:</span>
              <div className="status-pills">
                {['all', 'pending', 'approved', 'rejected'].map(st => (
                  <button
                    key={st}
                    className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Loading business listings...</div>
            ) : (
              <div className="table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Business Details</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-table">No business listings found in this queue.</td>
                      </tr>
                    ) : (
                      filteredListings.map(item => (
                        <tr
                          key={item.id}
                          className={`listing-row ${selectedListing?.id === item.id ? 'selected' : ''}`}
                          onClick={() => viewListingDetails(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="business-name-title">
                              <strong>{item.businessName || item.name}</strong>
                              {item.isVerified && <span className="verified-badge"><i className="fa-solid fa-circle-check"></i></span>}
                            </div>
                            <div className="details-sub">{item.email} | {item.phone || item.phoneNumber}</div>
                          </td>
                          <td><span className="category-tag">{item.category}</span></td>
                          <td>{item.addressLocality || 'Tamil Nadu'}</td>
                          <td>
                            <span className={`status-badge ${item.status}`}>
                              {item.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                viewListingDetails(item);
                              }}
                            >
                              Inspect <i className="fa-solid fa-magnifying-glass"></i>
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

          {/* Details & Inspection Column */}
          {selectedListing && (
            <div className="listings-detail-col">
              <div className="card detail-card">
                <div className="detail-header">
                  <h3>Inspect Business Details</h3>
                  <button className="close-btn" onClick={() => setSelectedListing(null)}>×</button>
                </div>

                <div className="detail-body">
                  <div className="logo-banner-preview">
                    {selectedListing.logoUrl && (
                      <img src={selectedListing.logoUrl} alt="Logo" className="logo-preview" />
                    )}
                    <h4>{selectedListing.businessName || selectedListing.name}</h4>
                  </div>

                  <div className="detail-section">
                    <h5>Overview</h5>
                    <p>{selectedListing.description || 'No description provided.'}</p>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Contact Email</span>
                      <span className="value">{selectedListing.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone Number</span>
                      <span className="value">{selectedListing.phoneNumber || selectedListing.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address</span>
                      <span className="value">
                        {selectedListing.addressStreet ? `${selectedListing.addressStreet}, ` : ''}
                        {selectedListing.addressLocality || 'Tamil Nadu'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Website</span>
                      <span className="value">
                        {selectedListing.website ? (
                          <a href={selectedListing.website} target="_blank" rel="noreferrer">{selectedListing.website}</a>
                        ) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* KYC Documents Panel */}
                  <div className="detail-section kyc-section">
                    <h5><i className="fa-solid fa-id-card"></i> KYC Document Verification</h5>
                    {selectedListing.kycDocumentUrl ? (
                      <div className="kyc-file-preview">
                        <span className="kyc-icon"><i className="fa-solid fa-file-pdf"></i></span>
                        <a href={selectedListing.kycDocumentUrl} target="_blank" rel="noreferrer" className="kyc-link">
                          View Verification Document (PDF/Image)
                        </a>
                      </div>
                    ) : (
                      <div className="kyc-empty">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> No verification documentation uploaded by user.
                      </div>
                    )}
                  </div>

                  {selectedListing.status === 'rejected' && selectedListing.rejectionReason && (
                    <div className="detail-section reason-alert reject">
                      <h5>Rejection Reason</h5>
                      <p>{selectedListing.rejectionReason}</p>
                    </div>
                  )}

                  {selectedListing.moreInfoNote && (
                    <div className="detail-section reason-alert info">
                      <h5>Request Note (More Info)</h5>
                      <p>{selectedListing.moreInfoNote}</p>
                    </div>
                  )}

                  <div className="detail-actions">
                    {selectedListing.status !== 'approved' && (
                      <button className="btn btn-approve" onClick={() => handleApprove(selectedListing.id)}>
                        <i className="fa-solid fa-circle-check"></i> Approve & Publish
                      </button>
                    )}
                    <button className="btn btn-reject" onClick={() => setPromptMode('reject')}>
                      <i className="fa-solid fa-circle-xmark"></i> Reject Listing
                    </button>
                    <button className="btn btn-info" onClick={() => setPromptMode('more-info')}>
                      <i className="fa-solid fa-question-circle"></i> Request More Info
                    </button>
                    <button className="btn btn-delete" onClick={() => handleDeleteListing(selectedListing.id)}>
                      <i className="fa-solid fa-trash"></i> Delete Listing
                    </button>
                  </div>

                  {/* Prompt Dialog Box */}
                  {promptMode && (
                    <div className="prompt-overlay">
                      <div className="prompt-box">
                        <h4>{promptMode === 'reject' ? 'Rejection Reason' : 'Request More Info Note'}</h4>
                        <textarea
                          placeholder={promptMode === 'reject' ? 'Enter the reason for rejection...' : 'Specify what additional details are needed...'}
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          rows="4"
                        />
                        <div className="prompt-buttons">
                          <button className="btn btn-secondary" onClick={() => { setPromptMode(null); setPromptText(''); }}>Cancel</button>
                          <button className="btn btn-primary" onClick={promptMode === 'reject' ? handleRejectSubmit : handleMoreInfoSubmit}>
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Moderation Section */}
                  <div className="detail-section reviews-moderation-section">
                    <h5><i className="fa-solid fa-comments"></i> Reviews Moderation</h5>
                    {reviewsLoading ? (
                      <div className="reviews-loading">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                      <p className="no-reviews">No reviews posted for this business yet.</p>
                    ) : (
                      <div className="reviews-list">
                        {reviews.map(rev => (
                          <div key={rev.id} className="review-card">
                            <div className="rev-head">
                              <strong>{rev.reviewerName}</strong>
                              <span className="rating-stars">
                                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                              </span>
                            </div>
                            <p className="rev-text">"{rev.comment}"</p>
                            <div className="rev-foot">
                              <span>Rating: {rev.rating} / 5</span>
                              <button className="delete-rev-btn" onClick={() => handleDeleteReview(rev.id)}>
                                <i className="fa-solid fa-trash-can"></i> Delete
                              </button>
                            </div>
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
      )}

      {activeTab === 'categories' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowCatForm(!showCatForm)}>
              {showCatForm ? 'Cancel Form' : '+ Add Category'}
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleSaveCategory} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h3>{editingCatId ? 'Edit Directory Category' : 'Create Directory Category'}</h3>
              <div className="form-group">
                <label>Category Name *</label>
                <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input type="text" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="e.g. food-restaurants" />
              </div>
              <div className="form-group">
                <label>Icon Style Class (FontAwesome)</label>
                <input type="text" value={catIcon} onChange={(e) => setCatIcon(e.target.value)} placeholder="e.g. fa-utensils" />
              </div>
              <button type="submit" className="btn btn-primary">Save Category</button>
            </form>
          )}

          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Slug</th>
                    <th>Icon Class</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-table">No directory categories cataloged.</td>
                    </tr>
                  ) : (
                    categories.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.name}</strong></td>
                        <td><code>{c.slug}</code></td>
                        <td><i className={`fa-solid ${c.icon || 'fa-tag'}`} style={{ marginRight: '8px' }}></i> {c.icon || 'fa-tag'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="action-btn edit-btn" onClick={() => handleEditCat(c)}>Edit</button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteCat(c.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBusinessDirectory;
