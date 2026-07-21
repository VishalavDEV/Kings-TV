import React, { useState, useEffect, useContext } from 'react';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicObituaries.css';

const PublicObituaries = () => {
  const { lang } = useContext(LanguageContext);
  const [obits, setObits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Demise detail popup state
  const [selectedObit, setSelectedObit] = useState(null);
  const [condolences, setCondolences] = useState([]);
  const [loadingCondolences, setLoadingCondolences] = useState(false);
  const [condolenceName, setCondolenceName] = useState('');
  const [condolenceMessage, setCondolenceMessage] = useState('');
  const [condolenceSuccess, setCondolenceSuccess] = useState('');

  // Submit-Obituary Form State
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [deceasedName, setDeceasedName] = useState('');
  const [photo, setPhoto] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfPassing, setDateOfPassing] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [biography, setBiography] = useState('');
  const [funeralVenue, setFuneralVenue] = useState('');
  const [familyContactName, setFamilyContactName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadObits = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/public/obituaries');
      if (Array.isArray(data)) {
        setObits(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObits();
  }, []);

  const handleSelectObit = async (obit) => {
    setSelectedObit(obit);
    setLoadingCondolences(true);
    setCondolenceSuccess('');
    try {
      const data = await fetchApi(`/public/obituaries/${obit.id}/condolences`);
      if (Array.isArray(data)) {
        setCondolences(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCondolences(false);
    }
  };

  const handleCondolenceSubmit = async (e) => {
    e.preventDefault();
    setCondolenceSuccess('');
    const payload = {
      name: condolenceName,
      message: condolenceMessage
    };
    try {
      await fetchApi(`/public/obituaries/${selectedObit.id}/condolences`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setCondolenceSuccess(lang === 'en' ? 'Condolence message submitted and is pending moderation.' : 'இரங்கல் செய்தி சமர்ப்பிக்கப்பட்டது. தணிக்கைக்குப் பின் வெளியிடப்படும்.');
      setCondolenceName('');
      setCondolenceMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitObit = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    const payload = {
      deceasedName,
      photo,
      dateOfBirth,
      dateOfPassing,
      age: parseInt(age) || 75,
      location,
      biography,
      familyMessage: biography,
      funeralVenue,
      familyContactName,
      familyPhone
    };
    try {
      await fetchApi('/public/obituaries', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSubmitSuccess(lang === 'en' ? 'Obituary submitted successfully! It will go live after admin approval.' : 'இரங்கல் செய்தி பதிவு செய்யப்பட்டது! தணிக்கைக்குப் பின் இணையத்தில் வெளியிடப்படும்.');
      setDeceasedName('');
      setPhoto('');
      setDateOfBirth('');
      setDateOfPassing('');
      setAge('');
      setLocation('');
      setBiography('');
      setFuneralVenue('');
      setFamilyContactName('');
      setFamilyPhone('');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredObits = obits.filter(o => 
    o.deceasedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.location && o.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="public-obits-container">
      {/* Banner */}
      <div className="obits-hero-banner">
        <h1>{lang === 'en' ? 'Obituaries & Demises' : 'மரண அறிவிப்புகள்'}</h1>
        <p>{lang === 'en' ? 'Pay tribute and leave condolences for departed souls in our community.' : 'நம் சமூகத்தில் மறைந்த ஆன்மாக்களுக்கு அஞ்சலி மற்றும் இரங்கல்களைச் செலுத்துங்கள்.'}</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="submit-obit-btn" onClick={() => { setShowSubmitForm(!showSubmitForm); setSelectedObit(null); }}>
            {showSubmitForm ? (lang === 'en' ? 'Close Submission Form' : 'படிவத்தை மூடு') : (lang === 'en' ? 'Post Obituary Demise' : 'மரண அறிவிப்பைப் பதிவிடு')}
          </button>
        </div>
      </div>

      {showSubmitForm && (
        <div className="rfq-form-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '2rem 0' }}>
          <h2>{lang === 'en' ? 'Submit Obituary Demise Notification' : 'மரண அறிவிப்பைப் பதிவிடவும்'}</h2>
          {submitSuccess && <div className="alert-banner success">{submitSuccess}</div>}
          <form onSubmit={handleSubmitObit} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>{lang === 'en' ? 'Deceased Name *' : 'மறைந்தவர் பெயர் *'}</label>
              <input type="text" value={deceasedName} onChange={(e) => setDeceasedName(e.target.value)} required />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Age' : 'வயது'}</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Location / District *' : 'மாவட்டம் / இடம் *'}</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Date of Birth' : 'பிறந்த தேதி'}</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Date of Demise *' : 'மறைந்த தேதி *'}</label>
                <input type="date" value={dateOfPassing} onChange={(e) => setDateOfPassing(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Photo URL' : 'புகைப்பட லிங்க்'}</label>
              <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://example.com/photo.jpg" />
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Funeral Venue / Details' : 'இறுதிச் சடங்கு விவரங்கள்'}</label>
              <input type="text" value={funeralVenue} onChange={(e) => setFuneralVenue(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Name (Submitter) *' : 'விண்ணப்பிப்பவர் பெயர் *'}</label>
                <input type="text" value={familyContactName} onChange={(e) => setFamilyContactName(e.target.value)} required />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Contact Details (Phone) *' : 'தொடர்பு எண் *'}</label>
                <input type="text" value={familyPhone} onChange={(e) => setFamilyPhone(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Family Message / Tribute Note *' : 'குடும்ப அஞ்சலி குறிப்பு *'}</label>
              <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows="4" required></textarea>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              {lang === 'en' ? 'Submit Demise Notification' : 'அறிவிப்பைச் சமர்ப்பி'}
            </button>
          </form>
        </div>
      )}

      {/* Search Filter */}
      <div style={{ margin: '2rem 0' }}>
        <input
          type="text"
          placeholder={lang === 'en' ? 'Search by deceased name or location...' : 'பெயர் அல்லது இடத்தைக் கொண்டு தேடுங்கள்...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
      ) : (
        <div className="obits-grid">
          {filteredObits.length === 0 ? (
            <p>{lang === 'en' ? 'No obituaries found.' : 'அறிவிப்புகள் எதுவும் இல்லை.'}</p>
          ) : (
            filteredObits.map(obit => (
              <div key={obit.id} className="obit-card" onClick={() => handleSelectObit(obit)}>
                <img src={obit.photo || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300'} alt={obit.deceasedName} className="obit-img" />
                <div className="obit-info">
                  <h3>{obit.deceasedName}</h3>
                  <div className="obit-meta">
                    {obit.age && <span>{lang === 'en' ? `Age: ${obit.age}` : `வயது: ${obit.age}`}</span>}
                    {obit.location && <span><i className="fa-solid fa-location-dot"></i> {obit.location}</span>}
                  </div>
                  <p className="obit-demise-date">
                    {lang === 'en' ? 'Demise Date:' : 'மறைந்த தேதி:'} <strong style={{ color: '#ef4444' }}>{obit.dateOfPassing || 'N/A'}</strong>
                  </p>
                  <p className="obit-excerpt">{obit.biography || obit.shortDescription}</p>
                  <button className="obit-view-btn">{lang === 'en' ? 'Pay Tribute / Write Condolence' : 'இரங்கல் செய்தி செலுத்து'}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Condolences detail modal */}
      {selectedObit && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#0f172a' }}>
              <h3>In Loving Memory: {selectedObit.deceasedName}</h3>
              <button className="modal-close" onClick={() => setSelectedObit(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5rem' }} className="obit-modal-header-block">
                <img src={selectedObit.photo || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=150'} alt={selectedObit.deceasedName} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedObit.deceasedName}</h4>
                  <p style={{ margin: '4px 0', color: '#64748b' }}>DOB: {selectedObit.dateOfBirth || 'N/A'} · Demise: {selectedObit.dateOfPassing || 'N/A'}</p>
                  {selectedObit.funeralVenue && (
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}><strong>Funeral Venue:</strong> {selectedObit.funeralVenue}</p>
                  )}
                </div>
              </div>

              <p style={{ fontStyle: 'italic', background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #94a3b8' }}>"{selectedObit.biography || selectedObit.shortDescription}"</p>

              <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

              {/* Condolences list */}
              <h4>{lang === 'en' ? 'Tribute & Condolences Messages' : 'இரங்கல் செய்திகள்'}</h4>
              {loadingCondolences ? (
                <p>Loading condolences list...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                  {condolences.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No condolence messages published yet. Be the first to write.</p>
                  ) : (
                    condolences.map(c => (
                      <div key={c.id} style={{ background: '#f1f5f9', padding: '10px 15px', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>
                          <span>{c.name}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#334155' }}>{c.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

              {/* Leave Condolence Form */}
              <form onSubmit={handleCondolenceSubmit}>
                <h5>{lang === 'en' ? 'Leave a Condolence Message' : 'இரங்கல் செய்தி எழுதவும்'}</h5>
                {condolenceSuccess && <div className="alert-banner success">{condolenceSuccess}</div>}
                
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label>{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                  <input type="text" value={condolenceName} onChange={(e) => setCondolenceName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>{lang === 'en' ? 'Message *' : 'செய்தி *'}</label>
                  <textarea value={condolenceMessage} onChange={(e) => setCondolenceMessage(e.target.value)} rows="3" required></textarea>
                </div>
                <button type="submit" className="submit-btn" style={{ padding: '8px 16px', background: '#0f172a', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                  {lang === 'en' ? 'Submit Message' : 'சமர்ப்பி'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicObituaries;
