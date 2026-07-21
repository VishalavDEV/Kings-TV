import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminWidgets.css';

const HtmlToolbar = ({ targetField, setFormData }) => {
  const insertTag = (openTag, closeTag = '') => {
    const el = document.getElementById(targetField);
    if (!el) return;
    
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData(prev => ({
      ...prev,
      [targetField]: newValue
    }));
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  return (
    <div className="html-editor-toolbar" style={{ display: 'flex', gap: '0.25rem', padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderBottom: 'none', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}>
      <button type="button" onClick={() => insertTag('<strong>', '</strong>')} title="Bold" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-bold"></i></button>
      <button type="button" onClick={() => insertTag('<em>', '</em>')} title="Italic" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-italic"></i></button>
      <button type="button" onClick={() => insertTag('<u>', '</u>')} title="Underline" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-underline"></i></button>
      <button type="button" onClick={() => insertTag('<s>', '</s>')} title="Strikethrough" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-strikethrough"></i></button>
      <span style={{ color: '#cbd5e1', padding: '0 0.25rem' }}>|</span>
      <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} title="Bullet List" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-list-ul"></i></button>
      <button type="button" onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')} title="Numbered List" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-list-ol"></i></button>
      <span style={{ color: '#cbd5e1', padding: '0 0.25rem' }}>|</span>
      <button type="button" onClick={() => {
        const url = prompt('Enter link URL:');
        if (url) insertTag(`<a href="${url}" target="_blank">`, '</a>');
      }} title="Link" style={{ padding: '0.2rem 0.4rem', cursor: 'pointer' }}><i className="fa-solid fa-link"></i></button>
    </div>
  );
};

const AdminWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Filtering state
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [filterLang, setFilterLang] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Add/Edit states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    widgetType: 'Default', // Default, Voting Poll, Tags Cloud, Random Posts, Popular Posts, Follow Us
    placement: 'sidebar',  // sidebar, footer
    menuOrder: 0,
    language: 'ta',
    visibility: true,
    content: ''
  });

  const widgetTypes = ['Default', 'Voting Poll', 'Tags Cloud', 'Random Posts', 'Popular Posts', 'Follow Us'];

  const loadWidgets = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/admin/widgets?page=${page}&size=${pageSize}`;
      if (filterLang) query += `&language=${filterLang}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetchApi(query);
      if (res && res.content) {
        setWidgets(res.content);
        setTotalCount(res.totalElements);
        setTotalPages(res.totalPages);
        setCurrentPage(res.number);
      } else {
        setWidgets([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load active widgets list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWidgets(0);
  }, [pageSize, filterLang]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWidgets(0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      title: '',
      widgetType: 'Default',
      placement: 'sidebar',
      menuOrder: 0,
      language: 'ta',
      visibility: true,
      content: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (widget) => {
    setIsEditMode(true);
    setEditingId(widget.id);
    setFormData({
      title: widget.title || '',
      widgetType: widget.widgetType || 'Default',
      placement: widget.placement || 'sidebar',
      menuOrder: widget.menuOrder || 0,
      language: widget.language || 'ta',
      visibility: widget.visibility !== false,
      content: widget.content || ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Widget title is required');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        widgetType: formData.widgetType,
        placement: formData.placement,
        menuOrder: parseInt(formData.menuOrder, 10) || 0,
        language: formData.language,
        visibility: formData.visibility,
        content: formData.widgetType === 'Default' ? formData.content : null
      };

      let res;
      if (isEditMode) {
        res = await fetchApi(`/admin/widgets/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi('/admin/widgets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(isEditMode ? 'Widget updated successfully!' : 'Widget created successfully!');
        setTimeout(() => {
          setShowModal(false);
          loadWidgets(currentPage);
        }, 800);
      }
    } catch (err) {
      setErrorMsg('Failed to save widget configuration');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this widget?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/widgets/${id}`, { method: 'DELETE' });
      setSuccessMsg('Widget removed successfully');
      loadWidgets(currentPage);
    } catch (err) {
      setErrorMsg('Failed to delete widget');
    }
  };

  return (
    <div className="admin-widgets-container">
      <div className="posts-header">
        <div>
          <h1>Sidebar & Footer Widgets</h1>
          <p className="subtitle">Displaying Y to Z of {totalCount} matching widgets</p>
        </div>
        <div className="action-buttons-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add Widget
          </button>
        </div>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {/* Filter Row */}
      <form onSubmit={handleSearchSubmit} className="posts-filter-bar">
        <div className="filter-item">
          <label>Show</label>
          <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
            <option value="15">15 entries</option>
            <option value="25">25 entries</option>
            <option value="50">50 entries</option>
            <option value="100">100 entries</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Language</label>
          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
            <option value="">All Languages</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="filter-item flex-grow">
          <label>Search Title / Type</label>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search active widgets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <i className="fa-solid fa-magnifying-glass"></i> Filter
            </button>
          </div>
        </div>
      </form>

      {/* Widgets Table */}
      {loading ? (
        <div className="loading-state">Loading active widgets...</div>
      ) : (
        <div className="posts-table-panel">
          <div className="table-wrapper">
            <table className="posts-table">
              <thead>
                <tr>
                  <th width="60">ID</th>
                  <th>Widget Title</th>
                  <th>Language</th>
                  <th>Placement</th>
                  <th>Display Order</th>
                  <th>Widget Type</th>
                  <th>Visibility</th>
                  <th>Date Added</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {widgets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table">No active widgets configured.</td>
                  </tr>
                ) : (
                  widgets.map((w) => (
                    <tr key={w.id}>
                      <td>#{w.id}</td>
                      <td>
                        <span className="font-semibold block text-slate-800">{w.title}</span>
                      </td>
                      <td>
                        <span className={`lang-badge ${w.language}`}>
                          {w.language === 'en' ? 'English' : 'Tamil'}
                        </span>
                      </td>
                      <td>
                        <span className="cat-chip-badge" style={{ textTransform: 'capitalize' }}>
                          {w.placement === 'sidebar' ? 'Right Sidebar' : 'Footer Columns'}
                        </span>
                      </td>
                      <td><span className="font-medium text-slate-600">{w.menuOrder || 0}</span></td>
                      <td>
                        <span className="badge badge-widget-type" style={{ padding: '0.2rem 0.5rem', background: '#e2e8f0', color: '#1e293b', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600' }}>
                          {w.widgetType}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${w.visibility ? 'published' : 'draft'}`}>
                          {w.visibility ? 'Show' : 'Hide'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-500">
                          {w.createdAt ? w.createdAt.substring(0, 10) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button className="action-btn edit-btn" onClick={() => openEditModal(w)}>
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(w.id)}>
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

          {/* Pagination Footer */}
          <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <span className="text-sm text-slate-500 font-medium">
              Showing {widgets.length > 0 ? (currentPage * pageSize + 1) : 0} to {currentPage * pageSize + widgets.length} of {totalCount} entries
            </span>
            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  disabled={currentPage === 0} 
                  onClick={() => loadWidgets(currentPage - 1)}
                  className="pag-btn"
                >
                  Previous
                </button>
                <span className="page-indicator" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  {currentPage + 1} / {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages - 1} 
                  onClick={() => loadWidgets(currentPage + 1)}
                  className="pag-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Modal form */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{isEditMode ? `Edit Widget #${editingId}` : 'Add New Widget'}</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Widget Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Recent Breaking Posts"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Widget Type *</label>
                  <select name="widgetType" value={formData.widgetType} onChange={handleInputChange}>
                    {widgetTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group half">
                  <label>Placement Zone *</label>
                  <select name="placement" value={formData.placement} onChange={handleInputChange}>
                    <option value="sidebar">Right Sidebar Zone</option>
                    <option value="footer">Footer Columns Zone</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Language *</label>
                  <select name="language" value={formData.language} onChange={handleInputChange}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="menuOrder"
                    value={formData.menuOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <input
                    type="checkbox"
                    name="visibility"
                    checked={formData.visibility}
                    onChange={handleInputChange}
                  />
                  <strong>Visible (Show on Site)</strong>
                </label>
              </div>

              {formData.widgetType === 'Default' && (
                <div className="form-group">
                  <label>Custom HTML / Sanitized Content</label>
                  <HtmlToolbar targetField="content" setFormData={setFormData} />
                  <textarea
                    id="content"
                    name="content"
                    rows="6"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="<div class='custom-widget-content'>...</div>"
                  />
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isEditMode ? 'Save Changes' : 'Create Widget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWidgets;
