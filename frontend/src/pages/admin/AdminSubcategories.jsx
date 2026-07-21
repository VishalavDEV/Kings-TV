import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminCategories.css';

const AdminSubcategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    parentCategoryId: '',
    name: '',
    language: 'ta',
    slug: '',
    description: '',
    keywords: '',
    color: '#3B82F6',
    menuOrder: 0,
    showOnMenu: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [catData, subData] = await Promise.allSettled([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories')
      ]);

      if (catData.status === 'fulfilled' && Array.isArray(catData.value)) {
        setCategories(catData.value);
        if (catData.value.length > 0 && !formData.parentCategoryId) {
          setFormData((prev) => ({ ...prev, parentCategoryId: catData.value[0].id }));
        }
      }
      if (subData.status === 'fulfilled' && Array.isArray(subData.value)) {
        setSubcategories(subData.value);
      }
    } catch (err) {
      console.error('Failed to load subcategories data:', err);
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
      parentCategoryId: categories.length > 0 ? categories[0].id : '',
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

  const handleEdit = (subCat) => {
    setEditingId(subCat.subcategoryId || subCat.id);
    setFormData({
      parentCategoryId: subCat.parentCategoryId || subCat.categoryId || (categories.length > 0 ? categories[0].id : ''),
      name: subCat.name || '',
      language: subCat.language || 'ta',
      slug: subCat.slug || '',
      description: subCat.description || '',
      keywords: subCat.keywords || '',
      color: subCat.color || '#3B82F6',
      menuOrder: subCat.menuOrder !== undefined ? subCat.menuOrder : (subCat.displayOrder || 0),
      showOnMenu: subCat.showOnMenu !== false
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Subcategory name is required');
      return;
    }

    if (!formData.parentCategoryId) {
      setErrorMsg('Please select a Parent Category');
      return;
    }

    try {
      const subId = editingId;
      const endpoint = subId ? `/admin/subcategories/${subId}` : '/admin/subcategories';
      const method = subId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        parentCategoryId: parseInt(formData.parentCategoryId, 10),
        categoryId: parseInt(formData.parentCategoryId, 10),
        menuOrder: parseInt(formData.menuOrder, 10) || 0
      };

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(subId ? 'Subcategory updated successfully!' : 'Subcategory created successfully!');
        resetForm();
        loadData();
      }
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Error saving subcategory';
      setErrorMsg(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/subcategories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Subcategory deleted successfully');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to delete subcategory');
    }
  };

  const getParentCategoryName = (parentId) => {
    const parent = categories.find((c) => String(c.id) === String(parentId));
    return parent ? parent.name : `Category #${parentId || 'N/A'}`;
  };

  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch =
      (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent = parentFilter ? String(sub.parentCategoryId || sub.categoryId) === String(parentFilter) : true;
    return matchesSearch && matchesParent;
  });

  return (
    <div className="admin-categories-container">
      <div className="categories-header">
        <h1>Subcategories Management</h1>
        <p className="subtitle">Manage subcategories associated under main article categories</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left View: Add / Edit Form */}
        <div className="form-panel">
          <h2>{editingId ? 'Edit Subcategory' : 'Add New Subcategory'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="parentCategoryId">Parent Category *</label>
              <select
                id="parentCategoryId"
                name="parentCategoryId"
                value={formData.parentCategoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Parent Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.language === 'en' ? 'EN' : 'TA'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="name">Subcategory Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Artificial Intelligence"
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
                <label htmlFor="color">Subcategory Color</label>
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
                  Show on Menu
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
                placeholder="Subcategory description..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Subcategory' : 'Add Subcategory'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right View: Subcategories Table */}
        <div className="table-panel">
          <div className="table-header-controls">
            <h2>Subcategories List ({filteredSubcategories.length})</h2>
            <div className="flex gap-2">
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                value={parentFilter}
                onChange={(e) => setParentFilter(e.target.value)}
              >
                <option value="">All Parent Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="search-box">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Search subcategories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading subcategories...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Parent Category</th>
                    <th>Color</th>
                    <th>Name</th>
                    <th>Language</th>
                    <th>Slug</th>
                    <th>Order</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-table">
                        No subcategories found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubcategories.map((sub) => (
                      <tr key={sub.subcategoryId || sub.id}>
                        <td>#{sub.subcategoryId || sub.id}</td>
                        <td>
                          <span className="font-medium text-blue-600">
                            {getParentCategoryName(sub.parentCategoryId || sub.categoryId)}
                          </span>
                        </td>
                        <td>
                          <span
                            className="color-swatch"
                            style={{ backgroundColor: sub.color || '#3B82F6' }}
                          />
                        </td>
                        <td className="font-semibold">{sub.name}</td>
                        <td>
                          <span className={`lang-badge ${sub.language || 'ta'}`}>
                            {sub.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td className="slug-cell">{sub.slug}</td>
                        <td>{sub.menuOrder !== undefined ? sub.menuOrder : (sub.displayOrder || 0)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleEdit(sub)}
                              title="Edit Subcategory"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(sub.subcategoryId || sub.id)}
                              title="Delete Subcategory"
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

export default AdminSubcategories;
