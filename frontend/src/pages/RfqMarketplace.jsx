import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import './RfqMarketplace.css';


const RfqMarketplace = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const defaultRfqs = [
    {
      rfq: { id: 1, title: "Need 500 Custom Printed T-Shirts", category: "Printing", description: "High quality cotton t-shirts with front and back print. Sizes: S to XXL.", quantity: 500, budget: "50,000 - 80,000", location: "Chennai, TN", deadline: "2026-05-25T23:59:59", status: "open" },
      quotesCount: 12
    },
    {
      rfq: { id: 2, title: "Interior Work for 3BHK Apartment", category: "Interior", description: "Modular kitchen, wardrobes, false ceiling and painting work.", quantity: 1, budget: "2,00,000 - 3,50,000", location: "Tambaram, Chennai", deadline: "2026-05-28T23:59:59", status: "open" },
      quotesCount: 8
    },
    {
      rfq: { id: 3, title: "AC Maintenance for 10 Offices", category: "Services", description: "Quarterly maintenance for 10 split AC units in office spaces.", quantity: 10, budget: "15,000 - 25,000", location: "Guindy, Chennai", deadline: "2026-05-26T23:59:59", status: "open" },
      quotesCount: 5
    }
  ];

  // RFQ Lists State
  const [rfqs, setRfqs] = useState(defaultRfqs);
  const [loading, setLoading] = useState(true);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quotesList, setQuotesList] = useState([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState('all');

  // Submit quote state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteTimeline, setQuoteTimeline] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteAttachment, setQuoteAttachment] = useState('');

  // Post RFQ state
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Printing');
  const [newQty, setNewQty] = useState(1);
  const [newBudget, setNewBudget] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetchApi('/rfq')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRfqs(data);
        } else {
          setRfqs(defaultRfqs);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setRfqs(defaultRfqs);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRfqClick = (item) => {
    setSelectedRfq(item.rfq);
    
    // Fetch proposals
    fetchApi(`/rfq/${item.rfq.id}/quotes`)
      .then(quotes => {
        if (Array.isArray(quotes)) {
          setQuotesList(quotes);
        }
      })
      .catch(() => {
        // Fallbacks matching mockup bids list
        setQuotesList([
          { quote: { id: 101, rfqId: item.rfq.id, quotedPrice: 48000.0, timelineDays: 10, notes: "We use premium combed cotton with durable screen printing. Delivery is guaranteed within 10 days.", status: "shortlisted" }, seller: { businessName: "Vignesh Printers", addressLocality: "Anna Nagar, Chennai" } },
          { quote: { id: 102, rfqId: item.rfq.id, quotedPrice: 52000.0, timelineDays: 7, notes: "Express delivery support included. Custom tagging available.", status: "pending" }, seller: { businessName: "Chennai Screen Arts", addressLocality: "T. Nagar, Chennai" } }
        ]);
      });
  };

  const handlePostRfq = (e) => {
    e.preventDefault();
    fetchApi('/rfq', {
      method: 'POST',
      body: JSON.stringify({
        title: newTitle,
        category: newCategory,
        quantity: Number(newQty),
        budget: newBudget,
        location: newLoc,
        deadline: newDeadline ? new Date(newDeadline).toISOString() : new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        description: newDesc
      })
    })
      .then(() => {
        setShowRfqModal(false);
        loadData();
        setNewTitle('');
        setNewDesc('');
      })
      .catch(() => {
        // Simulate local append
        const mockRfq = {
          rfq: {
            id: Date.now(),
            title: newTitle,
            category: newCategory,
            quantity: Number(newQty),
            budget: newBudget,
            location: newLoc,
            deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
            description: newDesc,
            status: "open"
          },
          quotesCount: 0
        };
        setRfqs(prev => [mockRfq, ...prev]);
        setShowRfqModal(false);
      });
  };

  const handleSubmitQuote = (e) => {
    e.preventDefault();
    if (!selectedRfq) return;

    fetchApi(`/rfq/${selectedRfq.id}/quotes`, {
      method: 'POST',
      body: JSON.stringify({
        sellerBusinessId: 1, // Assume first merchant business
        quotedPrice: Number(quotePrice),
        timelineDays: Number(quoteTimeline),
        notes: quoteNotes,
        proposalUrl: quoteAttachment
      })
    })
      .then(() => {
        setShowQuoteForm(false);
        setQuotePrice('');
        setQuoteTimeline('');
        setQuoteNotes('');
        handleRfqClick({ rfq: selectedRfq });
      })
      .catch(() => {
        // simulate local addition
        const mockQuote = {
          quote: {
            id: Date.now(),
            quotedPrice: Number(quotePrice),
            timelineDays: Number(quoteTimeline),
            notes: quoteNotes,
            status: "pending"
          },
          seller: { businessName: "My Local Shop", addressLocality: "Chennai" }
        };
        setQuotesList(prev => [mockQuote, ...prev]);
        setShowQuoteForm(false);
        setQuotePrice('');
        setQuoteTimeline('');
        setQuoteNotes('');
      });
  };

  const handleQuoteStatusChange = (quoteId, status) => {
    fetchApi(`/rfq/quotes/${quoteId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
      .then(() => {
        if (selectedRfq) handleRfqClick({ rfq: selectedRfq });
        loadData();
      })
      .catch(() => {
        // local toggle state update fallback
        setQuotesList(prev => prev.map(q => q.quote.id === quoteId ? { ...q, quote: { ...q.quote, status } } : q));
      });
  };

  const filteredRfqs = rfqs.filter(item => {
    const r = item.rfq;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    const matchesLoc = selectedLoc === 'all' || r.location.includes(selectedLoc);
    return matchesSearch && matchesCat && matchesLoc;
  });

  const categories = [
    { name: 'Construction', count: 125, icon: 'fa-building', color: 'text-orange-500' },
    { name: 'Printing', count: 84, icon: 'fa-print', color: 'text-blue-500' },
    { name: 'Fabrication', count: 67, icon: 'fa-tools', color: 'text-green-500' },
    { name: 'Events', count: 53, icon: 'fa-birthday-cake', color: 'text-pink-500' },
    { name: 'IT Services', count: 41, icon: 'fa-laptop-code', color: 'text-indigo-500' }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', paddingBottom: '60px' }}>
      
      {/* Standalone Dashboard Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-bars"></i>
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '850', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>RFQ - Request for Quote</h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: '500' }}>Post what you need. Get multiple quotes from verified businesses.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Location button */}
          <button 
            style={{
              padding: '8px 18px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <i className="fas fa-map-marker-alt text-gray-400"></i> Chennai, Tamil Nadu <i className="fas fa-chevron-down text-[8px] text-gray-400"></i>
          </button>
          
          {/* Notification Button */}
          <button 
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <i className="far fa-bell" style={{ fontSize: '14px' }}></i>
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '8px',
              fontWeight: '900',
              borderRadius: '50%',
              width: '15px',
              height: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>3</span>
          </button>
          
          {/* Chat Button */}
          <button 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <i className="far fa-comment-alt" style={{ fontSize: '14px' }}></i>
          </button>
          
          {/* User profile info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px 6px 6px',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <span style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>SJ</span>
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', display: 'block' }}>Sharmitha J</span>
              <span style={{ fontSize: '9px', fontWeight: '700', color: '#d97706', display: 'block' }}>Premium</span>
            </div>
            <i className="fas fa-chevron-down" style={{ fontSize: '8px', color: '#94a3b8', marginLeft: '4px' }}></i>
          </div>
        </div>
      </div>

      <div 
        className="rfq-module-container" 
        style={{ 
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >

      <div className="rfq-content-columns-grid">
        
        {/* COLUMN 1-3: Left Main section */}
        <div className="rfq-main-content-column">
          
          {/* Hero Banner Card */}
          <div className="rfq-hero-banner">
            <div className="rfq-hero-left">
              <h2 className="rfq-hero-title">Get the best quotes<br/>from <span className="text-[#6366f1]">verified businesses</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#e2e8f0', fontWeight: '600' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    <i className="fas fa-check"></i>
                  </span>
                  <span><strong>Verified Businesses</strong> <span style={{ opacity: 0.75, fontWeight: 'normal', marginLeft: '6px' }}>| KYC verified & trusted</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#e2e8f0', fontWeight: '600' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    <i className="fas fa-check"></i>
                  </span>
                  <span><strong>Compare Quotes</strong> <span style={{ opacity: 0.75, fontWeight: 'normal', marginLeft: '6px' }}>| Choose the best deal</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: '#e2e8f0', fontWeight: '600' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    <i className="fas fa-check"></i>
                  </span>
                  <span><strong>Save Time & Money</strong> <span style={{ opacity: 0.75, fontWeight: 'normal', marginLeft: '6px' }}>| Competitive pricing</span></span>
                </div>
              </div>
            </div>
            
            {/* Quote Graphic Clipboard Illustration overlay */}
            <div className="rfq-hero-graphic-wrap" style={{
              background: '#4f46e5',
              borderRadius: '24px',
              padding: '24px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              width: '200px',
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.5px' }}>RFQ</span>
                <span style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fbbf24',
                  color: '#1e1b4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: '900'
                }}>✓</span>
              </div>
              
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8' }}>Quote</span>
                <strong style={{ fontSize: '11px', fontWeight: '800', color: '#10b981' }}>₹45,000</strong>
              </div>
              
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '2px solid #6366f1',
                boxShadow: '0 8px 16px rgba(99,102,241,0.15)',
                transform: 'scale(1.05)'
              }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#6366f1' }}>Quote</span>
                <strong style={{ fontSize: '11px', fontWeight: '900', color: '#6366f1' }}>₹38,500</strong>
              </div>
              
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8' }}>Quote</span>
                <strong style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>₹50,200</strong>
              </div>
            </div>
          </div>

          {/* Floating Search Card */}
          <div className="rfq-search-bar-pill">
            <div className="rfq-search-field-pill">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search RFQ by title, category, or keyword..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="rfq-search-field-pill" style={{ paddingLeft: '12px' }}>
              <select 
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                style={{ paddingLeft: '8px' }}
              >
                <option value="all">{lang === 'en' ? 'All Categories' : 'அனைத்துப் பிரிவுகள்'}</option>
                <option value="Printing">{lang === 'en' ? 'Printing' : 'அச்சிடுதல்'}</option>
                <option value="Interior">{lang === 'en' ? 'Interior' : 'உள் அலங்காரம்'}</option>
                <option value="Services">{lang === 'en' ? 'Services' : 'சேவைகள்'}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-gray-400">
                <i className="fas fa-chevron-down text-[8px]"></i>
              </div>
            </div>

            <div className="rfq-search-field-pill" style={{ paddingLeft: '12px' }}>
              <select 
                value={selectedLoc}
                onChange={(e) => setSelectedLoc(e.target.value)}
                style={{ paddingLeft: '8px' }}
              >
                <option value="all">All Locations</option>
                <option value="Chennai">Chennai</option>
                <option value="TN">Tamil Nadu</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-gray-400">
                <i className="fas fa-chevron-down text-[8px]"></i>
              </div>
            </div>
            
            <button className="rfq-search-btn-pill" style={{ background: '#6366f1' }}>
              {lang === 'en' ? 'Search' : 'தேடுக'}
            </button>
          </div>

          {/* Categories Row */}
          <div className="rfq-quick-cats-cards-row">
            <button 
              onClick={() => { setSelectedCat('all'); setSelectedLoc('all'); }}
              className={`rfq-quick-cat-card-btn ${selectedCat === 'all' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'all' ? '#f5f3ff' : '#ffffff',
                borderColor: selectedCat === 'all' ? '#6366f1' : '#e2e8f0',
                color: '#6366f1',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800' }}>All Categories</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#8b5cf6', fontWeight: '700' }}>All Types</p>
              </div>
            </button>
            
            <button 
              onClick={() => setSelectedCat('Construction')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Construction' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'Construction' ? '#ffedd5' : '#fff7ed',
                borderColor: selectedCat === 'Construction' ? '#ea580c' : '#ffedd5',
                color: '#c2410c',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="rfq-quick-cat-card-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <i className="fas fa-building text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#431407' }}>Construction</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#ea580c', fontWeight: '700' }}>125 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Printing')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Printing' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'Printing' ? '#dbeafe' : '#eff6ff',
                borderColor: selectedCat === 'Printing' ? '#2563eb' : '#dbeafe',
                color: '#1d4ed8',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="rfq-quick-cat-card-icon-box" style={{ background: '#dbeafe', color: '#2563eb' }}>
                <i className="fas fa-print text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#172554' }}>Printing</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#2563eb', fontWeight: '700' }}>84 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Fabrication')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Fabrication' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'Fabrication' ? '#dcfce7' : '#f0fdf4',
                borderColor: selectedCat === 'Fabrication' ? '#16a34a' : '#dcfce7',
                color: '#15803d',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="rfq-quick-cat-card-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <i className="fas fa-tools text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#052e16' }}>Fabrication</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#16a34a', fontWeight: '700' }}>67 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Events')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Events' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'Events' ? '#fce7f3' : '#fdf2f8',
                borderColor: selectedCat === 'Events' ? '#db2777' : '#fce7f3',
                color: '#be185d',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="rfq-quick-cat-card-icon-box" style={{ background: '#fce7f3', color: '#db2777' }}>
                <i className="fas fa-birthday-cake text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#4c0519' }}>Events</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#db2777', fontWeight: '700' }}>53 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Services')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Services' ? 'active' : ''}`}
              style={{
                background: selectedCat === 'Services' ? '#e0e7ff' : '#eef2ff',
                borderColor: selectedCat === 'Services' ? '#4f46e5' : '#e0e7ff',
                color: '#4338ca',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span className="rfq-quick-cat-card-icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                <i className="fas fa-laptop text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#1e1b4b' }}>IT Services</h4>
                <p className="rfq-quick-cat-card-count" style={{ margin: 0, fontSize: '9px', color: '#4f46e5', fontWeight: '700' }}>41 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => alert("Opening all marketplace categories...")} 
              className="rfq-quick-cat-card-btn"
              style={{
                background: '#ffffff',
                borderColor: '#e2e8f0',
                color: '#1e293b',
                padding: '12px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '100px'
              }}
            >
              <span className="rfq-quick-cat-card-name" style={{ margin: 0, fontSize: '11px', fontWeight: '800' }}>More</span>
              <i className="fas fa-chevron-right text-[10px] text-gray-400 ml-1"></i>
            </button>
          </div>

          {/* Tab List Header */}
          <div className="flex flex-wrap justify-between items-center border-b border-gray-150" style={{ marginTop: '20px' }}>
            <div className="rfq-tabs-container" style={{ width: 'auto', borderBottom: 'none', marginTop: 0 }}>
              {['Open RFQs', 'My RFQs', 'Quotes Received', 'Closed / Awarded'].map((t, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    if (t === 'Open RFQs') return;
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: '/my-rfqs' } });
                    } else {
                      navigate('/my-rfqs');
                    }
                  }}
                  className={`rfq-tab-btn ${t === 'Open RFQs' ? 'active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-5 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 font-bold">Sort by:</span>
                <select className="bg-transparent border-0 font-extrabold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer px-1">
                  <option>Latest</option>
                  <option>Budget: High to Low</option>
                  <option>Quotes: Most to Least</option>
                </select>
              </div>
              <button 
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: theme === 'dark' ? '#cbd5e1' : '#475569'
                }}
              >
                <i className="fas fa-sliders-h text-[11px] text-gray-500"></i> Filters
              </button>
            </div>
          </div>

          {/* List of RFQs */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse rounded-2xl h-36 bg-gray-500/10 border border-gray-700/10 p-4"></div>
              ))}
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-gray-200">
              <i className="fas fa-file-signature text-4xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">No RFQs found</h3>
              <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRfqs.map(item => {
                const r = item.rfq;
                const isPrinting = r.category.toLowerCase() === 'printing';
                const isInterior = r.category.toLowerCase() === 'interior';
                
                // Custom images mapping
                let bannerImg = 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300';
                let labelBg = 'bg-purple-100 text-purple-700';
                if (isInterior) {
                  bannerImg = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300';
                  labelBg = 'bg-indigo-100 text-indigo-700';
                } else if (r.category.toLowerCase() === 'services') {
                  bannerImg = 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=300';
                  labelBg = 'bg-blue-100 text-blue-700';
                }

                const catColors = {
                  printing: { bg: '#f5f3ff', text: '#7c3aed' },
                  interior: { bg: '#eff6ff', text: '#2563eb' },
                  services: { bg: '#ecfdf5', text: '#059669' },
                  construction: { bg: '#fff7ed', text: '#ea580c' },
                };
                const currentCatColor = catColors[r.category.toLowerCase()] || { bg: '#f1f5f9', text: '#475569' };

                return (
                  <div 
                    key={r.id}
                    onClick={() => handleRfqClick(item)}
                    className="rfq-listing-row-card"
                    style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)', padding: '20px 24px', display: 'flex', gap: '20px', marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); alert("Saved RFQ!"); }}
                      className="text-gray-400 hover:text-[#6366f1] bg-transparent border-0 cursor-pointer p-0"
                      style={{ position: 'absolute', top: '20px', right: '20px' }}
                    >
                      <i className="far fa-bookmark text-sm"></i>
                    </button>

                    <div className="flex gap-4 flex-1">
                      <div className="rfq-listing-row-img" style={{ backgroundImage: `url(${bannerImg})`, width: '100px', height: '100px', borderRadius: '12px', backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>
                      <div className="rfq-listing-row-details" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div className="flex justify-between items-start">
                          <span 
                            style={{
                              background: currentCatColor.bg,
                              color: currentCatColor.text,
                              fontSize: '9px',
                              fontWeight: '800',
                              letterSpacing: '0.6px',
                              textTransform: 'uppercase',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              display: 'inline-block'
                            }}
                          >
                            {r.category}
                          </span>
                        </div>
                        <h4 className="rfq-listing-row-title" style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px 0' }}>{r.title}</h4>
                        <p className="rfq-listing-row-desc" style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.4' }}>{r.description}</p>
                        
                        <div className="rfq-listing-row-tags" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#475569', fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-box text-gray-400"></i> {r.quantity} {r.category === 'Interior' ? 'Project' : 'Units'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-wallet text-gray-400"></i> ₹{r.budget}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-map-marker-alt text-gray-400"></i> {r.location}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-gray-400 font-medium" style={{ marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                          <span className="flex items-center gap-1.5"><i className="far fa-clock text-gray-400"></i> Response by {new Date(r.deadline).getDate()} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date(r.deadline).getMonth()]} {new Date(r.deadline).getFullYear()}</span>
                          <span className="flex items-center gap-1.5"><i className="far fa-user text-gray-400"></i> Posted {r.id === 1 ? '2 hours ago' : r.id === 2 ? '5 hours ago' : '1 day ago'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right hand quotes summary */}
                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-center text-center px-4 md:border-l border-gray-100 dark:border-gray-800/20 min-w-[140px]">
                      <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none" style={{ margin: 0 }}>{item.quotesCount}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1.5">Quotes Received</p>
                      </div>
                      <button className="mt-3.5 py-2 px-5 rounded-xl border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white text-[10px] font-bold transition bg-transparent cursor-pointer">
                        View Quotes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          <button className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-150 text-gray-600 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm">
            Load More RFQs <i className="fas fa-chevron-down text-[10px]"></i>
          </button>

        </div>

        {/* COLUMN 4: Right Sidebar */}
        <div className="rfq-sidebar-column">
          
          {/* Quick Actions */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <h3 className="font-black text-sm text-slate-800 dark:text-white mb-4">Quick Actions</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: '/rfq' } });
                  } else {
                    setShowRfqModal(true);
                  }
                }}
                onMouseEnter={() => setHover1(true)}
                onMouseLeave={() => setHover1(false)}
                className="rfq-quick-action-link-card primary"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  textAlign: 'left',
                  padding: '20px 24px',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  boxShadow: hover1 ? '0 8px 24px rgba(99, 102, 241, 0.35)' : '0 4px 18px rgba(99, 102, 241, 0.25)',
                  transform: hover1 ? 'translateY(-3px) scale(1.01)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '4px'
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                    +
                  </span>
                  <div>
                    <span className="font-black text-xs block">Post a New RFQ</span>
                    <span className="text-[9px] text-indigo-200">I Need Something</span>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-indigo-200 text-[10px]"></i>
              </button>

              <button 
                onClick={() => alert("Navigating to Browse requirements...")}
                onMouseEnter={() => setHover2(true)}
                onMouseLeave={() => setHover2(false)}
                className="rfq-quick-action-link-card secondary"
                style={{
                  width: '100%',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  outline: 'none',
                  textAlign: 'left',
                  padding: '20px 24px',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: theme === 'dark' ? '#111827' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#1e293b',
                  boxShadow: hover2 ? '0 8px 20px rgba(99, 102, 241, 0.08)' : '0 4px 10px rgba(0, 0, 0, 0.02)',
                  transform: hover2 ? 'translateY(-3px) scale(1.01)' : 'none',
                  borderColor: hover2 ? '#6366f1' : 'var(--border-color, #e2e8f0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#111827] flex items-center justify-center text-gray-500">
                    <i className="far fa-file-alt text-xs"></i>
                  </span>
                  <div>
                    <span className="font-black text-xs block text-slate-800 dark:text-white">Browse Open RFQs</span>
                    <span className="text-[9px] text-gray-400">Find requirements</span>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
              </button>
            </div>
          </div>

          {/* RFQ Stats */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">RFQ Stats</h3>
              <select className="bg-transparent border-0 font-bold text-xs text-gray-500 focus:outline-none cursor-pointer">
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="rfq-stats-grid">
              <div className="rfq-stat-badge-box" style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '12px' }}>
                <h4 className="rfq-stat-badge-num" style={{ color: '#6d28d9' }}>12</h4>
                <p className="rfq-stat-badge-lbl" style={{ color: '#7c3aed' }}>RFQs Posted</p>
              </div>
              <div className="rfq-stat-badge-box" style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px' }}>
                <h4 className="rfq-stat-badge-num" style={{ color: '#1d4ed8' }}>18</h4>
                <p className="rfq-stat-badge-lbl" style={{ color: '#2563eb' }}>Quotes Received</p>
              </div>
              <div className="rfq-stat-badge-box" style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '12px' }}>
                <h4 className="rfq-stat-badge-num" style={{ color: '#047857' }}>2</h4>
                <p className="rfq-stat-badge-lbl" style={{ color: '#059669' }}>Awarded</p>
              </div>
              <div className="rfq-stat-badge-box" style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px' }}>
                <h4 className="rfq-stat-badge-num" style={{ color: '#b45309' }}>1</h4>
                <p className="rfq-stat-badge-lbl" style={{ color: '#d97706' }}>In Progress</p>
              </div>
            </div>

            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: '/my-rfqs' } });
                } else {
                  navigate('/my-rfqs'); 
                }
              }} 
              className="text-xs text-[#6366f1] hover:underline font-bold block text-center"
              style={{ marginTop: '8px' }}
            >
              View All My RFQs &rarr;
            </a>
          </div>

          {/* Recent RFQs */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-sm text-slate-800 dark:text-white">Recent RFQs</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Viewing all recent RFQs..."); }} className="text-xs text-[#6366f1] hover:underline font-bold">View All</a>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <i className="far fa-file-alt text-xs"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300" style={{ fontSize: '11px' }}>Need LED Sign Board</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">T. Nagar, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-orange-500 block">2 Quotes</span>
                  <span className="text-[8px] text-gray-400">2h ago</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <span className="w-8 h-8 rounded-lg bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center flex-shrink-0">
                    <i className="far fa-file-alt text-xs"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300" style={{ fontSize: '11px' }}>Office Cleaning Services</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">Anna Nagar, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#6366f1] block">4 Quotes</span>
                  <span className="text-[8px] text-gray-400">5h ago</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                    <i className="far fa-file-alt text-xs"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300" style={{ fontSize: '11px' }}>Bulk Office Stationery</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">Guindy, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#6366f1] block">3 Quotes</span>
                  <span className="text-[8px] text-gray-400">1d ago</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2.5 items-center">
                  <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <i className="far fa-file-alt text-xs"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300" style={{ fontSize: '11px' }}>Catering for Event</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">ECR, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#6366f1] block">6 Quotes</span>
                  <span className="text-[8px] text-gray-400">1d ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* For Businesses */}
          <div className="p-5 rounded-2xl border shadow-sm bg-gradient-to-br from-[#e0e7ff] to-[#f5f3ff] dark:from-slate-900 dark:to-purple-950/20 border-indigo-100/50 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-200" style={{ margin: '0 0 4px 0' }}>For Businesses</h4>
              <p className="text-[10px] text-indigo-750 dark:text-indigo-400 leading-normal" style={{ margin: '0 0 10px 0' }}>Respond to RFQs and grow your business</p>
              <button 
                type="button" 
                onClick={() => alert("Opening seller dashboard panel...")}
                className="py-2 px-3 bg-white text-indigo-650 hover:bg-[#6366f1] hover:text-white border border-[#6366f1]/20 font-bold text-[10px] rounded-lg transition cursor-pointer shadow-sm"
              >
                View RFQs for Businesses
              </button>
            </div>
            <div className="w-14 h-14 flex-shrink-0 text-indigo-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.83l5 4.5V18H7v-5.67l5-4.5z"/>
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* RFQ PROPOSALS DETAILS DIALOG MODAL */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold uppercase tracking-wider text-red-500">RFQ Quotation Center</h3>
              <button onClick={() => { setSelectedRfq(null); setQuotesList([]); setShowQuoteForm(false); }} className="text-2xl font-bold">&times;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left detail column */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold mb-2">{selectedRfq.title}</h2>
                  <p className="text-xs text-gray-500">{selectedRfq.description}</p>
                </div>

                {/* Proposals submitted */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm border-b border-gray-800/10 pb-2">Quotes Submitted by Sellers</h3>
                  
                  {quotesList.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No quotes submitted yet. Submit your bid below!</p>
                  ) : (
                    quotesList.map((q, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          padding: '20px',
                          borderRadius: '16px',
                          border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                        }}
                      >
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <h4 className="font-bold text-sm text-indigo-500">{q.seller.businessName}</h4>
                            <p className="text-[10px] text-gray-500"><i className="fas fa-map-marker-alt"></i> {q.seller.addressLocality}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-red-500">₹{q.quote.quotedPrice.toLocaleString()}</span>
                            <p className="text-[10px] text-gray-400">Timeline: {q.quote.timelineDays} days</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{q.quote.notes}</p>
                        
                        <div 
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            paddingTop: '16px',
                            borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                            marginTop: '4px'
                          }}
                        >
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            q.quote.status === 'shortlisted' ? 'bg-amber-600/10 text-amber-500' : 
                            q.quote.status === 'accepted' ? 'bg-green-600/10 text-green-500' : 'bg-gray-600/10 text-gray-500'
                          }`}>
                            {q.quote.status}
                          </span>
                          
                          <div className="flex flex-wrap gap-2 justify-end">
                            {q.quote.status === 'pending' && (
                              <button 
                                onClick={() => handleQuoteStatusChange(q.quote.id, 'shortlisted')}
                                className="bg-amber-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] hover:bg-amber-600 transition cursor-pointer shadow-sm"
                              >
                                Shortlist
                              </button>
                            )}
                            {(q.quote.status === 'pending' || q.quote.status === 'shortlisted') && (
                              <button 
                                onClick={() => handleQuoteStatusChange(q.quote.id, 'accepted')}
                                className="bg-green-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] hover:bg-green-700 transition cursor-pointer shadow-sm"
                              >
                                Accept &amp; Award
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submit bid sidebar form */}
              <div className="space-y-6">
                <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-bold text-sm mb-3">Post Your Bid proposal</h3>
                  {!showQuoteForm ? (
                    <button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login', { state: { from: '/rfq' } });
                        } else {
                          setShowQuoteForm(true);
                        }
                      }}
                      className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-red-700 transition"
                    >
                      Submit a Quotation
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitQuote} className="space-y-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Quoted Price (₹) *</label>
                        <input type="number" required placeholder="Price" className="bg-transparent border border-gray-700/30 p-2 rounded focus:outline-none" value={quotePrice} onChange={(e)=>setQuotePrice(e.target.value)}/>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Timeline (Days) *</label>
                        <input type="number" required placeholder="Days to deliver" className="bg-transparent border border-gray-700/30 p-2 rounded focus:outline-none" value={quoteTimeline} onChange={(e)=>setQuoteTimeline(e.target.value)}/>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Proposal Notes</label>
                        <textarea rows="2" placeholder="Tell us why we should choose you..." className="bg-transparent border border-gray-700/30 p-2 rounded focus:outline-none" value={quoteNotes} onChange={(e)=>setQuoteNotes(e.target.value)}></textarea>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold">Proposal PDF URL</label>
                        <input type="url" placeholder="https://example.com/proposal.pdf" className="bg-transparent border border-gray-700/30 p-2 rounded focus:outline-none" value={quoteAttachment} onChange={(e)=>setQuoteAttachment(e.target.value)}/>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setShowQuoteForm(false)} className="w-1/2 py-2 rounded border border-gray-700/30 font-bold">Cancel</button>
                        <button type="submit" className="w-1/2 bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">Submit Quote</button>
                      </div>
                    </form>
                  )}
                </div>

                <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-bold text-sm mb-3">RFQ Metadata</h3>
                  <div className="space-y-2 text-xs text-gray-500">
                    <p>Estimated Quantity: <strong className="text-gray-400">{selectedRfq.quantity}</strong></p>
                    <p>Delivery Location: <strong className="text-gray-400">{selectedRfq.location}</strong></p>
                    <p>Expiry Deadline: <strong className="text-gray-400">{new Date(selectedRfq.deadline).toLocaleString()}</strong></p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* POST RFQ MODAL */}
      {showRfqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handlePostRfq} className={`w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold uppercase tracking-wider text-red-500">Post RFQ Requirement</h3>
              <button type="button" onClick={() => setShowRfqModal(false)} className="text-2xl font-bold">&times;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold">RFQ Title *</label>
                <input type="text" required placeholder="e.g. Need 500 Custom T-Shirts" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Category *</label>
                <select className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`} value={newCategory} onChange={(e)=>setNewCategory(e.target.value)}>
                  <option value="Printing">{lang === 'en' ? 'Printing' : 'அச்சிடுதல்'}</option>
                  <option value="Construction">{lang === 'en' ? 'Construction' : 'கட்டுமானம்'}</option>
                  <option value="Fabrication">{lang === 'en' ? 'Fabrication' : 'உலோக தயாரிப்பு'}</option>
                  <option value="Events">{lang === 'en' ? 'Events' : 'நிகழ்ச்சிகள்'}</option>
                  <option value="Services">{lang === 'en' ? 'Services' : 'சேவைகள்'}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Quantity Required *</label>
                <input type="number" required className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newQty} onChange={(e)=>setNewQty(Number(e.target.value))}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Target Budget (₹) *</label>
                <input type="text" required placeholder="e.g. 50,000 - 80,000" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBudget} onChange={(e)=>setNewBudget(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Delivery Location *</label>
                <input type="text" required placeholder="e.g. Chennai, TN" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newLoc} onChange={(e)=>setNewLoc(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Bidding Deadline *</label>
                <input type="date" required className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newDeadline} onChange={(e)=>setNewDeadline(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold">Detailed Requirements Description *</label>
                <textarea required rows="4" placeholder="Detail out all specifications, dimensions, material quality details, etc..." className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newDesc} onChange={(e)=>setNewDesc(e.target.value)}></textarea>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowRfqModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-700/30">Cancel</button>
              <button type="submit" className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">Publish RFQ</button>
            </div>
          </form>
        </div>
      )}

    </div>
  </div>
  );
};

export default RfqMarketplace;
