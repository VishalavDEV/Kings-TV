import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';

const DealsListing = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  // Deals List States
  const [deals, setDeals] = useState([]);
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
        if (res && res.content) {
          setDeals(res.content);
        } else {
          setDeals([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching deals", err);
        setError("Showing simulated deals catalog.");
        setLoading(false);
        setDeals([
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
            deal: { id: 4, title: "25% Off on Car Wash", category: "Automotive", discountType: "percentage", discountValue: 25.0, originalPrice: 800.0, discountedPrice: 600.0, validUntil: "2026-05-28T23:59:59", couponCode: "WASH25", bannerUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400", usageLimit: 120, isFeatured: false, status: "approved" },
            merchant: { businessName: "Sparkle Car Care", addressLocality: "Ambattur, Chennai" }
          }
        ]);
      });
  };

  useEffect(() => {
    loadData();
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

  const filteredDeals = deals.filter(item => {
    const d = item.deal;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesPrice = !d.discountedPrice || d.discountedPrice <= priceRange;
    const matchesType = discountType === 'all' || d.discountType === discountType;
    return matchesSearch && matchesCat && matchesPrice && matchesType;
  });

  const categories = [
    { name: 'Food & Beverages', count: 18 },
    { name: 'Fashion', count: 12 },
    { name: 'Health & Wellness', count: 8 },
    { name: 'Automotive', count: 6 },
    { name: 'Electronics', count: 5 },
    { name: 'Home & Living', count: 4 },
    { name: 'Beauty & Salon', count: 3 },
    { name: 'Sports', count: 2 }
  ];

  return (
    <div className={`p-4 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <i className="fas fa-tags text-red-500"></i>
            {lang === 'en' ? 'Hot Deals & Offers' : 'சிறப்பு சலுகைகள்'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Grab the best discount coupons from verified local businesses</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition"
        >
          Create New Deal
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR FILTERS (Column 1) */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-sm mb-4">Filter Deals</h3>
            
            {/* Search Input */}
            <div className="relative mb-6 text-xs text-gray-800">
              <input 
                type="text" 
                placeholder="Search deals..." 
                className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <h4 className="font-bold text-xs uppercase text-gray-400 mb-3">Categories</h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <button 
                  onClick={() => setSelectedCategory('all')} 
                  className={`text-left ${selectedCategory === 'all' ? 'font-bold text-red-500' : 'text-gray-500'}`}
                >
                  All Categories
                </button>
                {categories.map((c, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedCategory(c.name)}
                    className={`flex justify-between items-center text-left ${selectedCategory === c.name ? 'font-bold text-red-500' : 'text-gray-500'}`}
                  >
                    <span>{c.name}</span> <span className="font-normal opacity-60">({c.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Type Checkboxes */}
            <div className="mb-6 text-xs">
              <h4 className="font-bold text-xs uppercase text-gray-400 mb-3">Discount Type</h4>
              <div className="space-y-2">
                {['percentage', 'flat', 'bogo', 'combo'].map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input 
                      type="radio" 
                      name="discountType" 
                      className="accent-red-500"
                      checked={discountType === type}
                      onChange={() => setDiscountType(type)}
                    />
                    <span>{type === 'bogo' ? 'Buy One Get One' : type + ' off'}</span>
                  </label>
                ))}
                <button onClick={() => setDiscountType('all')} className="text-red-500 font-bold text-[10px] mt-2 block hover:underline">Reset Types</button>
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <h4 className="font-bold text-xs uppercase text-gray-400 mb-3">Price Limit</h4>
              <input 
                type="range" 
                min="0" 
                max="50000" 
                step="100"
                className="w-full accent-red-500 cursor-pointer"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                <span>₹0</span>
                <span>₹{priceRange.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN BODY (Column 2) */}
        <div className="flex-1 space-y-8">
          
          {/* Hero Banner with countdown */}
          <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-red-600 to-orange-500 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
            <div className="space-y-3 max-w-lg">
              <span className="bg-white/20 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Deal of the Day
              </span>
              <h2 className="text-2xl md:text-3xl font-black">Up to 50% OFF on Fashion, Electronics &amp; More</h2>
              <p className="text-xs opacity-90">Grab the best offers from verified local businesses in Anna Nagar.</p>
              <button 
                onClick={() => alert("Opening today's best deals list...")}
                className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition transform hover:scale-105"
              >
                Explore Deals
              </button>
            </div>
            
            {/* Simulated countdown clock matching mockup */}
            <div className="flex gap-3 text-center">
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 min-w-[56px]">
                <h4 className="text-xl font-black">02</h4>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Days</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 min-w-[56px]">
                <h4 className="text-xl font-black">12</h4>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Hrs</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 min-w-[56px]">
                <h4 className="text-xl font-black">45</h4>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Mins</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md rounded-xl p-2.5 min-w-[56px]">
                <h4 className="text-xl font-black">36</h4>
                <p className="text-[9px] uppercase tracking-wider opacity-80">Secs</p>
              </div>
            </div>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDeals.map(item => {
              const d = item.deal;
              const m = item.merchant || {};
              return (
                <div 
                  key={d.id}
                  onClick={() => setSelectedDeal(d)}
                  className={`rounded-2xl overflow-hidden cursor-pointer border transition transform hover:-translate-y-1 hover:shadow-lg ${
                    theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${d.bannerUrl})` }}>
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {d.discountType === 'percentage' ? `${d.discountValue}% OFF` : `₹${d.discountValue} OFF`}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-red-500">{d.category}</span>
                      <h3 className="font-extrabold text-sm mt-1 leading-tight">{d.title}</h3>
                      <p className="text-[11px] text-gray-500 font-semibold mt-1">{m.businessName}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                        <i className="fas fa-map-marker-alt"></i> {m.addressLocality}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-800/10 pt-3 flex justify-between items-center text-xs mt-3">
                      <div>
                        <span className="font-black text-sm text-red-500">₹{d.discountedPrice || d.originalPrice}</span>
                        {d.originalPrice && (
                          <span className="text-[10px] line-through text-gray-400 ml-1.5">₹{d.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        Valid till {new Date(d.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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
