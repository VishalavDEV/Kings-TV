import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminGallery.css';

const AdminGallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Album for Image Grid Manager
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);

  // Album Form
  const [albumName, setAlbumName] = useState('');
  const [language, setLanguage] = useState('ta');

  // Image Form
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/gallery-albums');
      if (Array.isArray(res)) {
        setAlbums(res);
      }
    } catch (err) {
      console.error('Failed to load gallery albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!albumName.trim()) {
      setErrorMsg('Album name is required');
      return;
    }

    try {
      const res = await fetchApi('/admin/gallery-albums', {
        method: 'POST',
        body: JSON.stringify({ albumName, language })
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Gallery Album created successfully!');
        setAlbumName('');
        loadAlbums();
      }
    } catch (err) {
      setErrorMsg('Failed to create album');
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm('Delete this album and all its images?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/gallery-albums/${id}`, { method: 'DELETE' });
      setSuccessMsg('Album deleted');
      if (activeAlbum && activeAlbum.id === id) {
        setActiveAlbum(null);
      }
      loadAlbums();
    } catch (err) {
      setErrorMsg('Failed to delete album');
    }
  };

  const openAlbumManager = async (album) => {
    setActiveAlbum(album);
    try {
      const images = await fetchApi(`/admin/gallery-albums/${album.id}/images`);
      if (Array.isArray(images)) {
        setAlbumImages(images);
      }
    } catch (err) {
      console.error('Failed to load album images:', err);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    try {
      const res = await fetchApi(`/admin/gallery-albums/${activeAlbum.id}/images`, {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: newImageUrl,
          caption: newCaption,
          displayOrder: albumImages.length + 1
        })
      });

      if (res) {
        setAlbumImages((prev) => [...prev, res]);
        setNewImageUrl('');
        setNewCaption('');
      }
    } catch (err) {
      console.error('Failed to add image:', err);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await fetchApi(`/admin/gallery-albums/images/${imageId}`, { method: 'DELETE' });
      setAlbumImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  };

  return (
    <div className="admin-gallery-container">
      <div className="pages-header">
        <h1>Photo Gallery & Albums Manager</h1>
        <p className="subtitle">Create gallery albums and manage high-resolution media photo grids</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Add Album Form */}
        <div className="form-panel">
          <h2>Create New Gallery Album</h2>
          <form onSubmit={handleCreateAlbum} className="category-form">
            <div className="form-group">
              <label htmlFor="albumName">Album Name *</label>
              <input
                type="text"
                id="albumName"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="e.g. Annual Cultural Festival 2026"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="en">English</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Create Album
            </button>
          </form>
        </div>

        {/* Right: Album list table */}
        <div className="table-panel">
          <h2>Albums ({albums.length})</h2>
          {loading ? (
            <div className="loading-state">Loading albums...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Album Name</th>
                    <th>Language</th>
                    <th>Images Count</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {albums.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No albums created yet.
                      </td>
                    </tr>
                  ) : (
                    albums.map((alb) => (
                      <tr key={alb.id} className={activeAlbum && activeAlbum.id === alb.id ? 'bg-blue-50' : ''}>
                        <td>#{alb.id}</td>
                        <td>
                          <span className="font-semibold text-slate-800">{alb.albumName}</span>
                        </td>
                        <td>
                          <span className={`lang-badge ${alb.language}`}>{alb.language === 'en' ? 'English' : 'Tamil'}</span>
                        </td>
                        <td>
                          <span className="font-medium text-slate-600">{(alb.images || []).length} Photos</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => openAlbumManager(alb)}
                            >
                              <i className="fa-solid fa-images"></i> Manage Photos
                            </button>
                            <button type="button" className="action-btn delete-btn" onClick={() => handleDeleteAlbum(alb.id)}>
                              <i className="fa-solid fa-trash"></i>
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

      {/* Image Grid Manager Modal / Drawer */}
      {activeAlbum && (
        <div className="modal-backdrop">
          <div className="modal-content-box max-w-4xl">
            <div className="modal-header">
              <h2>Photos Manager: {activeAlbum.albumName}</h2>
              <button className="close-btn" onClick={() => setActiveAlbum(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              {/* Add Image Inline Form */}
              <form onSubmit={handleAddImage} className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
                <h3 className="font-bold text-slate-700 text-sm mb-3">Add Photo to Album</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="url"
                    placeholder="Image URL (e.g. https://...)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Photo Caption / Description"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <button type="submit" className="btn btn-primary text-sm">
                  + Upload / Add Photo
                </button>
              </form>

              {/* Photos Grid */}
              <div className="images-grid-container">
                {albumImages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">No photos added to this album yet.</div>
                ) : (
                  albumImages.map((img) => (
                    <div key={img.id} className="image-grid-card">
                      <div className="img-preview-box">
                        <img src={img.imageUrl} alt={img.caption || 'Gallery photo'} />
                        <button type="button" className="delete-overlay-btn" onClick={() => handleDeleteImage(img.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      <div className="img-caption-box">{img.caption || <span className="text-gray-400 italic">No caption</span>}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveAlbum(null)}>
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
