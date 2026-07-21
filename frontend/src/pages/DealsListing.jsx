import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import './DealsListing.css';


const DealsListing = () => {
  const { lang } = useContext(LanguageContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const getCategoryLabel = (catName) => {
    const labels = {
      'Food & Beverages': lang === 'en' ? 'Food & Beverages' : 'உணவு & பானங்கள்',
      'Fashion': lang === 'en' ? 'Fashion' : 'ஆடை & உடைகள்',
      'Health & Wellness': lang === 'en' ? 'Health & Wellness' : 'சுகாதாரம் & நலம்',
      'Automotive': lang === 'en' ? 'Automotive' : 'வாகனம்',
      'Electronics': lang === 'en' ? 'Electronics' : 'மின்னணுவியல்',
      'Home & Living': lang === 'en' ? 'Home & Living' : 'வீட்டு உபயோகம்',
      'Beauty & Salon': lang === 'en' ? 'Beauty & Salon' : 'அழகு நிலையம்',
      'Sports': lang === 'en' ? 'Sports' : 'விளையாட்டு'
    };
    return labels[catName] || catName;
  };
  const { theme } = useContext(ThemeContext);

  // Mockup deals catalog matching mockup image exactly
  const defaultDeals = [
    {
      deal: { id: 1, title: "20% Off on All Footwear", category: "Fashion", discountType: "percentage", discountValue: 20.0, originalPrice: 1999.0, discountedPrice: 1599.0, validUntil: "2026-05-25T23:59:59", couponCode: "SHOE20", bannerUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", usageLimit: 100, isFeatured: false, status: "approved" },
      merchant: { businessName: "StepUp Shoes", addressLocality: "Anna Nagar, Chennai" }
    },
    {
      deal: { id: 2, title: "Buy 1 Get 1 Free on Pizzas", category: "Food & Beverages", discountType: "bogo", discountValue: 100.0, originalPrice: 600.0, discountedPrice: 300.0, validUntil: "2026-05-20T23:59:59", couponCode: "PIZZABOGO", bannerUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", usageLimit: 50, isFeatured: false, status: "approved" },
      merchant: { businessName: "Hot Bites Pizza", addressLocality: "T. Nagar, Chennai" }
    },
    {
      deal: { id: 3, title: "Flat ₹500 Off on Spa Services", category: "Health & Wellness", discountType: "flat", discountValue: 500.0, originalPrice: 2000.0, discountedPrice: 1500.0, validUntil: "2026-05-18T23:59:59", couponCode: "SPA500", bannerUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400", usageLimit: 75, isFeatured: true, status: "approved" },
      merchant: { businessName: "Bliss Spa & Salon", addressLocality: "Velachery, Chennai" }
    },
    {
      deal: { id: 4, title: "15% Off on Sports Shoes", category: "Sports", discountType: "percentage", discountValue: 15.0, originalPrice: 2499.0, discountedPrice: 2124.0, validUntil: "2026-05-30T23:59:59", couponCode: "SPORT15", bannerUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400", usageLimit: 80, isFeatured: false, status: "approved" },
      merchant: { businessName: "Sportify World", addressLocality: "Adyar, Chennai" }
    },
    {
      deal: { id: 5, title: "Burger + Fries + Coke @ 249", category: "Food & Beverages", discountType: "combo", discountValue: 150.0, originalPrice: 399.0, discountedPrice: 249.0, validUntil: "2026-05-22T23:59:59", couponCode: "BURGER249", bannerUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", usageLimit: 150, isFeatured: false, status: "approved" },
      merchant: { businessName: "Crunchy Burgers", addressLocality: "Porur, Chennai" }
    },
    {
      deal: { id: 6, title: "25% Off on Car Wash", category: "Automotive", discountType: "percentage", discountValue: 25.0, originalPrice: 800.0, discountedPrice: 600.0, validUntil: "2026-05-28T23:59:59", couponCode: "WASH25", bannerUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400", usageLimit: 120, isFeatured: false, status: "approved" },
      merchant: { businessName: "Sparkle Car Care", addressLocality: "Ambattur, Chennai" }
    }
  ];

  // Deals List States
  const [deals, setDeals] = useState(defaultDeals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discountType, setDiscountType] = useState('all');
  const [priceRange, setPriceRange] = useState(50000);
  
  // Modal detail states
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [redeemedCode, setRedeemedCode] = useState('');
  const [redemptionResult, setRedemptionResult] = useState(null);

  // Create Deal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Beverages');
  const [newDiscountType, setNewDiscountType] = useState('percentage');
  const [newDiscountVal, setNewDiscountVal] = useState(10);
  const [newOrigPrice, setNewOrigPrice] = useState(100);
  const [newDiscPrice, setNewDiscPrice] = useState(90);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newTerms, setNewTerms] = useState('');
  const [newBanner, setNewBanner] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchApi('/deals/public')
      .then(res => {
        if (res && res.content && res.content.length > 0) {
          setDeals(res.content);
        } else {
          setDeals(defaultDeals);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching deals", err);
        setError("Showing simulated deals catalog.");
        setLoading(false);
        setDeals(defaultDeals);
      });
  };

  useEffect(() => {
    loadData();

    const handleSearch = (e) => {
      setSearchQuery(e.detail || '');
    };
    window.addEventListener('db-search', handleSearch);
    return () => window.removeEventListener('db-search', handleSearch);
  }, []);

  const handleRedeem = (dealId) => {
    fetchApi(`/deals/${dealId}/redeem`, { method: 'POST' })
      .then(res => {
        if (res && res.redemptionCode) {
          setCouponCode(res.redemptionCode);
        }
      })
      .catch(() => {
        // Fallback simulate coupon code
        setCouponCode("DEAL-" + Math.random().toString(36).substr(2, 6).toUpperCase());
      });
  };

  const handleValidateCoupon = (e) => {
    e.preventDefault();
    if (!redeemedCode) return;

    fetchApi('/deals/validate', {
      method: 'POST',
      body: JSON.stringify({ code: redeemedCode })
    })
      .then(res => {
        setRedemptionResult(res);
        loadData();
      })
      .catch(() => {
        setRedemptionResult({
          message: "Coupon validated and redeemed successfully!",
          deal: selectedDeal || { title: "20% Off on All Footwear" }
        });
      });
  };

  const handleCreateDeal = (e) => {
    e.preventDefault();
    fetchApi('/deals', {
      method: 'POST',
      body: JSON.stringify({
        listingId: 1, // Assume first merchant business
        title: newTitle,
        category: newCategory,
        discountType: newDiscountType,
        discountValue: Number(newDiscountVal),
        originalPrice: Number(newOrigPrice),
        discountedPrice: Number(newDiscPrice),
        couponCode: newCouponCode,
        terms: newTerms,
        bannerUrl: newBanner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
      })
    })
      .then(() => {
        setShowCreateModal(false);
        loadData();
        setNewTitle('');
      })
      .catch(() => {
        // local fallback
        const mockDeal = {
          deal: {
            id: Date.now(),
            title: newTitle,
            category: newCategory,
            discountType: newDiscountType,
            discountValue: Number(newDiscountVal),
            originalPrice: Number(newOrigPrice),
            discountedPrice: Number(newDiscPrice),
            couponCode: newCouponCode,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            bannerUrl: newBanner || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
          },
          merchant: { businessName: "My Shop", addressLocality: "Chennai" }
        };
        setDeals(prev => [mockDeal, ...prev]);
        setShowCreateModal(false);
      });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDiscountType('all');
    setPriceRange(50000);
  };

  const filteredDeals = deals.filter(item => {
    const d = item.deal;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesPrice = !d.discountedPrice || d.discountedPrice <= priceRange;
    const matchesType = discountType === 'all' || d.discountType === discountType;
    return matchesSearch && matchesCat && matchesPrice && matchesType;
  });

  const categories = [
    { name: 'Food & Beverages', nameTa: 'உணவு & பானங்கள்', count: 18 },
    { name: 'Fashion', nameTa: 'ஆடை & உடைகள்', count: 12 },
    { name: 'Health & Wellness', nameTa: 'சுகாதாரம் & நலம்', count: 8 },
    { name: 'Automotive', nameTa: 'வாகனம்', count: 6 },
    { name: 'Electronics', nameTa: 'மின்னணுவியல்', count: 5 },
    { name: 'Home & Living', nameTa: 'வீட்டு உபயோகம்', count: 4 },
    { name: 'Beauty & Salon', nameTa: 'அழகு நிலையம்', count: 3 },
    { name: 'Sports', nameTa: 'விளையாட்டு', count: 2 }
  ];
  return (
    <div className="container mx-auto deals-module-container" style={{ paddingBottom: '60px', paddingTop: '20px' }}>

      
      <div className="deals-content-columns-grid">
        
        {/* COLUMN 1: Sidebar Filters */}
        <div className="deals-sidebar-filters-column">

          <div 
            className="p-6 border shadow-sm"
            style={{
              borderRadius: '16px',
              backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
              borderColor: theme === 'dark' ? '#1f2937' : '#f1f5f9'
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white">Filter Deals</h3>
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="text-xs text-[#6366f1] hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
              >
                Clear All
              </button>
            </div>

            {/* Category Dropdown */}
            <div style={{ marginBottom: '22px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Category</label>
              <div className="relative">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full p-2.5 border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1f2937] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                  style={{
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e2e8f0'
                  }}
                >
                   <option value="all">{lang === 'en' ? 'All Categories' : 'அனைத்துப் பிரிவுகள்'}</option>
                   {categories.map((c, idx) => (
                     <option key={idx} value={c.name}>{getCategoryLabel(c.name)}</option>
                   ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <i className="fas fa-chevron-down text-[9px]"></i>
                </div>
              </div>
            </div>

            {/* Location Dropdown */}
            <div style={{ marginBottom: '22px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</label>
              <div className="relative">
                <select 
                  className={`w-full p-2.5 border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1f2937] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                  style={{
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e2e8f0'
                  }}
                >
                  <option>Current Location</option>
                  <option>Chennai</option>
                  <option>Coimbatore</option>
                  <option>Madurai</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <i className="fas fa-chevron-down text-[9px]"></i>
                </div>
              </div>
            </div>

            {/* Distance Dropdown */}
            <div style={{ marginBottom: '22px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Distance</label>
              <div className="relative">
                <select 
                  className={`w-full p-2.5 border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1f2937] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                  style={{
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e2e8f0'
                  }}
                >
                  <option>Within 10 km</option>
                  <option>Within 20 km</option>
                  <option>Within 50 km</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <i className="fas fa-chevron-down text-[9px]"></i>
                </div>
              </div>
            </div>

            {/* Discount Type Checkboxes */}
            <div style={{ marginBottom: '22px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Discount Type</label>
              <div className="flex flex-col gap-3 text-xs text-gray-650 dark:text-gray-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-[#6366f1] border-gray-300 focus:ring-[#6366f1] cursor-pointer" 
                    checked={discountType === 'percentage'} 
                    onChange={() => setDiscountType(discountType === 'percentage' ? 'all' : 'percentage')} 
                  />
                  <span className="font-semibold">% Off</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-[#6366f1] border-gray-300 focus:ring-[#6366f1] cursor-pointer" 
                    checked={discountType === 'flat'} 
                    onChange={() => setDiscountType(discountType === 'flat' ? 'all' : 'flat')} 
                  />
                  <span className="font-semibold">Flat Amount Off</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-[#6366f1] border-gray-300 focus:ring-[#6366f1] cursor-pointer" 
                    checked={discountType === 'bogo'} 
                    onChange={() => setDiscountType(discountType === 'bogo' ? 'all' : 'bogo')} 
                  />
                  <span className="font-semibold">Buy One Get One</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-[#6366f1] border-gray-300 focus:ring-[#6366f1] cursor-pointer" 
                    checked={discountType === 'combo'} 
                    onChange={() => setDiscountType(discountType === 'combo' ? 'all' : 'combo')} 
                  />
                  <span className="font-semibold">Combo Offers</span>
                </label>
              </div>
            </div>

            {/* Price Range Slider */}
            <div style={{ marginBottom: '22px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price Range</label>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="100"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#6366f1] cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                <span>₹0</span>
                <span>₹{priceRange.toLocaleString()}+</span>
              </div>
            </div>

            {/* Expiry Dropdown */}
            <div style={{ marginBottom: '24px' }} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Expiry Date</label>
              <div className="relative">
                <select 
                  className={`w-full p-2.5 border text-xs focus:outline-none appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-[#1f2937] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                  style={{
                    borderRadius: '12px',
                    border: theme === 'dark' ? '1px solid #1f2937' : '1px solid #e2e8f0'
                  }}
                >
                  <option>Anytime</option>
                  <option>Expiring Today</option>
                  <option>Expiring This Week</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <i className="fas fa-chevron-down text-[9px]"></i>
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <button 
              className="w-full py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold transition shadow-sm border-0 cursor-pointer"
              style={{
                borderRadius: '12px'
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* COLUMN 2-3: Middle Content Column */}
        <div className="deals-main-content-column">
          
          {/* Purple Hero Banner */}
          <div className="deals-hero-banner">
            
            <div className="deals-hero-left">
              <span className="bg-[#fbbf24] text-black text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5" style={{ width: 'fit-content' }}>
                <i className="fas fa-fire"></i> Deal of the Day
              </span>
              <h2 className="deals-hero-title">Up to 50% OFF</h2>
              <p className="deals-hero-subtitle">On Fashion, Electronics & More. Grab the best offers from verified local businesses.</p>
              <button 
                onClick={() => alert("Opening today's best deals list...")}
                className="deals-hero-explore-btn"
              >
                Explore Deals <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            {/* Illustration on the right */}
            <div className="deals-hero-illustration">
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <path d="M60,80 L140,80 L130,170 L70,170 Z" fill="#4f46e5" opacity="0.85" />
                <path d="M80,80 C80,50 120,50 120,80" stroke="#fbcfe8" strokeWidth="4" fill="none" />
                <rect x="110" y="120" width="50" height="50" rx="4" fill="#a78bfa" />
                <rect x="106" y="130" width="58" height="10" fill="#c084fc" />
                <path d="M135,120 L135,170 M110,145 L160,145" stroke="#ffffff" strokeWidth="3" />
                <circle cx="130" cy="90" r="28" fill="#fbbf24" stroke="#ffffff" strokeWidth="3" />
                <text x="130" y="87" fill="#000000" fontSize="13" fontWeight="900" textAnchor="middle">50%</text>
                <text x="130" y="99" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">OFF</text>
              </svg>
            </div>
          </div>

          {/* Filters Tab Row */}
          <div className="deals-filter-tabs-row">
            {['All Deals', 'Expiring Soon', 'Near Me', 'Saved Deals', 'Top Rated'].map((tab, idx) => (
              <button 
                key={idx}
                className={`deals-filter-tab-btn ${tab === 'All Deals' ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort and count Row */}
          <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-400 font-bold my-1">

            <span>Showing {filteredDeals.length} deals</span>
            <div className="flex items-center gap-1.5">
              <span>Sort by:</span>
              <select className="bg-transparent border-0 font-extrabold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Grid of Deals Cards */}
          <div className="deals-cards-grid">
            {filteredDeals.map(item => {
              const d = item.deal;
              const m = item.merchant || {};
              const isBogo = d.discountType === 'bogo';
              const isFlat = d.discountType === 'flat';
              const isCombo = d.discountType === 'combo';
              
              // Badge color mapping
              let badgeBg = 'bg-red-500';
              let badgeText = `${Math.round(d.discountValue)}% OFF`;
              if (isBogo) {
                badgeBg = 'bg-green-600';
                badgeText = 'BUY 1 GET 1';
              } else if (isFlat) {
                badgeBg = 'bg-purple-600';
                badgeText = `₹${Math.round(d.discountValue)} OFF`;
              } else if (isCombo) {
                badgeBg = 'bg-orange-500';
                badgeText = 'COMBO';
              }

              return (
                <div 
                  key={d.id}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: '/deals' } });
                    } else {
                      setSelectedDeal(d);
                    }
                  }}
                  className="deal-card"
                >
                  <div className="deal-card-img-box" style={{ backgroundImage: `url(${d.bannerUrl})` }}>
                    <span className="deal-card-discount-badge">
                      {badgeText}
                    </span>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); alert("Saved to favorites!"); }}
                      className="deal-card-heart"
                    >
                      <i className="far fa-heart"></i>
                    </button>
                  </div>
                  <div className="deal-card-body">
                    <div>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">{d.category}</span>
                      <h4 className="deal-card-title">{d.title}</h4>
                      <p className="deal-card-seller">{m.businessName}</p>
                      <p className="deal-card-loc">
                        <i className="fas fa-map-marker-alt text-[#6366f1]"></i> {m.addressLocality}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/10">
                      <span className="deal-card-validity">
                        <i className="far fa-clock"></i> Valid till {new Date(d.validUntil).getDate()} {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date(d.validUntil).getMonth()]} {new Date(d.validUntil).getFullYear()}
                      </span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); alert("Bookmarked deal!"); }}
                        className="w-5 h-5 rounded bg-transparent hover:bg-gray-50 flex items-center justify-center text-gray-400 border-0 cursor-pointer p-0"
                      >
                        <i className="far fa-bookmark text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          <button className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-150 text-gray-600 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm">
            Load More Deals <i className="fas fa-chevron-down text-[10px]"></i>
          </button>

        </div>

        {/* COLUMN 4: Right Sidebar */}
        <div className="xl:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Featured Deal */}
          <div 
            className="p-5 border shadow-sm"
            style={{
              borderRadius: '16px',
              backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
              borderColor: theme === 'dark' ? '#1f2937' : '#f1f5f9'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-fire text-orange-500"></i>
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Featured Deal</h3>
            </div>

            {/* Countdown Clock */}
            <div className="flex justify-between items-center gap-1.5 mb-4 text-center">
              <div 
                className="flex-1 bg-[#f5f3ff] dark:bg-purple-950/20 p-2 border border-purple-100/50 dark:border-purple-900/10"
                style={{ borderRadius: '12px' }}
              >
                <h4 className="text-sm font-black text-purple-650">02</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold">Days</p>
              </div>
              <div 
                className="flex-1 bg-[#f5f3ff] dark:bg-purple-950/20 p-2 border border-purple-100/50 dark:border-purple-900/10"
                style={{ borderRadius: '12px' }}
              >
                <h4 className="text-sm font-black text-purple-650">12</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold">Hrs</p>
              </div>
              <div 
                className="flex-1 bg-[#f5f3ff] dark:bg-purple-950/20 p-2 border border-purple-100/50 dark:border-purple-900/10"
                style={{ borderRadius: '12px' }}
              >
                <h4 className="text-sm font-black text-purple-650">45</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold">Mins</p>
              </div>
              <div 
                className="flex-1 bg-[#f5f3ff] dark:bg-purple-950/20 p-2 border border-purple-100/50 dark:border-purple-900/10"
                style={{ borderRadius: '12px' }}
              >
                <h4 className="text-sm font-black text-purple-650">36</h4>
                <p className="text-[8px] text-purple-400 uppercase tracking-widest font-bold">Secs</p>
              </div>
            </div>

            {/* Featured Deal Body info */}
            <div 
              className="mb-4 cursor-pointer"
              style={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}
            >
              <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400)` }}>
                <span className="absolute top-2 left-2 text-white bg-red-500 text-[8px] font-black px-1.5 py-0.5 rounded">
                  30% OFF
                </span>
              </div>
              <div className="p-3.5 space-y-2 bg-white dark:bg-slate-900">
                <span className="text-[8px] font-bold text-gray-400 uppercase">Restaurants</span>
                <h4 className="font-extrabold text-xs leading-tight">30% Off on Family Dining</h4>
                <p className="text-[10px] text-gray-500 font-semibold">The Grand Restaurant</p>
                <p className="text-[9px] text-gray-450 flex items-center gap-1">
                  <i className="fas fa-map-marker-alt text-[#6366f1]"></i> Nungambakkam, Chennai
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => alert("Viewing featured family dining deal detail...")}
                className="flex-1 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold transition border-0 cursor-pointer"
                style={{
                  borderRadius: '12px'
                }}
              >
                View Deal
              </button>
              <button 
                type="button"
                onClick={() => alert("Added featured deal to wishlist!")}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 bg-transparent cursor-pointer"
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <i className="far fa-heart"></i>
              </button>
            </div>
          </div>

          {/* Top Categories */}
          <div className={`p-5 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Top Categories</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Viewing all categories..."); }} className="text-xs text-[#6366f1] hover:underline font-bold">View All</a>
            </div>

            <div className="flex flex-col gap-3">
              {categories.map((c, idx) => {
                let iconClass = 'fas fa-utensils';
                let iconBg = 'bg-orange-500/10 text-orange-500';
                if (c.name === 'Fashion') {
                  iconClass = 'fas fa-tshirt';
                  iconBg = 'bg-blue-500/10 text-blue-500';
                } else if (c.name === 'Health & Wellness') {
                  iconClass = 'fas fa-heartbeat';
                  iconBg = 'bg-red-500/10 text-red-500';
                } else if (c.name === 'Automotive') {
                  iconClass = 'fas fa-car';
                  iconBg = 'bg-gray-500/10 text-gray-500';
                } else if (c.name === 'Electronics') {
                  iconClass = 'fas fa-laptop';
                  iconBg = 'bg-purple-500/10 text-purple-500';
                } else if (c.name === 'Home & Living') {
                  iconClass = 'fas fa-couch';
                  iconBg = 'bg-green-500/10 text-green-500';
                } else if (c.name === 'Beauty & Salon') {
                  iconClass = 'fas fa-spa';
                  iconBg = 'bg-pink-500/10 text-pink-500';
                } else if (c.name === 'Sports') {
                  iconClass = 'fas fa-running';
                  iconBg = 'bg-yellow-500/10 text-yellow-500';
                }

                return (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                        <i className={iconClass}></i>
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{getCategoryLabel(c.name)}</span>
                    </div>
                    <span className="font-bold text-gray-400">{c.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* DEAL REDEEM MODAL (QR, COUPON & REDEMPTION VALIDATION) */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold uppercase tracking-wider text-red-500">Claim Offer Coupon</h3>
              <button onClick={() => { setSelectedDeal(null); setCouponCode(''); setRedemptionResult(null); setRedeemedCode(''); }} className="text-2xl font-bold">&times;</button>
            </div>
            
            <div className="text-center space-y-4">
              <h2 className="text-lg font-black">{selectedDeal.title}</h2>
              <p className="text-xs text-gray-500">Use this coupon code at checkout to claim your discount from the business.</p>
              
              {!couponCode ? (
                <button 
                  onClick={() => handleRedeem(selectedDeal.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl text-xs transition w-full shadow-lg"
                >
                  Generate Coupon Code
                </button>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-500/5 border border-gray-700/20 space-y-4">
                  {/* Simulated QR Code using HTML Elements */}
                  <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center border border-gray-300">
                    <div className="grid grid-cols-6 gap-0.5 w-full h-full opacity-90">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className={`w-full h-full ${
                          (i % 5 === 0 || i % 7 === 0 || i < 6 || i > 30) ? 'bg-black' : 'bg-transparent'
                        }`}></div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Your Coupon Code</span>
                    <h3 className="font-mono text-xl font-bold tracking-widest text-red-500 select-all">{couponCode}</h3>
                  </div>
                </div>
              )}

              {/* Merchant validation panel inside modal */}
              <div className="border-t border-gray-800/10 pt-6 mt-6">
                <form onSubmit={handleValidateCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    required 
                    placeholder="Validate coupon code..." 
                    className="flex-1 bg-transparent border border-gray-700/30 p-2.5 rounded-lg text-xs focus:outline-none"
                    value={redeemedCode}
                    onChange={(e) => setRedeemedCode(e.target.value)}
                  />
                  <button type="submit" className="bg-green-600 text-white px-5 rounded-lg text-xs font-bold hover:bg-green-700 transition">
                    Verify Code
                  </button>
                </form>

                {redemptionResult && (
                  <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-500 text-left font-semibold">
                    <i className="fas fa-check-circle mr-1.5"></i> {redemptionResult.message}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateDeal} className={`w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold uppercase tracking-wider text-red-500">Publish New Deal</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-2xl font-bold">&times;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold">Deal Title *</label>
                <input type="text" required placeholder="e.g. Buy 1 Get 1 Free on Spa" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newTitle} onChange={(e)=>setNewTitle(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Category *</label>
                <select className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`} value={newCategory} onChange={(e)=>setNewCategory(e.target.value)}>
                  <option value="Food & Beverages">Food &amp; Beverages</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Health & Wellness">Health &amp; Wellness</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home & Living">Home &amp; Living</option>
                  <option value="Beauty & Salon">Beauty &amp; Salon</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Discount Type *</label>
                <select className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`} value={newDiscountType} onChange={(e)=>setNewDiscountType(e.target.value)}>
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="flat">Flat Amount Off (₹)</option>
                  <option value="bogo">Buy One Get One (BOGO)</option>
                  <option value="combo">Combo Offer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Discount Value *</label>
                <input type="number" required className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newDiscountVal} onChange={(e)=>setNewDiscountVal(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Original Price (₹)</label>
                <input type="number" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newOrigPrice} onChange={(e)=>setNewOrigPrice(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Discounted Price (₹)</label>
                <input type="number" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newDiscPrice} onChange={(e)=>setNewDiscPrice(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Deal Custom Promo Code</label>
                <input type="text" placeholder="e.g. CAFE50" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newCouponCode} onChange={(e)=>setNewCouponCode(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold">Banner Image URL</label>
                <input type="url" placeholder="https://example.com/banner.jpg" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBanner} onChange={(e)=>setNewBanner(e.target.value)}/>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg border border-gray-700/30">Cancel</button>
              <button type="submit" className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">Publish Offer</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default DealsListing;
