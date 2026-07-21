import React, { useState, useEffect, useContext } from 'react';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicWishes.css';

const PublicWishes = () => {
  const { lang } = useContext(LanguageContext);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all'); // all, birthday, anniversary, festival, congratulations, other

  // Submit wish form states
  const [showForm, setShowForm] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [wishType, setWishType] = useState('birthday');
  const [message, setMessage] = useState('');
  const [recipientPhoto, setRecipientPhoto] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderProfile, setSenderProfile] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const loadWishes = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/public/wishes');
      if (Array.isArray(data)) {
        setWishes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, []);

  const handleSubmitWish = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    const payload = {
      recipientName,
      recipientPhoto,
      image: recipientPhoto,
      wishType,
      message,
      senderName,
      senderProfile,
      relationship
    };
    try {
      await fetchApi('/public/wishes', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setSubmitSuccess(lang === 'en' ? 'Wish greeting submitted and is pending moderation.' : 'வாழ்த்து அட்டை சமர்ப்பிக்கப்பட்டது! தணிக்கைக்குப் பின் இணையத்தில் வெளியிடப்படும்.');
      setRecipientName('');
      setRecipientPhoto('');
      setMessage('');
      setSenderName('');
      setSenderProfile('');
      setRelationship('');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWishes = selectedType === 'all'
    ? wishes
    : wishes.filter(w => (w.wishType || '').toLowerCase() === selectedType.toLowerCase());

  return (
    <div className="public-wishes-container">
      {/* Hero Banner */}
      <div className="wishes-hero-banner">
        <h1>{lang === 'en' ? 'Wishes & Greetings' : 'வாழ்த்துகள் & பாராட்டுக்கள்'}</h1>
        <p>{lang === 'en' ? 'Send birthday, anniversary, and congratulations wishes to your family and friends.' : 'உங்கள் குடும்பத்தினருக்கும் நண்பர்களுக்கும் பிறந்தநாள், திருமண நாள் வாழ்த்துகளை அனுப்புங்கள்.'}</p>
        
        <div style={{ marginTop: '1.5rem' }}>
          <button className="submit-wish-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? (lang === 'en' ? 'Close Wish Form' : 'படிவத்தை மூடு') : (lang === 'en' ? 'Post a Wish Greeting' : 'வாழ்த்து அட்டை பதிவிடு')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rfq-form-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '2rem 0' }}>
          <h2>{lang === 'en' ? 'Submit a Wish Greeting Card' : 'வாழ்த்து அட்டையைப் பதிவிடவும்'}</h2>
          {submitSuccess && <div className="alert-banner success">{submitSuccess}</div>}
          <form onSubmit={handleSubmitWish} style={{ marginTop: '1.5rem' }}>
            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Recipient Name *' : 'வாழ்த்து பெறுபவர் பெயர் *'}</label>
                <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Greeting Type *' : 'வாழ்த்து வகை *'}</label>
                <select value={wishType} onChange={(e) => setWishType(e.target.value)} required>
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
                <label>{lang === 'en' ? 'Recipient Photo URL' : 'பெறுபவர் புகைப்பட லிங்க்'}</label>
                <input type="text" value={recipientPhoto} onChange={(e) => setRecipientPhoto(e.target.value)} placeholder="https://example.com/photo.jpg" />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Relationship' : 'உறவுமுறை'}</label>
                <input type="text" value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="e.g. Brother, Friend" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} required />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Contact Info (Phone) *' : 'தொடர்பு எண் *'}</label>
                <input type="text" value={senderProfile} onChange={(e) => setSenderProfile(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Greeting Message *' : 'வாழ்த்துச் செய்தி *'}</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="4" required></textarea>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              {lang === 'en' ? 'Submit Greeting Wish' : 'வாழ்த்தைச் சமர்ப்பி'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Categories */}
      <div className="wish-filter-row" style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', margin: '2rem 0' }}>
        {['all', 'birthday', 'anniversary', 'festival', 'congratulations', 'other'].map(type => (
          <button key={type} className={`filter-tag-btn ${selectedType === type ? 'active' : ''}`} onClick={() => setSelectedType(type)} style={{
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid #cbd5e1',
            background: selectedType === type ? '#B3732A' : 'white',
            color: selectedType === type ? 'white' : '#475569',
            fontWeight: '700',
            textTransform: 'capitalize',
            cursor: 'pointer'
          }}>
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }} className="spinner"></div>
      ) : (
        <div className="wishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredWishes.length === 0 ? (
            <p>{lang === 'en' ? 'No wishes greetings found.' : 'வாழ்த்துகள் எதுவும் இல்லை.'}</p>
          ) : (
            filteredWishes.map(w => (
              <div key={w.id} className="wish-card" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <img src={w.recipientPhoto || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=300'} alt={w.recipientName} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{w.recipientName}</h3>
                    <span className="badge" style={{ background: '#eff6ff', color: '#1e40af', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px' }}>{w.wishType}</span>
                  </div>
                  {w.relationship && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0' }}>Relationship: {w.relationship}</p>}
                  <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', margin: '10px 0' }}>"{w.message}"</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>{lang === 'en' ? 'Wished by:' : 'வாழ்த்தியவர்:'} <strong>{w.senderName || 'Anonymous'}</strong></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PublicWishes;
