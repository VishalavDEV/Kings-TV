import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminPushNotifications.css';

const AdminPushNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form composer fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [targetType, setTargetType] = useState('GLOBAL');
  const [targetValue, setTargetValue] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/push-notifications?size=20');
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error('Failed to load notifications history:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const [cats, dists] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/districts') // fallback list or assume standard districts
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(dists)) setDistricts(dists);
    } catch (e) {
      console.error('Failed to load targets dropdown lists:', e);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadTargets();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title.trim() || !body.trim()) {
      setErrorMsg('Title and Message Body are required.');
      return;
    }

    const payload = {
      title,
      body,
      imageUrl,
      actionUrl,
      targetType,
      targetValue
    };

    try {
      const res = await fetchApi('/admin/push-notifications/send', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Push notification broadcast queued successfully!');
        resetComposer();
        loadNotifications();
      }
    } catch (err) {
      setErrorMsg('Failed to broadcast push notification.');
    }
  };

  const resetComposer = () => {
    setTitle('');
    setBody('');
    setImageUrl('');
    setActionUrl('');
    setTargetType('GLOBAL');
    setTargetValue('');
  };

  return (
    <div className="admin-push-container">
      <div className="posts-header">
        <h1>Push Notifications Composer</h1>
        <p className="subtitle">Send instant breaking alerts globally or target specific districts and categories</p>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Compose Form */}
        <div className="form-panel">
          <h2>Compose Notification</h2>
          <form onSubmit={handleSendNotification} className="category-form">
            <div className="form-group">
              <label>Alert Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Breaking: Chennai rains high alert"
                required
              />
            </div>

            <div className="form-group">
              <label>Message Body *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write message description details..."
                rows="3"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Rich Notification Image URL (Optional)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/breaking-image.jpg"
              />
            </div>

            <div className="form-group">
              <label>On-Click Destination URL / Action Link</label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="e.g. /article/breaking-rains-alert"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Target Audience *</label>
                <select value={targetType} onChange={(e) => { setTargetType(e.target.value); setTargetValue(''); }}>
                  <option value="GLOBAL">Broadcast to All Readers</option>
                  <option value="DISTRICT">Target by District Location</option>
                  <option value="CATEGORY">Target by Category Interest</option>
                </select>
              </div>

              {targetType !== 'GLOBAL' && (
                <div className="form-group half">
                  <label>Audience Segment *</label>
                  {targetType === 'DISTRICT' ? (
                    <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      <option value="Chennai">Chennai</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Coimbatore">Coimbatore</option>
                    </select>
                  ) : (
                    <select value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>
              <i className="fa-solid fa-paper-plane"></i> Send Notification
            </button>
          </form>
        </div>

        {/* Right: History Table */}
        <div className="table-panel">
          <h2>Broadcast Logs</h2>
          {loading ? (
            <div className="loading-state">Loading history...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Alert Title</th>
                    <th>Target Group</th>
                    <th>Sent/Opens</th>
                    <th>CTR %</th>
                    <th>Date Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        No push history logs available.
                      </td>
                    </tr>
                  ) : (
                    notifications.map(n => {
                      const ctrVal = n.sentCount > 0 ? ((n.openedCount || 0) / n.sentCount) * 100 : 0.0;
                      return (
                        <tr key={n.id}>
                          <td>#{n.id}</td>
                          <td>
                            <strong>{n.title}</strong>
                            <p className="text-xs text-slate-500 truncate" style={{ maxWidth: '180px' }}>{n.body}</p>
                          </td>
                          <td>
                            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {n.targetType}: {n.targetValue || 'All'}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-semibold">
                              {n.sentCount} sent / {n.openedCount || 0} opened
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: ctrVal > 0 ? '#10b981' : '#64748b' }}>
                              {ctrVal.toFixed(1)}%
                            </strong>
                          </td>
                          <td>
                            <span className="text-xs text-slate-500">
                              {n.sentAt ? n.sentAt.substring(0, 16).replace('T', ' ') : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
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

export default AdminPushNotifications;
