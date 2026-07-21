import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicDeals.css';

const PublicDeals = () => {
  const { lang } = useContext(LanguageContext);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal States
  const [selectedDealMap, setSelectedDealMap] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [discountType, setDiscountType] = useState('');

  const loadDeals = async () => {
    setLoading(true);
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (discountType) query += `&discountType=${encodeURIComponent(discountType)}`;
      const res = await fetchApi(`/v1/deals/public${query}`);
      if (res && Array.isArray(res.content)) {
        setDeals(res.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, [discountType]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadDeals();
  };

  const checkExpiringSoon = (validUntilStr) => {
    if (!validUntilStr) return false;
    const diffMs = new Date(validUntilStr) - new Date();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  };

  return (
    <div className="public-deals-container">
      {/* Deals Hero */}
      <div className="deals-hero-banner">
        <h1>{lang === 'en' ? 'Hot Deals & Coupons' : 'சிறப்பு சலுகைகள் & தள்ளுபடிகள்'}</h1>
        <p>{lang === 'en' ? 'Unlock exclusive discounts, BOGO promotions, and offers from verified local shops.' : 'உள்ளூர் கடைகளின் பிரத்யேக தள்ளுபடிகள் மற்றும் சலுகைகளைப் பெற்று மகிழுங்கள்.'}</p>
      </div>

      {/* Filter Row */}
      <form onSubmit={handleFilterSubmit} className="deals-search-bar-row">
        <input
          type="text"
          placeholder={lang === 'en' ? "Search deals..." : "சலுகைகளைத் தேடுங்கள்..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="select-input">
          <option value="">{lang === 'en' ? 'All Formats' : 'அனைத்து வடிவங்கள்'}</option>
          <option value="percent">Percentage Off</option>
          <option value="flat">Flat Price Off</option>
          <option value="BOGO">BOGO (Buy One Get One)</option>
        </select>
        <button type="submit" className="filter-submit-btn">
          {lang === 'en' ? 'Filter' : 'வடிகட்டு'}
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p>{lang === 'en' ? 'Syncing deals catalog...' : 'சலுகைகளை ஏற்றிவருகிறது...'}</p>
        </div>
      ) : (
        <div className="deals-grid-list">
          {deals.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>
              {lang === 'en' ? 'No active deals match your criteria.' : 'அனுமதிக்கப்பட்ட சலுகைகள் எதுவும் தற்சமயம் இல்லை.'}
            </p>
          ) : (
            deals.map(item => {
              const d = item.deal;
              const merchant = item.merchant;
              const expiring = checkExpiringSoon(d.validUntil);
              
              return (
                <div key={d.id} className="deal-grid-card" onClick={() => setSelectedDealMap(item)}>
                  <div className="deal-card-banner" style={{ background: d.bannerUrl || d.image ? `url(${d.bannerUrl || d.image}) center/cover` : 'linear-gradient(135deg, #f43f5e, #be123c)' }}>
                    {expiring && (
                      <span className="deal-expiring-badge">
                        <i className="fa-solid fa-clock"></i> {lang === 'en' ? 'Expiring Soon' : 'விரைவில் முடிகிறது'}
                      </span>
                    )}
                  </div>
                  <div className="deal-card-body">
                    <span className="deal-discount-tag">
                      {d.discountType === 'percent' ? `${d.discountValue}% Off` : d.discountType === 'flat' ? `₹${d.discountValue} Off` : 'BOGO Deal'}
                    </span>
                    <h3>{d.title}</h3>
                    {merchant && (
                      <h4 className="deal-merchant-name"><i className="fa-solid fa-store"></i> {merchant.businessName || merchant.name}</h4>
                    )}
                    <p className="deal-excerpt">{d.terms || (lang === 'en' ? 'Click to view terms and conditions.' : 'நிபந்தனைகளைக் காண சொடுக்கவும்.')}</p>
                  </div>
                  <div className="deal-card-footer">
                    <span className="view-deal-btn">
                      {lang === 'en' ? 'Get Deal' : 'சலுகையைப் பெறு'} <i className="fa-solid fa-gift"></i>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDealMap && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#f43f5e' }}>
              <h3>Promotional Offer Detail</h3>
              <button className="modal-close" onClick={() => setSelectedDealMap(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', color: '#e11d48', fontWeight: '800', margin: '1rem 0' }}>
                {selectedDealMap.deal.discountType === 'percent' ? `${selectedDealMap.deal.discountValue}% DISCOUNT` : selectedDealMap.deal.discountType === 'flat' ? `₹${selectedDealMap.deal.discountValue} OFF` : 'BUY 1 GET 1 FREE'}
              </h2>
              <h3>{selectedDealMap.deal.title}</h3>
              
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', margin: '1.5rem 0', textAlign: 'left' }}>
                <p><strong>{lang === 'en' ? 'Coupon Code:' : 'கூப்பன் குறியீடு:'}</strong> <code style={{ fontSize: '1.1rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>{selectedDealMap.deal.couponCode || 'NO CODE REQUIRED'}</code></p>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#475569', whiteSpace: 'pre-line' }}>
                  <strong>{lang === 'en' ? 'Terms & Conditions:' : 'விதிமுறைகள் & நிபந்தனைகள்:'}</strong><br/>
                  {selectedDealMap.deal.terms || 'General promo terms apply.'}
                </p>
              </div>

              {selectedDealMap.merchant ? (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{lang === 'en' ? 'Offered by:' : 'வழங்குபவர்:'}</p>
                  <Link to={`/directory/${selectedDealMap.merchant.slug}`} className="sidebar-apply-cta" style={{ display: 'inline-flex', background: '#0f172a', textDecoration: 'none' }} onClick={() => setSelectedDealMap(null)}>
                    <i className="fa-solid fa-store"></i> {selectedDealMap.merchant.businessName || selectedDealMap.merchant.name} Profile
                  </Link>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{lang === 'en' ? 'Standalone promo offer.' : 'தனிப்பட்ட விளம்பர சலுகை.'}</p>
              )}

              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1.5rem' }}>
                {lang === 'en' ? `Offer valid until: ${new Date(selectedDealMap.deal.validUntil).toLocaleString()}` : `சலுகை முடியும் நாள்: ${new Date(selectedDealMap.deal.validUntil).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDeals;
