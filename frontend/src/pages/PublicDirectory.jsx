import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicDirectory.css';

const PublicDirectory = () => {
  const { lang } = useContext(LanguageContext);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search parameters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  // Submit Listing Form modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bizName, setBizName] = useState('');
  const [bizCat, setBizCat] = useState('');
  const [bizSubcat, setBizSubcat] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizWeb, setBizWeb] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizLocality, setBizLocality] = useState('');
  const [bizStreet, setBizStreet] = useState('');
  const [bizHours, setBizHours] = useState('');
  const [bizLogo, setBizLogo] = useState('');
  const [bizCover, setBizCover] = useState('');
  const [bizLat, setBizLat] = useState('');
  const [bizLng, setBizLng] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const loadListings = async () => {
    setLoading(true);
    try {
      const query = `?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`;
      const data = await fetchApi(`/public/directory${query}`);
      if (Array.isArray(data)) {
        setListings(data);
      }

      const catData = await fetchApi('/public/directory/categories');
      if (Array.isArray(catData)) {
        setCategories(catData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleSelfSubmitListing = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    const payload = {
      businessName: bizName,
      name: bizName,
      category: bizCat,
      subcategory: bizSubcat,
      phoneNumber: bizPhone,
      phone: bizPhone,
      email: bizEmail,
      website: bizWeb,
      address: bizAddress,
      addressLocality: bizLocality,
      addressStreet: bizStreet,
      workingHours: bizHours,
      logoUrl: bizLogo,
      logo: bizLogo,
      coverUrl: bizCover,
      coverImage: bizCover,
      latitude: parseFloat(bizLat) || null,
      longitude: parseFloat(bizLng) || null,
      description: bizDesc,
      status: 'pending',
      isVerified: false
    };

    try {
      const res = await fetchApi('/public/directory/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res) {
        setSubmitSuccess(lang === 'en' ? 'Thank you! Your business listing was submitted and is pending verification.' : 'நன்றி! உங்கள் வணிக விவரம் சமர்ப்பிக்கப்பட்டு, மதிப்பாய்வில் உள்ளது.');
        // Reset states
        setBizName('');
        setBizCat('');
        setBizSubcat('');
        setBizPhone('');
        setBizEmail('');
        setBizWeb('');
        setBizAddress('');
        setBizLocality('');
        setBizStreet('');
        setBizHours('');
        setBizLogo('');
        setBizCover('');
        setBizLat('');
        setBizLng('');
        setBizDesc('');
        setTimeout(() => setShowSubmitModal(false), 3000);
      }
    } catch (err) {
      setSubmitError('Failed to submit listing. Try again later.');
    }
  };

  return (
    <div className="public-directory-container">
      {/* Directory Hero Banner */}
      <div className="directory-hero">
        <h1>{lang === 'en' ? 'Local Business Directory' : 'உள்ளூர் வணிக வழிகாட்டி'}</h1>
        <p>{lang === 'en' ? 'Find top-rated services, restaurants, shops, and businesses near you.' : 'உங்களுக்கு அருகிலுள்ள சிறந்த உணவகங்கள், கடைகள் மற்றும் சேவைகளைக் கண்டறியுங்கள்.'}</p>
        <button className="submit-biz-cta" onClick={() => { setSubmitSuccess(''); setSubmitError(''); setShowSubmitModal(true); }}>
          <i className="fa-solid fa-store"></i> {lang === 'en' ? 'Submit Your Business' : 'உங்கள் வணிகத்தை பதிவு செய்யுங்கள்'}
        </button>
      </div>

      {/* Directory Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="directory-search-bar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '2rem auto', maxWidth: '900px' }}>
        <input
          type="text"
          placeholder={lang === 'en' ? "Search by keyword..." : "தேட வார்த்தையை உள்ளிடவும்..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flexGrow: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <input
          type="text"
          placeholder={lang === 'en' ? "Locality (e.g. Chennai)..." : "வட்டம் (எ.கா: சென்னை)..."}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ width: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: '200px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
        >
          <option value="">{lang === 'en' ? 'All Categories' : 'அனைத்துப் பிரிவுகள்'}</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: '12px 24px', background: '#B3732A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          {lang === 'en' ? 'Filter' : 'வடிகட்டு'}
        </button>
      </form>

      {/* Grid List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p>{lang === 'en' ? 'Fetching listings catalog...' : 'வணிகங்களை ஏற்றிவருகிறது...'}</p>
        </div>
      ) : (
        <div className="biz-grid-list">
          {listings.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>
              {lang === 'en' ? 'No approved business listings match your criteria.' : 'அனுமதிக்கப்பட்ட வணிக விவரங்கள் எதுவும் கிடைக்கவில்லை.'}
            </p>
          ) : (
            listings.map(biz => (
              <div key={biz.id} className="biz-grid-card">
                <div className="biz-card-banner" style={{ background: biz.coverUrl ? `url(${biz.coverUrl}) center/cover` : 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                  {biz.isVerified && (
                    <span className="biz-verified-badge" title="Verified Business">
                      <i className="fa-solid fa-circle-check"></i> {lang === 'en' ? 'Verified' : 'சரிபார்க்கப்பட்டது'}
                    </span>
                  )}
                </div>
                <div className="biz-card-body">
                  <span className="biz-cat-tag">{biz.category}</span>
                  <h3>
                    <Link to={`/directory/${biz.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {biz.businessName || biz.name}
                    </Link>
                  </h3>
                  <p className="biz-desc-excerpt">{biz.description || (lang === 'en' ? 'No description available.' : 'விளக்கம் எதுவும் இல்லை.')}</p>
                  
                  <div className="biz-card-meta">
                    {biz.phoneNumber && (
                      <span className="biz-meta-item">
                        <i className="fa-solid fa-phone"></i> {biz.phoneNumber}
                      </span>
                    )}
                    <span className="biz-meta-item">
                      <i className="fa-solid fa-location-dot"></i> {biz.addressLocality || 'Tamil Nadu'}
                    </span>
                  </div>
                </div>
                <div className="biz-card-footer">
                  <Link to={`/directory/${biz.slug}`} className="view-details-btn">
                    {lang === 'en' ? 'View Details' : 'விவரம் காண்க'} <i className="fa-solid fa-arrow-right-long"></i>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submit Listing Modal overlay form */}
      {showSubmitModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#B3732A' }}>
              <h3>{lang === 'en' ? 'Submit Your Business' : 'உங்கள் வணிகத்தை பதிவு செய்க'}</h3>
              <button className="modal-close" onClick={() => setShowSubmitModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {submitSuccess ? (
                <div className="alert-banner success">{submitSuccess}</div>
              ) : (
                <form onSubmit={handleSelfSubmitListing}>
                  {submitError && <div className="alert-banner error">{submitError}</div>}
                  
                  <div className="form-group">
                    <label>{lang === 'en' ? 'Business Name *' : 'வணிகத்தின் பெயர் *'}</label>
                    <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Category *' : 'பிரிவு *'}</label>
                      <input type="text" value={bizCat} onChange={(e) => setBizCat(e.target.value)} placeholder="e.g. Restaurants" required />
                    </div>
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Subcategory' : 'துணைப்பிரிவு'}</label>
                      <input type="text" value={bizSubcat} onChange={(e) => setBizSubcat(e.target.value)} placeholder="e.g. Vegetarian" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Phone Number *' : 'கைபேசி எண் *'}</label>
                      <input type="text" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} required />
                    </div>
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Email Address' : 'மின்னஞ்சல்'}</label>
                      <input type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'en' ? 'Website URL' : 'இணைய முகவரி'}</label>
                    <input type="url" value={bizWeb} onChange={(e) => setBizWeb(e.target.value)} placeholder="https://example.com" />
                  </div>

                  <div className="form-group">
                    <label>{lang === 'en' ? 'Full Street Address *' : 'தெரு முகவரி *'}</label>
                    <input type="text" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Locality (City) *' : 'நகரம் *'}</label>
                      <input type="text" value={bizLocality} onChange={(e) => setBizLocality(e.target.value)} placeholder="e.g. Chennai" required />
                    </div>
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Street/Area *' : 'பகுதி *'}</label>
                      <input type="text" value={bizStreet} onChange={(e) => setBizStreet(e.target.value)} placeholder="e.g. T-Nagar" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Logo Image URL' : 'லோகோ பட முகவரி'}</label>
                      <input type="text" value={bizLogo} onChange={(e) => setBizLogo(e.target.value)} />
                    </div>
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Cover Banner URL' : 'அட்டைப் பட முகவரி'}</label>
                      <input type="text" value={bizCover} onChange={(e) => setBizCover(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>{lang === 'en' ? 'Working Hours' : 'வேலை நேரம்'}</label>
                      <input type="text" value={bizHours} onChange={(e) => setBizHours(e.target.value)} placeholder="e.g. 9 AM - 9 PM" />
                    </div>
                    <div className="form-group half" style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label>Lat</label>
                        <input type="text" value={bizLat} onChange={(e) => setBizLat(e.target.value)} placeholder="13.0827" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Lng</label>
                        <input type="text" value={bizLng} onChange={(e) => setBizLng(e.target.value)} placeholder="80.2707" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{lang === 'en' ? 'Business Description *' : 'வணிக விளக்கம் *'}</label>
                    <textarea value={bizDesc} onChange={(e) => setBizDesc(e.target.value)} rows="3" required></textarea>
                  </div>

                  <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '10px', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                    {lang === 'en' ? 'Submit for Review' : 'மதிப்பாய்விற்கு சமர்ப்பி'}
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

export default PublicDirectory;
