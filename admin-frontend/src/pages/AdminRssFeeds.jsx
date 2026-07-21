import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminRssFeeds.css';

const AdminRssFeeds = () => {
  const [feeds, setFeeds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingId, setFetchingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    sourceUrl: '',
    categoryId: '',
    autoImportInterval: 60,
    language: 'ta',
    enabled: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [feedData, catData] = await Promise.allSettled([
        fetchApi('/admin/rss-feeds'),
        fetchApi('/admin/categories')
      ]);

      if (feedData.status === 'fulfilled' && Array.isArray(feedData.value)) {
        setFeeds(feedData.value);
      }
      if (catData.status === 'fulfilled' && Array.isArray(catData.value)) {
        setCategories(catData.value);
        if (catData.value.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catData.value[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load RSS Feeds data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      sourceUrl: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      autoImportInterval: 60,
      language: 'ta',
      enabled: true
    });
    setErrorMsg('');
  };

  const handleEdit = (feed) => {
    setEditingId(feed.id);
    setFormData({
      name: feed.name || '',
      sourceUrl: feed.sourceUrl || '',
      categoryId: feed.categoryId || (categories.length > 0 ? categories[0].id : ''),
      autoImportInterval: feed.autoImportInterval || 60,
      language: feed.language || 'ta',
      enabled: feed.enabled !== false
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.sourceUrl.trim()) {
      setErrorMsg('Feed name and source URL are required.');
      return;
    }

    try {
      const endpoint = editingId ? `/admin/rss-feeds/${editingId}` : '/admin/rss-feeds';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        autoImportInterval: parseInt(formData.autoImportInterval, 10) || 60
      };

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(editingId ? 'RSS Feed updated successfully!' : 'RSS Feed added successfully!');
        resetForm();
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save RSS feed');
    }
  };

  const handleFetchNow = async (feedId) => {
    setFetchingId(feedId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetchApi(`/admin/rss-feeds/${feedId}/fetch-now`, { method: 'POST' });
      if (res && res.importedCount !== undefined) {
        setSuccessMsg(`Fetched successfully! Imported ${res.importedCount} new draft articles (${res.skippedCount} skipped).`);
        loadData();
      } else if (res && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch RSS feed items');
    } finally {
      setFetchingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this RSS Feed?')) return;
    try {
      await fetchApi(`/admin/rss-feeds/${id}`, { method: 'DELETE' });
      setSuccessMsg('RSS Feed deleted successfully!');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to delete RSS Feed');
    }
  };

  const getCategoryName = (catId) => {
    const found = categories.find((c) => String(c.id) === String(catId));
    return found ? found.name : 'General';
  };

  return (
    <div className="admin-rss-container">
      <div className="pages-header">
        <h1>RSS Feed Auto-Import Engine</h1>
        <p className="subtitle">Configure external RSS sources to pull and create news draft stories automatically</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Form */}
        <div className="form-panel">
          <h2>{editingId ? 'Edit RSS Feed' : 'Add New RSS Feed'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Feed Title / Source Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. BBC News Tamil RSS"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sourceUrl">Source XML URL *</label>
              <input
                type="url"
                id="sourceUrl"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleInputChange}
                placeholder="https://feeds.example.com/rss.xml"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Category Mapping</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="language">Target Language</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="autoImportInterval">Interval (Minutes)</label>
              <input
                type="number"
                id="autoImportInterval"
                name="autoImportInterval"
                value={formData.autoImportInterval}
                onChange={handleInputChange}
                min="15"
              />
            </div>

            <div className="form-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleInputChange}
                />
                <span>Feed Enabled for Auto-Import</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Feed Changes' : 'Add RSS Feed'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Table */}
        <div className="table-panel">
          <h2>Registered Feeds ({feeds.length})</h2>
          {loading ? (
            <div className="loading-state">Loading RSS feeds...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Feed Name & URL</th>
                    <th>Category</th>
                    <th>Interval</th>
                    <th>Last Fetched</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {feeds.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        No RSS feeds configured.
                      </td>
                    </tr>
                  ) : (
                    feeds.map((feed) => (
                      <tr key={feed.id}>
                        <td>#{feed.id}</td>
                        <td>
                          <div className="feed-info-cell">
                            <span className="font-bold text-slate-800">{feed.name}</span>
                            <a href={feed.sourceUrl} target="_blank" rel="noreferrer" className="feed-url-link">
                              {feed.sourceUrl}
                            </a>
                          </div>
                        </td>
                        <td>
                          <span className="cat-chip-badge">{getCategoryName(feed.categoryId)}</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600 font-semibold">{feed.autoImportInterval || 60} min</span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-500">
                            {feed.lastFetchedAt ? new Date(feed.lastFetchedAt).toLocaleString() : 'Never'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn publish-btn"
                              onClick={() => handleFetchNow(feed.id)}
                              disabled={fetchingId === feed.id}
                            >
                              <i className={`fa-solid ${fetchingId === feed.id ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> Fetch Now
                            </button>
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(feed)}
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(feed.id)}
                            >
                              <i className="fa-solid fa-trash-can"></i>
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
        </div>
      </div>
    </div>
  );
};

export default AdminRssFeeds;
