import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import './AdminCategories.css';

const AdminCategories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab switching state
  const [activeTab, setActiveTab] = useState(
    location.pathname.endsWith('/subcategories') ? 'subcategories' : 'categories'
  );

  // Sync tab with URL
  useEffect(() => {
    setActiveTab(location.pathname.endsWith('/subcategories') ? 'subcategories' : 'categories');
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'subcategories') {
      navigate('/categories/subcategories');
    } else {
      navigate('/categories');
    }
  };

  // Shared Data States
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters State for Categories Tab
  const [catSearch, setCatSearch] = useState('');
  const [catLangFilter, setCatLangFilter] = useState(''); // All, 'ta', 'en'
  const [catPageSize, setCatPageSize] = useState(15);
  const [catCurrentPage, setCatCurrentPage] = useState(1);

  // Filters State for Subcategories Tab
  const [subSearch, setSubSearch] = useState('');
  const [subLangFilter, setSubLangFilter] = useState(''); // All, 'ta', 'en'
  const [subParentFilter, setSubParentFilter] = useState(''); // Category ID
  const [subPageSize, setSubPageSize] = useState(15);
  const [subCurrentPage, setSubCurrentPage] = useState(1);

  // Modal Dialog Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'subcategory'
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    language: 'ta',
    description: '',
    keywords: '',
    color: '#3B82F6',
    menuOrder: 0,
    showOnMenu: true,
    parentCategoryId: ''
  });

  // Load Data from Backend
  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [cats, subs] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories')
      ]);
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
      if (Array.isArray(subs)) {
        setSubcategories(subs);
      }
    } catch (err) {
      console.error('Failed to load categories/subcategories data:', err);
      setErrorMsg(err.message || 'Failed to fetch categories data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Slug Generation Logic
  const slugify = (text) => {
    if (!text) return '';
    // Keep English, numbers, Tamil characters, space, and hyphen
    let cleaned = text.replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s\-]/g, '');
    cleaned = cleaned.trim().replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase();
    return cleaned;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, name: value };
      if (!slugTouched && !editingId) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open Modal Helpers
  const openAddCategoryModal = () => {
    setEditingId(null);
    setModalType('category');
    setSlugTouched(false);
    setFormData({
      name: '',
      slug: '',
      language: 'ta',
      description: '',
      keywords: '',
      color: '#3B82F6',
      menuOrder: 0,
      showOnMenu: true,
      parentCategoryId: ''
    });
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openAddSubcategoryModal = () => {
    setEditingId(null);
    setModalType('subcategory');
    setSlugTouched(false);
    setFormData({
      name: '',
      slug: '',
      language: 'ta',
      description: '',
      keywords: '',
      color: '#3B82F6',
      menuOrder: 0,
      showOnMenu: true,
      parentCategoryId: categories.length > 0 ? categories[0].id.toString() : ''
    });
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openEditCategoryModal = (cat) => {
    setEditingId(cat.id);
    setModalType('category');
    setSlugTouched(true);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      language: cat.language || 'ta',
      description: cat.description || '',
      keywords: cat.keywords || '',
      color: cat.color || '#3B82F6',
      menuOrder: cat.menuOrder !== undefined ? cat.menuOrder : (cat.displayOrder || 0),
      showOnMenu: cat.showOnMenu !== false,
      parentCategoryId: ''
    });
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openEditSubcategoryModal = (sub) => {
    setEditingId(sub.subcategoryId || sub.id);
    setModalType('subcategory');
    setSlugTouched(true);
    setFormData({
      name: sub.name || '',
      slug: sub.slug || '',
      language: sub.language || 'ta',
      description: sub.description || '',
      keywords: sub.keywords || '',
      color: sub.color || '#3B82F6',
      menuOrder: sub.menuOrder !== undefined ? sub.menuOrder : (sub.displayOrder || 0),
      showOnMenu: sub.showOnMenu !== false,
      parentCategoryId: sub.parentCategoryId || sub.categoryId || (categories.length > 0 ? categories[0].id : '')
    });
    setIsModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!formData.name || formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      setErrorMsg('Name is required and must be between 2 and 100 characters');
      return;
    }

    if (modalType === 'subcategory' && !formData.parentCategoryId) {
      setErrorMsg('Parent Category is required for subcategories');
      return;
    }

    if (modalType === 'category') {
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (formData.color && !hexRegex.test(formData.color)) {
        setErrorMsg('Color must be a valid hex code (e.g. #3B82F6)');
        return;
      }
    }

    try {
      const endpoint = modalType === 'category'
        ? (editingId ? `/admin/categories/${editingId}` : '/admin/categories')
        : (editingId ? `/admin/subcategories/${editingId}` : '/admin/subcategories');
      
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        menuOrder: parseInt(formData.menuOrder, 10) || 0
      };

      if (modalType === 'subcategory') {
        payload.parentCategoryId = parseInt(formData.parentCategoryId, 10);
        payload.categoryId = parseInt(formData.parentCategoryId, 10);
      }

      await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      setSuccessMsg(editingId ? `${modalType === 'category' ? 'Category' : 'Subcategory'} updated successfully!` : `${modalType === 'category' ? 'Category' : 'Subcategory'} created successfully!`);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Error processing request');
    }
  };

  // Delete Action Handles
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Category deleted successfully');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete category');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteSubcategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/subcategories/${id}`, { method: 'DELETE' });
      setSuccessMsg('Subcategory deleted successfully');
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete subcategory');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter Categories data
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      (cat.name || '').toLowerCase().includes(catSearch.toLowerCase()) ||
      (cat.slug || '').toLowerCase().includes(catSearch.toLowerCase());
    const matchesLang = catLangFilter ? cat.language === catLangFilter : true;
    return matchesSearch && matchesLang;
  });

  // Filter Subcategories data
  const filteredSubcategories = subcategories.filter((sub) => {
    const matchesSearch =
      (sub.name || '').toLowerCase().includes(subSearch.toLowerCase()) ||
      (sub.slug || '').toLowerCase().includes(subSearch.toLowerCase());
    const matchesLang = subLangFilter ? sub.language === subLangFilter : true;
    const matchesParent = subParentFilter ? String(sub.parentCategoryId || sub.categoryId) === String(subParentFilter) : true;
    return matchesSearch && matchesLang && matchesParent;
  });

  // Pagination bounds
  const catTotalPages = Math.ceil(filteredCategories.length / catPageSize) || 1;
  const subTotalPages = Math.ceil(filteredSubcategories.length / subPageSize) || 1;

  // Sync pagination bounds if filters shrink listings
  useEffect(() => {
    if (catCurrentPage > catTotalPages) setCatCurrentPage(catTotalPages);
  }, [filteredCategories.length, catPageSize, catTotalPages, catCurrentPage]);

  useEffect(() => {
    if (subCurrentPage > subTotalPages) setSubCurrentPage(subTotalPages);
  }, [filteredSubcategories.length, subPageSize, subTotalPages, subCurrentPage]);

  const displayedCategories = filteredCategories.slice(
    (catCurrentPage - 1) * catPageSize,
    catCurrentPage * catPageSize
  );

  const displayedSubcategories = filteredSubcategories.slice(
    (subCurrentPage - 1) * subPageSize,
    subCurrentPage * subPageSize
  );

  const getParentName = (parentId) => {
    const match = categories.find((c) => String(c.id) === String(parentId));
    return match ? match.name : `Category #${parentId}`;
  };

  return (
    <div className="admin-categories-container">
      {/* Header with tabs and Top Right add toolbar */}
      <div className="categories-header-row">
        <div className="categories-header-left">
          <h1>Categories &amp; Subcategories</h1>
          <p className="subtitle">Configure public news structures, theme colors, SEO meta values, and navigation listings</p>
        </div>
        <div className="categories-header-right">
          {activeTab === 'categories' ? (
            <button className="btn btn-primary" onClick={openAddCategoryModal}>
              <i className="fa-solid fa-plus mr-1.5"></i> Add Category
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openAddSubcategoryModal}>
              <i className="fa-solid fa-plus mr-1.5"></i> Add Subcategory
            </button>
          )}
        </div>
      </div>

      {/* Dynamic messages notification banners */}
      {errorMsg && (
        <div className="alert-banner error">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          <span>{errorMsg}</span>
          <button className="close-alert-btn" onClick={() => setErrorMsg('')}>&times;</button>
        </div>
      )}
      {successMsg && (
        <div className="alert-banner success">
          <i className="fa-solid fa-circle-check mr-2"></i>
          <span>{successMsg}</span>
          <button className="close-alert-btn" onClick={() => setSuccessMsg('')}>&times;</button>
        </div>
      )}

      {/* Tabs navigation row */}
      <div className="categories-tabs-bar">
        <button
          className={`tab-item-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          <i className="fa-solid fa-folder-tree mr-2"></i>
          Categories ({categories.length})
        </button>
        <button
          className={`tab-item-btn ${activeTab === 'subcategories' ? 'active' : ''}`}
          onClick={() => handleTabChange('subcategories')}
        >
          <i className="fa-solid fa-list-check mr-2"></i>
          Subcategories ({subcategories.length})
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="premium-loader-card">
          <div className="spinner"></div>
          <p>Loading catalog mappings...</p>
        </div>
      ) : activeTab === 'categories' ? (
        /* CATEGORIES VIEW TAB */
        categories.length === 0 ? (
          /* Under construction / barrier style empty state */
          <div className="barrier-empty-card">
            <div className="barrier-icon-container">
              <i className="fa-solid fa-road-barrier font-bold-icon"></i>
            </div>
            <h2>No categories yet — add your first one</h2>
            <p>Your news portal needs at least one main category classification to organize and display articles.</p>
            <button className="btn btn-primary btn-lg" onClick={openAddCategoryModal}>
              <i className="fa-solid fa-plus mr-2"></i> Add Category
            </button>
          </div>
        ) : (
          <div className="table-card-container">
            {/* Filter controls row */}
            <div className="table-filter-controls">
              <div className="controls-left">
                <span className="control-label">Show</span>
                <select
                  value={catPageSize}
                  onChange={(e) => {
                    setCatPageSize(parseInt(e.target.value, 10));
                    setCatCurrentPage(1);
                  }}
                  className="show-count-select"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="control-label">entries</span>
              </div>

              <div className="controls-right">
                <div className="filter-item">
                  <label>Language:</label>
                  <select
                    value={catLangFilter}
                    onChange={(e) => {
                      setCatLangFilter(e.target.value);
                      setCatCurrentPage(1);
                    }}
                    className="lang-select-filter"
                  >
                    <option value="">All</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="search-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={catSearch}
                    onChange={(e) => {
                      setCatSearch(e.target.value);
                      setCatCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="premium-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Category Name</th>
                    <th>Language</th>
                    <th>Order</th>
                    <th>Color</th>
                    <th className="options-col">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedCategories.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-results-cell">
                        No matching categories found
                      </td>
                    </tr>
                  ) : (
                    displayedCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td>#{cat.id}</td>
                        <td className="font-bold-title">{cat.name}</td>
                        <td>
                          <span className={`lang-badge ${cat.language || 'ta'}`}>
                            {cat.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td>{cat.menuOrder !== undefined ? cat.menuOrder : (cat.displayOrder || 0)}</td>
                        <td>
                          <div className="color-swatch-cell">
                            <span
                              className="color-swatch-box"
                              style={{ backgroundColor: cat.color || '#3B82F6' }}
                            />
                            <span className="color-label-code">{cat.color || '#3B82F6'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons-row">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openEditCategoryModal(cat)}
                              title="Edit details"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteCategory(cat.id)}
                              title="Delete category"
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

            {/* Pagination footer bar */}
            <div className="table-pagination-footer">
              <div className="footer-stats">
                Showing {filteredCategories.length === 0 ? 0 : (catCurrentPage - 1) * catPageSize + 1} to{' '}
                {Math.min(catCurrentPage * catPageSize, filteredCategories.length)} of{' '}
                {filteredCategories.length} entries
              </div>
              <div className="pagination-buttons">
                <button
                  className="page-nav-btn"
                  disabled={catCurrentPage === 1}
                  onClick={() => setCatCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </button>
                {Array.from({ length: catTotalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-num-btn ${catCurrentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setCatCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="page-nav-btn"
                  disabled={catCurrentPage === catTotalPages}
                  onClick={() => setCatCurrentPage((p) => Math.min(p + 1, catTotalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* SUBCATEGORIES VIEW TAB */
        subcategories.length === 0 ? (
          /* Under construction / barrier style empty state */
          <div className="barrier-empty-card">
            <div className="barrier-icon-container">
              <i className="fa-solid fa-road-barrier"></i>
            </div>
            <h2>No subcategories yet — add your first one</h2>
            <p>Attach subcategory entries under your parent categories to enable secondary navigation layers.</p>
            <button className="btn btn-primary btn-lg" onClick={openAddSubcategoryModal}>
              <i className="fa-solid fa-plus mr-2"></i> Add Subcategory
            </button>
          </div>
        ) : (
          <div className="table-card-container">
            {/* Filter controls row */}
            <div className="table-filter-controls">
              <div className="controls-left">
                <span className="control-label">Show</span>
                <select
                  value={subPageSize}
                  onChange={(e) => {
                    setSubPageSize(parseInt(e.target.value, 10));
                    setSubCurrentPage(1);
                  }}
                  className="show-count-select"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="control-label">entries</span>
              </div>

              <div className="controls-right">
                <div className="filter-item">
                  <label>Parent Category:</label>
                  <select
                    value={subParentFilter}
                    onChange={(e) => {
                      setSubParentFilter(e.target.value);
                      setSubCurrentPage(1);
                    }}
                    className="lang-select-filter"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label>Language:</label>
                  <select
                    value={subLangFilter}
                    onChange={(e) => {
                      setSubLangFilter(e.target.value);
                      setSubCurrentPage(1);
                    }}
                    className="lang-select-filter"
                  >
                    <option value="">All</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="search-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={subSearch}
                    onChange={(e) => {
                      setSubSearch(e.target.value);
                      setSubCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="premium-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Subcategory Name</th>
                    <th>Language</th>
                    <th>Parent Category</th>
                    <th className="options-col">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-results-cell">
                        No matching subcategories found
                      </td>
                    </tr>
                  ) : (
                    displayedSubcategories.map((sub) => (
                      <tr key={sub.subcategoryId || sub.id}>
                        <td>#{sub.subcategoryId || sub.id}</td>
                        <td className="font-bold-title">{sub.name}</td>
                        <td>
                          <span className={`lang-badge ${sub.language || 'ta'}`}>
                            {sub.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td>
                          <span className="parent-cat-pill">
                            {getParentName(sub.parentCategoryId || sub.categoryId)}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-row">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openEditSubcategoryModal(sub)}
                              title="Edit details"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteSubcategory(sub.subcategoryId || sub.id)}
                              title="Delete subcategory"
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

            {/* Pagination footer bar */}
            <div className="table-pagination-footer">
              <div className="footer-stats">
                Showing {filteredSubcategories.length === 0 ? 0 : (subCurrentPage - 1) * subPageSize + 1} to{' '}
                {Math.min(subCurrentPage * subPageSize, filteredSubcategories.length)} of{' '}
                {filteredSubcategories.length} entries
              </div>
              <div className="pagination-buttons">
                <button
                  className="page-nav-btn"
                  disabled={subCurrentPage === 1}
                  onClick={() => setSubCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </button>
                {Array.from({ length: subTotalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-num-btn ${subCurrentPage === idx + 1 ? 'active' : ''}`}
                    onClick={() => setSubCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="page-nav-btn"
                  disabled={subCurrentPage === subTotalPages}
                  onClick={() => setSubCurrentPage((p) => Math.min(p + 1, subTotalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* DIALOG MODAL FOR ADD/EDIT ACTIONS */}
      {isModalOpen && (
        <div className="premium-modal-overlay">
          <div className="modal-backdrop-blur" onClick={() => setIsModalOpen(false)}></div>
          <div className="modal-card-box">
            <div className="modal-header">
              <h3>
                {editingId ? 'Edit' : 'Add New'}{' '}
                {modalType === 'category' ? 'Category' : 'Subcategory'}
              </h3>
              <button className="modal-close-x" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form-body">
              <div className="form-group-item">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder={`e.g. ${modalType === 'category' ? 'International News' : 'Global Politics'}`}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Slug (auto-generated, editable)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="auto-generated-slug"
                />
              </div>

              {modalType === 'subcategory' && (
                <div className="form-group-item">
                  <label>Parent Category *</label>
                  <select
                    name="parentCategoryId"
                    value={formData.parentCategoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Parent Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.language === 'en' ? 'EN' : 'TA'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row-items">
                <div className="form-group-item flex-1">
                  <label>Language *</label>
                  <select name="language" value={formData.language} onChange={handleInputChange}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {modalType === 'category' && (
                  <div className="form-group-item flex-1">
                    <label>Menu Order</label>
                    <input
                      type="number"
                      name="menuOrder"
                      value={formData.menuOrder}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                )}
              </div>

              {modalType === 'category' && (
                <div className="form-group-item">
                  <label>Category Theme Color</label>
                  <div className="color-swatch-picker-row">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="#3B82F6"
                      className="color-hex-text-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group-item checkbox-toggle-wrapper">
                <span className="toggle-label">Show on Navigation Menu</span>
                <label className="switch-toggle">
                  <input
                    type="checkbox"
                    name="showOnMenu"
                    checked={formData.showOnMenu}
                    onChange={handleInputChange}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              <div className="form-group-item">
                <label>Description (Meta Tag)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Meta tag description for search engines..."
                />
              </div>

              <div className="form-group-item">
                <label>Keywords (Meta Tag)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="news, global, events (comma separated)"
                />
              </div>

              <div className="modal-actions-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
