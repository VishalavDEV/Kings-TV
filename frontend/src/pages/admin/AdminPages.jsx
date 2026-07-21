import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminPages.css';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    keywords: '',
    language: 'ta',
    parentLinkId: '',
    menuOrder: 0,
    location: 'NONE',
    content: ''
  });

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/pages');
      if (Array.isArray(res)) {
        setPages(res);
      }
    } catch (err) {
      console.error('Failed to load dynamic pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      keywords: '',
      language: 'ta',
      parentLinkId: '',
      menuOrder: 0,
      location: 'NONE',
      content: ''
    });
    setErrorMsg('');
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      description: p.description || '',
      keywords: p.keywords || '',
      language: p.language || 'ta',
      parentLinkId: p.parentLinkId || '',
      menuOrder: p.menuOrder || 0,
      location: p.location || 'NONE',
      content: p.content || ''
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Page title is required');
      return;
    }

    try {
      const pageId = editingId;
      const endpoint = pageId ? `/admin/pages/${pageId}` : '/admin/pages';
      const method = pageId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        parentLinkId: formData.parentLinkId ? parseInt(formData.parentLinkId, 10) : null,
        menuOrder: parseInt(formData.menuOrder, 10) || 0
      };

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(pageId ? 'Page updated successfully!' : 'Page created successfully!');
        resetForm();
        loadPages();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving page');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom page?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/pages/${id}`, { method: 'DELETE' });
      setSuccessMsg('Page deleted successfully');
      loadPages();
    } catch (err) {
      setErrorMsg('Failed to delete page');
    }
  };

  const getParentPageTitle = (parentId) => {
    const parent = pages.find((p) => String(p.id) === String(parentId));
    return parent ? parent.title : `Page #${parentId || 'N/A'}`;
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter ? p.location === locationFilter : true;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="admin-pages-container">
      <div className="pages-header">
        <h1>Dynamic Pages Management</h1>
        <p className="subtitle">Create and manage custom website pages and static contents</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left view: Add/Edit Form */}
        <div className="form-panel">
          <h2>{editingId ? 'Edit Page details' : 'Add New Custom Page'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="title">Page Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Terms of Services"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Unique Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g. terms-of-services"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="language">Language</label>
                <select id="language" name="language" value={formData.language} onChange={handleInputChange}>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="form-group half">
                <label>Menu Location</label>
                <div className="radio-group-options flex flex-col gap-1 mt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input type="radio" name="location" value="TOP_MENU" checked={formData.location === 'TOP_MENU'} onChange={handleInputChange} />
                    Top Menu
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input type="radio" name="location" value="MAIN_MENU" checked={formData.location === 'MAIN_MENU'} onChange={handleInputChange} />
                    Main Menu
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input type="radio" name="location" value="FOOTER" checked={formData.location === 'FOOTER'} onChange={handleInputChange} />
                    Footer
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                    <input type="radio" name="location" value="NONE" checked={formData.location === 'NONE'} onChange={handleInputChange} />
                    Don't Add to Menu
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="parentLinkId">Parent Link Page</label>
                <select id="parentLinkId" name="parentLinkId" value={formData.parentLinkId} onChange={handleInputChange}>
                  <option value="">None</option>
                  {pages
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group half">
                <label htmlFor="menuOrder">Menu Order</label>
                <input
                  type="number"
                  id="menuOrder"
                  name="menuOrder"
                  value={formData.menuOrder}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">Page Body Content *</label>
              <textarea
                id="content"
                name="content"
                rows="8"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write page content details (HTML supported)..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Meta SEO Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Meta tag description..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="keywords">Meta SEO Keywords</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="comma, separated, keywords"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Page' : 'Create Page'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right view: Pages Table */}
        <div className="table-panel">
          <div className="table-header-controls">
            <h2>Custom Pages ({filteredPages.length})</h2>
            <div className="flex gap-2">
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="NONE">None</option>
                <option value="TOP_MENU">Top Menu</option>
                <option value="MAIN_MENU">Main Menu</option>
                <option value="FOOTER">Footer</option>
              </select>

              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading pages list...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Parent Page</th>
                    <th>Order</th>
                    <th>Language</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-table">
                        No custom pages found.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold">{p.title}</span>
                            <span className="text-xs text-gray-500 font-mono">{p.slug}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${p.location ? p.location.toLowerCase() : 'none'}`}>
                            {p.location || 'NONE'}
                          </span>
                        </td>
                        <td>
                          {p.parentLinkId ? (
                            <span className="text-slate-600 font-medium">
                              {getParentPageTitle(p.parentLinkId)}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-light">-</span>
                          )}
                        </td>
                        <td>{p.menuOrder}</td>
                        <td>
                          <span className={`lang-badge ${p.language}`}>
                            {p.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(p)}
                              title="Edit Page"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(p.id)}
                              title="Delete Page"
                            >
                              <i className="fa-solid fa-trash"></i> Delete
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

export default AdminPages;
