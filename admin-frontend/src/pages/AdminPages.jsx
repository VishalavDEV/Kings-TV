import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminPages.css';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    language: 'ta',
    location: 'NONE',
    parentLinkId: '',
    menuOrder: 0,
    content: '',
    description: '',
    keywords: '',
    visibility: 'Public', // Public, Draft
    pageType: 'custom'
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/pages');
      if (Array.isArray(data)) {
        setPages(data);
      }
    } catch (err) {
      setErrorMsg('Failed to load custom pages');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    setFormData((prev) => {
      // Auto-generate slug supporting English and Tamil character groups
      const cleanText = titleVal
        .replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s\-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      
      // Only auto-update slug if it was empty or matched previous auto-generated slug
      const oldCleaned = prev.title
        .replace(/[^a-zA-Z0-9\u0B80-\u0BFF\s\-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
        
      const shouldUpdateSlug = prev.slug === '' || prev.slug === oldCleaned;
      return {
        ...prev,
        title: titleVal,
        slug: shouldUpdateSlug ? cleanText : prev.slug
      };
    });
  };

  const handleVisibilityToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      visibility: isChecked ? 'Public' : 'Draft'
    }));
  };

  const insertTag = (tagOpen, tagClose = '') => {
    const textarea = document.getElementById('content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    // Refocus and re-select target text range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 10);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      language: 'ta',
      location: 'NONE',
      parentLinkId: '',
      menuOrder: 0,
      content: '',
      description: '',
      keywords: '',
      visibility: 'Public',
      pageType: 'custom'
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (page) => {
    setEditingId(page.id);
    setFormData({
      title: page.title || '',
      slug: page.slug || '',
      language: page.language || 'ta',
      location: page.location || 'NONE',
      parentLinkId: page.parentLinkId || '',
      menuOrder: page.menuOrder || 0,
      content: page.content || '',
      description: page.description || '',
      keywords: page.keywords || '',
      visibility: page.visibility || 'Public',
      pageType: page.pageType || 'custom'
    });
    setIsModalOpen(true);
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

  // Filtered pages list
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter ? p.location === locationFilter : true;
    const matchesLanguage = languageFilter ? p.language === languageFilter : true;
    return matchesSearch && matchesLocation && matchesLanguage;
  });

  // Paginated pages calculation
  const totalPagesCount = Math.ceil(filteredPages.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPages = filteredPages.slice(startIndex, startIndex + pageSize);

  // Ensure current page is valid after filters change
  useEffect(() => {
    if (currentPage > 1 && startIndex >= filteredPages.length) {
      setCurrentPage(1);
    }
  }, [filteredPages.length, pageSize]);

  return (
    <div className="admin-pages-container">
      <div className="flex justify-between items-center mb-6">
        <div className="pages-header" style={{ marginBottom: 0 }}>
          <h1>Static Pages Management</h1>
          <p className="subtitle">Create and manage custom website pages and static contents</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fa-solid fa-plus mr-1.5"></i> Add Page
        </button>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {/* Filter controls row */}
      <div className="filter-bar-controls">
        <div className="filter-left-group">
          <span className="text-xs font-semibold text-slate-500 uppercase">Show</span>
          <select 
            className="filter-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
          >
            <option value={15}>15 entries</option>
            <option value={25}>25 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>

          <span className="text-xs font-semibold text-slate-500 uppercase">Language</span>
          <select
            className="filter-select"
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Languages</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="en">English</option>
          </select>

          <span className="text-xs font-semibold text-slate-500 uppercase">Location</span>
          <select
            className="filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Locations</option>
            <option value="NONE">None</option>
            <option value="TOP_MENU">Header (Top Menu)</option>
            <option value="MAIN_MENU">Main Menu</option>
            <option value="FOOTER">Footer</option>
          </select>
        </div>

        <div className="filter-right-group">
          <div className="search-box" style={{ margin: 0 }}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Pages Table Panel */}
      <div className="table-panel" style={{ width: '100%' }}>
        {loading ? (
          <div className="loading-state">Loading pages list...</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Language</th>
                    <th>Location</th>
                    <th>Visibility</th>
                    <th>Page Type</th>
                    <th>Date Added</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPages.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-table">
                        No custom pages found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedPages.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold">{p.title}</span>
                            <span className="text-xs text-gray-500 font-mono">{p.slug}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`lang-badge ${p.language}`}>
                            {p.language === 'en' ? 'English' : 'Tamil'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${p.location ? p.location.toLowerCase() : 'none'}`}>
                            {p.location === 'TOP_MENU' || p.location === 'HEADER' ? 'HEADER' : p.location || 'NONE'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${(p.visibility || 'Public').toLowerCase()}`}>
                            {p.visibility || 'Public'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-semibold text-slate-600 uppercase font-mono">
                            {p.pageType || 'custom'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600 font-medium">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
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

            {/* Pagination Controls */}
            {totalPagesCount > 1 && (
              <div className="pagination-container">
                <span className="text-sm text-slate-500 font-medium">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredPages.length)} of {filteredPages.length} pages
                </span>
                <div className="flex gap-2">
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === totalPagesCount}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit/Add Page Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Custom Page Details' : 'Create Custom Page'}</h2>
              <button className="close-modal-btn" onClick={resetForm}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                  <label htmlFor="title">Page Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Terms of Service"
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
                    placeholder="e.g. terms-of-service"
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
                    <label htmlFor="location">Menu Location</label>
                    <select id="location" name="location" value={formData.location} onChange={handleInputChange}>
                      <option value="NONE">None (Don't Add to Menu)</option>
                      <option value="TOP_MENU">Header (Top Menu)</option>
                      <option value="MAIN_MENU">Main Menu</option>
                      <option value="FOOTER">Footer</option>
                    </select>
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
                    <label htmlFor="menuOrder">Menu Order Position</label>
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

                {/* Content Editor with Toolbar */}
                <div className="form-group">
                  <label htmlFor="content">Page Body Content *</label>
                  
                  {/* Styled format tools */}
                  <div className="editor-toolbar">
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<strong>', '</strong>')} title="Bold">
                      <i className="fa-solid fa-bold"></i> Bold
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<em>', '</em>')} title="Italic">
                      <i className="fa-solid fa-italic"></i> Italic
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<h2>', '</h2>')} title="H2 Heading">
                      Heading 2
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<h3>', '</h3>')} title="H3 Heading">
                      Heading 3
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<p>', '</p>')} title="Paragraph">
                      Paragraph
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<a href="https://" target="_blank">', '</a>')} title="Hyperlink">
                      <i className="fa-solid fa-link"></i> Link
                    </button>
                    <button type="button" className="toolbar-btn" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} title="Bullet List">
                      <i className="fa-solid fa-list-ul"></i> Bullet List
                    </button>
                  </div>

                  <textarea
                    id="content"
                    name="content"
                    className="editor-textarea"
                    rows="8"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write page content details (HTML supported)..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label htmlFor="pageType">Page Type</label>
                    <input
                      type="text"
                      id="pageType"
                      name="pageType"
                      value={formData.pageType}
                      onChange={handleInputChange}
                      placeholder="e.g. custom"
                    />
                  </div>
                  <div className="form-group half">
                    <label style={{ display: 'block', marginBottom: '8px' }}>Visibility Status (Public)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={formData.visibility === 'Public'}
                          onChange={handleVisibilityToggle}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <span className="text-sm font-semibold text-slate-700">
                        {formData.visibility}
                      </span>
                    </div>
                  </div>
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

                <div className="form-actions mt-4">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Page' : 'Create Page'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPages;
