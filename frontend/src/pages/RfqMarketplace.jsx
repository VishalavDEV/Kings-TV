import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';

const RfqMarketplace = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  // RFQ Lists State
  const [rfqs, setRfqs] = useState([]);
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
        if (Array.isArray(data)) {
          setRfqs(data);
        } else {
          setRfqs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        // Fallbacks matching Mockup 4
        setRfqs([
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
        ]);
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
    <div className={`p-4 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 1. HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            RFQ - Request for Quote
          </span>
          <h2 className="text-2xl md:text-3xl font-black">Get the best quotes from verified businesses</h2>
          <p className="text-xs opacity-90">Post your requirements, compare custom proposals, save time &amp; money.</p>
        </div>
        <button 
          onClick={() => setShowRfqModal(true)}
          className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl text-xs shadow-md transition transform hover:scale-105"
        >
          Post a New RFQ
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-500/5 p-3 rounded-2xl border border-gray-700/20 mb-8 text-xs text-gray-800">
        <div className="flex items-center px-3 bg-white/10 rounded-lg">
          <i className="fas fa-search text-gray-400 mr-2"></i>
          <input 
            type="text" 
            placeholder="Search RFQs..." 
            className="w-full bg-transparent p-2 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="bg-white/10 border border-gray-700/20 p-2.5 rounded-lg focus:outline-none"
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Printing">Printing</option>
          <option value="Construction">Construction</option>
          <option value="Fabrication">Fabrication</option>
          <option value="Events">Events</option>
          <option value="Services">Services</option>
        </select>
        <select 
          className="bg-white/10 border border-gray-700/20 p-2.5 rounded-lg focus:outline-none"
          value={selectedLoc}
          onChange={(e) => setSelectedLoc(e.target.value)}
        >
          <option value="all">All Locations</option>
          <option value="Chennai">Chennai</option>
          <option value="TN">Tamil Nadu</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* RFQ CARDS COLUMN (Column 1) */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Open Requirements</h2>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setSelectedCat('all')} className="px-3.5 py-1.5 rounded-lg border border-gray-700/20 bg-red-600 text-white font-bold">Open RFQs</button>
              <button className="px-3.5 py-1.5 rounded-lg border border-gray-700/20 font-medium">Shortlisted</button>
              <button className="px-3.5 py-1.5 rounded-lg border border-gray-700/20 font-medium">Awarded</button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="animate-pulse rounded-2xl h-36 bg-gray-500/10 border border-gray-700/10 p-4"></div>
              ))}
            </div>
          ) : filteredRfqs.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-gray-700/20">
              <i className="fas fa-file-signature text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">No RFQs posted yet</h3>
              <p className="text-sm text-gray-500">Post your requirement to get custom quotes from verified partners.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRfqs.map(item => (
                <div 
                  key={item.rfq.id}
                  onClick={() => handleRfqClick(item)}
                  className={`p-5 rounded-2xl border cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                    theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-red-500">{item.rfq.category}</span>
                    <span className="bg-green-600/10 text-green-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize">
                      {item.rfq.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm md:text-md mb-2">{item.rfq.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.rfq.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-gray-500 border-t border-gray-800/10 pt-3">
                    <div>
                      <span className="block text-gray-400 uppercase font-semibold">Quantity</span>
                      <span className="font-bold text-xs">{item.rfq.quantity} Units</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 uppercase font-semibold">Estimated Budget</span>
                      <span className="font-bold text-xs">₹{item.rfq.budget}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 uppercase font-semibold">Bids Count</span>
                      <span className="font-bold text-xs text-indigo-500">{item.quotesCount} proposals</span>
                    </div>
                    <div className="text-right">
                      <button className="text-red-500 hover:underline font-bold text-xs">View Quotes &rarr;</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STATS & SIDEBAR INFO (Column 2) */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-sm mb-4">RFQ Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-500/5 p-3 rounded-xl border border-gray-700/20">
                <h4 className="text-xl font-black text-red-500">12</h4>
                <p className="text-[9px] uppercase tracking-wider text-gray-500">RFQs Posted</p>
              </div>
              <div className="bg-gray-500/5 p-3 rounded-xl border border-gray-700/20">
                <h4 className="text-xl font-black text-green-500">18</h4>
                <p className="text-[9px] uppercase tracking-wider text-gray-500">Quotes Recv</p>
              </div>
              <div className="bg-gray-500/5 p-3 rounded-xl border border-gray-700/20">
                <h4 className="text-xl font-black text-blue-500">02</h4>
                <p className="text-[9px] uppercase tracking-wider text-gray-500">Awarded</p>
              </div>
              <div className="bg-gray-500/5 p-3 rounded-xl border border-gray-700/20">
                <h4 className="text-xl font-black text-yellow-500">01</h4>
                <p className="text-[9px] uppercase tracking-wider text-gray-500">In Progress</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-sm mb-4">Marketplace Categories</h3>
            <div className="flex flex-col gap-3 text-xs">
              {categories.map((c, i) => (
                <div key={i} className="flex justify-between items-center cursor-pointer hover:text-red-500">
                  <span className="flex items-center gap-2">
                    <i className={`fas ${c.icon} ${c.color}`}></i> {c.name}
                  </span>
                  <span className="text-gray-500">{c.count} RFQs</span>
                </div>
              ))}
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
                      onClick={() => setShowQuoteForm(true)}
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
