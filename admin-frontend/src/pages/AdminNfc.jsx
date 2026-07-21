import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminNfc.css';

const AdminNfc = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Analytics sub-view state
  const [selectedCardForAnalytics, setSelectedCardForAnalytics] = useState(null);
  const [analyticsLogs, setAnalyticsLogs] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Form Fields
  const [cardUid, setCardUid] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [cardTemplate, setCardTemplate] = useState('classic');
  const [vcardEnabled, setVcardEnabled] = useState(true);
  const [status, setStatus] = useState('active');

  // Social Links
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const loadCards = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/nfc');
      if (Array.isArray(data)) setCards(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this card? Access will be immediately blocked.")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/nfc/${id}/revoke`, { method: 'PUT' });
      setSuccessMsg('NFC card revoked / blocked.');
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
      loadCards();
    } catch (e) {
      setErrorMsg('Failed to delete NFC card.');
    }
  };

  const handleViewAnalytics = async (card) => {
    setSelectedCardForAnalytics(card);
    setLoadingAnalytics(true);
    try {
      const data = await fetchApi(`/admin/nfc/${card.id}/analytics`);
      if (Array.isArray(data)) {
        setAnalyticsLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleEdit = (card) => {
    setEditingId(card.id);
    setCardUid(card.cardUid || card.shortCode || '');
    setOwnerName(card.ownerName || '');
    setTitle(card.title || '');
    setCompany(card.company || '');
    setPhone(card.phone || '');
    setEmail(card.email || '');
    setWebsite(card.website || '');
    setProfilePhoto(card.profilePhoto || '');
    setCardTemplate(card.cardTemplate || 'classic');
    setVcardEnabled(card.vcardEnabled !== false);
    setStatus(card.status || 'active');

    // Parse social links if present
    try {
      const socials = JSON.parse(card.socialLinks || '{}');
      setFacebook(socials.facebook || '');
      setTwitter(socials.twitter || '');
      setLinkedin(socials.linkedin || '');
    } catch (e) {
      setFacebook('');
      setTwitter('');
      setLinkedin('');
    }

    setShowForm(true);
    setSelectedCardForAnalytics(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setCardUid('');
    setOwnerName('');
    setTitle('');
    setCompany('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setProfilePhoto('');
    setCardTemplate('classic');
    setVcardEnabled(true);
    setStatus('active');
    setFacebook('');
    setTwitter('');
    setLinkedin('');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const socialObj = { facebook, twitter, linkedin };

    const payload = {
      cardUid,
      shortCode: cardUid,
      ownerName,
      title,
      company,
      phone,
      email,
      website,
      socialLinks: JSON.stringify(socialObj),
      profilePhoto,
      cardTemplate,
      vcardEnabled,
      status,
      linkType: 'profile'
    };

    try {
      if (editingId) {
        await fetchApi(`/admin/nfc/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('NFC card updated successfully.');
      } else {
        await fetchApi('/admin/nfc', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('NFC card registered successfully.');
      }
      resetForm();
      loadCards();
    } catch (err) {
      setErrorMsg('Failed to save NFC card.');
    }
  };

  return (
    <div className="admin-nfc-container">
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>NFC Digital Business Cards</h1>
          <p className="subtitle">Issue and encode hardware NFC tags, design profile pages, and track metrics telemetry</p>
        </div>
        <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); setSelectedCardForAnalytics(null); }}>
          {showForm ? 'Close Form' : '+ Issue NFC Card'}
        </button>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3>{editingId ? 'Edit NFC Card Profile' : 'Register NFC Card'}</h3>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Card UID / Serial Number *</label>
              <input type="text" value={cardUid} onChange={(e) => setCardUid(e.target.value)} placeholder="e.g. nfc-tag-102938" required />
            </div>
            <div className="form-group half">
              <label>Owner Full Name *</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Job Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sales Director" />
            </div>
            <div className="form-group half">
              <label>Company / Organization</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Kings TV Network" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Contact Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Contact Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Website URL</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="form-group half">
              <label>Profile Image URL</label>
              <input type="text" value={profilePhoto} onChange={(e) => setProfilePhoto(e.target.value)} />
            </div>
          </div>

          <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#1e293b' }}>Social Profiles Mappings</h4>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Facebook</label>
              <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="URL" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Twitter</label>
              <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="URL" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>LinkedIn</label>
              <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="URL" />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group half">
              <label>Card Visual Template</label>
              <select value={cardTemplate} onChange={(e) => setCardTemplate(e.target.value)}>
                <option value="classic">Sleek Dark (Classic)</option>
                <option value="modern">Vibrant Gold (Modern)</option>
                <option value="minimalist">Clean White (Minimalist)</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Card Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="revoked">Revoked (Blocked)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" checked={vcardEnabled} onChange={(e) => setVcardEnabled(e.target.checked)} id="vcardchk" />
            <label htmlFor="vcardchk" style={{ margin: 0 }}>Enable "Save Contact" vCard download action</label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{editingId ? 'Update NFC Profile' : 'Issue NFC Card'}</button>
        </form>
      )}

      {selectedCardForAnalytics && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Tap Analytics History for: {selectedCardForAnalytics.ownerName} ({selectedCardForAnalytics.cardUid || selectedCardForAnalytics.shortCode})</h3>
            <button className="action-btn delete-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedCardForAnalytics(null)}>Close Analytics</button>
          </div>
          {loadingAnalytics ? (
            <p>Fetching tap metrics...</p>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table" style={{ background: 'white' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Tapped Reader</th>
                    <th>Approx Location City</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-table" style={{ padding: '20px' }}>No tap history recorded for this tag.</td>
                    </tr>
                  ) : (
                    analyticsLogs.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.tappedAt).toLocaleString()}</td>
                        <td>{log.customerName}</td>
                        <td><i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i> {log.locationCity || 'Chennai'}</td>
                        <td><span style={{ color: '#16a34a', fontWeight: '700' }}>{log.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Hardware Print instructions cards info */}
      <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
        <h4><i className="fa-solid fa-circle-info"></i> NFC Hardware Encoding instructions</h4>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#1e3a8a', lineHeight: '1.5' }}>
          To link a physical NFC card or tag to this system, program the tag with the URL matching the pattern:
          <br/>
          <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', margin: '4px 0', fontWeight: '700' }}>
            https://kings-tv.vercel.app/card/{"{card_uid}"}
          </code>
          <br/>
          When scanned, this URL will redirect the guest to their customized mobile-first business contact card page.
        </p>
      </div>

      {loading ? (
        <div className="loading-state">Syncing issued tag registers...</div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Company</th>
                <th>Card UID</th>
                <th>Total Taps</th>
                <th>Status</th>
                <th>Encoding URL Target</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {cards.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">No NFC business cards registered.</td>
                </tr>
              ) : (
                cards.map(card => (
                  <tr key={card.id}>
                    <td>
                      <strong>{card.ownerName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.title || 'No Title'}</div>
                    </td>
                    <td>{card.company || 'Standalone'}</td>
                    <td><code>{card.cardUid || card.shortCode}</code></td>
                    <td>
                      <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: '700' }}>
                        {card.tapCount || 0} scans
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: card.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: card.status === 'active' ? '#166534' : '#991b1b'
                      }}>
                        {card.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>https://kings-tv.vercel.app/card/{card.cardUid || card.shortCode}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="action-btn edit-btn" style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1' }} onClick={() => handleViewAnalytics(card)}>Analytics</button>
                        <button className="action-btn edit-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleEdit(card)}>Edit</button>
                        {card.status === 'active' && (
                          <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#dc2626' }} onClick={() => handleRevoke(card.id)}>Revoke</button>
                        )}
                        <button className="action-btn delete-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleDelete(card.id)}>Delete</button>
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
  );
};

export default AdminNfc;
