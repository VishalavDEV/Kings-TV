import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminBusinessDirectory.css';

const AdminBusinessDirectory = () => {
  const [activeTab, setActiveTab] = useState('listings'); // listings / categories
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Listings Form States
  const [businessName, setBusinessName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [addressLocality, setAddressLocality] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [hoursJson, setHoursJson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState('pending');
  const [ownerId, setOwnerId] = useState('');
  const [slug, setSlug] = useState('');

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
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve listing.');
    }
  };

  const handleReject = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/${id}/reject`, { method: 'PUT' });
      setSuccessMsg('Business listing rejected successfully.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to reject listing.');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/business-listings/${id}`, { method: 'DELETE' });
      setSuccessMsg('Listing deleted successfully.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete listing.');
    }
  };

  const handleEditListing = (item) => {
    setEditingId(item.id);
    setBusinessName(item.businessName || '');
    setCategoryName(item.category || '');
    setCategoryId(item.categoryId || '');
    setSubcategory(item.subcategory || '');
    setDescription(item.description || '');
    setAddress(item.address || '');
    setAddressLocality(item.addressLocality || '');
    setAddressStreet(item.addressStreet || '');
    setWorkingHours(item.workingHours || '');
    setHoursJson(item.hoursJson || '');
    setPhoneNumber(item.phoneNumber || item.phone || '');
    setEmail(item.email || '');
    setWebsite(item.website || '');
    setLogoUrl(item.logoUrl || item.logo || '');
    setCoverUrl(item.coverUrl || item.coverImage || '');
    setLatitude(item.latitude || '');
    setLongitude(item.longitude || '');
    setIsVerified(item.isVerified || false);
    setStatus(item.status || 'pending');
    setOwnerId(item.ownerId || '');
    setSlug(item.slug || '');
    setShowForm(true);
  };

  const resetListingForm = () => {
    setEditingId(null);
    setBusinessName('');
    setCategoryName('');
    setCategoryId('');
    setSubcategory('');
    setDescription('');
    setAddress('');
    setAddressLocality('');
    setAddressStreet('');
    setWorkingHours('');
    setHoursJson('');
    setPhoneNumber('');
    setEmail('');
    setWebsite('');
    setLogoUrl('');
    setCoverUrl('');
    setLatitude('');
    setLongitude('');
    setIsVerified(false);
    setStatus('pending');
    setOwnerId('');
    setSlug('');
    setShowForm(false);
  };

  const handleSaveListingSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const payload = {
      businessName,
      name: businessName,
      category: categoryName,
      categoryId: parseInt(categoryId) || null,
      subcategory,
      description,
      address,
      addressLocality,
      addressStreet,
      workingHours,
      hoursJson,
      phoneNumber,
      phone: phoneNumber,
      email,
      website,
      logoUrl,
      logo: logoUrl,
      coverUrl,
      coverImage: coverUrl,
      latitude: parseFloat(latitude) || null,
      longitude: parseFloat(longitude) || null,
      isVerified,
      status,
      ownerId: parseInt(ownerId) || null,
      slug
    };

    try {
      if (editingId) {
        await fetchApi(`/admin/business-listings/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Business listing updated successfully.');
      } else {
        await fetchApi('/admin/business-listings', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Business listing created successfully.');
      }
      resetListingForm();
      loadData();
    } catch (e) {
      setErrorMsg('Failed to save business listing.');
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

  return (
    <div className="admin-business-directory-container">
      <div className="posts-header">
        <h1>Local Business Directory</h1>
        <p className="subtitle">Moderate business listings, verify company info, and customize directory categories</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('listings'); resetListingForm(); }}
          style={{ background: 'transparent', border: 'none', fontWeight: activeTab === 'listings' ? '800' : '500', color: activeTab === 'listings' ? '#B3732A' : '#64748b', cursor: 'pointer', padding: '0.5rem 1rem' }}
        >
          Business Listings
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => { setActiveTab('categories'); setShowCatForm(false); }}
          style={{ background: 'transparent', border: 'none', fontWeight: activeTab === 'categories' ? '800' : '500', color: activeTab === 'categories' ? '#B3732A' : '#64748b', cursor: 'pointer', padding: '0.5rem 1rem' }}
        >
          Directory Categories
        </button>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {activeTab === 'listings' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel Form' : '+ Add Business Listing'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveListingSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <h3>{editingId ? 'Edit Business Listing' : 'Create New Business Listing'}</h3>
              <div className="form-group">
                <label>Business Name *</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Category (Text representation) *</label>
                  <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Restaurants" required />
                </div>
                <div className="form-group half">
                  <label>Select Parent Category ID</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">-- None / Select category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Subcategory</label>
                  <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g. Vegetarian" />
                </div>
                <div className="form-group half">
                  <label>Slug (optional)</label>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. hotel-saravana-bhavan" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Phone Number</label>
                  <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div className="form-group half">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Website URL</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              </div>

              <div className="form-group">
                <label>Full Address Description</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street, area details" />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Address Locality</label>
                  <input type="text" value={addressLocality} onChange={(e) => setAddressLocality(e.target.value)} placeholder="e.g. Chennai" />
                </div>
                <div className="form-group half">
                  <label>Address Street</label>
                  <input type="text" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} placeholder="e.g. T-Nagar" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Logo Image URL</label>
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                </div>
                <div className="form-group half">
                  <label>Cover Banner Image URL</label>
                  <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Geo Latitude</label>
                  <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 13.0827" />
                </div>
                <div className="form-group half">
                  <label>Geo Longitude</label>
                  <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 80.2707" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Hours description</label>
                  <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="e.g. 9:00 AM - 9:00 PM" />
                </div>
                <div className="form-group half">
                  <label>Hours JSON</label>
                  <input type="text" value={hoursJson} onChange={(e) => setHoursJson(e.target.value)} placeholder='{"mon":"09:00-21:00"}' />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Owner User ID (optional)</label>
                  <input type="number" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} />
                </div>
                <div className="form-group half">
                  <label>Moderation Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved / Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                <input type="checkbox" id="verifiedCheck" checked={isVerified} onChange={(e) => setIsVerified(e.target.checked)} />
                <label htmlFor="verifiedCheck">Is Verified Business (Verification Badge)</label>
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"></textarea>
              </div>

              <button type="submit" className="btn btn-primary">{editingId ? 'Update Listing' : 'Create Listing'}</button>
            </form>
          )}

          {loading ? (
            <div className="loading-state">Loading directories...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Verified</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">No business listings cataloged.</td>
                    </tr>
                  ) : (
                    listings.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.businessName || item.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.slug}</div>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.addressLocality || 'Tamil Nadu'}</td>
                        <td>
                          {item.isVerified ? (
                            <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '0.75rem', background: '#dbeafe', padding: '2px 8px', borderRadius: '999px' }}>
                              <i className="fa-solid fa-circle-check"></i> Verified
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No</span>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: item.status === 'approved' ? '#dcfce7' : item.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: item.status === 'approved' ? '#166534' : item.status === 'rejected' ? '#991b1b' : '#854d0e'
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {item.status === 'pending' && (
                              <>
                                <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApprove(item.id)}>Approve</button>
                                <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#dc2626' }} onClick={() => handleReject(item.id)}>Reject</button>
                              </>
                            )}
                            <button className="action-btn edit-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleEditListing(item)}>Edit</button>
                            <button className="action-btn delete-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleDeleteListing(item.id)}>Delete</button>
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
