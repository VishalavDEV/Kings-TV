import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminGallery.css';

const AdminGallery = () => {
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'albums'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown options lists
  const [categories, setCategories] = useState([]);
  const [albumsList, setAlbumsList] = useState([]);

  // --- Tab 1: Images States ---
  const [images, setImages] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [imagesPages, setImagesPages] = useState(0);
  const [imagesCurrentPage, setImagesCurrentPage] = useState(0);
  const [imagesPageSize, setImagesPageSize] = useState(15);
  const [filterImgLang, setFilterImgLang] = useState('');
  const [filterImgAlbum, setFilterImgAlbum] = useState('');
  const [filterImgCategory, setFilterImgCategory] = useState('');
  const [imgSearch, setImgSearch] = useState('');

  // --- Tab 2: Albums States ---
  const [albums, setAlbums] = useState([]);
  const [totalAlbums, setTotalAlbums] = useState(0);
  const [albumsPages, setAlbumsPages] = useState(0);
  const [albumsCurrentPage, setAlbumsCurrentPage] = useState(0);
  const [albumsPageSize, setAlbumsPageSize] = useState(15);
  const [filterAlbLang, setFilterAlbLang] = useState('');
  const [albSearch, setAlbSearch] = useState('');

  // Modals Add/Edit
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEditImageMode, setIsEditImageMode] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [imageForm, setImageForm] = useState({
    title: '',
    language: 'ta',
    albumId: '',
    categoryId: '',
    fileUrl: ''
  });

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [isEditAlbumMode, setIsEditAlbumMode] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [albumForm, setAlbumForm] = useState({
    albumName: '',
    language: 'ta',
    coverImageId: ''
  });

  // Load active drop-downs
  const loadFilters = async () => {
    try {
      const [cats, albs] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/gallery/albums?size=100')
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (albs && albs.content) setAlbumsList(albs.content);
    } catch (e) {
      console.error('Failed to load filters list data', e);
    }
  };

  const loadImages = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/gallery/images?page=${page}&size=${imagesPageSize}`;
      if (filterImgLang) query += `&language=${filterImgLang}`;
      if (filterImgAlbum) query += `&albumId=${filterImgAlbum}`;
      if (filterImgCategory) query += `&categoryId=${filterImgCategory}`;
      if (imgSearch) query += `&search=${encodeURIComponent(imgSearch)}`;

      const res = await fetchApi(query);
      if (res && res.content) {
        setImages(res.content);
        setTotalImages(res.totalElements);
        setImagesPages(res.totalPages);
        setImagesCurrentPage(res.number);
      } else {
        setImages([]);
      }
    } catch (err) {
      setErrorMsg('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumsTab = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/gallery/albums?page=${page}&size=${albumsPageSize}`;
      if (filterAlbLang) query += `&language=${filterAlbLang}`;
      if (albSearch) query += `&search=${encodeURIComponent(albSearch)}`;

      const res = await fetchApi(query);
      if (res && res.content) {
        setAlbums(res.content);
        setTotalAlbums(res.totalElements);
        setAlbumsPages(res.totalPages);
        setAlbumsCurrentPage(res.number);
      } else {
        setAlbums([]);
      }
    } catch (err) {
      setErrorMsg('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    if (activeTab === 'images') {
      loadImages(0);
    } else {
      loadAlbumsTab(0);
    }
  }, [activeTab, imagesPageSize, filterImgLang, filterImgAlbum, filterImgCategory, albumsPageSize, filterAlbLang]);

  const handleImageSearchSubmit = (e) => {
    e.preventDefault();
    loadImages(0);
  };

  const handleAlbumSearchSubmit = (e) => {
    e.preventDefault();
    loadAlbumsTab(0);
  };

  // Image Upload helper
  const handleImageFileUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }
      // Check file formats
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert('Invalid file format. Only JPEG, PNG, WEBP, and GIF are allowed.');
        return;
      }

      const fData = new FormData();
      fData.append('file', file);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/v1/articles/upload', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: fData
        });
        const data = await response.json();
        if (data && data.url) {
          setImageForm(prev => ({ ...prev, fileUrl: data.url }));
        }
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
  };

  // Image form save/update
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!imageForm.fileUrl) {
      setErrorMsg('Image file is required');
      return;
    }

    try {
      const payload = {
        title: imageForm.title,
        language: imageForm.language,
        albumId: imageForm.albumId ? parseInt(imageForm.albumId, 10) : null,
        categoryId: imageForm.categoryId ? parseInt(imageForm.categoryId, 10) : null,
        fileUrl: imageForm.fileUrl
      };

      let res;
      if (isEditImageMode) {
        res = await fetchApi(`/gallery/images/${editingImageId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi('/gallery/images', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(isEditImageMode ? 'Image details updated successfully!' : 'Image uploaded successfully!');
        setTimeout(() => {
          setShowImageModal(false);
          loadImages(imagesCurrentPage);
          loadFilters(); // refresh album cover options
        }, 800);
      }
    } catch (err) {
      setErrorMsg('Failed to save image.');
    }
  };

  // Album form save/update
  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!albumForm.albumName.trim()) {
      setErrorMsg('Album Name is required');
      return;
    }

    try {
      const payload = {
        albumName: albumForm.albumName,
        language: albumForm.language,
        coverImageId: albumForm.coverImageId ? parseInt(albumForm.coverImageId, 10) : null
      };

      let res;
      if (isEditAlbumMode) {
        res = await fetchApi(`/gallery/albums/${editingAlbumId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi('/gallery/albums', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(isEditAlbumMode ? 'Album updated successfully!' : 'Album created successfully!');
        setTimeout(() => {
          setShowAlbumModal(false);
          loadAlbumsTab(albumsCurrentPage);
          loadFilters(); // refresh dropdown lists
        }, 800);
      }
    } catch (err) {
      setErrorMsg('Failed to save album');
    }
  };

  const handleSetCover = async (albumId, imageId) => {
    try {
      await fetchApi(`/gallery/albums/${albumId}/cover?imageId=${imageId}`, {
        method: 'PUT'
      });
      setSuccessMsg('Album cover image updated successfully');
      loadImages(imagesCurrentPage);
    } catch (err) {
      setErrorMsg('Failed to set album cover image');
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await fetchApi(`/gallery/images/${id}`, { method: 'DELETE' });
      setSuccessMsg('Image deleted successfully');
      loadImages(imagesCurrentPage);
    } catch (e) {
      setErrorMsg('Failed to delete image');
    }
  };

  const handleDeleteAlbum = async (id, actionOverride = null) => {
    try {
      let url = `/gallery/albums/${id}`;
      if (actionOverride) {
        url += `?action=${actionOverride}`;
      }
      const res = await fetchApi(url, { method: 'DELETE' });
      
      if (res && res.error === 'ALBUM_NOT_EMPTY') {
        const choice = window.confirm(
          `${res.message}\n\nClick "OK" to move all images to "Unassigned" and delete the album.\nClick "Cancel" to abort.`
        );
        if (choice) {
          await handleDeleteAlbum(id, 'unassign');
        }
      } else {
        setSuccessMsg('Album deleted successfully');
        loadAlbumsTab(albumsCurrentPage);
        loadFilters();
      }
    } catch (e) {
      setErrorMsg('Failed to delete album');
    }
  };

  const getAlbumName = (id) => {
    const alb = albumsList.find(a => String(a.id) === String(id));
    return alb ? alb.albumName : 'Unassigned';
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => String(c.id) === String(id));
    return cat ? cat.name : 'None';
  };

  return (
    <div className="admin-gallery-container">
      <div className="posts-header">
        <div>
          <h1>Photo Gallery & Media library</h1>
          <p className="subtitle">Manage album collections and high-resolution photo grids</p>
        </div>
        <div className="action-buttons-group">
          {activeTab === 'images' ? (
            <button className="btn btn-primary" onClick={() => {
              setIsEditImageMode(false);
              setImageForm({ title: '', language: 'ta', albumId: '', categoryId: '', fileUrl: '' });
              setShowImageModal(true);
            }}>
              <i className="fa-solid fa-plus"></i> Add Image
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => {
              setIsEditAlbumMode(false);
              setAlbumForm({ albumName: '', language: 'ta', coverImageId: '' });
              setShowAlbumModal(true);
            }}>
              <i className="fa-solid fa-plus"></i> Add Album
            </button>
          )}
        </div>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {/* Tabs Controller */}
      <div className="tab-control-bar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '700', border: 'none', borderBottom: activeTab === 'images' ? '2px solid #2563eb' : 'none', color: activeTab === 'images' ? '#2563eb' : '#64748b', background: 'none', cursor: 'pointer' }}
        >
          Images List
        </button>
        <button 
          className={`tab-btn ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => setActiveTab('albums')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '700', border: 'none', borderBottom: activeTab === 'albums' ? '2px solid #2563eb' : 'none', color: activeTab === 'albums' ? '#2563eb' : '#64748b', background: 'none', cursor: 'pointer' }}
        >
          Albums Collections
        </button>
      </div>

      {/* TAB 1: IMAGES LIST */}
      {activeTab === 'images' && (
        <div>
          {/* Images Filters Row */}
          <form onSubmit={handleImageSearchSubmit} className="posts-filter-bar">
            <div className="filter-item">
              <label>Show</label>
              <select value={imagesPageSize} onChange={(e) => setImagesPageSize(parseInt(e.target.value, 10))}>
                <option value="15">15 entries</option>
                <option value="25">25 entries</option>
                <option value="50">50 entries</option>
                <option value="100">100 entries</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Language</label>
              <select value={filterImgLang} onChange={(e) => setFilterImgLang(e.target.value)}>
                <option value="">All Languages</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Album</label>
              <select value={filterImgAlbum} onChange={(e) => setFilterImgAlbum(e.target.value)}>
                <option value="">All Albums</option>
                <option value="-1">Unassigned Images</option>
                {albumsList.map(a => <option key={a.id} value={a.id}>{a.albumName}</option>)}
              </select>
            </div>

            <div className="filter-item">
              <label>Category</label>
              <select value={filterImgCategory} onChange={(e) => setFilterImgCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="filter-item flex-grow">
              <label>Search Title</label>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search image title keywords..." 
                  value={imgSearch}
                  onChange={(e) => setImgSearch(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <i className="fa-solid fa-magnifying-glass"></i> Filter
                </button>
              </div>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="loading-state">Loading images grid...</div>
          ) : (
            <div className="posts-table-panel">
              <div className="table-wrapper">
                <table className="posts-table">
                  <thead>
                    <tr>
                      <th width="60">ID</th>
                      <th width="100">Preview</th>
                      <th>Image Title</th>
                      <th>Language</th>
                      <th>Album</th>
                      <th>Category</th>
                      <th>Date Created</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {images.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="empty-table">No images found.</td>
                      </tr>
                    ) : (
                      images.map(img => (
                        <tr key={img.id}>
                          <td>#{img.id}</td>
                          <td>
                            <div className="post-thumbnail-preview">
                              <img src={img.fileUrl} alt="preview" style={{ maxWidth: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            </div>
                          </td>
                          <td>
                            <span className="font-semibold block text-slate-800">{img.title || 'Untitled Image'}</span>
                          </td>
                          <td>
                            <span className={`lang-badge ${img.language}`}>
                              {img.language === 'en' ? 'English' : 'Tamil'}
                            </span>
                          </td>
                          <td><span className="cat-chip-badge">{getAlbumName(img.albumId)}</span></td>
                          <td><span className="cat-chip-badge" style={{ background: '#f8fafc', color: '#64748b' }}>{getCategoryName(img.categoryId)}</span></td>
                          <td>
                            <span className="text-xs text-slate-500">
                              {img.createdAt ? img.createdAt.substring(0, 10) : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              {img.albumId && (
                                <button 
                                  className="action-btn edit-btn" 
                                  style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                                  onClick={() => handleSetCover(img.albumId, img.id)}
                                >
                                  <i className="fa-solid fa-image"></i> Set as Cover
                                </button>
                              )}
                              <button className="action-btn edit-btn" onClick={() => {
                                setIsEditImageMode(true);
                                setEditingImageId(img.id);
                                setImageForm({
                                  title: img.title || '',
                                  language: img.language || 'ta',
                                  albumId: img.albumId || '',
                                  categoryId: img.categoryId || '',
                                  fileUrl: img.fileUrl || ''
                                });
                                setShowImageModal(true);
                              }}>
                                <i className="fa-solid fa-pen-to-square"></i> Edit
                              </button>
                              <button className="action-btn delete-btn" onClick={() => handleDeleteImage(img.id)}>
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
              <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <span className="text-sm text-slate-500 font-medium">
                  Showing {images.length > 0 ? (imagesCurrentPage * imagesPageSize + 1) : 0} to {imagesCurrentPage * imagesPageSize + images.length} of {totalImages} entries
                </span>
                {imagesPages > 1 && (
                  <div className="pagination-bar" style={{ display: 'flex', gap: '0.25rem' }}>
                    <button disabled={imagesCurrentPage === 0} onClick={() => loadImages(imagesCurrentPage - 1)} className="pag-btn">Previous</button>
                    <span className="page-indicator" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                      {imagesCurrentPage + 1} / {imagesPages}
                    </span>
                    <button disabled={imagesCurrentPage === imagesPages - 1} onClick={() => loadImages(imagesCurrentPage + 1)} className="pag-btn">Next</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALBUMS LIST */}
      {activeTab === 'albums' && (
        <div>
          {/* Albums Filters */}
          <form onSubmit={handleAlbumSearchSubmit} className="posts-filter-bar">
            <div className="filter-item">
              <label>Show</label>
              <select value={albumsPageSize} onChange={(e) => setAlbumsPageSize(parseInt(e.target.value, 10))}>
                <option value="15">15 entries</option>
                <option value="25">25 entries</option>
                <option value="50">50 entries</option>
                <option value="100">100 entries</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Language</label>
              <select value={filterAlbLang} onChange={(e) => setFilterAlbLang(e.target.value)}>
                <option value="">All Languages</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="filter-item flex-grow">
              <label>Search Album</label>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search album name keywords..." 
                  value={albSearch}
                  onChange={(e) => setAlbSearch(e.target.value)}
                />
                <button type="submit" className="search-btn">
                  <i className="fa-solid fa-magnifying-glass"></i> Filter
                </button>
              </div>
            </div>
          </form>

          {/* Table */}
          {loading ? (
            <div className="loading-state">Loading albums database...</div>
          ) : (
            <div className="posts-table-panel">
              <div className="table-wrapper">
                <table className="posts-table">
                  <thead>
                    <tr>
                      <th width="60">ID</th>
                      <th>Album Name</th>
                      <th>Language</th>
                      <th>Cover Image ID</th>
                      <th>Date Created</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albums.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-table">No albums found.</td>
                      </tr>
                    ) : (
                      albums.map(alb => (
                        <tr key={alb.id}>
                          <td>#{alb.id}</td>
                          <td>
                            <span className="font-semibold block text-slate-800">{alb.albumName}</span>
                          </td>
                          <td>
                            <span className={`lang-badge ${alb.language}`}>
                              {alb.language === 'en' ? 'English' : 'Tamil'}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-mono text-slate-600">
                              {alb.coverImageId ? `Image #${alb.coverImageId}` : 'None'}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-slate-500">
                              {alb.createdAt ? alb.createdAt.substring(0, 10) : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons-cell">
                              <button className="action-btn edit-btn" onClick={() => {
                                setIsEditAlbumMode(true);
                                setEditingAlbumId(alb.id);
                                setAlbumForm({
                                  albumName: alb.albumName || '',
                                  language: alb.language || 'ta',
                                  coverImageId: alb.coverImageId || ''
                                });
                                setShowAlbumModal(true);
                              }}>
                                <i className="fa-solid fa-pen-to-square"></i> Edit
                              </button>
                              <button className="action-btn delete-btn" onClick={() => handleDeleteAlbum(alb.id)}>
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
              <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <span className="text-sm text-slate-500 font-medium">
                  Showing {albums.length > 0 ? (albumsCurrentPage * albumsPageSize + 1) : 0} to {albumsCurrentPage * albumsPageSize + albums.length} of {totalAlbums} entries
                </span>
                {albumsPages > 1 && (
                  <div className="pagination-bar" style={{ display: 'flex', gap: '0.25rem' }}>
                    <button disabled={albumsCurrentPage === 0} onClick={() => loadAlbumsTab(albumsCurrentPage - 1)} className="pag-btn">Previous</button>
                    <span className="page-indicator" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                      {albumsCurrentPage + 1} / {albumsPages}
                    </span>
                    <button disabled={albumsCurrentPage === albumsPages - 1} onClick={() => loadAlbumsTab(albumsCurrentPage + 1)} className="pag-btn">Next</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Image Add/Edit Overlay */}
      {showImageModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{isEditImageMode ? `Edit Image Details #${editingImageId}` : 'Add New Image to Gallery'}</h2>
              <button className="close-modal-btn" onClick={() => setShowImageModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleImageSubmit} className="modal-form">
              <div className="form-group">
                <label>Image Title / Caption</label>
                <input 
                  type="text" 
                  value={imageForm.title}
                  onChange={(e) => setImageForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Festival Crowd Highlights"
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Language *</label>
                  <select value={imageForm.language} onChange={(e) => setImageForm(prev => ({ ...prev, language: e.target.value }))}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Album Assignment</label>
                  <select value={imageForm.albumId} onChange={(e) => setImageForm(prev => ({ ...prev, albumId: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {albumsList.map(a => <option key={a.id} value={a.id}>{a.albumName}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Category Assignment</label>
                <select value={imageForm.categoryId} onChange={(e) => setImageForm(prev => ({ ...prev, categoryId: e.target.value }))}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Choose Local Image File *</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text"
                    placeholder="Or paste external image URL..."
                    value={imageForm.fileUrl}
                    onChange={(e) => setImageForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                    style={{ flexGrow: 1 }}
                  />
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                  />
                </div>
                {imageForm.fileUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={imageForm.fileUrl} alt="preview" style={{ maxWidth: '180px', maxHeight: '120px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowImageModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isEditImageMode ? 'Save Details' : 'Publish Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Album Add/Edit Overlay */}
      {showAlbumModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{isEditAlbumMode ? `Edit Album #${editingAlbumId}` : 'Create New Gallery Album'}</h2>
              <button className="close-modal-btn" onClick={() => setShowAlbumModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAlbumSubmit} className="modal-form">
              <div className="form-group">
                <label>Album Name *</label>
                <input 
                  type="text" 
                  value={albumForm.albumName}
                  onChange={(e) => setAlbumForm(prev => ({ ...prev, albumName: e.target.value }))}
                  placeholder="e.g. TN Assembly Budget Session 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Language *</label>
                <select value={albumForm.language} onChange={(e) => setAlbumForm(prev => ({ ...prev, language: e.target.value }))}>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAlbumModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isEditAlbumMode ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
