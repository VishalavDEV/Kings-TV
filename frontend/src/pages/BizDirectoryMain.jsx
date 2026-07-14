import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';
import './Videos.css'; // Leverage existing shared animations & styles if any, or inline Tailwind

const BizDirectoryMain = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  
  // Data State
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Selected business details modal
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [bizReviews, setBizReviews] = useState([]);
  const [bizGallery, setBizGallery] = useState([]);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  
  // Create business modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCat, setNewBizCat] = useState('Restaurant');
  const [newBizLoc, setNewBizLoc] = useState('');
  const [newBizStreet, setNewBizStreet] = useState('');
  const [newBizHours, setNewBizHours] = useState('09:00 AM - 09:00 PM');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizDesc, setNewBizDesc] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizWeb, setNewBizWeb] = useState('');
  const [newBizLogo, setNewBizLogo] = useState('');
  const [newBizCover, setNewBizCover] = useState('');

  const loadData = () => {
    setLoading(true);
    fetchApi('/directory')
      .then(data => {
        if (Array.isArray(data)) {
          setBusinesses(data);
        } else {
          setBusinesses([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching directory listings", err);
        setError("Failed to fetch directory details. Showing fallback simulated directory.");
        setLoading(false);
        // Fallbacks matching mockup names
        setBusinesses([
          { id: 1, businessName: "AB's Restaurant", category: "Restaurant", addressLocality: "Anna Nagar, Chennai", addressStreet: "12th Main Road", workingHours: "11:00 AM - 11:00 PM", phoneNumber: "044-1234567", ratingAvg: 4.6, ratingCount: 128, isFeatured: true, isPremium: true, kycStatus: "verified", subscriptionStatus: "premium", logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100", coverUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600", description: "Delicious multicuisine dining in the heart of Anna Nagar." },
          { id: 2, businessName: "Sundaram Hospital", category: "Health & Medical", addressLocality: "T. Nagar, Chennai", addressStreet: "GN Chetty Road", workingHours: "24 Hours Service", phoneNumber: "044-7654321", ratingAvg: 4.7, ratingCount: 256, isFeatured: true, isPremium: true, kycStatus: "verified", subscriptionStatus: "premium", logoUrl: "https://images.unsplash.com/photo-1586773860418-d3b3da96ae12?w=100", coverUrl: "https://images.unsplash.com/photo-1586773860418-d3b3da96ae12?w=600", description: "Premier multispeciality medical care clinic." },
          { id: 3, businessName: "Headlines Salon", category: "Beauty & Salon", addressLocality: "Velachery, Chennai", addressStreet: "Bypass Road", workingHours: "09:00 AM - 09:00 PM", phoneNumber: "044-9988776", ratingAvg: 4.5, ratingCount: 98, isFeatured: true, isPremium: false, kycStatus: "verified", subscriptionStatus: "free", logoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100", coverUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600", description: "Professional beauty treatments and hair styling salon." },
          { id: 4, businessName: "Gadget World", category: "Electronics", addressLocality: "Porur, Chennai", addressStreet: "Mount Poonamallee Road", workingHours: "10:00 AM - 09:30 PM", phoneNumber: "044-5544332", ratingAvg: 4.5, ratingCount: 75, isFeatured: false, isPremium: false, kycStatus: "verified", subscriptionStatus: "free", logoUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=100", coverUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600", description: "All kinds of smart gadgets, mobiles, and electronic accessories." }
        ]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBizClick = (biz) => {
    setSelectedBiz(biz);
    // Fetch gallery and reviews
    fetchApi(`/directory/${biz.id}/gallery`)
      .then(g => setBizGallery(Array.isArray(g) ? g : []))
      .catch(() => setBizGallery([
        { id: 101, imageUrl: biz.coverUrl },
        { id: 102, imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600" }
      ]));

    fetchApi(`/directory/${biz.id}/reviews`)
      .then(r => setBizReviews(Array.isArray(r) ? r : []))
      .catch(() => setBizReviews([
        { id: 201, reviewerName: "Hari Prakash", rating: 5, comment: "Amazing services and absolute professional behaviour!" },
        { id: 202, reviewerName: "Priya Sharma", rating: 4, comment: "Decent ambience and cooperative staff. Worth visiting." }
      ]));
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReviewComment || !newReviewName) return;

    fetchApi(`/directory/${selectedBiz.id}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        reviewerName: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment
      })
    })
      .then(saved => {
        setBizReviews(prev => [saved, ...prev]);
        setNewReviewComment('');
        setNewReviewName('');
        loadData(); // refresh rating count
      })
      .catch(() => {
        // local mockup fallback
        const mockRev = {
          id: Date.now(),
          reviewerName: newReviewName,
          rating: newReviewRating,
          comment: newReviewComment
        };
        setBizReviews(prev => [mockRev, ...prev]);
        setNewReviewComment('');
        setNewReviewName('');
      });
  };

  const handleCreateBusiness = (e) => {
    e.preventDefault();
    fetchApi('/directory', {
      method: 'POST',
      body: JSON.stringify({
        businessName: newBizName,
        category: newBizCat,
        addressLocality: newBizLoc,
        addressStreet: newBizStreet,
        workingHours: newBizHours,
        phoneNumber: newBizPhone,
        description: newBizDesc,
        email: newBizEmail,
        website: newBizWeb,
        logoUrl: newBizLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100",
        coverUrl: newBizCover || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
        status: "active"
      })
    })
      .then(() => {
        setShowAddModal(false);
        loadData();
        // Reset states
        setNewBizName('');
        setNewBizLoc('');
        setNewBizPhone('');
      })
      .catch(() => {
        // Fallback simulate local update
        const fallbackBiz = {
          id: Date.now(),
          businessName: newBizName,
          category: newBizCat,
          addressLocality: newBizLoc,
          addressStreet: newBizStreet,
          workingHours: newBizHours,
          phoneNumber: newBizPhone,
          ratingAvg: 5.0,
          ratingCount: 1,
          logoUrl: newBizLogo || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100",
          coverUrl: newBizCover || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
          description: newBizDesc
        };
        setBusinesses(prev => [fallbackBiz, ...prev]);
        setShowAddModal(false);
      });
  };

  // Filter listings based on category and searches
  const filtered = businesses.filter(b => {
    const matchesCategory = selectedCategory === 'all' || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLoc = b.addressLocality.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesCategory && matchesSearch && matchesLoc;
  });

  const categories = [
    { name: 'Restaurant', icon: 'fa-utensils', color: 'bg-red-50 text-red-500' },
    { name: 'Health & Medical', icon: 'fa-heartbeat', color: 'bg-green-55 text-green-600' },
    { name: 'Education', icon: 'fa-graduation-cap', color: 'bg-purple-50 text-purple-500' },
    { name: 'Automotive', icon: 'fa-car', color: 'bg-blue-50 text-blue-500' },
    { name: 'Real Estate', icon: 'fa-home', color: 'bg-orange-50 text-orange-500' },
    { name: 'Beauty & Salon', icon: 'fa-spa', color: 'bg-pink-50 text-pink-500' },
    { name: 'Electronics', icon: 'fa-laptop', color: 'bg-indigo-50 text-indigo-500' },
    { name: 'Shops', icon: 'fa-shopping-bag', color: 'bg-teal-50 text-teal-500' }
  ];

  return (
    <div className={`p-4 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 1. HERO BANNER WITH DYNAMIC SEARCH */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-cover bg-center p-8 md:p-16 flex flex-col items-center justify-center text-center text-white" 
           style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200")' }}>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          {lang === 'en' ? 'Find the Best Local Businesses Near You' : 'உங்களுக்கு அருகிலுள்ள சிறந்த வணிகங்களைக் கண்டறியவும்'}
        </h1>
        <p className="text-md md:text-lg mb-8 opacity-90 max-w-2xl">
          {lang === 'en' ? 'Search, discover and connect with trusted local businesses.' : 'நம்பகமான உள்ளூர் வணிகங்களைத் தேடிக் கண்டறிந்து தொடர்பு கொள்ளுங்கள்.'}
        </p>

        {/* Search form controls */}
        <div className="biz-search-bar">
          <div className="biz-search-field">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Search businesses, services...' : 'வணிகங்கள், சேவைகளைத் தேடுக...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="biz-search-field">
            <i className="fas fa-map-marker-alt"></i>
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Chennai, Tamil Nadu' : 'சென்னை, தமிழ்நாடு'} 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button className="biz-search-btn">
            {lang === 'en' ? 'Search' : 'தேடுக'}
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-4xl">
          <div className="flex items-center gap-2 justify-center bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 text-xs">
            <i className="fas fa-check-circle text-green-400"></i> KYC Verified
          </div>
          <div className="flex items-center gap-2 justify-center bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 text-xs">
            <i className="fas fa-star text-yellow-400"></i> Top Rated Services
          </div>
          <div className="flex items-center gap-2 justify-center bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 text-xs">
            <i className="fas fa-mobile-alt text-blue-400"></i> NFC Tap to Pay
          </div>
          <div className="flex items-center gap-2 justify-center bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/10 text-xs">
            <i className="fas fa-tags text-orange-400"></i> Great Deals & Offers
          </div>
        </div>
      </div>

      {/* 2. BROWSE CATEGORIES ROW */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">{lang === 'en' ? 'Browse Categories' : 'வகைகளை உலாவுக'}</h2>
          <button onClick={() => setSelectedCategory('all')} className="text-red-500 hover:underline text-sm font-semibold">
            {lang === 'en' ? 'View All Categories' : 'அனைத்து பிரிவுகள்'} &rarr;
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((c, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedCategory(c.name)}
              className={`p-4 rounded-xl flex flex-col items-center justify-center text-center transition duration-150 border ${
                selectedCategory === c.name 
                  ? 'border-red-500 bg-red-50/10' 
                  : (theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-white')
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${c.color}`}>
                <i className={`fas ${c.icon} text-lg`}></i>
              </div>
              <span className="text-xs font-bold leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. BUSINESSES LIST & CARD DISPLAY */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Listings column */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              {selectedCategory === 'all' ? (lang === 'en' ? 'Featured Businesses' : 'சிறப்பு வணிகங்கள்') : `${selectedCategory}`}
            </h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> {lang === 'en' ? 'Add Business' : 'வணிகத்தைச் சேர்'}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="animate-pulse rounded-xl border border-gray-200/20 p-4 h-64 bg-gray-500/10"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-700/20">
              <i className="fas fa-store-slash text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-lg font-bold mb-2">{lang === 'en' ? 'No businesses found' : 'வணிகங்கள் எதுவும் காணப்படவில்லை'}</h3>
              <p className="text-sm text-gray-500">{lang === 'en' ? 'Try adjusting your search query or filters' : 'தேடல் சொற்களை மாற்றி மீண்டும் முயலவும்'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(biz => (
                <div 
                  key={biz.id}
                  onClick={() => handleBizClick(biz)}
                  className={`rounded-2xl overflow-hidden cursor-pointer transition transform hover:-translate-y-1 hover:shadow-xl border ${
                    theme === 'dark' ? 'bg-[#111827] border-gray-800/80' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${biz.coverUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600'})` }}>
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                      FEATURED
                    </div>
                    {biz.kycStatus === 'verified' && (
                      <div className="absolute bottom-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> KYC Verified
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold text-red-500">{biz.category}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
                        <i className="fas fa-star"></i> {biz.ratingAvg || 5.0} <span className="text-gray-500 font-normal">({biz.ratingCount || 0})</span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-lg mb-2">{biz.businessName}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5">
                      <i className="fas fa-map-marker-alt text-gray-400"></i> {biz.addressLocality}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-1.5">
                      <i className="fas fa-clock text-gray-400"></i> {biz.workingHours}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                      <i className="fas fa-phone-alt text-gray-400"></i> {biz.phoneNumber}
                    </p>
                    <div className="border-t border-gray-200/10 pt-3 flex justify-between items-center text-xs">
                      <span className="text-green-500 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Open Now
                      </span>
                      <button className="text-red-500 hover:underline font-bold">
                        {lang === 'en' ? 'View Details' : 'விவரங்களைக் காண்க'} &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar marketing card column */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-extrabold text-lg mb-4">{lang === 'en' ? 'Why List Your Business?' : 'உங்கள் வணிகத்தை ஏன் இணைக்க வேண்டும்?'}</h3>
            <ul className="text-xs space-y-3 text-gray-500 mb-6">
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i> Get discovered by more local customers
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i> Improve your online visibility
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i> Build trust with KYC verified badge
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check text-green-500 mt-0.5"></i> Showcase your products & services
              </li>
            </ul>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition duration-150"
            >
              + {lang === 'en' ? 'Add Your Business' : 'வணிகத்தைப் பதிவு செய்'}
            </button>
          </div>

          {/* Popular Locations lists */}
          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
            <h3 className="font-bold text-md mb-4 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-red-500"></i> Popular Locations
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div onClick={() => setLocationQuery("Anna Nagar")} className="flex justify-between items-center cursor-pointer hover:text-red-500">
                <span>Anna Nagar</span> <span className="text-gray-500 font-normal">120+ businesses</span>
              </div>
              <div onClick={() => setLocationQuery("T. Nagar")} className="flex justify-between items-center cursor-pointer hover:text-red-500">
                <span>T. Nagar</span> <span className="text-gray-500 font-normal">95+ businesses</span>
              </div>
              <div onClick={() => setLocationQuery("Velachery")} className="flex justify-between items-center cursor-pointer hover:text-red-500">
                <span>Velachery</span> <span className="text-gray-500 font-normal">80+ businesses</span>
              </div>
              <div onClick={() => setLocationQuery("Adyar")} className="flex justify-between items-center cursor-pointer hover:text-red-500">
                <span>Adyar</span> <span className="text-gray-500 font-normal">70+ businesses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BUSINESS DETAIL POPUP MODAL (Reviews, Gallery, Contact) */}
      {selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: `url(${selectedBiz.coverUrl})` }}>
              <button 
                onClick={() => setSelectedBiz(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg focus:outline-none"
              >
                &times;
              </button>
              <div className="absolute bottom-4 left-6 flex items-center gap-4">
                <img src={selectedBiz.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl border-2 border-white shadow-md bg-white object-cover" />
                <div>
                  <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">{selectedBiz.category}</span>
                  <h2 className="text-2xl font-black text-white mt-1 shadow-sm">{selectedBiz.businessName}</h2>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Info Column */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="font-extrabold text-lg mb-3">About Us</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{selectedBiz.description || 'No description provided.'}</p>
                </div>

                {/* Photo Gallery */}
                <div>
                  <h3 className="font-extrabold text-lg mb-3">Gallery</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {bizGallery.map((g, idx) => (
                      <img key={idx} src={g.imageUrl} alt="Gallery" className="w-36 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-700/20" />
                    ))}
                  </div>
                </div>

                {/* Reviews List */}
                <div>
                  <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
                    Reviews &amp; Ratings 
                    <span className="text-xs font-bold text-yellow-500">
                      <i className="fas fa-star"></i> {selectedBiz.ratingAvg || 5.0} ({selectedBiz.ratingCount || 0})
                    </span>
                  </h3>

                  {/* Submit review form */}
                  <form onSubmit={submitReview} className="space-y-3 mb-6 p-4 rounded-xl border border-gray-700/20 bg-gray-500/5">
                    <h4 className="text-xs font-bold uppercase text-red-500">Write a Review</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        required
                        className="bg-transparent border border-gray-700/30 rounded-lg p-2 text-xs focus:outline-none w-full"
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                      />
                      <select 
                        className={`bg-transparent border border-gray-700/30 rounded-lg p-2 text-xs focus:outline-none w-full ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      >
                        <option value="5">5 Star (Excellent)</option>
                        <option value="4">4 Star (Good)</option>
                        <option value="3">3 Star (Average)</option>
                        <option value="2">2 Star (Poor)</option>
                        <option value="1">1 Star (Terrible)</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Share your experience working with this merchant..." 
                      rows="2"
                      required
                      className="bg-transparent border border-gray-700/30 rounded-lg p-2 text-xs focus:outline-none w-full"
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                    ></textarea>
                    <button className="bg-red-600 text-white font-bold py-2 px-5 rounded-lg text-xs hover:bg-red-700 transition">
                      Submit Review
                    </button>
                  </form>

                  {/* Reviews Content */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {bizReviews.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No reviews yet. Be the first to review!</p>
                    ) : (
                      bizReviews.map((r, i) => (
                        <div key={i} className="border-b border-gray-800/10 pb-3 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold">{r.reviewerName}</span>
                            <span className="text-yellow-500"><i className="fas fa-star"></i> {r.rating}</span>
                          </div>
                          <p className="text-gray-500">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Contacts details */}
              <div className="space-y-6">
                <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-bold text-sm mb-4">Contact Information</h3>
                  <div className="space-y-3 text-xs text-gray-500">
                    <p className="flex items-start gap-2">
                      <i className="fas fa-map-marker-alt text-red-500 mt-0.5"></i>
                      <span>{selectedBiz.addressStreet}, {selectedBiz.addressLocality}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-phone-alt text-red-500"></i>
                      <span>{selectedBiz.phoneNumber}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-envelope text-red-500"></i>
                      <span>{selectedBiz.email || 'info@merchant.com'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-globe text-red-500"></i>
                      <a href={selectedBiz.website || '#'} className="hover:underline text-red-500">{selectedBiz.website || 'www.merchant.com'}</a>
                    </p>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className="font-bold text-sm mb-3">Operating Hours</h3>
                  <p className="text-xs text-green-500 font-bold flex items-center gap-1.5 mb-2">
                    <i className="fas fa-clock"></i> Open Now
                  </p>
                  <p className="text-xs text-gray-500">{selectedBiz.workingHours}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 5. ADD BUSINESS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateBusiness} className={`w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold">Add New Local Business</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-2xl font-bold">&times;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Business Name *</label>
                <input type="text" required placeholder="e.g. AB's Cafe" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizName} onChange={(e)=>setNewBizName(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Category *</label>
                <select className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`} value={newBizCat} onChange={(e)=>setNewBizCat(e.target.value)}>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Health & Medical">Health & Medical</option>
                  <option value="Education">Education</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Beauty & Salon">Beauty & Salon</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Shops">Shops</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Locality (City/Area) *</label>
                <input type="text" required placeholder="e.g. Anna Nagar, Chennai" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizLoc} onChange={(e)=>setNewBizLoc(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Phone Number *</label>
                <input type="text" required placeholder="e.g. +91 98765 43210" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizPhone} onChange={(e)=>setNewBizPhone(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-bold">Short Description</label>
                <textarea rows="3" placeholder="Briefly describe what your business offers..." className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizDesc} onChange={(e)=>setNewBizDesc(e.target.value)}></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Street Address</label>
                <input type="text" placeholder="e.g. 5th Cross Street" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizStreet} onChange={(e)=>setNewBizStreet(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Working Hours</label>
                <input type="text" placeholder="e.g. 09:00 AM - 09:00 PM" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizHours} onChange={(e)=>setNewBizHours(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Logo Image URL</label>
                <input type="url" placeholder="https://example.com/logo.jpg" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizLogo} onChange={(e)=>setNewBizLogo(e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Cover Image URL</label>
                <input type="url" placeholder="https://example.com/cover.jpg" className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none" value={newBizCover} onChange={(e)=>setNewBizCover(e.target.value)}/>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-xl border border-gray-700/30 hover:bg-gray-500/10 text-xs font-bold">Cancel</button>
              <button type="submit" className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-red-700 transition">Register Business</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default BizDirectoryMain;
