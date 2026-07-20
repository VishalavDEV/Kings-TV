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
    <div className="container mx-auto rfq-module-container" style={{ paddingBottom: '60px', paddingTop: '20px' }}>

      <div className="rfq-content-columns-grid">
        
        {/* COLUMN 1-3: Left Main section */}
        <div className="rfq-main-content-column">
          
          {/* Hero Banner Card */}
          <div className="rfq-hero-banner">
            <div className="rfq-hero-left">
              <h2 className="rfq-hero-title">Get the best quotes<br/>from <span className="text-[#6366f1]">verified businesses</span></h2>
              <div className="rfq-hero-pills">
                <div className="rfq-hero-pill-badge">
                  <i className="fas fa-check-circle"></i>
                  <span>Verified Businesses - KYC verified & trusted</span>
                </div>
                <div className="rfq-hero-pill-badge">
                  <i className="fas fa-check-circle"></i>
                  <span>Compare Quotes - Choose the best deal</span>
                </div>
                <div className="rfq-hero-pill-badge">
                  <i className="fas fa-check-circle"></i>
                  <span>Save Time & Money - Competitive pricing</span>
                </div>
              </div>
            </div>
            
            {/* Quote Graphic Illustration overlay */}
            <div className="rfq-hero-graphic-wrap">
              <div className="rfq-hero-graphic-card">
                <span>Quote</span>
                <strong>₹45,000</strong>
              </div>
              <div className="rfq-hero-graphic-card best">
                <span>Quote</span>
                <strong style={{ color: '#6366f1' }}>₹38,500</strong>
              </div>
              <div className="rfq-hero-graphic-card">
                <span>Quote</span>
                <strong>₹50,200</strong>
              </div>
            </div>
          </div>

          {/* Floating Search Card */}
          <div className={`p-4 rounded-2xl border shadow-lg -mt-8 relative z-20 mx-4 ${
            theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2 flex items-center px-3 bg-gray-50 dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-gray-800">
                <i className="fas fa-search text-gray-400 mr-2.5"></i>
                <input 
                  type="text" 
                  placeholder="Search RFQ by title, category, or keyword..." 
                  className="w-full bg-transparent py-2.5 text-xs focus:outline-none text-gray-800 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <select 
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className={`w-full p-2.5 pr-8 rounded-xl border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#111827] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="all">{lang === 'en' ? 'All Categories' : 'அனைத்துப் பிரிவுகள்'}</option>
                  <option value="Printing">{lang === 'en' ? 'Printing' : 'அச்சிடுதல்'}</option>
                  <option value="Interior">{lang === 'en' ? 'Interior' : 'உள் அலங்காரம்'}</option>
                  <option value="Services">{lang === 'en' ? 'Services' : 'சேவைகள்'}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-450">
                  <i className="fas fa-chevron-down text-[8px]"></i>
                </div>
              </div>

              <div className="relative">
                <select 
                  value={selectedLoc}
                  onChange={(e) => setSelectedLoc(e.target.value)}
                  className={`w-full p-2.5 pr-8 rounded-xl border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#111827] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="all">All Locations</option>
                  <option value="Chennai">Chennai</option>
                  <option value="TN">Tamil Nadu</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-450">
                  <i className="fas fa-chevron-down text-[8px]"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Row */}
          <div className="rfq-quick-cats-cards-row">
            <button 
              onClick={() => { setSelectedCat('all'); setSelectedLoc('all'); }}
              className={`rfq-quick-cat-card-btn ${selectedCat === 'all' ? 'active' : ''}`}
            >
              <h4 className="rfq-quick-cat-card-name">All Categories</h4>
              <p className="rfq-quick-cat-card-count">All Types</p>
            </button>
            
            <button 
              onClick={() => setSelectedCat('Construction')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Construction' ? 'active' : ''}`}
            >
              <span className="rfq-quick-cat-card-icon-box text-orange-500">
                <i className="fas fa-building text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name">Construction</h4>
                <p className="rfq-quick-cat-card-count">125 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Printing')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Printing' ? 'active' : ''}`}
            >
              <span className="rfq-quick-cat-card-icon-box text-blue-500">
                <i className="fas fa-print text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name">Printing</h4>
                <p className="rfq-quick-cat-card-count">84 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Fabrication')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Fabrication' ? 'active' : ''}`}
            >
              <span className="rfq-quick-cat-card-icon-box text-green-500">
                <i className="fas fa-tools text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name">Fabrication</h4>
                <p className="rfq-quick-cat-card-count">67 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Events')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Events' ? 'active' : ''}`}
            >
              <span className="rfq-quick-cat-card-icon-box text-pink-500">
                <i className="fas fa-birthday-cake text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name">Events</h4>
                <p className="rfq-quick-cat-card-count">53 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => setSelectedCat('Services')} 
              className={`rfq-quick-cat-card-btn ${selectedCat === 'Services' ? 'active' : ''}`}
            >
              <span className="rfq-quick-cat-card-icon-box text-indigo-500">
                <i className="fas fa-laptop text-xs"></i>
              </span>
              <div>
                <h4 className="rfq-quick-cat-card-name">IT Services</h4>
                <p className="rfq-quick-cat-card-count">41 RFQs</p>
              </div>
            </button>

            <button 
              onClick={() => alert("Opening all marketplace categories...")} 
              className="rfq-quick-cat-card-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px' }}
            >
              <span className="rfq-quick-cat-card-name" style={{ margin: 0 }}>More</span>
              <i className="fas fa-chevron-right text-[10px] text-gray-400 ml-1"></i>
            </button>
          </div>

          {/* Tab List Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 text-xs mt-4">
            <div className="flex flex-wrap gap-2">

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
                  className={`px-4 py-2.5 rounded-xl font-bold border transition whitespace-nowrap cursor-pointer ${
                    t === 'Open RFQs' 
                      ? 'bg-[#f5f3ff] border-[#ddd6fe]/60 text-[#7c3aed]' 
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-bold">Sort by:</span>
                <select className="bg-transparent border-0 font-extrabold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer">
                  <option>Latest</option>
                  <option>Budget: High to Low</option>
                  <option>Quotes: Most to Least</option>
                </select>
              </div>
              <button className="px-3 py-2 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 font-bold flex items-center gap-1.5 cursor-pointer">
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

                return (
                  <div 
                    key={r.id}
                    onClick={() => handleRfqClick(item)}
                    className="rfq-listing-row-card"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="rfq-listing-row-img" style={{ backgroundImage: `url(${bannerImg})` }}></div>
                      <div className="rfq-listing-row-details">
                        <div className="flex justify-between items-start">
                          <span className={`rfq-listing-row-header-badge ${isPrinting ? 'printing' : isInterior ? 'interior' : 'services'}`}>
                            {r.category}
                          </span>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); alert("Saved RFQ!"); }}
                            className="text-gray-400 hover:text-[#6366f1] bg-transparent border-0 cursor-pointer p-0"
                          >
                            <i className="far fa-bookmark text-xs"></i>
                          </button>
                        </div>
                        <h4 className="rfq-listing-row-title">{r.title}</h4>
                        <p className="rfq-listing-row-desc">{r.description}</p>
                        
                        <div className="rfq-listing-row-tags">
                          <span>
                            <i className="fas fa-box text-indigo-500"></i> {r.quantity} {r.category === 'Interior' ? 'Project' : 'Units'}
                          </span>
                          <span>
                            <i className="fas fa-wallet text-indigo-500"></i> ₹{r.budget}
                          </span>
                          <span>
                            <i className="fas fa-map-marker-alt text-indigo-500"></i> {r.location}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[9px] text-red-500 font-bold" style={{ marginTop: '8px' }}>
                          <span className="flex items-center gap-1"><i className="far fa-clock"></i> Response by {new Date(r.deadline).getDate()} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date(r.deadline).getMonth()]} {new Date(r.deadline).getFullYear()}</span>
                          <span className="text-gray-400 flex items-center gap-1"><i className="far fa-user"></i> Posted {r.id === 1 ? '2 hours ago' : r.id === 2 ? '5 hours ago' : '1 day ago'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right hand quotes summary */}
                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-center text-center px-4 md:border-l border-gray-100 dark:border-gray-855/10 min-w-[120px]">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">{item.quotesCount}</h3>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mt-1">Quotes Received</p>
                      </div>
                      <button className="mt-3 py-2 px-4 rounded-xl border border-[#6366f1]/20 text-[#6366f1] hover:bg-[#6366f1] hover:text-white text-[10px] font-bold transition bg-transparent cursor-pointer">
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
            <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: '/rfq' } });
                  } else {
                    setShowRfqModal(true);
                  }
                }}
                className="rfq-quick-action-link-card primary"
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
                className="rfq-quick-action-link-card secondary"
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
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">RFQ Stats</h3>
              <select className="bg-transparent border-0 font-bold text-xs text-gray-500 focus:outline-none cursor-pointer">
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="rfq-stats-grid">
              <div className="rfq-stat-badge-box">
                <h4 className="rfq-stat-badge-num">12</h4>
                <p className="rfq-stat-badge-lbl">RFQs Posted</p>
              </div>
              <div className="rfq-stat-badge-box">
                <h4 className="rfq-stat-badge-num">18</h4>
                <p className="rfq-stat-badge-lbl">Quotes Received</p>
              </div>
              <div className="rfq-stat-badge-box">
                <h4 className="rfq-stat-badge-num" style={{ color: '#10b981' }}>2</h4>
                <p className="rfq-stat-badge-lbl">Awarded</p>
              </div>
              <div className="rfq-stat-badge-box">
                <h4 className="rfq-stat-badge-num" style={{ color: '#d97706' }}>1</h4>
                <p className="rfq-stat-badge-lbl">In Progress</p>
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
            >
              View All My RFQs &rarr;
            </a>
          </div>

          {/* Recent RFQs */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Recent RFQs</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Viewing all recent RFQs..."); }} className="text-xs text-[#6366f1] hover:underline font-bold">View All</a>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-lightbulb text-[10px]"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Need LED Sign Board</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">T. Nagar, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9.5px] font-bold text-orange-500 block">2 Quotes</span>
                  <span className="text-[8px] text-gray-400">2h ago</span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-broom text-[10px]"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Office Cleaning Services</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">Anna Nagar, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9.5px] font-bold text-[#6366f1] block">4 Quotes</span>
                  <span className="text-[8px] text-gray-400">5h ago</span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-pencil-alt text-[10px]"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Bulk Office Stationery</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">Guindy, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9.5px] font-bold text-[#6366f1] block">3 Quotes</span>
                  <span className="text-[8px] text-gray-400">1d ago</span>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-2.5">
                  <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-cookie-bite text-[10px]"></i>
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-700 dark:text-gray-300">Catering for Event</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">ECR, Chennai</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[9.5px] font-bold text-[#6366f1] block">6 Quotes</span>
                  <span className="text-[8px] text-gray-400">1d ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* For Businesses */}
          <div className="p-5 rounded-2xl border shadow-sm bg-gradient-to-br from-[#e0e7ff] to-[#f5f3ff] dark:from-slate-900 dark:to-purple-950/20 border-indigo-100/50 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">For Businesses</h4>
              <p className="text-[10px] text-indigo-750 dark:text-indigo-400 leading-normal">Respond to RFQs and grow your business</p>
              <button 
                type="button" 
                onClick={() => alert("Opening seller dashboard panel...")}
                className="py-1.5 px-3 bg-white text-indigo-650 hover:bg-[#6366f1] hover:text-white border border-[#6366f1]/20 font-bold text-[10px] rounded-lg transition cursor-pointer shadow-sm"
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
                      <div key={idx} className="p-4 rounded-xl border border-gray-700/20 bg-gray-500/5 space-y-3">
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
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            q.quote.status === 'shortlisted' ? 'bg-amber-600/10 text-amber-500' : 
                            q.quote.status === 'accepted' ? 'bg-green-600/10 text-green-500' : 'bg-gray-600/10 text-gray-500'
                          }`}>
                            {q.quote.status}
                          </span>
                          
                          <div className="flex gap-2">
                            {q.quote.status === 'pending' && (
                              <button 
                                onClick={() => handleQuoteStatusChange(q.quote.id, 'shortlisted')}
                                className="bg-amber-500 text-white font-bold py-1 px-3 rounded text-[10px] hover:bg-amber-600 transition"
                              >
                                Shortlist
                              </button>
                            )}
                            {(q.quote.status === 'pending' || q.quote.status === 'shortlisted') && (
                              <button 
                                onClick={() => handleQuoteStatusChange(q.quote.id, 'accepted')}
                                className="bg-green-600 text-white font-bold py-1 px-3 rounded text-[10px] hover:bg-green-700 transition"
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
  );
};

export default RfqMarketplace;
