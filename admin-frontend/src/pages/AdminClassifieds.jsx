import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminClassifieds.css';

const AdminClassifieds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Others');
  const [location, setLocation] = useState('Tamil Nadu');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/classifieds');
      if (Array.isArray(data)) {
        setAds(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/classifieds', {
        method: 'POST',
        body: JSON.stringify({
          title,
          price: parseFloat(price) || 0.0,
          category,
          location,
          description,
          contactInfo,
          imageUrl: imageUrl || null,
          status: 'active'
        })
      });
      if (res) {
        setSuccessMsg('Classified listing published successfully.');
        setTitle('');
        setPrice('');
        setDescription('');
        setContactInfo('');
        setImageUrl('');
        setShowAddForm(false);
        loadAds();
      }
    } catch (err) {
      setErrorMsg('Failed to create classified listing.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetchApi(`/classifieds/${id}`, { method: 'DELETE' });
      setSuccessMsg('Listing deleted successfully.');
      loadAds();
    } catch (e) {
      setErrorMsg('Failed to delete listing.');
    }
  };

  return (
    <div className="admin-classifieds-container">
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Classified Listings Manager</h1>
          <p className="subtitle">Publish, moderate, and remove user listings and advertisements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Close Form' : '+ Add Listing'}
        </button>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3>Create New Classified Listing</h3>
          <div className="form-group">
            <label>Listing Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Price (INR) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Jobs">Jobs</option>
                <option value="Properties">Properties</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Services">Services</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Location *</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Contact Info (Phone/Email) *</label>
              <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Mock Image URL</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/item.jpg" />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" required></textarea>
          </div>
          <button type="submit" className="btn btn-primary">Publish Listing</button>
        </form>
      )}

      {loading ? (
        <div className="loading-state">Loading listings...</div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Location</th>
                <th>Seller info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">No classified listings found.</td>
                </tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id}>
                    <td><strong>{ad.title}</strong></td>
                    <td>{ad.category}</td>
                    <td><strong className="text-emerald-600">₹{ad.price}</strong></td>
                    <td>{ad.location}</td>
                    <td>{ad.contactInfo}</td>
                    <td><span className="status-badge active">{ad.status}</span></td>
                    <td>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(ad.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminClassifieds;
