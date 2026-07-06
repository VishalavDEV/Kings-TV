import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Classifieds = () => {
  const { lang, t } = useContext(LanguageContext);
  const [ads, setAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('property');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [desc, setDesc] = useState('');

  const fallbackAds = [
    { id: 'demo-1', title: '2 BHK சொகுசு வீடு வாடகைக்கு', category: 'property', priceDetail: '₹12,000 / மாதம்', location: 'சென்னை', contactInfo: 'ராமச்சந்திரன்: 98765 12345', description: 'அண்ணா நகர் மெயின் ரோடு. புதிய கட்டுமானம். கார் பார்க்கிங், குடிநீர் வசதியுடன்.', daysAgo: '1 நாளுக்கு முன்', icon: '🏢' },
    { id: 'demo-2', title: 'விஜய் எலக்ட்ரானிக்ஸ் ஆடி அதிரடி சலுகை', category: 'discount', priceDetail: 'ஆடி தள்ளுபடி', location: 'சேலம்', contactInfo: 'விஜய் எலக்ட்ரானிக்ஸ்: 0427 244 1122', description: 'LED டிவிகள், ஏசி மற்றும் பிரிட்ஜ்களுக்கான நேரடி தள்ளுபடி சலுகைகள். வாராந்திர சிறப்பு தவணை முறை வசதி.', daysAgo: '2 நாட்களுக்கு முன்', icon: '🏷️' },
    { id: 'demo-3', title: 'Swift Dzire (2018 Model) விற்பனைக்கு', category: 'vehicle', priceDetail: '₹4,20,000', location: 'கோவை', contactInfo: 'சிவகுமார்: 99442 88776', description: 'சிங்கிள் ஓனர், நல்ல நிலையில் உள்ளது. 65,000 கிமீ ஓடியது. இன்சூரன்ஸ் நடப்பில் உள்ளது.', daysAgo: '3 நாட்களுக்கு முன்', icon: '🚗' },
    { id: 'demo-4', title: 'Samsung Smart TV (43 inch) விற்பனைக்கு', category: 'appliance', priceDetail: '₹18,500', location: 'திருச்சி', contactInfo: 'அகமது: 96321 07412', description: '1 வருடமே பயன்படுத்தப்பட்டது. மிக அருமையான கண்டிஷன். ஒரிஜினல் பில், பாக்ஸ் மற்றும் ரிமோட்டுடன்.', daysAgo: '5 நாட்களுக்கு முன்', icon: '📺' }
  ];

  const loadData = () => {
    fetchApi('/classifieds')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => ({
          id: item.ad_id || item.id,
          title: item.title,
          category: (item.category || '').toLowerCase(),
          priceDetail: item.priceDetail || item.price_detail,
          location: item.location,
          contactInfo: item.contactInfo || item.contact_info,
          description: item.description,
          daysAgo: '1 நாளுக்கு முன்',
          icon: item.category === 'property' ? '🏢' : item.category === 'discount' ? '🏷️' : item.category === 'vehicle' ? '🚗' : '📺'
        })) : [];
        const merged = [...formatted, ...fallbackAds];
        setAds(merged);
        setFilteredAds(merged);
      })
      .catch((err) => {
        console.warn("Could not fetch classifieds from API, using fallback", err);
        setAds(fallbackAds);
        setFilteredAds(fallbackAds);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = ads;

    if (selectedCat !== 'all') {
      result = result.filter(item => item.category === selectedCat);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    setFilteredAds(result);
  }, [selectedCat, searchQuery, ads]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/classifieds', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category: category.toLowerCase(),
        priceDetail: price,
        location,
        contactInfo: contact,
        description: desc
      })
    })
    .then(() => {
      setTitle('');
      setPrice('');
      setContact('');
      setDesc('');
      setLocation('');
      setShowModal(false);
      loadData();
    })
    .catch(err => {
      console.warn("API ad save failed, updating locally", err);
      const newAd = {
        id: Date.now(),
        title,
        category,
        priceDetail: price,
        location,
        contactInfo: contact,
        description: desc,
        daysAgo: 'இப்போது',
        icon: category === 'property' ? '🏢' : category === 'discount' ? '🏷️' : category === 'vehicle' ? '🚗' : '📺'
      };
      setAds(prev => [newAd, ...prev]);
      setTitle('');
      setPrice('');
      setContact('');
      setDesc('');
      setLocation('');
      setShowModal(false);
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      property: lang === 'en' ? 'Property' : 'சொத்து',
      vehicle: lang === 'en' ? 'Vehicle' : 'வாகனம்',
      appliance: lang === 'en' ? 'Appliance' : 'வீட்டு உபயோகம்',
      discount: lang === 'en' ? 'Discount' : 'சலுகை'
    };
    return labels[cat] || cat;
  };

  const getCategoryClass = (cat) => {
    const classes = {
      property: 'cat-politics',
      vehicle: 'cat-sports',
      appliance: 'cat-technology',
      discount: 'cat-business'
    };
    return classes[cat] || 'cat-politics';
  };

  const getGradient = (cat) => {
    const grads = {
      property: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      vehicle: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
      appliance: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
      discount: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    };
    return grads[cat] || 'linear-gradient(135deg, #6b7280 0%, #374151 100%)';
  };

  return (
    <main className="container">
      {/* HERO / SEARCH */}
      <section className="classifieds-hero">
        <h1>{lang === 'en' ? 'Classifieds & Discounts' : 'விளம்பரங்கள் & தள்ளுபடிகள்'}</h1>
        <p>{lang === 'en' ? 'Buy or sell locally and explore special discount offers from stores' : 'உள்ளூரில் பொருட்கள் வாங்க/விற்க மற்றும் கடைகளின் நேரடி சலுகைகளை அறியுங்கள்'}</p>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'House rent, car, mobile offer...' : 'வீடு வாடகைக்கு, கார், மொபைல் சலுகை...'} 
            aria-label="Search Ads"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>{lang === 'en' ? 'Search' : 'தேடுக'}</button>
        </div>
      </section>

      {/* FILTERS */}
      <div className="category-filter-row">
        <button 
          className={`filter-pill ${selectedCat === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          {lang === 'en' ? 'All' : 'அனைத்தும்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'property' ? 'active' : ''}`}
          onClick={() => setSelectedCat('property')}
        >
          {lang === 'en' ? 'Properties' : 'சொத்துக்கள்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'vehicle' ? 'active' : ''}`}
          onClick={() => setSelectedCat('vehicle')}
        >
          {lang === 'en' ? 'Vehicles' : 'வாகனங்கள்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'appliance' ? 'active' : ''}`}
          onClick={() => setSelectedCat('appliance')}
        >
          {lang === 'en' ? 'Appliances' : 'வீட்டு உபயோகம்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'discount' ? 'active' : ''}`}
          onClick={() => setSelectedCat('discount')}
        >
          {lang === 'en' ? 'Offers' : 'சிறப்பு சலுகைகள்'}
        </button>
      </div>

      {/* CLASSIFIEDS GRID */}
      <section className="classifieds-grid">
        {filteredAds.map(ad => (
          <div className="classified-card" key={ad.id}>
            <div 
              className={`card-banner-img ${getCategoryClass(ad.category)}`} 
              style={{ background: getGradient(ad.category) }}
            >
              <span className={`badge ${getCategoryClass(ad.category)}`}>
                {getCategoryLabel(ad.category)}
              </span>
              <span>{ad.icon} {ad.title.slice(0, 20)}...</span>
            </div>
            <div className="classified-body">
              <div className="classified-price">{ad.priceDetail}</div>
              <h2 className="classified-title">{ad.title}</h2>
              <p className="classified-desc">{ad.description}</p>
              <div className="classified-meta">
                <span>📍 {ad.location}</span>
                <span>📅 {ad.daysAgo}</span>
              </div>
            </div>
            <button 
              className="contact-btn"
              onClick={() => alert(`${lang === 'en' ? 'Contact Info' : 'தொடர்பு விபரம்'}: ${ad.contactInfo}`)}
            >
              {lang === 'en' ? 'Show Contact' : 'தொடர்பு கொள்ள'}
            </button>
          </div>
        ))}
      </section>

      {/* PROMO REGISTRATION BAR */}
      <section className="classifieds-hero" style={{ background: 'var(--white)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--text-dark)', marginTop: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
          {lang === 'en' ? 'Have something to sell or want to publish a discount offer?' : 'ஏதேனும் விற்க வேண்டுமா அல்லது தள்ளுபடி சலுகையை வெளியிட வேண்டுமா?'}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          {lang === 'en' ? 'Post your classified ad and reach buyers instantly.' : 'உங்கள் வகைப்படுத்தப்பட்ட விளம்பரத்தை பதிவிட்டு உடனடியாக வாங்குபவர்களை சென்றடையுங்கள்.'}</p>
        <button 
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 24px', borderRadius: '30px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          {lang === 'en' ? 'Post Free Ad' : 'புதிய விளம்பரத்தை பதிவிடவும்'}
        </button>
      </section>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="modal open" id="addClassifiedModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Post Classified Ad' : 'புதிய விளம்பரத்தை சேர்க்கவும்'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="addClassifiedForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="adTitle">{lang === 'en' ? 'Ad Title *' : 'விளம்பரத் தலைப்பு *'}</label>
                  <input 
                    type="text" 
                    id="adTitle" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Splendor Bike for Sale' : 'எ.கா: ஸ்பிளெண்டர் பைக் விற்பனைக்கு'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adCat">{lang === 'en' ? 'Category *' : 'வகை *'}</label>
                  <select 
                    id="adCat" 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  >
                    <option value="property">{lang === 'en' ? 'Property' : 'சொத்து'}</option>
                    <option value="vehicle">{lang === 'en' ? 'Vehicle' : 'வாகனம்'}</option>
                    <option value="appliance">{lang === 'en' ? 'Appliance' : 'வீட்டு உபயோகம்'}</option>
                    <option value="discount">{lang === 'en' ? 'Discount Offer' : 'சிறப்பு சலுகை'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="adPrice">{lang === 'en' ? 'Price / Offer Detail *' : 'விலை / சலுகை விபரம் *'}</label>
                  <input 
                    type="text" 
                    id="adPrice" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. ₹35,000 or 30% Off' : 'எ.கா: ₹35,000 அல்லது 30% தள்ளுபடி'}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adLoc">{lang === 'en' ? 'Location *' : 'விற்பனை இடம் *'}</label>
                  <input 
                    type="text" 
                    id="adLoc" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Salem' : 'எ.கா: சேலம்'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adContact">{lang === 'en' ? 'Contact Info (Name & Phone) *' : 'தொடர்பு விபரம் (பெயர் & எண்) *'}</label>
                  <input 
                    type="text" 
                    id="adContact" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Raja - 9876543210' : 'எ.கா: ராஜா - 9876543210'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="adDesc">{lang === 'en' ? 'Description *' : 'விளக்க விபரம் *'}</label>
                  <textarea 
                    id="adDesc" 
                    required 
                    rows="3"
                    placeholder={lang === 'en' ? 'Describe the product condition or offer guidelines' : 'தயாரிப்பு நிலை அல்லது சலுகை விதிகளை விளக்கவும்'}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">{lang === 'en' ? 'Submit' : 'சமர்ப்பிக்க'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Classifieds;
