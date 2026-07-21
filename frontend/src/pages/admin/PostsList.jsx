import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import './PostsList.css';

const PostsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Determine current pre-filter view based on URL route path
  let view = 'all';
  let viewTitle = 'All Articles';
  if (path.includes('/posts/slider')) {
    view = 'slider';
    viewTitle = 'Slider Carousel Articles';
  } else if (path.includes('/posts/featured')) {
    view = 'featured';
    viewTitle = 'Featured Articles';
  } else if (path.includes('/posts/breaking')) {
    view = 'breaking';
    viewTitle = 'Breaking News Articles';
  } else if (path.includes('/posts/recommended')) {
    view = 'recommended';
    viewTitle = 'Recommended Articles';
  } else if (path.includes('/posts/pending')) {
    view = 'pending';
    viewTitle = 'Pending Review';
  } else if (path.includes('/posts/scheduled')) {
    view = 'scheduled';
    viewTitle = 'Scheduled Launches';
  } else if (path.includes('/posts/drafts')) {
    view = 'draft';
    viewTitle = 'Draft Articles';
  }

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  // Pagination & Filtering state
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [filterLang, setFilterLang] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkReport, setBulkReport] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadFilterOptions = async () => {
    try {
      const [cats, subs] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories')
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(subs)) setSubcategories(subs);
    } catch (err) {
      console.error('Failed to load filter definitions:', err);
    }
  };

  const loadArticles = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/admin/articles?view=${view}&page=${page}&size=${pageSize}`;
      if (filterLang) query += `&language=${filterLang}`;
      if (filterAuthor) query += `&user=${encodeURIComponent(filterAuthor)}`;
      if (filterCategory) query += `&category=${filterCategory}`;
      if (filterSubcategory) query += `&subcategory=${filterSubcategory}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetchApi(query);
      if (res && res.content) {
        setArticles(res.content);
        setTotalCount(res.totalElements);
        setTotalPages(res.totalPages);
        setCurrentPage(res.number);
      } else {
        setArticles([]);
      }
    } catch (err) {
      setErrorMsg('Failed to load articles list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadArticles(0);
  }, [view, pageSize, filterLang, filterCategory, filterSubcategory]);

  useEffect(() => {
    if (filterCategory) {
      const filtered = subcategories.filter(
        sub => String(sub.parentCategoryId || sub.categoryId) === String(filterCategory)
      );
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
      setFilterSubcategory('');
    }
  }, [filterCategory, subcategories]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadArticles(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetchApi(`/admin/articles/${id}`, { method: 'DELETE' });
      setSuccessMsg('Article deleted successfully');
      loadArticles(currentPage);
    } catch (err) {
      setErrorMsg('Failed to delete article');
    }
  };

  const handleToggleFeature = async (article, field) => {
    try {
      const updatedValue = !article[field];
      await fetchApi(`/admin/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          [field]: updatedValue
        })
      });
      setSuccessMsg(`${field} status updated successfully`);
      loadArticles(currentPage);
    } catch (err) {
      setErrorMsg('Failed to toggle highlight status');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setBulkUploading(true);
    setBulkReport(null);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', bulkFile);

      // fetchApi with multipart/form-data support
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/articles/bulk-upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      const res = await response.json();
      if (response.ok) {
        setBulkReport(res);
        setSuccessMsg('Bulk upload processing complete!');
        loadArticles(0);
      } else {
        setErrorMsg(res.error || 'Failed to process bulk upload file');
      }
    } catch (err) {
      setErrorMsg('Network error uploading CSV file');
    } finally {
      setBulkUploading(false);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => String(c.id) === String(catId));
    return cat ? cat.name : `Cat #${catId || 'N/A'}`;
  };

  return (
    <div className="posts-list-container">
      <div className="posts-header">
        <div>
          <h1>{viewTitle}</h1>
          <p className="subtitle">Displaying {totalCount} matching articles</p>
        </div>
        <div className="action-buttons-group">
          <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
            <i className="fa-solid fa-file-import"></i> Bulk Upload CSV
          </button>
          <Link to="/posts/add" className="btn btn-primary">
            <i className="fa-solid fa-plus"></i> Add Post
          </Link>
        </div>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {view === 'scheduled' && (
        <div className="cron-info-banner mb-4 p-4 bg-slate-800 text-white rounded-xl shadow-md border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-clock-rotate-left text-green-400 text-lg"></i>
            <h3 className="font-bold text-base m-0 text-white">Cron Job Auto-Publish Configuration</h3>
          </div>
          <p className="text-xs text-slate-300 m-0 mb-2">
            Configure your server's crontab to automatically publish scheduled posts when launch dates pass.
          </p>
          <div className="text-xs bg-slate-900 p-2 rounded font-mono text-green-300 border border-slate-700">
            GET http://localhost:8080/api/admin/cron/publish-scheduled
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="posts-filter-bar">
        <div className="filter-item">
          <label>Show</label>
          <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
            <option value="10">10 entries</option>
            <option value="25">25 entries</option>
            <option value="50">50 entries</option>
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

        <div className="filter-item">
          <label>Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Subcategory</label>
          <select value={filterSubcategory} onChange={(e) => setFilterSubcategory(e.target.value)}>
            <option value="">All Subcategories</option>
            {filteredSubcategories.map(s => <option key={s.subcategoryId || s.id} value={s.subcategoryId || s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="filter-item flex-grow">
          <label>Search Author / Title</label>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="e.g. politics, Author Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <i className="fa-solid fa-magnifying-glass"></i> Filter
            </button>
          </div>
        </div>
      </form>

      {/* Table Content */}
      {loading ? (
        <div className="loading-state">Loading post contents...</div>
      ) : (
        <div className="posts-table-panel">
          <div className="table-wrapper">
            <table className="posts-table">
              <thead>
                <tr>
                  <th width="40"><input type="checkbox" /></th>
                  <th width="60">ID</th>
                  <th width="100">Thumbnail</th>
                  <th>Title & Tags</th>
                  <th>Language</th>
                  <th>Post Type</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Views</th>
                  <th>Status</th>
                  {view === 'scheduled' && <th>Days Remaining</th>}
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="empty-table">No matching posts found.</td>
                  </tr>
                ) : (
                  articles.map((art) => (
                    <tr key={art.id}>
                      <td><input type="checkbox" /></td>
                      <td>#{art.id}</td>
                      <td>
                        <div className="post-thumbnail-preview">
                          {art.featuredImageUrl || art.imageUrl ? (
                            <img src={art.featuredImageUrl || art.imageUrl} alt="preview" />
                          ) : (
                            <div className="no-image-preview"><i className="fa-regular fa-image"></i></div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="post-title-cell">
                          <span className="font-semibold block text-slate-800">{art.title}</span>
                          <div className="post-tags-badges">
                            {art.isSlider && <span className="badge badge-slider">Slider</span>}
                            {art.isFeatured && <span className="badge badge-featured">Featured</span>}
                            {art.isBreaking && <span className="badge badge-breaking">Breaking</span>}
                            {art.isRecommended && <span className="badge badge-recommended">Recommended</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`lang-badge ${art.language}`}>
                          {art.language === 'en' ? 'English' : 'Tamil'}
                        </span>
                      </td>
                      <td>
                        <span className={`post-type-badge ${art.postType ? art.postType.toLowerCase() : 'article'}`}>
                          {art.postType || 'ARTICLE'}
                        </span>
                      </td>
                      <td>
                        <span className="cat-chip-badge">{getCategoryName(art.categoryId)}</span>
                      </td>
                      <td><span className="text-slate-600">{art.authorName || 'Desk'}</span></td>
                      <td><span className="font-medium text-slate-600">{art.views || 0}</span></td>
                      <td>
                        <span className={`status-badge ${art.status ? art.status.toLowerCase() : 'draft'}`}>
                          {art.status || 'DRAFT'}
                        </span>
                      </td>
                      {view === 'scheduled' && (
                        <td>
                          <span className="badge badge-scheduled font-semibold">
                            {art.scheduledAt ? (
                              Math.max(0, Math.ceil((new Date(art.scheduledAt) - new Date()) / (1000 * 60 * 60 * 24))) + ' Days'
                            ) : 'Pending'}
                          </span>
                        </td>
                      )}
                      <td>
                        <div className="action-buttons-cell">
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => navigate(`/posts/edit/${art.id}`, { state: { article: art } })}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          
                          <div className="toggle-badge-actions">
                            <button 
                              className={`toggle-action-btn ${art.isFeatured ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isFeatured')}
                              title="Toggle Featured"
                            >
                              <i className="fa-solid fa-star"></i>
                            </button>
                            <button 
                              className={`toggle-action-btn ${art.isBreaking ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isBreaking')}
                              title="Toggle Breaking"
                            >
                              <i className="fa-solid fa-bolt"></i>
                            </button>
                          </div>

                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(art.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button 
                disabled={currentPage === 0} 
                onClick={() => loadArticles(currentPage - 1)}
                className="pag-btn"
              >
                Previous
              </button>
              <span className="page-indicator">Page {currentPage + 1} of {totalPages}</span>
              <button 
                disabled={currentPage === totalPages - 1} 
                onClick={() => loadArticles(currentPage + 1)}
                className="pag-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Upload Modal Dialog */}
      {showBulkModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Bulk Upload CSV</h2>
              <button className="close-modal-btn" onClick={() => { setShowBulkModal(false); setBulkReport(null); setBulkFile(null); }}>&times;</button>
            </div>
            
            <form onSubmit={handleBulkUpload} className="modal-form">
              <p className="modal-instructions">
                Upload a CSV file containing columns in order: <code>title</code>, <code>summary</code>, <code>content</code>, and optional <code>language</code>.
              </p>
              
              <div className="form-group">
                <label htmlFor="csvFile">Choose CSV File</label>
                <input 
                  type="file" 
                  id="csvFile" 
                  accept=".csv"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowBulkModal(false); setBulkReport(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={bulkUploading || !bulkFile}>
                  {bulkUploading ? 'Uploading & Processing...' : 'Process Import'}
                </button>
              </div>
            </form>

            {bulkReport && (
              <div className="bulk-report-results">
                <h3>Processing Report</h3>
                <div className="report-stats">
                  <span className="success-text">Success: <strong>{bulkReport.successCount}</strong> rows</span>
                  <span className="error-text">Failed: <strong>{bulkReport.failureCount}</strong> rows</span>
                </div>
                {bulkReport.errors && bulkReport.errors.length > 0 && (
                  <div className="report-errors-list">
                    <h4>Error Logs:</h4>
                    <ul>
                      {bulkReport.errors.map((err, index) => <li key={index}>{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsList;
