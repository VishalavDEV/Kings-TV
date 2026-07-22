import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/fetchApi';
import { useAuth } from '../context/AuthContext';
import './PostsList.css';

const PostsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const path = location.pathname;

  // Determine current pre-filter view based on URL route path
  let view = 'all';
  let viewTitle = 'All Articles';
  if (path.includes('/posts/my')) {
    view = 'my';
    viewTitle = 'My Articles';
  } else if (path.includes('/posts/slider')) {
    view = 'slider';
    viewTitle = 'Slider Showcase Showcase';
  } else if (path.includes('/posts/featured')) {
    view = 'featured';
    viewTitle = 'Featured Showcase';
  } else if (path.includes('/posts/breaking')) {
    view = 'breaking';
    viewTitle = 'Breaking News Alerts';
  } else if (path.includes('/posts/recommended')) {
    view = 'recommended';
    viewTitle = 'Recommended Showcase';
  } else if (path.includes('/posts/pending')) {
    view = 'pending';
    viewTitle = 'Pending Reviews';
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
  const [authors, setAuthors] = useState([]);

  // Pagination & Filtering state
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const [filterLang, setFilterLang] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadFilterOptions = async () => {
    try {
      const [cats, subs, userList] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/subcategories'),
        fetchApi('/admin/users')
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(subs)) setSubcategories(subs);
      if (Array.isArray(userList)) setAuthors(userList);
    } catch (err) {
      console.error('Failed to load filter definitions:', err);
    }
  };

  const loadArticles = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/admin/articles?view=${view}&page=${page}&size=${pageSize}`;
      if (view === 'my' && currentUser) {
        query += `&user=${encodeURIComponent(currentUser.fullName || currentUser.username)}`;
      }
      if (filterLang) query += `&language=${filterLang}`;
      if (filterAuthor) query += `&user=${encodeURIComponent(filterAuthor)}`;
      if (filterCategory) query += `&category=${filterCategory}`;
      if (filterSubcategory) query += `&subcategory=${filterSubcategory}`;
      if (filterType) query += `&postType=${filterType}`;
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
  }, [view, pageSize, filterLang, filterCategory, filterSubcategory, filterAuthor, filterType]);

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
      const res = await fetchApi(`/admin/articles/${article.id}/toggleFlag`, {
        method: 'PATCH',
        body: JSON.stringify({
          flagName: field,
          value: updatedValue
        })
      });
      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Distribution setting updated successfully');
        loadArticles(currentPage);
      }
    } catch (err) {
      setErrorMsg('Failed to toggle flag');
    }
  };

  const handleRemoveFromBreaking = async (article) => {
    try {
      const res = await fetchApi(`/admin/articles/${article.id}/toggleFlag`, {
        method: 'PATCH',
        body: JSON.stringify({
          flagName: 'isBreaking',
          value: false
        })
      });
      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Removed from Breaking News Alerts');
        // Instantly remove from UI list state
        setArticles(prev => prev.filter(a => a.id !== article.id));
        setTotalCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setErrorMsg('Failed to remove from breaking list');
    }
  };

  const handleBreakingOrderChange = async (article, val) => {
    try {
      const parsedVal = val === '' ? null : parseInt(val, 10);
      const res = await fetchApi(`/admin/articles/${article.id}/toggleFlag`, {
        method: 'PATCH',
        body: JSON.stringify({
          flagName: 'breakingOrder',
          value: parsedVal
        })
      });
      if (!res.error) {
        setArticles(prev => 
          prev.map(a => a.id === article.id ? { ...a, breakingOrder: parsedVal } : a)
        );
      }
    } catch (err) {
      console.error('Failed to update breaking sequence order', err);
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
          <p className="subtitle">Displaying Y to Z of {totalCount} matching articles</p>
        </div>
        <div className="action-buttons-group">
          <Link to="/posts/bulk-upload" className="btn btn-secondary">
            <i className="fa-solid fa-file-import"></i> Bulk Upload CSV
          </Link>
          <Link 
            to={view === 'breaking' ? '/posts/add?isBreaking=true' : '/posts/add'} 
            className="btn btn-primary"
          >
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

        <div className="filter-item">
          <label>Post Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Post Types</option>
            <option value="ARTICLE">Article</option>
            <option value="GALLERY">Gallery</option>
            <option value="SORTED_LIST">Sorted List</option>
            <option value="PAGE">Page</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="TRIVIA_QUIZ">Trivia Quiz</option>
            <option value="PERSONALITY_QUIZ">Personality Quiz</option>
          </select>
        </div>

        <div className="filter-item">
          <label>User</label>
          <select value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)}>
            <option value="">All Users</option>
            {authors.map(u => (
              <option key={u.id} value={u.fullName || u.username}>{u.fullName || u.username}</option>
            ))}
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
          <label>Search box</label>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="e.g. Title keyword..." 
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
                  {view === 'breaking' && <th>Breaking Order</th>}
                  {view === 'scheduled' && <th>Days Remaining</th>}
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={view === 'breaking' ? "12" : "11"} className="empty-table">No matching posts found.</td>
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
                            {art.showOnlyRegistered && <span className="badge badge-registered" style={{background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1'}}>Registered Only</span>}
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
                      <td><span className="font-medium text-slate-600">{art.viewsCount || art.views || 0}</span></td>
                      <td>
                        <span className={`status-badge ${art.status ? art.status.toLowerCase() : 'draft'}`}>
                          {art.status || 'DRAFT'}
                        </span>
                      </td>
                      {view === 'breaking' && (
                        <td>
                          <input 
                            type="number"
                            value={art.breakingOrder !== null && art.breakingOrder !== undefined ? art.breakingOrder : ''}
                            onChange={(e) => handleBreakingOrderChange(art, e.target.value)}
                            className="breaking-order-input"
                            style={{ width: '60px', padding: '0.2rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}
                            placeholder="None"
                          />
                        </td>
                      )}
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
                          
                          {art.status === 'PUBLISHED' && (
                            <a 
                              href={art.postType === 'PAGE' ? `/p/${art.slug}` : `/news/${art.id}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="action-btn view-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}
                            >
                              <i className="fa-solid fa-eye"></i> View
                            </a>
                          )}

                          <div className="toggle-badge-actions" style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              className={`toggle-action-btn ${art.isFeatured ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isFeatured')}
                              title="Toggle Featured Highlight"
                              style={{ background: art.isFeatured ? '#fef3c7' : '#f1f5f9', color: art.isFeatured ? '#d97706' : '#64748b', border: '1px solid', borderColor: art.isFeatured ? '#fde68a' : '#cbd5e1', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-star"></i>
                            </button>
                            <button 
                              className={`toggle-action-btn ${art.isSlider ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isSlider')}
                              title="Toggle Slider Carousel"
                              style={{ background: art.isSlider ? '#dbeafe' : '#f1f5f9', color: art.isSlider ? '#2563eb' : '#64748b', border: '1px solid', borderColor: art.isSlider ? '#bfdbfe' : '#cbd5e1', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-images"></i>
                            </button>
                            <button 
                              className={`toggle-action-btn ${art.isBreaking ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isBreaking')}
                              title="Toggle Breaking Alert"
                              style={{ background: art.isBreaking ? '#fee2e2' : '#f1f5f9', color: art.isBreaking ? '#dc2626' : '#64748b', border: '1px solid', borderColor: art.isBreaking ? '#fecaca' : '#cbd5e1', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-bolt"></i>
                            </button>
                            <button 
                              className={`toggle-action-btn ${art.isRecommended ? 'active' : ''}`}
                              onClick={() => handleToggleFeature(art, 'isRecommended')}
                              title="Toggle Recommended Display"
                              style={{ background: art.isRecommended ? '#f0fdf4' : '#f1f5f9', color: art.isRecommended ? '#16a34a' : '#64748b', border: '1px solid', borderColor: art.isRecommended ? '#bbf7d0' : '#cbd5e1', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-thumbs-up"></i>
                            </button>
                          </div>

                          {view === 'breaking' && (
                            <button 
                              className="action-btn remove-breaking-btn" 
                              onClick={() => handleRemoveFromBreaking(art)}
                              title="Remove from Breaking Alerts"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-ban"></i> Remove
                            </button>
                          )}

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

          {/* Pagination Footer */}
          <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <span className="text-sm text-slate-500 font-medium">
              Showing {articles.length > 0 ? (currentPage * pageSize + 1) : 0} to {currentPage * pageSize + articles.length} of {totalCount} entries
            </span>
            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  disabled={currentPage === 0} 
                  onClick={() => loadArticles(currentPage - 1)}
                  className="pag-btn"
                >
                  Previous
                </button>
                <span className="page-indicator" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  {currentPage + 1} / {totalPages}
                </span>
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
        </div>
      )}
    </div>
  );
};

export default PostsList;
