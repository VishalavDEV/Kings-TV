import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicDirectory.css';

const PublicDirectoryDetail = () => {
  const { slug } = useParams();
  const { lang } = useContext(LanguageContext);
  const [biz, setBiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Claim listing states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimName, setClaimName] = useState('');
  const [claimContact, setClaimContact] = useState('');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/public/directory/detail/${slug}`);
        if (data && !data.error) {
          setBiz(data);
        }
      } catch (e) {
        console.error("Failed to load business details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    setClaimSuccess(lang === 'en' ? 'Claim request submitted! Our review team will contact you shortly.' : 'உரிமைகோரல் கோரிக்கை சமர்ப்பிக்கப்பட்டது! எங்கள் குழு உங்களை விரைவில் தொடர்பு கொள்ளும்.');
    setClaimName('');
    setClaimContact('');
    setClaimMessage('');
    setTimeout(() => {
      setShowClaimModal(false);
      setClaimSuccess('');
    }, 4000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>{lang === 'en' ? 'Loading business profile...' : 'வணிக விவரங்களை ஏற்றிவருகிறது...'}</p>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="container" style={{ padding: '60px 15px', textAlign: 'center' }}>
        <h2>{lang === 'en' ? 'Business Listing Not Found' : 'வணிக விவரங்கள் கிடைக்கவில்லை'}</h2>
        <p>{lang === 'en' ? 'The directory listing you are looking for does not exist or has been removed.' : 'நீங்கள் தேடும் வணிகம் இந்த வழிகாட்டியில் இல்லை.'}</p>
        <Link to="/directory" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
          {lang === 'en' ? 'Back to Directory' : 'வழிகாட்டிக்குச் செல்லவும்'}
        </Link>
      </div>
    );
  }

  return (
    <div className="public-directory-detail-container">
      {/* Cover Banner */}
      <div className="biz-detail-banner" style={{ background: biz.coverUrl ? `url(${biz.coverUrl}) center/cover` : 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        <div className="biz-detail-overlay">
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {biz.logoUrl && (
              <img src={biz.logoUrl} alt={biz.businessName || biz.name} className="biz-detail-logo" />
            )}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <span className="detail-cat-badge">{biz.category}</span>
              <h1 className="detail-biz-name">
                {biz.businessName || biz.name}{' '}
                {biz.isVerified && (
                  <i className="fa-solid fa-circle-check" style={{ color: '#3b82f6', fontSize: '1.5rem', marginLeft: '8px' }} title="Verified Listing"></i>
                )}
              </h1>
              <p className="detail-locality"><i className="fa-solid fa-location-dot"></i> {biz.addressLocality || 'Tamil Nadu'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', margin: '2rem auto', padding: '0 15px' }} className="detail-split-grid">
        {/* Main description section */}
        <div className="detail-main-info">
          <div className="info-card">
            <h2>{lang === 'en' ? 'About Business' : 'வணிகத்தைப் பற்றி'}</h2>
            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.95rem', color: '#334155' }}>
              {biz.description || (lang === 'en' ? 'No description available for this business.' : 'இந்த வணிகத்திற்கான விளக்கம் எதுவும் இன்னும் வழங்கப்படவில்லை.')}
            </p>
          </div>

          <div className="info-card" style={{ marginTop: '20px' }}>
            <h2>{lang === 'en' ? 'Location & Address' : 'முகவரி & வரைபடம்'}</h2>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}><i className="fa-solid fa-map-pin"></i> {biz.address || (biz.addressStreet + ", " + biz.addressLocality)}</p>
            
            {/* Mock map embedding */}
            <div className="mock-map-view" style={{ height: '280px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {biz.latitude && biz.longitude ? (
                <iframe
                  title="Business Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${biz.latitude},${biz.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  style={{ border: 0 }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <i className="fa-solid fa-map-location-dot fa-3x" style={{ marginBottom: '8px' }}></i>
                  <p>{lang === 'en' ? '[ Geolocation coordinates not pinned ]' : '[ வரைபடக் குறியீடுகள் அமைக்கப்படவில்லை ]'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Hours */}
        <aside className="detail-sidebar">
          <div className="info-card">
            <h3>{lang === 'en' ? 'Contact Details' : 'தொடர்பு விவரங்கள்'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
              {biz.phoneNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-phone" style={{ color: '#B3732A' }}></i>
                  <a href={`tel:${biz.phoneNumber}`} style={{ color: 'inherit', fontWeight: 600 }}>{biz.phoneNumber}</a>
                </div>
              )}
              {biz.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-envelope" style={{ color: '#B3732A' }}></i>
                  <a href={`mailto:${biz.email}`} style={{ color: 'inherit' }}>{biz.email}</a>
                </div>
              )}
              {biz.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-globe" style={{ color: '#B3732A' }}></i>
                  <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{ color: '#B3732A', fontWeight: '700' }}>{lang === 'en' ? 'Visit Website' : 'இணையதளம் செல்ல'}</a>
                </div>
              )}
            </div>
          </div>

          <div className="info-card" style={{ marginTop: '20px' }}>
            <h3>{lang === 'en' ? 'Working Hours' : 'வேலை நேரம்'}</h3>
            <p style={{ marginTop: '0.5rem', fontWeight: 600, color: '#475569' }}>
              <i className="fa-regular fa-clock"></i> {biz.workingHours || (lang === 'en' ? 'Not Specified' : 'குறிப்பிடப்படவில்லை')}
            </p>
          </div>

          <div className="info-card" style={{ marginTop: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <h3>{lang === 'en' ? 'Own this business?' : 'இந்த வணிகத்தின் உரிமையாளரா?'}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
              {lang === 'en' ? 'Claim this verified badge listing to update business details.' : 'இந்த வணிகத்தை உரிமை கோரி, தகவல்களைப் புதுப்பிக்கவும்.'}
            </p>
            <button className="claim-listing-btn" onClick={() => { setClaimSuccess(''); setShowClaimModal(true); }}>
              {lang === 'en' ? 'Claim This Listing' : 'உரிமை கோருங்கள்'}
            </button>
          </div>
        </aside>
      </div>

      {/* Claim listing Modal */}
      {showClaimModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#0f172a' }}>
              <h3>{lang === 'en' ? 'Claim Listing Verification' : 'வணிகத்தை உரிமை கோருங்கள்'}</h3>
              <button className="modal-close" onClick={() => setShowClaimModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {claimSuccess ? (
                <div className="alert-banner success">{claimSuccess}</div>
              ) : (
                <form onSubmit={handleClaimSubmit}>
                  <div className="form-group">
                    <label>{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                    <input type="text" value={claimName} onChange={(e) => setClaimName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'en' ? 'Contact Phone/Email *' : 'தொடர்பு விபரம் *'}</label>
                    <input type="text" value={claimContact} onChange={(e) => setClaimContact(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'en' ? 'Verification Message / Proof *' : 'உரிமை கோருவதற்கான ஆதாரம் *'}</label>
                    <textarea value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} rows="3" placeholder={lang === 'en' ? 'E.g., I am the general manager. Here is our registry ID...' : 'எ.கா: நான் இந்த நிறுவனத்தின் உரிமையாளர்...'} required></textarea>
                  </div>
                  <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '10px', padding: '12px 24px', background: '#0f172a', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                    {lang === 'en' ? 'Submit Claim Request' : 'கோரிக்கையைச் சமர்ப்பி'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDirectoryDetail;
