import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    language: 'ta',
    slug: '',
    description: '',
    keywords: '',
    color: '#3B82F6',
    menuOrder: 0,
    showOnMenu: true
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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
      language: 'ta',
      slug: '',
      description: '',
      keywords: '',
      color: '#3B82F6',
      menuOrder: 0,
      showOnMenu: true
    });
    setErrorMsg('');
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name || '',
      language: category.language || 'ta',
      slug: category.slug || '',
      description: category.description || '',
      keywords: category.keywords || '',
      color: category.color || '#3B82F6',
      menuOrder: category.menuOrder !== undefined ? category.menuOrder : (category.displayOrder || 0),
      showOnMenu: category.showOnMenu !== undefined ? category.showOnMenu : (category.isNav !== false)
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    try {
      const endpoint = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        menuOrder: parseInt(formData.menuOrder, 10) || 0
      };

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(editingId ? 'Category updated successfully!' : 'Category created successfully!');
        resetForm();
        loadCategories();
      }
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Error saving category';
      setErrorMsg(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Category deleted successfully');
      loadCategories();
    } catch (err) {
      setErrorMsg('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.slug || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.language || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-categories-container">
      <div className="categories-header">
        <h1>Categories Management</h1>
        <p className="subtitle">Create, edit, and organize article categories and navigation menus</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left View: Add / Edit Form */}
        <div className="form-panel">
          <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Technology"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="language">Language *</label>
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
              <label htmlFor="slug">Custom Slug (Optional)</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="auto-generated if empty"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="color">Category Color</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                  <span className="color-hex">{formData.color}</span>
                </div>
              </div>

              <div className="form-group half checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showOnMenu"
                    checked={formData.showOnMenu}
                    onChange={handleInputChange}
                  />
                  Show on Navigation Menu
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Meta Description</label>
              <textarea
                id="description"
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="SEO Meta Description..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="keywords">Meta Keywords</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="news, tech, updates"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Category' : 'Add Category'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right View: Categories Table */}
        <div className="table-panel">
          <div className="table-header-controls">
            <h2>Categories List ({filteredCategories.length})</h2>
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading categories...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Color</th>
                    <th>Name</th>
                    <th>Language</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th>On Menu</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-table">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td>
                          <span
                            className="color-swatch"
                            style={{ backgroundColor: cat.color || '#3B82F6' }}
                          />
                        </td>
                        <td className="font-semibold">{cat.name}</td>
                        <td>
                          <span className={`lang-badge ${cat.language || 'ta'}`}>
                            {cat.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td className="slug-cell">{cat.slug}</td>
                        <td>{cat.menuOrder !== undefined ? cat.menuOrder : (cat.displayOrder || 0)}</td>
                        <td>
                          <span className={`status-pill ${cat.showOnMenu !== false ? 'active' : 'inactive'}`}>
                            {cat.showOnMenu !== false ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(cat)}
                              title="Edit Category"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(cat.id)}
                              title="Delete Category"
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

export default AdminCategories;
