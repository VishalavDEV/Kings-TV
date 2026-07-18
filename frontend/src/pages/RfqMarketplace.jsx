import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

const RfqMarketplace = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

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
    <div className="container mx-auto px-4 py-8 rfq-main-dashboard text-slate-800 dark:text-slate-100" style={{ paddingBottom: '60px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMN 1-3: Left Main section */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Hero Banner Card */}
          <div className="relative rounded-3xl overflow-visible p-6 md:p-8 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white flex justify-between items-center gap-6 shadow-xl min-h-[220px]">
            <div className="space-y-4 max-w-md relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">Get the best quotes<br/>from <span className="text-[#6366f1]">verified businesses</span></h2>
              <div className="flex flex-col gap-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-user-check text-[10px]"></i>
                  </span>
                  <div>
                    <span className="font-bold text-white block">Verified Businesses</span>
                    <span className="text-[10px] text-gray-400">KYC verified &amp; trusted</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-balance-scale text-[10px]"></i>
                  </span>
                  <div>
                    <span className="font-bold text-white block">Compare Quotes</span>
                    <span className="text-[10px] text-gray-400">Choose the best deal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-piggy-bank text-[10px]"></i>
                  </span>
                  <div>
                    <span className="font-bold text-white block">Save Time &amp; Money</span>
                    <span className="text-[10px] text-gray-400">Competitive pricing</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mockup Clipboard Quote Illustration */}
            <div className="hidden md:flex relative z-10 w-48 h-44 items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <rect x="50" y="30" width="100" height="140" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                <rect x="80" y="18" width="40" height="16" rx="4" fill="#94a3b8" />
                <text x="100" y="55" fill="#312e81" fontSize="13" fontWeight="900" textAnchor="middle">RFQ</text>
                <circle cx="130" cy="50" r="8" fill="#fbbf24"/>
                <path d="M128,47 L132,53" stroke="white" strokeWidth="1.5" />
                <rect x="30" y="80" width="60" height="28" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="35" y="92" fill="#64748b" fontSize="7" fontWeight="bold">Quote</text>
                <text x="35" y="102" fill="#22c55e" fontSize="8" fontWeight="bold">₹45,000</text>
                <rect x="65" y="112" width="70" height="32" rx="6" fill="#f5f3ff" stroke="#c084fc" strokeWidth="2" />
                <text x="71" y="125" fill="#7c3aed" fontSize="8" fontWeight="bold">Quote</text>
                <text x="71" y="137" fill="#4f46e5" fontSize="10" fontWeight="950">₹38,500</text>
                <rect x="110" y="78" width="60" height="28" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="115" y="90" fill="#64748b" fontSize="7" fontWeight="bold">Quote</text>
                <text x="115" y="100" fill="#64748b" fontSize="8" fontWeight="bold">₹50,200</text>
              </svg>
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
                  <option value="all">All Categories</option>
                  <option value="Printing">Printing</option>
                  <option value="Interior">Interior</option>
                  <option value="Services">Services</option>
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
          <div className="flex gap-3 overflow-x-auto pb-1 mt-2 scrollbar-none">
            <button 
              onClick={() => { setSelectedCat('all'); setSelectedLoc('all'); }}
              className="p-3 rounded-xl border-2 border-[#6366f1] bg-[#f5f3ff] text-left min-w-[120px] cursor-pointer"
            >
              <h4 className="font-extrabold text-[11px] text-[#6366f1]">All Categories</h4>
              <p className="text-[9px] text-[#a78bfa] font-bold mt-0.5">All Types</p>
            </button>
            
            <button onClick={() => setSelectedCat('Construction')} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[120px] cursor-pointer flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 mt-0.5">
                <i className="fas fa-building text-xs"></i>
              </span>
              <div>
                <h4 className="font-extrabold text-[11px] text-gray-755">Construction</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">125 RFQs</p>
              </div>
            </button>

            <button onClick={() => setSelectedCat('Printing')} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[120px] cursor-pointer flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mt-0.5">
                <i className="fas fa-print text-xs"></i>
              </span>
              <div>
                <h4 className="font-extrabold text-[11px] text-gray-755">Printing</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">84 RFQs</p>
              </div>
            </button>

            <button onClick={() => setSelectedCat('Fabrication')} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[120px] cursor-pointer flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mt-0.5">
                <i className="fas fa-tools text-xs"></i>
              </span>
              <div>
                <h4 className="font-extrabold text-[11px] text-gray-755">Fabrication</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">67 RFQs</p>
              </div>
            </button>

            <button onClick={() => setSelectedCat('Events')} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[120px] cursor-pointer flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 mt-0.5">
                <i className="fas fa-birthday-cake text-xs"></i>
              </span>
              <div>
                <h4 className="font-extrabold text-[11px] text-gray-755">Events</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">53 RFQs</p>
              </div>
            </button>

            <button onClick={() => setSelectedCat('Services')} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[120px] cursor-pointer flex items-start gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mt-0.5">
                <i className="fas fa-laptop text-xs"></i>
              </span>
              <div>
                <h4 className="font-extrabold text-[11px] text-gray-755">IT Services</h4>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">41 RFQs</p>
              </div>
            </button>

            <button onClick={() => alert("Opening all marketplace categories...")} className="p-3 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 text-left min-w-[100px] cursor-pointer flex items-center justify-center gap-1">
              <span className="font-extrabold text-[11px] text-gray-600">More</span>
              <i className="fas fa-chevron-right text-[10px] text-gray-400"></i>
            </button>
          </div>

          {/* Tab List Header */}
          <div className="flex justify-between items-center text-xs mt-4">
            <div className="flex gap-2">
              {['Open RFQs', 'My RFQs', 'Quotes Received', 'Closed / Awarded'].map((t, idx) => (
                <button 
                  key={idx} 
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
                    className={`p-4 rounded-2xl border transition shadow-sm hover:shadow-md cursor-pointer flex flex-col md:flex-row justify-between gap-4 ${
                      theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-28 h-28 rounded-xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${bannerImg})` }}></div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${labelBg}`}>
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
                        <h4 className="font-extrabold text-xs text-gray-850 dark:text-white mt-1">{r.title}</h4>
                        <p className="text-[10px] text-gray-405 leading-relaxed line-clamp-2 h-7">{r.description}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9.5px] text-gray-400 font-bold border-t border-gray-100 dark:border-gray-800/10 pt-2">
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <i className="fas fa-box text-indigo-500"></i> {r.quantity} {r.category === 'Interior' ? 'Project' : 'Units'}
                          </span>
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <i className="fas fa-wallet text-indigo-500"></i> ₹{r.budget}
                          </span>
                          <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <i className="fas fa-map-marker-alt text-indigo-500"></i> {r.location}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[9px] text-red-500 font-bold">
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
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                if (!isAuthenticated) {
                  alert(lang === 'en' ? "Please login or sign up to post an RFQ." : "RFQ சமர்ப்பிக்க தயவுசெய்து உள்நுழையவும் அல்லது பதிவு செய்யவும்.");
                  navigate('/login', { state: { from: '/rfq' } });
                } else {
                  setShowRfqModal(true);
                }
              }}
                className="w-full p-4 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white transition flex items-center justify-between text-left border-0 cursor-pointer shadow-sm"
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
                className={`w-full p-4 rounded-xl border flex items-center justify-between text-left cursor-pointer transition ${
                  theme === 'dark' ? 'bg-transparent border-gray-800 hover:bg-gray-850 text-white' : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                }`}
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

            <div className="grid grid-cols-2 gap-3 text-center mb-4">
              <div className="bg-[#f5f3ff] dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100/50 dark:border-purple-900/10">
                <h4 className="text-lg font-black text-purple-650">12</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold mt-1">RFQs Posted</p>
              </div>
              <div className="bg-[#f5f3ff] dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100/50 dark:border-purple-900/10">
                <h4 className="text-lg font-black text-purple-650">18</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold mt-1">Quotes Received</p>
              </div>
              <div className="bg-[#ecfdf5] dark:bg-green-950/20 p-3 rounded-xl border border-green-100/50 dark:border-green-900/10">
                <h4 className="text-lg font-black text-green-600">2</h4>
                <p className="text-[8px] text-green-500 uppercase tracking-widest font-bold mt-1">Awarded</p>
              </div>
              <div className="bg-[#fffbeb] dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/10">
                <h4 className="text-lg font-black text-amber-600">1</h4>
                <p className="text-[8px] text-amber-500 uppercase tracking-widest font-bold mt-1">In Progress</p>
              </div>
            </div>

            <a href="#" onClick={(e) => { e.preventDefault(); alert("Viewing all RFQs..."); }} className="text-xs text-[#6366f1] hover:underline font-bold block text-center">
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
                          alert(lang === 'en' ? "Please login or sign up to submit a quotation." : "விலைப்புள்ளி சமர்ப்பிக்க தயவுசெய்து உள்நுழையவும் அல்லது பதிவு செய்யவும்.");
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
                  <option value="Printing">Printing</option>
                  <option value="Construction">Construction</option>
                  <option value="Fabrication">Fabrication</option>
                  <option value="Events">Events</option>
                  <option value="Services">Services</option>
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
