import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminObituariesWishes.css';

const AdminObituariesWishes = () => {
  const [subTab, setSubTab] = useState('obits'); // obits / wishes / condolences
  const [obits, setObits] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [condolences, setCondolences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form edit states
  const [showObitForm, setShowObitForm] = useState(false);
  const [editingObitId, setEditingObitId] = useState(null);
  const [obitName, setObitName] = useState('');
  const [obitPhoto, setObitPhoto] = useState('');
  const [obitBirth, setObitBirth] = useState('');
  const [obitDeath, setObitDeath] = useState('');
  const [obitAge, setObitAge] = useState('');
  const [obitLocation, setObitLocation] = useState('');
  const [obitMessage, setObitMessage] = useState('');
  const [obitFuneral, setObitFuneral] = useState('');
  const [obitStatus, setObitStatus] = useState('pending');
  const [obitSubmitter, setObitSubmitter] = useState('');
  const [obitContact, setObitContact] = useState('');

  const [showWishForm, setShowWishForm] = useState(false);
  const [editingWishId, setEditingWishId] = useState(null);
  const [wishName, setWishName] = useState('');
  const [wishType, setWishType] = useState('birthday');
  const [wishMessage, setWishMessage] = useState('');
  const [wishPhoto, setWishPhoto] = useState('');
  const [wishStatus, setWishStatus] = useState('pending');
  const [wishSubmitter, setWishSubmitter] = useState('');
  const [wishContact, setWishContact] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (subTab === 'obits') {
        const data = await fetchApi('/admin/obituaries');
        if (Array.isArray(data)) setObits(data);
      } else if (subTab === 'wishes') {
        const data = await fetchApi('/admin/wishes');
        if (Array.isArray(data)) setWishes(data);
      } else {
        const data = await fetchApi('/public/obituaries/condolences/all');
        if (Array.isArray(data)) setCondolences(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subTab]);

  // Obit handlers
  const handleApproveObit = async (id) => {
    try {
      await fetchApi(`/admin/obituaries/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Obituary approved and published.');
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
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete obituary.');
    }
  };

  const handleEditObit = (obit) => {
    setEditingObitId(obit.id);
    setObitName(obit.deceasedName || '');
    setObitPhoto(obit.photo || '');
    setObitBirth(obit.dateOfBirth || '');
    setObitDeath(obit.dateOfPassing || '');
    setObitAge(obit.age || '');
    setObitLocation(obit.location || '');
    setObitMessage(obit.biography || '');
    setObitFuneral(obit.funeralVenue || '');
    setObitStatus(obit.status || 'pending');
    setObitSubmitter(obit.familyContactName || '');
    setObitContact(obit.familyPhone || '');
    setShowObitForm(true);
  };

  const resetObitForm = () => {
    setEditingObitId(null);
    setObitName('');
    setObitPhoto('');
    setObitBirth('');
    setObitDeath('');
    setObitAge('');
    setObitLocation('');
    setObitMessage('');
    setObitFuneral('');
    setObitStatus('pending');
    setObitSubmitter('');
    setObitContact('');
    setShowObitForm(false);
  };

  const handleObitSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      deceasedName: obitName,
      photo: obitPhoto,
      dateOfBirth: obitBirth || null,
      dateOfPassing: obitDeath || null,
      age: parseInt(obitAge) || 70,
      location: obitLocation,
      biography: obitMessage,
      familyMessage: obitMessage,
      funeralVenue: obitFuneral,
      status: obitStatus,
      familyContactName: obitSubmitter,
      familyPhone: obitContact
    };

    try {
      if (editingObitId) {
        await fetchApi(`/admin/obituaries/${editingObitId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Obituary updated successfully.');
      } else {
        await fetchApi('/admin/obituaries', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Obituary created successfully.');
      }
      resetObitForm();
      loadData();
    } catch (err) {
      setErrorMsg('Failed to save obituary.');
    }
  };

  // Wish handlers
  const handleApproveWish = async (id) => {
    try {
      await fetchApi(`/admin/wishes/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Wish greeting approved.');
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
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete wish.');
    }
  };

  const handleEditWish = (w) => {
    setEditingWishId(w.id);
    setWishName(w.recipientName || '');
    setWishType(w.wishType || 'birthday');
    setWishMessage(w.message || '');
    setWishPhoto(w.recipientPhoto || '');
    setWishStatus(w.status || 'pending');
    setWishSubmitter(w.senderName || '');
    setWishContact(w.senderProfile || '');
    setShowWishForm(true);
  };

  const resetWishForm = () => {
    setEditingWishId(null);
    setWishName('');
    setWishType('birthday');
    setWishMessage('');
    setWishPhoto('');
    setWishStatus('pending');
    setWishSubmitter('');
    setWishContact('');
    setShowWishForm(false);
  };

  const handleWishSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      recipientName: wishName,
      recipientPhoto: wishPhoto,
      image: wishPhoto,
      wishType: wishType,
      message: wishMessage,
      status: wishStatus,
      senderName: wishSubmitter,
      senderProfile: wishContact
    };

    try {
      if (editingWishId) {
        await fetchApi(`/admin/wishes/${editingWishId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Wish updated successfully.');
      } else {
        await fetchApi('/admin/wishes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Wish created successfully.');
      }
      resetWishForm();
      loadData();
    } catch (err) {
      setErrorMsg('Failed to save wish.');
    }
  };

  // Condolence handlers
  const handleApproveCondolence = async (id) => {
    try {
      await fetchApi(`/public/obituaries/condolences/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Condolence approved.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to approve condolence.');
    }
  };

  const handleDeleteCondolence = async (id) => {
    if (!window.confirm("Delete this condolence message?")) return;
    try {
      await fetchApi(`/public/obituaries/condolences/${id}`, { method: 'DELETE' });
      setSuccessMsg('Condolence deleted.');
      loadData();
    } catch (e) {
      setErrorMsg('Failed to delete condolence.');
    }
  };

  return (
    <div className="admin-obits-container">
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Obituaries & Wishes Greetings</h1>
          <p className="subtitle">Moderate user demises registry notifications, greeting cards, and condolence messages</p>
        </div>
        <div>
          {subTab === 'obits' && (
            <button className="btn btn-primary" onClick={() => { if (showObitForm) resetObitForm(); else setShowObitForm(true); }}>
              {showObitForm ? 'Close Form' : '+ Add Obituary'}
            </button>
          )}
          {subTab === 'wishes' && (
            <button className="btn btn-primary" onClick={() => { if (showWishForm) resetWishForm(); else setShowWishForm(true); }}>
              {showWishForm ? 'Close Form' : '+ Add Wish Greeting'}
            </button>
          )}
        </div>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {/* Sub tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #cbd5e1', margin: '1.5rem 0', paddingBottom: '0.5rem' }}>
        <button className={`tab-btn ${subTab === 'obits' ? 'active' : ''}`} onClick={() => setSubTab('obits')}>Obituaries</button>
        <button className={`tab-btn ${subTab === 'wishes' ? 'active' : ''}`} onClick={() => setSubTab('wishes')}>Wishes & Greetings</button>
        <button className={`tab-btn ${subTab === 'condolences' ? 'active' : ''}`} onClick={() => setSubTab('condolences')}>Condolences Moderation</button>
      </div>

      {/* Obit Form */}
      {showObitForm && (
        <form onSubmit={handleObitSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3>{editingObitId ? 'Edit Obituary Registry' : 'Create Obituary'}</h3>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Deceased Full Name *</label>
              <input type="text" value={obitName} onChange={(e) => setObitName(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Deceased Age</label>
              <input type="number" value={obitAge} onChange={(e) => setObitAge(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Deceased Photo URL</label>
              <input type="text" value={obitPhoto} onChange={(e) => setObitPhoto(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Location / City</label>
              <input type="text" value={obitLocation} onChange={(e) => setObitLocation(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Date of Birth</label>
              <input type="date" value={obitBirth} onChange={(e) => setObitBirth(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Date of Demise</label>
              <input type="date" value={obitDeath} onChange={(e) => setObitDeath(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Funeral Venue / Details</label>
              <input type="text" value={obitFuneral} onChange={(e) => setObitFuneral(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Status</label>
              <select value={obitStatus} onChange={(e) => setObitStatus(e.target.value)}>
                <option value="pending">Pending Moderation</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Submitted By Name</label>
              <input type="text" value={obitSubmitter} onChange={(e) => setObitSubmitter(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Submitted By Contact Info</label>
              <input type="text" value={obitContact} onChange={(e) => setObitContact(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Family Message / Biography</label>
            <textarea value={obitMessage} onChange={(e) => setObitMessage(e.target.value)} rows="3"></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{editingObitId ? 'Update Obituary' : 'Create Obituary'}</button>
        </form>
      )}

      {/* Wish Form */}
      {showWishForm && (
        <form onSubmit={handleWishSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3>{editingWishId ? 'Edit Wish Greeting' : 'Create Wish Greeting'}</h3>
          
          <div className="form-row">
            <div className="form-group half">
              <label>Recipient Name *</label>
              <input type="text" value={wishName} onChange={(e) => setWishName(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Greeting Type</label>
              <select value={wishType} onChange={(e) => setWishType(e.target.value)}>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="festival">Festival</option>
                <option value="congratulations">Congratulations</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Recipient Photo URL</label>
              <input type="text" value={wishPhoto} onChange={(e) => setWishPhoto(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Status</label>
              <select value={wishStatus} onChange={(e) => setWishStatus(e.target.value)}>
                <option value="pending">Pending Moderation</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Submitted By Name</label>
              <input type="text" value={wishSubmitter} onChange={(e) => setWishSubmitter(e.target.value)} />
            </div>
            <div className="form-group half">
              <label>Submitted By Contact Info</label>
              <input type="text" value={wishContact} onChange={(e) => setWishContact(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Greeting Message</label>
            <textarea value={wishMessage} onChange={(e) => setWishMessage(e.target.value)} rows="3"></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{editingWishId ? 'Update Wish' : 'Create Wish'}</button>
        </form>
      )}

      {/* Lists */}
      {loading ? (
        <div className="loading-state">Syncing directories...</div>
      ) : subTab === 'obits' ? (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Deceased Name</th>
                <th>Birth / passing</th>
                <th>Details</th>
                <th>Location</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {obits.length === 0 ? (
                <tr><td colSpan="6" className="empty-table">No obituaries registered.</td></tr>
              ) : (
                obits.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={o.photo || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=60'} alt={o.deceasedName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <strong>{o.deceasedName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age: {o.age}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>DOB: {o.dateOfBirth || 'N/A'}</div>
                      <div style={{ color: '#ef4444' }}>Demise: {o.dateOfPassing || 'N/A'}</div>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>{o.biography || 'No Biography'}</p>
                    </td>
                    <td>{o.location || 'Tamil Nadu'}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: o.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: o.status === 'published' ? '#166534' : '#854d0e'
                      }}>{o.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {o.status === 'pending' && (
                          <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApproveObit(o.id)}>Approve</button>
                        )}
                        <button className="action-btn edit-btn" onClick={() => handleEditObit(o)}>Edit</button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteObit(o.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : subTab === 'wishes' ? (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Recipient Name</th>
                <th>Greeting type</th>
                <th>Message</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {wishes.length === 0 ? (
                <tr><td colSpan="6" className="empty-table">No wishes registered.</td></tr>
              ) : (
                wishes.map(w => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={w.recipientPhoto || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=60'} alt={w.recipientName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <strong>{w.recipientName}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', textTransform: 'capitalize' }}>{w.wishType}</span>
                    </td>
                    <td><p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>{w.message}</p></td>
                    <td>
                      <strong>{w.senderName || 'Anonymous'}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{w.senderProfile || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: w.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: w.status === 'published' ? '#166534' : '#854d0e'
                      }}>{w.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {w.status === 'pending' && (
                          <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApproveWish(w.id)}>Approve</button>
                        )}
                        <button className="action-btn edit-btn" onClick={() => handleEditWish(w)}>Edit</button>
                        <button className="action-btn delete-btn" onClick={() => handleDeleteWish(w.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Obituary ID</th>
                <th>Visitor Name</th>
                <th>Condolence Message</th>
                <th>Status</th>
                <th>Date Posted</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {condolences.length === 0 ? (
                <tr><td colSpan="6" className="empty-table">No condolences messages to moderate.</td></tr>
              ) : (
                condolences.map(c => (
                  <tr key={c.id}>
                    <td><code>OBIT-{c.obituaryId}</code></td>
                    <td><strong>{c.name}</strong></td>
                    <td><p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>{c.message}</p></td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: c.status === 'published' ? '#dcfce7' : '#fef3c7',
                        color: c.status === 'published' ? '#166534' : '#854d0e'
                      }}>{c.status}</span>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {c.status === 'pending' && (
                          <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApproveCondolence(c.id)}>Approve</button>
                        )}
                        <button className="action-btn delete-btn" onClick={() => handleDeleteCondolence(c.id)}>Delete</button>
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

export default AdminObituariesWishes;
