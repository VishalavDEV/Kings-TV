import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminNfc.css';

const AdminNfc = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Queue status filter
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Card for inspection
  const [selectedCard, setSelectedCard] = useState(null);

  // Analytics sub-view state
  const [analyticsLogs, setAnalyticsLogs] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [viewingAnalyticsId, setViewingAnalyticsId] = useState(null);

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/nfc');
      if (Array.isArray(data)) setCards(data);
    } catch (e) {
      console.error("Could not load NFC cards queue", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleStatusTransition = async (id, nextStatus) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi(`/admin/nfc/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res && res.card) {
        setSuccessMsg(`Status updated to ${nextStatus}.`);
        setSelectedCard(res.card);
        loadCards();
      }
    } catch (e) {
      setErrorMsg('Failed to update card status.');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this card? Access will be immediately blocked.")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/nfc/${id}/revoke`, { method: 'PUT' });
      setSuccessMsg('NFC card revoked / blocked.');
      if (selectedCard && selectedCard.id === id) {
        setSelectedCard(prev => ({ ...prev, status: 'revoked' }));
      }
      loadCards();
    } catch (e) {
      setErrorMsg('Failed to revoke card.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this NFC profile?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/nfc/${id}`, { method: 'DELETE' });
      setSuccessMsg('NFC profile deleted.');
      setSelectedCard(null);
      setViewingAnalyticsId(null);
      loadCards();
    } catch (e) {
      setErrorMsg('Failed to delete NFC card.');
    }
  };

  const handleViewAnalytics = async (cardId) => {
    setViewingAnalyticsId(cardId);
    setSelectedCard(null);
    setLoadingAnalytics(true);
    try {
      const data = await fetchApi(`/admin/nfc/${cardId}/analytics`);
      if (Array.isArray(data)) {
        setAnalyticsLogs(data);
      }
    } catch (e) {
      console.error("Could not load analytics logs", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const filteredCards = cards.filter(card => {
    if (statusFilter === 'all') return true;
    const currentStatus = card.status || 'requested';
    return currentStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  const getNextStatusText = (status) => {
    const s = status ? status.toLowerCase() : 'requested';
    if (s === 'requested') return 'Move to Printing';
    if (s === 'printing') return 'Mark as Shipped';
    if (s === 'shipped') return 'Mark as Activated';
    return null;
  };

  const getNextStatusVal = (status) => {
    const s = status ? status.toLowerCase() : 'requested';
    if (s === 'requested') return 'printing';
    if (s === 'printing') return 'shipped';
    if (s === 'shipped') return 'activated';
    return null;
  };

  return (
    <div className="admin-nfc-container">
      <div className="posts-header">
        <h1>NFC Digital Business Cards</h1>
        <p className="subtitle">Track digital card tags fulfillment pipeline, generate UIDs, and monitor tap logs</p>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="nfc-layout-grid" style={{ display: 'grid', gridTemplateColumns: selectedCard || viewingAnalyticsId ? '3fr 2fr' : '1fr', gap: '20px' }}>
        {/* Main List Column */}
        <div className="nfc-list-col">
          <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Filter Status:</span>
            {['all', 'requested', 'printing', 'shipped', 'activated', 'revoked'].map(st => (
              <button
                key={st}
                className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? '#B3732A' : '#f1f5f9',
                  color: statusFilter === st ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Loading NFC cards registry...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Owner / Title</th>
                    <th>Company</th>
                    <th>Card UID</th>
                    <th>Scans</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCards.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">No cards found in this status queue.</td>
                    </tr>
                  ) : (
                    filteredCards.map(card => (
                      <tr
                        key={card.id}
                        className={`nfc-row ${selectedCard?.id === card.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedCard(card); setViewingAnalyticsId(null); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{card.ownerName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.title || 'No Title'}</div>
                        </td>
                        <td>{card.company || 'Standalone'}</td>
                        <td>
                          {card.cardUid ? <code>{card.cardUid}</code> : <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Unassigned</span>}
                        </td>
                        <td>
                          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '800' }}>
                            {card.tapCount || 0} taps
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${card.status || 'requested'}`}>
                            {card.status || 'requested'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnalytics(card.id);
                            }}
                          >
                            Analytics
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspection Column */}
        {selectedCard && (
          <div className="nfc-detail-col">
            <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Inspect Tag Request</h3>
                <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedCard(null)}>×</button>
              </div>

              <div className="detail-body">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                  {selectedCard.profilePhoto && (
                    <img src={selectedCard.profilePhoto} alt="Profile" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div>
                    <h4 style={{ margin: 0 }}>{selectedCard.ownerName}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedCard.title} at {selectedCard.company || 'Standalone'}</span>
                  </div>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Fulfillment Status</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b', textTransform: 'uppercase' }}>{selectedCard.status || 'requested'}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Card UID</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      {selectedCard.cardUid ? <code>{selectedCard.cardUid}</code> : 'Pending UID (Not Printed)'}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Phone</span>
                    <span className="value" style={{ fontSize: '0.85rem' }}>{selectedCard.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Email</span>
                    <span className="value" style={{ fontSize: '0.85rem' }}>{selectedCard.email || 'N/A'}</span>
                  </div>
                </div>

                {selectedCard.status && selectedCard.status.toLowerCase() !== 'requested' && selectedCard.shortCode && (
                  <div className="detail-section encode-url-box" style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#1e3a8a' }}>Copy Target URL to program NFC tag:</h5>
                    <code style={{ fontSize: '0.8rem', display: 'block', wordBreak: 'break-all', color: '#1d4ed8', fontWeight: 600 }}>
                      {window.location.origin}/t/{selectedCard.shortCode}
                    </code>
                  </div>
                )}

                {/* Status Transitions Buttons */}
                <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {getNextStatusVal(selectedCard.status) && (
                    <button
                      className="btn btn-approve"
                      onClick={() => handleStatusTransition(selectedCard.id, getNextStatusVal(selectedCard.status))}
                      style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="fa-solid fa-arrow-right"></i> {getNextStatusText(selectedCard.status)}
                    </button>
                  )}
                  {selectedCard.status !== 'revoked' && (
                    <button
                      className="btn btn-reject"
                      onClick={() => handleRevoke(selectedCard.id)}
                      style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <i className="fa-solid fa-ban"></i> Revoke & Block Card
                    </button>
                  )}
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(selectedCard.id)}
                    style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Delete Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Analytics History Column */}
          {viewingAnalyticsId && (
            <div className="nfc-analytics-col">
              <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Tap Scans History</h3>
                  <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setViewingAnalyticsId(null)}>×</button>
                </div>

                <div className="detail-body">
                  {loadingAnalytics ? (
                    <div>Syncing tap metrics...</div>
                  ) : analyticsLogs.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No telemetry logs recorded for this digital card yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto' }}>
                      {analyticsLogs.map(log => (
                        <div key={log.id} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>Tapped by: {log.customerName || 'Anonymous Guest'}</strong>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}><i className="fa-solid fa-location-dot"></i> {log.locationCity || 'Chennai'}</div>
                          </div>
                          <span style={{ color: '#64748b' }}>{new Date(log.tappedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminNfc;
