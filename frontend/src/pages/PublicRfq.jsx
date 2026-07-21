import React, { useState, useEffect, useContext } from 'react';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicRfq.css';

const PublicRfq = () => {
  const { lang } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('post'); // post / open / my-bids
  const [loading, setLoading] = useState(false);
  const [rfqList, setRfqList] = useState([]);
  
  // Submit Requirement Form
  const [productOrService, setProductOrService] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [postSuccess, setPostSuccess] = useState('');
  const [postError, setPostError] = useState('');

  // Business-facing Bidding Form Modal
  const [biddingRfq, setBiddingRfq] = useState(null);
  const [sellerBusinessId, setSellerBusinessId] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [businessesList, setBusinessesList] = useState([]);
  const [bidSuccess, setBidSuccess] = useState('');
  const [bidError, setBidError] = useState('');

  // Buyer-facing lookup
  const [lookupName, setLookupName] = useState('');
  const [myRfqs, setMyRfqs] = useState([]);
  const [selectedRfqForQuotes, setSelectedRfqForQuotes] = useState(null);
  const [quotesReceived, setQuotesReceived] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState('');

  const loadOpenRfqs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/public/rfq');
      if (Array.isArray(data)) {
        setRfqList(data);
      }
      const biz = await fetchApi('/public/directory');
      if (Array.isArray(biz)) {
        setBusinessesList(biz);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'open') {
      loadOpenRfqs();
    }
  }, [activeTab]);

  const handlePostRequirement = async (e) => {
    e.preventDefault();
    setPostSuccess('');
    setPostError('');

    const payload = {
      productOrService,
      title: productOrService,
      buyerName,
      buyerContact,
      category,
      quantity: parseInt(quantity) || 1,
      budgetMin: parseFloat(budgetMin) || 0.0,
      budgetMax: parseFloat(budgetMax) || 0.0,
      description,
      location,
      status: 'open'
    };

    try {
      const res = await fetchApi('/public/rfq', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res) {
        setPostSuccess(lang === 'en' ? 'Requirement posted successfully! Local businesses will start quoting soon.' : 'தேவை வெற்றிகரமாகப் பதிவிடப்பட்டது! நிறுவனங்கள் விரைவில் சலுகைகளை வழங்கும்.');
        setProductOrService('');
        setBuyerName('');
        setBuyerContact('');
        setCategory('');
        setQuantity('');
        setBudgetMin('');
        setBudgetMax('');
        setDescription('');
        setLocation('');
      }
    } catch (err) {
      setPostError('Failed to post requirement. Try again later.');
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidSuccess('');
    setBidError('');

    const payload = {
      sellerBusinessId: parseInt(sellerBusinessId),
      businessId: parseInt(sellerBusinessId),
      quotedPrice: parseFloat(quotedPrice),
      notes,
      message: notes,
      status: 'submitted'
    };

    try {
      const res = await fetchApi(`/public/rfq/${biddingRfq.id}/quotes`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res) {
        setBidSuccess(lang === 'en' ? 'Quote bid submitted successfully!' : 'சலுகை விலை வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது!');
        setSellerBusinessId('');
        setQuotedPrice('');
        setNotes('');
        setTimeout(() => setBiddingRfq(null), 2500);
      }
    } catch (err) {
      setBidError('Failed to submit quote.');
    }
  };

  const handleLookupRequests = () => {
    if (!lookupName.trim()) return;
    const matched = rfqList.filter(item => item.rfq.buyerName && item.rfq.buyerName.toLowerCase().includes(lookupName.toLowerCase()));
    // If rfqList is empty because it's not loaded, let's fetch all then filter
    fetchApi('/public/rfq').then(data => {
      if (Array.isArray(data)) {
        setRfqList(data);
        const filtered = data.filter(item => item.rfq.buyerName && item.rfq.buyerName.toLowerCase().includes(lookupName.toLowerCase()));
        setMyRfqs(filtered);
      }
    });
  };

  const handleViewQuotesReceived = async (rfq) => {
    setSelectedRfqForQuotes(rfq);
    setLoadingQuotes(true);
    setAcceptSuccess('');
    try {
      const quotes = await fetchApi(`/public/rfq/${rfq.id}/quotes`);
      if (Array.isArray(quotes)) {
        setQuotesReceived(quotes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    setAcceptSuccess('');
    try {
      await fetchApi(`/public/rfq/quotes/${quoteId}/accept`, { method: 'PUT' });
      setAcceptSuccess(lang === 'en' ? 'Quote accepted successfully! This requirement is now closed.' : 'சலுகை ஏற்றுக்கொள்ளப்பட்டது! தேவைக்கான தேடல் முடிந்தது.');
      if (selectedRfqForQuotes) {
        handleViewQuotesReceived(selectedRfqForQuotes);
      }
      handleLookupRequests();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="public-rfq-container">
      {/* Hero Header */}
      <div className="rfq-hero-banner">
        <h1>{lang === 'en' ? 'Request for Quotes (RFQ)' : 'சலுகைக் கோரிக்கை (RFQ)'}</h1>
        <p>{lang === 'en' ? 'Post your business requirements and receive custom price quotes from verified local sellers.' : 'உங்கள் தேவைகளைப் பதிவிட்டு, உள்ளூர் வணிகர்களிடம் இருந்து சலுகை விலைகளைப் பெறுங்கள்.'}</p>
      </div>

      {/* Tabs */}
      <div className="tab-menu" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #cbd5e1', margin: '2rem 0', paddingBottom: '0.5rem' }}>
        <button className={`tab-btn ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}>
          {lang === 'en' ? 'Post a Requirement' : 'தேவையைப் பதிவிடு'}
        </button>
        <button className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`} onClick={() => { setActiveTab('open'); loadOpenRfqs(); }}>
          {lang === 'en' ? 'Open RFQs (Businesses View)' : 'திறந்த தேவைகள் (நிறுவனங்கள்)'}
        </button>
        <button className={`tab-btn ${activeTab === 'my-bids' ? 'active' : ''}`} onClick={() => { setActiveTab('my-bids'); }}>
          {lang === 'en' ? 'My Requests & Quotes' : 'என் தேவைகள் & சலுகைகள்'}
        </button>
      </div>

      {/* Tab Content: Post Requirement */}
      {activeTab === 'post' && (
        <div className="rfq-form-card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2>{lang === 'en' ? 'Post your product or service requirement' : 'உங்களுக்குத் தேவையான பொருள்/சேவையைப் பதிவிடவும்'}</h2>
          
          {postSuccess && <div className="alert-banner success">{postSuccess}</div>}
          {postError && <div className="alert-banner error">{postError}</div>}

          <form onSubmit={handlePostRequirement} style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>{lang === 'en' ? 'Product or Service Required *' : 'தேவைப்படும் பொருள் அல்லது சேவை *'}</label>
              <input type="text" value={productOrService} onChange={(e) => setProductOrService(e.target.value)} placeholder="e.g. 50 Office Chairs" required />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Your Phone/Email *' : 'தொடர்பு எண்/மின்னஞ்சல் *'}</label>
                <input type="text" value={buyerContact} onChange={(e) => setBuyerContact(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Category *' : 'பிரிவு *'}</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Office Supplies" required />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Quantity Required *' : 'தேவைப்படும் அளவு *'}</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Min Budget (₹)' : 'குறைந்தபட்ச வரவு செலவு (₹)'}</label>
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
              </div>
              <div className="form-group half">
                <label>{lang === 'en' ? 'Max Budget (₹)' : 'அதிகபட்ச வரவு செலவு (₹)'}</label>
                <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>{lang === 'en' ? 'Delivery Location *' : 'டெலிவரி செய்ய வேண்டிய இடம் *'}</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. T-Nagar, Chennai" required />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Detailed Specifications *' : 'கூடுதல் தகவல்கள் *'}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" placeholder="Describe quality, colors, certifications, delivery dates..." required></textarea>
            </div>

            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
              {lang === 'en' ? 'Post Requirement' : 'தேவையைப் பதிவிடு'}
            </button>
          </form>
        </div>
      )}

      {/* Tab Content: Open Requirements list */}
      {activeTab === 'open' && (
        <div>
          <h2>{lang === 'en' ? 'Active Requirements to Quote' : 'வணிகர்களின் சலுகைக்காக உள்ள தேவைகள்'}</h2>
          <div className="rfq-grid" style={{ display: 'grid', gap: '20px', marginTop: '1.5rem' }}>
            {rfqList.length === 0 ? (
              <p>{lang === 'en' ? 'No open requirements found.' : 'திறந்த தேவைகள் எதுவும் தற்சமயம் இல்லை.'}</p>
            ) : (
              rfqList.map(item => {
                const r = item.rfq;
                return (
                  <div key={r.id} className="rfq-list-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="rfq-cat-tag" style={{ background: '#fef3c7', color: '#854d0e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{r.category}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Posted: {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ margin: '8px 0', fontSize: '1.25rem' }}>{r.productOrService || r.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#475569' }}>{r.description}</p>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', margin: '1rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                      <span><strong>Qty:</strong> {r.quantity} units</span>
                      {r.budgetMin && (
                        <span><strong>Budget:</strong> ₹{r.budgetMin} - {r.budgetMax}</span>
                      )}
                      <span><strong>Location:</strong> {r.location}</span>
                    </div>
                    
                    <button className="quote-this-btn" onClick={() => { setBidSuccess(''); setBidError(''); setBiddingRfq(r); }} style={{ background: '#B3732A', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}>
                      {lang === 'en' ? 'Submit Quotation Bid' : 'சலுகையை வழங்கு'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Buyer lookups */}
      {activeTab === 'my-bids' && (
        <div>
          <h2>{lang === 'en' ? 'Lookup my posted requirements' : 'என் தேவைகள் மற்றும் பெறப்பட்ட சலுகைகள்'}</h2>
          <div style={{ display: 'flex', gap: '8px', margin: '1rem 0' }}>
            <input type="text" placeholder={lang === 'en' ? "Enter buyer name used during post..." : "பதிவிட்டபோது பயன்படுத்திய பெயரை உள்ளிடவும்..."} value={lookupName} onChange={(e) => setLookupName(e.target.value)} style={{ flexGrow: 1, padding: '10px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            <button onClick={handleLookupRequests} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>{lang === 'en' ? 'Find' : 'தேடு'}</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '2rem' }} className="detail-split-grid">
            {/* Buyer RFQs list */}
            <div>
              <h3>{lang === 'en' ? 'My Requirements List' : 'என் தேவைகளின் பட்டியல்'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '1rem' }}>
                {myRfqs.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No requirements found for this lookup name.</p>
                ) : (
                  myRfqs.map(item => (
                    <div key={item.rfq.id} className="rfq-list-card" style={{ background: selectedRfqForQuotes?.id === item.rfq.id ? '#f8fafc' : 'white', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleViewQuotesReceived(item.rfq)}>
                      <h4>{item.rfq.productOrService || item.rfq.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Status: {item.rfq.status} · Quotes count: {item.quotesCount}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quotes received details */}
            <div>
              <h3>{lang === 'en' ? 'Quotes Received' : 'பெறப்பட்ட சலுகைகள் விவரம்'}</h3>
              {selectedRfqForQuotes ? (
                <div style={{ marginTop: '1rem' }}>
                  {acceptSuccess && <div className="alert-banner success">{acceptSuccess}</div>}
                  {loadingQuotes ? (
                    <p>Loading quotations received...</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {quotesReceived.length === 0 ? (
                        <p style={{ color: '#64748b' }}>No quotes received for this requirement yet.</p>
                      ) : (
                        quotesReceived.map(q => (
                          <div key={q.id} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>₹{q.quotedPrice}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status: {q.status}</span>
                            </div>
                            <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#475569' }}>{q.notes || q.message || 'N/A'}</p>
                            {q.status === 'submitted' && selectedRfqForQuotes.status === 'open' && (
                              <button onClick={() => handleAcceptQuote(q.id)} style={{ background: '#16a34a', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}>
                                Accept Quote & Award Contract
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#64748b', marginTop: '1rem' }}>Select a requirement listing to view quotes received.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bidding Quote Modal */}
      {biddingRfq && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#B3732A' }}>
              <h3>Submit Quote Proposal</h3>
              <button className="modal-close" onClick={() => setBiddingRfq(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {bidSuccess ? (
                <div className="alert-banner success">{bidSuccess}</div>
              ) : (
                <form onSubmit={handleBidSubmit}>
                  {bidError && <div className="alert-banner error">{bidError}</div>}
                  
                  <div className="form-group">
                    <label>Select Your Registered Business *</label>
                    <select value={sellerBusinessId} onChange={(e) => setSellerBusinessId(e.target.value)} required>
                      <option value="">-- Choose Business Profile --</option>
                      {businessesList.map(b => (
                        <option key={b.id} value={b.id}>{b.businessName || b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Quoted Price Bid (₹) *</label>
                    <input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Proposal Message / Note *</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Describe delivery timeline, certifications, warranty details..." required></textarea>
                  </div>

                  <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '10px', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                    Submit Bid Quote
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

export default PublicRfq;
