import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminLiveStream.css';

const AdminLiveStream = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Edit fields
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadStreams = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/livestream');
      if (Array.isArray(res)) {
        setStreams(res);
      }
    } catch (e) {
      console.error('Failed to load streams:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim() || !streamUrl.trim()) {
      setErrorMsg('Title and Stream URL are required.');
      return;
    }

    const payload = { title, streamUrl, streamKey, isActive };

    try {
      let res;
      if (isEditMode) {
        res = await fetchApi(`/admin/livestream/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi('/admin/livestream', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(isEditMode ? 'Live stream configuration updated!' : 'Live stream created successfully!');
        resetForm();
        loadStreams();
      }
    } catch (err) {
      setErrorMsg('Failed to save live stream configuration.');
    }
  };

  const handleEditClick = (stream) => {
    setIsEditMode(true);
    setEditingId(stream.id);
    setTitle(stream.title || '');
    setStreamUrl(stream.streamUrl || '');
    setStreamKey(stream.streamKey || '');
    setIsActive(stream.isActive !== false);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this live stream configuration?')) return;
    try {
      await fetchApi(`/admin/livestream/${id}`, { method: 'DELETE' });
      setSuccessMsg('Live stream configuration deleted.');
      loadStreams();
    } catch (e) {
      setErrorMsg('Failed to delete live stream.');
    }
  };

  const handleToggleActive = async (stream) => {
    try {
      await fetchApi(`/admin/livestream/${stream.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...stream, isActive: !stream.isActive })
      });
      setSuccessMsg(`Live stream ${!stream.isActive ? 'activated' : 'deactivated'} successfully.`);
      loadStreams();
    } catch (e) {
      setErrorMsg('Failed to toggle status.');
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setTitle('');
    setStreamUrl('');
    setStreamKey('');
    setIsActive(true);
  };

  return (
    <div className="admin-livestream-container">
      <div className="posts-header">
        <h1>Live Stream Settings</h1>
        <p className="subtitle">Configure RTMP/HLS feeds and manage live channel broadcasts</p>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      <div className="split-view-layout">
        {/* Left Form */}
        <div className="form-panel">
          <h2>{isEditMode ? `Edit Stream #${editingId}` : 'Add New Live Stream'}</h2>
          <form onSubmit={handleFormSubmit} className="category-form">
            <div className="form-group">
              <label>Stream Title / Channel Name *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tamil Nadu Election Live feed"
                required
              />
            </div>

            <div className="form-group">
              <label>Stream URL (HLS / m3u8 or RTMP) *</label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="e.g. https://live.kingstv.com/hls/live.m3u8"
                required
              />
            </div>

            <div className="form-group">
              <label>Stream Key (Optional)</label>
              <input
                type="text"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="e.g. live_tv_stream_key_abc123"
              />
            </div>

            <div className="form-group inline-toggle">
              <label className="toggle-container">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Active / Live TV Stream broadcast</span>
              </label>
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary flex-grow">
                {isEditMode ? 'Save Settings' : 'Add Stream'}
              </button>
              {isEditMode && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Table */}
        <div className="table-panel">
          <h2>Configured Channels ({streams.length})</h2>
          {loading ? (
            <div className="loading-state">Loading channels...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Channel Title</th>
                    <th>Stream Source</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {streams.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No live channels configured yet.
                      </td>
                    </tr>
                  ) : (
                    streams.map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td>
                          <strong>{s.title}</strong>
                        </td>
                        <td>
                          <code className="text-xs">{s.streamUrl}</code>
                        </td>
                        <td>
                          <button
                            className={`status-btn-pill ${s.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleActive(s)}
                            style={{
                              border: 'none',
                              padding: '0.2rem 0.5rem',
                              fontSize: '0.75rem',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              background: s.isActive ? '#dcfce7' : '#fee2e2',
                              color: s.isActive ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {s.isActive ? 'Live' : 'Offline'}
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="action-btn edit-btn" onClick={() => handleEditClick(s)}>
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteClick(s.id)}>
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

export default AdminLiveStream;
