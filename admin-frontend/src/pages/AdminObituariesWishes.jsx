import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminObituariesWishes.css';

const AdminObituariesWishes = () => {
  const [subTab, setSubTab] = useState('obits'); // obits / wishes / templates / comments
  const [obits, setObits] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Queue sub-filters
  const [obitFilter, setObitFilter] = useState('all');
  const [wishFilter, setWishFilter] = useState('all');

  // Selection Detail Overlays
  const [selectedObit, setSelectedObit] = useState(null);
  const [selectedWish, setSelectedWish] = useState(null);

  // Unmasked contact details state
  const [unmaskedContact, setUnmaskedContact] = useState(null);
  const [unmasking, setUnmasking] = useState(false);

  // Templates Management States
  const [templateType, setTemplateType] = useState('obits'); // obits / wishes
  const [obitTemplates, setObitTemplates] = useState([]);
  const [wishTemplates, setWishTemplates] = useState([]);
  const [tplName, setTplName] = useState('');
  const [tplBackgroundUrl, setTplBackgroundUrl] = useState('');
  const [tplOverlayUrl, setTplOverlayUrl] = useState('');
  const [tplBorderColor, setTplBorderColor] = useState('');
  const [tplTextColor, setTplTextColor] = useState('');
  const [showTplForm, setShowTplForm] = useState(false);

  // Comments Moderation States
  const [commentsType, setCommentsType] = useState('obits'); // obits / wishes
  const [obitGuestbook, setObitGuestbook] = useState([]);
  const [wishComments, setWishComments] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'obits') {
        const data = await fetchApi('/admin/obituaries');
        if (Array.isArray(data)) setObits(data);
      } else if (subTab === 'wishes') {
        const data = await fetchApi('/admin/wishes');
        if (Array.isArray(data)) setWishes(data);
      } else if (subTab === 'templates') {
        const obitTpl = await fetchApi('/admin/obituaries/templates');
        if (Array.isArray(obitTpl)) setObitTemplates(obitTpl);
        const wishTpl = await fetchApi('/admin/wishes/templates');
        if (Array.isArray(wishTpl)) setWishTemplates(wishTpl);
      } else if (subTab === 'comments') {
        const obitGb = await fetchApi('/admin/obituaries/guestbook');
        if (Array.isArray(obitGb)) setObitGuestbook(obitGb);
        const wishCmt = await fetchApi('/admin/wishes/comments');
        if (Array.isArray(wishCmt)) setWishComments(wishCmt);
      }
    } catch (e) {
      console.error("Could not sync obituaries/wishes admin data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedObit(null);
    setSelectedWish(null);
    setUnmaskedContact(null);
  }, [subTab, templateType, commentsType]);

  // Obit handlers
  const handleApproveObit = async (id) => {
    try {
      await fetchApi(`/admin/obituaries/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Obituary approved and published.');
      if (selectedObit && selectedObit.id === id) {
        setSelectedObit(prev => ({ ...prev, status: 'published' }));
      }
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve obituary.');
    }
  };

  const handleDeleteObit = async (id) => {
    if (!window.confirm("Delete this obituary?")) return;
    try {
      await fetchApi(`/admin/obituaries/${id}`, { method: 'DELETE' });
      setSuccessMsg('Obituary deleted.');
      setSelectedObit(null);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete obituary.');
    }
  };

  // Contact details unmasking with auditing
  const handleRevealContact = async (obitId) => {
    setUnmasking(true);
    try {
      const res = await fetchApi(`/admin/obituaries/${obitId}/unmask-contact`);
      if (res && res.familyPhone) {
        setUnmaskedContact(res);
        setSuccessMsg('Contact details unmasked and logged to audit trail.');
      }
    } catch (e) {
      setErrorMsg('Failed to unmask contact details.');
    } finally {
      setUnmasking(false);
    }
  };

  // Wish handlers
  const handleApproveWish = async (id) => {
    try {
      await fetchApi(`/admin/wishes/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Wish greeting approved.');
      if (selectedWish && selectedWish.id === id) {
        setSelectedWish(prev => ({ ...prev, status: 'published' }));
      }
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve wish.');
    }
  };

  const handleDeleteWish = async (id) => {
    if (!window.confirm("Delete this wish?")) return;
    try {
      await fetchApi(`/admin/wishes/${id}`, { method: 'DELETE' });
      setSuccessMsg('Wish greeting deleted.');
      setSelectedWish(null);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete wish.');
    }
  };

  // Templates Handlers
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!tplName.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    const payload = {
      name: tplName,
      backgroundUrl: tplBackgroundUrl,
      overlayUrl: tplOverlayUrl,
      borderColor: tplBorderColor,
      textColor: tplTextColor
    };
    const endpoint = templateType === 'obits' ? '/admin/obituaries/templates' : '/admin/wishes/templates';
    try {
      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSuccessMsg('Frame template created successfully.');
      setTplName('');
      setTplBackgroundUrl('');
      setTplOverlayUrl('');
      setTplBorderColor('');
      setTplTextColor('');
      setShowTplForm(false);
      loadData();
    } catch (e) {
      setErrorMsg('Failed to create frame template.');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    const endpoint = templateType === 'obits' ? `/admin/obituaries/templates/${id}` : `/admin/wishes/templates/${id}`;
    try {
      await fetchApi(endpoint, { method: 'DELETE' });
      setSuccessMsg('Frame template deleted.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete frame template.');
    }
  };

  // Guestbook / Comments Moderation Handlers
  const handleDeleteComment = async (id) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    const endpoint = commentsType === 'obits' ? `/admin/obituaries/guestbook/${id}` : `/admin/wishes/comments/${id}`;
    try {
      await fetchApi(endpoint, { method: 'DELETE' });
      setSuccessMsg('Comment deleted successfully.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete comment.');
    }
  };

  // Filters mapping
  const filteredObits = obits.filter(o => {
    if (obitFilter === 'all') return true;
    return o.status === obitFilter;
  });

  const filteredWishes = wishes.filter(w => {
    if (wishFilter === 'all') return true;
    return w.status === wishFilter;
  });

  return (
    <div className="admin-obits-container">
      <div className="posts-header">
        <h1>Obituaries & Wishes Moderator</h1>
        <p className="subtitle">Moderate user memorials, approve birthday cards, configure visual frames, and inspect guestbook feedback</p>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      {/* Main Category Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #cbd5e1', margin: '1.5rem 0', paddingBottom: '0.5rem' }}>
        <button className={`tab-btn ${subTab === 'obits' ? 'active' : ''}`} onClick={() => setSubTab('obits')}>
          <i className="fa-solid fa-square-person-confined"></i> Obituaries Queue
        </button>
        <button className={`tab-btn ${subTab === 'wishes' ? 'active' : ''}`} onClick={() => setSubTab('wishes')}>
          <i className="fa-solid fa-cake-candles"></i> Wishes Greetings Queue
        </button>
        <button className={`tab-btn ${subTab === 'templates' ? 'active' : ''}`} onClick={() => setSubTab('templates')}>
          <i className="fa-solid fa-crop-simple"></i> Frame Templates
        </button>
        <button className={`tab-btn ${subTab === 'comments' ? 'active' : ''}`} onClick={() => setSubTab('comments')}>
          <i className="fa-solid fa-comments"></i> Comments Moderation
        </button>
      </div>

      {/* 1. OBITUARIES QUEUE */}
      {subTab === 'obits' && (
        <div className="queue-split-grid" style={{ display: 'grid', gridTemplateColumns: selectedObit ? '3fr 2fr' : '1fr', gap: '20px' }}>
          <div className="queue-list-col">
            <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Filter Queue:</span>
              {['all', 'pending', 'published'].map(st => (
                <button
                  key={st}
                  className={`status-pill-btn ${obitFilter === st ? 'active' : ''}`}
                  onClick={() => setObitFilter(st)}
                  style={{
                    background: obitFilter === st ? '#B3732A' : '#f1f5f9',
                    color: obitFilter === st ? 'white' : '#475569',
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
              <div className="loading-state">Loading obituaries...</div>
            ) : (
              <div className="table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Deceased Name</th>
                      <th>Passing Details</th>
                      <th>Native City</th>
                      <th>Fulfillment</th>
                      <th>Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredObits.length === 0 ? (
                      <tr><td colSpan="5" className="empty-table">No obituaries found.</td></tr>
                    ) : (
                      filteredObits.map(o => (
                        <tr key={o.id} onClick={() => { setSelectedObit(o); setUnmaskedContact(null); }} style={{ cursor: 'pointer' }} className={selectedObit?.id === o.id ? 'selected' : ''}>
                          <td>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {o.photo && <img src={o.photo} alt="Photo" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                              <div>
                                <strong>{o.deceasedName}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age: {o.age}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>Passed: {o.dateOfPassing}</div>
                          </td>
                          <td>{o.location || 'Tamil Nadu'}</td>
                          <td>
                            <span className={`status-badge ${o.status === 'published' ? 'approved' : 'pending'}`}>
                              {o.status === 'published' ? 'PUBLISHED' : o.status}
                            </span>
                          </td>
                          <td><button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>Inspect</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedObit && (
            <div className="queue-detail-col">
              <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Inspect Obituary</h3>
                  <button className="close-btn" onClick={() => setSelectedObit(null)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div className="detail-body">
                  {selectedObit.photo && (
                    <img src={selectedCardPhoto(selectedObit)} alt="Deceased" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto 1rem auto', display: 'block' }} />
                  )}
                  <h4 style={{ textAlign: 'center', margin: '0 0 4px 0' }}>{selectedObit.deceasedName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>Age: {selectedObit.age} • Native: {selectedObit.location}</div>

                  <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#475569' }}>Family Statement</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>{selectedObit.biography || 'No statement details.'}</p>
                  </div>

                  <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#475569' }}>Funeral Arrangements</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>Venue: {selectedObit.funeralVenue || 'N/A'}</p>
                    {selectedObit.funeralDatetime && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Time: {new Date(selectedObit.funeralDatetime).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Masked Contact Details panel */}
                  <div className="detail-section" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 6px 0', color: '#334155' }}><i className="fa-solid fa-lock"></i> Demise Submitter Contact</h5>
                    {unmaskedContact ? (
                      <div>
                        <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}><strong>Submitter:</strong> {unmaskedContact.familyContactName}</div>
                        <div style={{ fontSize: '0.85rem' }}><strong>Phone:</strong> {unmaskedContact.familyPhone}</div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleRevealContact(selectedObit.id)}
                        disabled={unmasking}
                        style={{ width: '100%', padding: '6px', fontSize: '0.8rem', background: '#e2e8f0' }}
                      >
                        {unmasking ? 'Logging Audit...' : 'Reveal Contact Details (Audited Event)'}
                      </button>
                    )}
                  </div>

                  <div className="detail-actions" style={{ display: 'flex', gap: '8px' }}>
                    {selectedObit.status !== 'published' && (
                      <button className="btn btn-approve" onClick={() => handleApproveObit(selectedObit.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        Approve & Publish
                      </button>
                    )}
                    <button className="btn btn-delete" onClick={() => handleDeleteObit(selectedObit.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Delete Memorial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. WISHES QUEUE */}
      {subTab === 'wishes' && (
        <div className="queue-split-grid" style={{ display: 'grid', gridTemplateColumns: selectedWish ? '3fr 2fr' : '1fr', gap: '20px' }}>
          <div className="queue-list-col">
            <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#475569' }}>Filter Queue:</span>
              {['all', 'pending', 'published'].map(st => (
                <button
                  key={st}
                  className={`status-pill-btn ${wishFilter === st ? 'active' : ''}`}
                  onClick={() => setWishFilter(st)}
                  style={{
                    background: wishFilter === st ? '#B3732A' : '#f1f5f9',
                    color: wishFilter === st ? 'white' : '#475569',
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
              <div className="loading-state">Loading wishes...</div>
            ) : (
              <div className="table-wrapper">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Recipient Name</th>
                      <th>Greeting Type</th>
                      <th>Message</th>
                      <th>Sender</th>
                      <th>Fulfillment</th>
                      <th>Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWishes.length === 0 ? (
                      <tr><td colSpan="6" className="empty-table">No wishes greetings found.</td></tr>
                    ) : (
                      filteredWishes.map(w => (
                        <tr key={w.id} onClick={() => setSelectedWish(w)} style={{ cursor: 'pointer' }} className={selectedWish?.id === w.id ? 'selected' : ''}>
                          <td>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              {w.recipientPhoto && <img src={w.recipientPhoto} alt="Photo" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                              <strong>{w.recipientName}</strong>
                            </div>
                          </td>
                          <td><span className="category-tag">{w.wishType}</span></td>
                          <td><p style={{ margin: 0, fontSize: '0.8rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.message}</p></td>
                          <td>{w.senderName || 'Anonymous'}</td>
                          <td>
                            <span className={`status-badge ${w.status === 'published' ? 'approved' : 'pending'}`}>
                              {w.status === 'published' ? 'PUBLISHED' : w.status}
                            </span>
                          </td>
                          <td><button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.75rem' }}>Inspect</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedWish && (
            <div className="queue-detail-col">
              <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>Inspect Greeting</h3>
                  <button className="close-btn" onClick={() => setSelectedWish(null)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div className="detail-body">
                  {selectedWish.recipientPhoto && (
                    <img src={selectedWish.recipientPhoto} alt="Recipient" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', margin: '0 auto 1rem auto', display: 'block' }} />
                  )}
                  <h4 style={{ textAlign: 'center', margin: '0 0 4px 0' }}>{selectedWish.recipientName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>Event Category: {selectedWish.wishType}</div>

                  <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#475569' }}>Greeting Message</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>"{selectedWish.message}"</p>
                  </div>

                  <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                    <div className="detail-item">
                      <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Submitted By</span>
                      <strong className="value" style={{ fontSize: '0.85rem' }}>{selectedWish.senderName || 'Anonymous'}</strong>
                    </div>
                    <div className="detail-item">
                      <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Relationship</span>
                      <strong className="value" style={{ fontSize: '0.85rem' }}>{selectedWish.relationship || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="detail-actions" style={{ display: 'flex', gap: '8px' }}>
                    {selectedWish.status !== 'published' && (
                      <button className="btn btn-approve" onClick={() => handleApproveWish(selectedWish.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        Approve & Publish
                      </button>
                    )}
                    <button className="btn btn-delete" onClick={() => handleDeleteWish(selectedWish.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Delete Greeting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FRAME TEMPLATES MANAGER */}
      {subTab === 'templates' && (
        <div className="templates-tab-layout">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`tab-btn ${templateType === 'obits' ? 'active' : ''}`} onClick={() => setTemplateType('obits')}>Obituary Frames</button>
              <button className={`tab-btn ${templateType === 'wishes' ? 'active' : ''}`} onClick={() => setTemplateType('wishes')}>Wish Frames</button>
            </div>
            <button className="btn btn-primary" onClick={() => setShowTplForm(!showTplForm)}>
              {showTplForm ? 'Close Form' : '+ Add Frame Template'}
            </button>
          </div>

          {showTplForm && (
            <form onSubmit={handleCreateTemplate} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <h3>Create {templateType === 'obits' ? 'Obituary' : 'Wish'} Frame Template</h3>
              <div className="form-row">
                <div className="form-group half">
                  <label>Template Name *</label>
                  <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Background URL</label>
                  <input type="text" value={tplBackgroundUrl} onChange={(e) => setTplBackgroundUrl(e.target.value)} placeholder="https://example.com/bg.png" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Overlay Image URL</label>
                  <input type="text" value={tplOverlayUrl} onChange={(e) => setTplOverlayUrl(e.target.value)} placeholder="https://example.com/overlay.png" />
                </div>
                <div className="form-group half" style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Border Hex Color</label>
                    <input type="text" value={tplBorderColor} onChange={(e) => setTplBorderColor(e.target.value)} placeholder="#000000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Text Hex Color</label>
                    <input type="text" value={tplTextColor} onChange={(e) => setTplTextColor(e.target.value)} placeholder="#FFFFFF" />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Save Frame Template</button>
            </form>
          )}

          <div className="templates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {templateType === 'obits' ? (
              obitTemplates.length === 0 ? <p>No obituary frame templates registered.</p> :
              obitTemplates.map(t => (
                <div key={t.id} className="template-card" style={{ background: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ height: '140px', background: t.backgroundUrl ? `url(${t.backgroundUrl}) center/cover` : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', marginBottom: '8px', border: `3px solid ${t.borderColor || '#ccc'}` }}>
                    {t.overlayUrl && <img src={t.overlayUrl} alt="Overlay" style={{ width: '40px', opacity: 0.8 }} />}
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: t.textColor || '#1e293b' }}>{t.name}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Slug: {t.slug}</span>
                    <button className="delete-rev-btn" onClick={() => handleDeleteTemplate(t.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}><i className="fa-solid fa-trash"></i> Delete</button>
                  </div>
                </div>
              ))
            ) : (
              wishTemplates.length === 0 ? <p>No wish frame templates registered.</p> :
              wishTemplates.map(t => (
                <div key={t.id} className="template-card" style={{ background: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ height: '140px', background: t.backgroundUrl ? `url(${t.backgroundUrl}) center/cover` : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', marginBottom: '8px', border: `3px solid ${t.borderColor || '#ccc'}` }}>
                    {t.overlayUrl && <img src={t.overlayUrl} alt="Overlay" style={{ width: '40px', opacity: 0.8 }} />}
                  </div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: t.textColor || '#1e293b' }}>{t.name}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Slug: {t.slug}</span>
                    <button className="delete-rev-btn" onClick={() => handleDeleteTemplate(t.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}><i className="fa-solid fa-trash"></i> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. COMMENTS MODERATION TAB */}
      {subTab === 'comments' && (
        <div className="comments-moderation-layout">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button className={`tab-btn ${commentsType === 'obits' ? 'active' : ''}`} onClick={() => setCommentsType('obits')}>Obituary Guestbooks</button>
            <button className={`tab-btn ${commentsType === 'wishes' ? 'active' : ''}`} onClick={() => setCommentsType('wishes')}>Wishes Comments</button>
          </div>

          <div className="table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Post Source Info</th>
                  <th>Commenter Name</th>
                  <th>Comment Text</th>
                  <th>Date Posted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {commentsType === 'obits' ? (
                  obitGuestbook.length === 0 ? <tr><td colSpan="5" className="empty-table">No guestbook comments cataloged.</td></tr> :
                  obitGuestbook.map(c => (
                    <tr key={c.id}>
                      <td><strong>Obituary ID: {c.obituaryId}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {c.avatarUrl && <img src={c.avatarUrl} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                          <strong>{c.name}</strong>
                        </div>
                      </td>
                      <td><p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>"{c.message}"</p></td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteComment(c.id)}><i className="fa-solid fa-trash-can"></i> Moderate / Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  wishComments.length === 0 ? <tr><td colSpan="5" className="empty-table">No wishes comments cataloged.</td></tr> :
                  wishComments.map(c => (
                    <tr key={c.id}>
                      <td><strong>Wish Card ID: {c.wish?.id || 'N/A'}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {c.commenterPhoto && <img src={c.commenterPhoto} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                          <strong>{c.commenterName}</strong>
                        </div>
                      </td>
                      <td><p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>"{c.comment}"</p></td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteComment(c.id)}><i className="fa-solid fa-trash-can"></i> Moderate / Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const selectedCardPhoto = (item) => {
  return item.photo || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150';
};

export default AdminObituariesWishes;
