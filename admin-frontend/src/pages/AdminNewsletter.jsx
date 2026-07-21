import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminNewsletter.css';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Settings Panel State
  const [settings, setSettings] = useState({
    status: 'enabled',
    popupEnabled: true
  });

  // Compose Email Modal State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState({
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsRes, settingsRes] = await Promise.all([
        fetchApi('/admin/newsletter/subscribers'),
        fetchApi('/admin/newsletter/settings')
      ]);
      if (Array.isArray(subsRes)) setSubscribers(subsRes);
      if (settingsRes) {
        setSettings({
          status: settingsRes.status || 'enabled',
          popupEnabled: settingsRes.popupEnabled !== undefined ? settingsRes.popupEnabled : true
        });
      }
    } catch (err) {
      console.error('Failed to load newsletter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(subscribers.map((s) => s.subscriberId || s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Remove this newsletter subscriber?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/newsletter/subscribers/${id}`, { method: 'DELETE' });
      setSuccessMsg('Subscriber removed');
      loadData();
    } catch (err) {
      setErrorMsg('Failed to delete subscriber');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetchApi('/admin/newsletter/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res && res.message) {
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('Failed to update newsletter settings');
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!composeData.subject.trim() || !composeData.body.trim()) {
      setErrorMsg('Newsletter subject and body content are required');
      return;
    }

    setSending(true);
    try {
      const payload = {
        subject: composeData.subject,
        body: composeData.body,
        subscriberIds: selectedIds.length > 0 ? selectedIds : null
      };

      const res = await fetchApi('/admin/newsletter/send', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.message) {
        setSuccessMsg(`Success! ${res.message} (Sent to ${res.recipientsCount} recipient(s))`);
        setShowComposeModal(false);
        setComposeData({ subject: '', body: '' });
      }
    } catch (err) {
      setErrorMsg('Failed to send newsletter broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-newsletter-container">
      <div className="pages-header">
        <h1>Newsletter Subscribers & Campaigns</h1>
        <p className="subtitle">Manage newsletter list subscribers, compose email broadcasts, and configure popup settings</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subscribers List (2 cols) */}
        <div className="lg:col-span-2">
          <div className="table-panel">
            <div className="table-header-controls flex justify-between items-center">
              <h2>Subscribers ({subscribers.length})</h2>
              <button
                type="button"
                className="btn btn-primary text-sm flex items-center gap-2"
                onClick={() => setShowComposeModal(true)}
              >
                <i className="fa-solid fa-paper-plane"></i> Compose & Send Email
                {selectedIds.length > 0 ? ` (${selectedIds.length} Selected)` : ' (All Subscribers)'}
              </button>
            </div>

            {loading ? (
              <div className="loading-state">Loading subscribers list...</div>
            ) : (
              <div className="table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th width="40">
                        <input
                          type="checkbox"
                          checked={subscribers.length > 0 && selectedIds.length === subscribers.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Subscriber Email</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Subscribed Date</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-table">
                          No subscribers found.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => {
                        const sid = s.subscriberId || s.id;
                        const isSelected = selectedIds.includes(sid);
                        return (
                          <tr key={sid} className={isSelected ? 'bg-blue-50' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(sid)}
                              />
                            </td>
                            <td>
                              <span className="font-semibold text-slate-800">{s.email}</span>
                            </td>
                            <td>
                              <span className="text-slate-600 font-medium">{s.name || 'Anonymous'}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${s.status ? s.status.toLowerCase() : 'active'}`}>
                                {s.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td>
                              <span className="text-xs text-slate-500">
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  type="button"
                                  className="action-btn delete-btn text-xs"
                                  onClick={() => handleDeleteSubscriber(sid)}
                                  title="Delete Subscriber"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
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

        {/* Right Column: Newsletter Settings Panel (1 col) */}
        <div>
          <div className="form-panel">
            <h2>Newsletter Settings</h2>
            <form onSubmit={handleSaveSettings} className="category-form">
              <div className="form-group">
                <label htmlFor="newsletterStatus">Newsletter Feature Status</label>
                <select
                  id="newsletterStatus"
                  value={settings.status}
                  onChange={(e) => setSettings((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="enabled">Enabled (Active)</option>
                  <option value="disabled">Disabled (Hidden)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="popupEnabled">Newsletter Signup Popup</label>
                <select
                  id="popupEnabled"
                  value={settings.popupEnabled ? 'true' : 'false'}
                  onChange={(e) => setSettings((prev) => ({ ...prev, popupEnabled: e.target.value === 'true' }))}
                >
                  <option value="true">Popup Enabled</option>
                  <option value="false">Popup Disabled</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Compose Email Broadcast Modal */}
      {showComposeModal && (
        <div className="modal-backdrop">
          <div className="modal-content-box max-w-2xl">
            <div className="modal-header">
              <h2>Compose Newsletter Campaign</h2>
              <button className="close-btn" onClick={() => setShowComposeModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSendNewsletter}>
              <div className="modal-body">
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-lg mb-4 font-medium">
                  Recipient Audience:{' '}
                  {selectedIds.length > 0
                    ? `${selectedIds.length} Selected Subscriber(s)`
                    : `All ${subscribers.length} Active Subscribers`}
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Email Subject Header *</label>
                  <input
                    type="text"
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Kings TV Weekly Highlights & Breaking Updates"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="body">Email HTML Content / Body *</label>
                  <textarea
                    id="body"
                    rows="8"
                    value={composeData.body}
                    onChange={(e) => setComposeData((prev) => ({ ...prev, body: e.target.value }))}
                    placeholder="Write your email broadcast text or HTML template content..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowComposeModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Broadcasting Email...' : 'Send Broadcast Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
