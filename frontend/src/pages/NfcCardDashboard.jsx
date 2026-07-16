import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';

const NfcCardDashboard = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);

  // Card & Stats state
  const [stats, setStats] = useState({
    totalTaps: 248,
    totalPayments: 45680.0,
    successfulPayments: 236,
    todaysTaps: 12,
    card: {
      id: 1,
      cardStatus: 'activated',
      shortCode: 'KCARD-10024',
      linkType: 'payment',
      upiId: 'kingcafe@upi',
      upiName: 'King Cafe',
      trackingNumber: 'TRK-987654321',
      updatedAt: '2025-05-20T12:00:00'
    }
  });

  const [tapsList, setTapsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiNameInput, setUpiNameInput] = useState('');
  const [linkTypeInput, setLinkTypeInput] = useState('payment');

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLinkType, setRequestLinkType] = useState('profile');
  const [requestUpi, setRequestUpi] = useState('');
  const [requestUpiName, setRequestUpiName] = useState('');

  // Selected merchant directory business id
  const [merchantBizId, setMerchantBizId] = useState(1);

  const loadData = () => {
    setLoading(true);
    fetchApi(`/nfc/stats?listingId=${merchantBizId}`)
      .then(data => {
        if (data && data.card && data.card.cardStatus !== 'none') {
          setStats(prev => ({
            ...prev,
            ...data,
            totalTaps: data.totalTaps || prev.totalTaps,
            totalPayments: data.totalPayments || prev.totalPayments,
            successfulPayments: data.successfulPayments || prev.successfulPayments,
            todaysTaps: data.todaysTaps !== undefined && data.todaysTaps !== 0 ? data.todaysTaps : prev.todaysTaps,
            card: {
              ...prev.card,
              ...data.card
            }
          }));
          setUpiIdInput(data.card.upiId || '');
          setUpiNameInput(data.card.upiName || '');
          setLinkTypeInput(data.card.linkType || 'payment');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    fetchApi(`/nfc/taps?listingId=${merchantBizId}`)
      .then(taps => {
        if (Array.isArray(taps) && taps.length > 0) {
          setTapsList(taps);
        } else {
          setTapsList([
            { id: 1, tappedAt: "2025-05-24T11:32:00", tapType: "payment", customerName: "Hari Prakash", amount: 250.00, status: "success", locationCity: "Anna Nagar, Chennai" },
            { id: 2, tappedAt: "2025-05-24T10:15:00", tapType: "profile", customerName: "Unknown", amount: 0.0, status: "success", locationCity: "T. Nagar, Chennai" },
            { id: 3, tappedAt: "2025-05-23T19:45:00", tapType: "payment", customerName: "Priya Sharma", amount: 1120.00, status: "success", locationCity: "Anna Nagar, Chennai" },
            { id: 4, tappedAt: "2025-05-23T18:20:00", tapType: "payment", customerName: "Vignesh R", amount: 560.00, status: "success", locationCity: "Anna Nagar, Chennai" }
          ]);
        }
      })
      .catch(() => {
        setTapsList([
          { id: 1, tappedAt: "2025-05-24T11:32:00", tapType: "payment", customerName: "Hari Prakash", amount: 250.00, status: "success", locationCity: "Anna Nagar, Chennai" },
          { id: 2, tappedAt: "2025-05-24T10:15:00", tapType: "profile", customerName: "Unknown", amount: 0.0, status: "success", locationCity: "T. Nagar, Chennai" },
          { id: 3, tappedAt: "2025-05-23T19:45:00", tapType: "payment", customerName: "Priya Sharma", amount: 1120.00, status: "success", locationCity: "Anna Nagar, Chennai" },
          { id: 4, tappedAt: "2025-05-23T18:20:00", tapType: "payment", customerName: "Vignesh R", amount: 560.00, status: "success", locationCity: "Anna Nagar, Chennai" }
        ]);
      });
  };

  useEffect(() => {
    fetchApi('/directory')
      .then(listings => {
        if (Array.isArray(listings) && listings.length > 0) {
          const kingCafe = listings.find(item => item.businessName === 'King Cafe') || listings[0];
          setMerchantBizId(kingCafe.id);
        }
      })
      .catch(() => {
        setMerchantBizId(1);
      });
  }, []);

  useEffect(() => {
    if (merchantBizId) {
      loadData();
    }
  }, [merchantBizId]);

  const handleUpdateUpi = (e) => {
    e.preventDefault();
    if (!stats.card || !stats.card.id) return;
    
    fetchApi(`/nfc/${stats.card.id}/upi`, {
      method: 'PUT',
      body: JSON.stringify({
        upiId: upiIdInput,
        upiName: upiNameInput,
        linkType: linkTypeInput
      })
    })
      .then(updated => {
        setStats(prev => ({
          ...prev,
          card: updated
        }));
        setShowUpiModal(false);
        loadData();
      })
      .catch(() => {
        // Local simulate update
        setStats(prev => ({
          ...prev,
          card: {
            ...prev.card,
            upiId: upiIdInput,
            upiName: upiNameInput,
            linkType: linkTypeInput
          }
        }));
        setShowUpiModal(false);
      });
  };

  const handleRequestCard = (e) => {
    e.preventDefault();
    fetchApi('/nfc/request', {
      method: 'POST',
      body: JSON.stringify({
        listingId: merchantBizId,
        linkType: requestLinkType,
        upiId: requestUpi,
        upiName: requestUpiName
      })
    })
      .then(() => {
        setShowRequestModal(false);
        loadData();
      })
      .catch(() => {
        // Local simulate order request
        setStats(prev => ({
          ...prev,
          card: {
            id: Date.now(),
            cardStatus: 'requested',
            shortCode: 'KC-REQ-' + Math.floor(1000 + Math.random() * 9000),
            linkType: requestLinkType,
            upiId: requestUpi,
            upiName: requestUpiName,
            updatedAt: new Date().toISOString()
          }
        }));
        setShowRequestModal(false);
      });
  };

  const handleBlockCard = () => {
    if (!stats.card || !stats.card.id) return;
    if (!window.confirm("Are you sure you want to block this NFC card?")) return;

    fetchApi(`/nfc/${stats.card.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'blocked' })
    })
      .then(updated => {
        setStats(prev => ({ ...prev, card: updated }));
      })
      .catch(() => {
        setStats(prev => ({ ...prev, card: { ...prev.card, cardStatus: 'blocked' } }));
      });
  };

  const handleReissueCard = () => {
    if (!stats.card || !stats.card.id) return;
    if (!window.confirm("Do you want to request card reissue? Current card will be blocked.")) return;

    fetchApi(`/nfc/${stats.card.id}/reissue`, {
      method: 'POST'
    })
      .then(() => {
        loadData();
      })
      .catch(() => {
        setStats(prev => ({
          ...prev,
          card: {
            ...prev.card,
            cardStatus: 'requested',
            shortCode: 'KCARD-REISSUE'
          }
        }));
      });
  };

  // Mock OTP Activation code generator for demo purposes
  const handleVerifyOtp = () => {
    const code = window.prompt("Enter 4-digit activation code (check your order status):");
    if (!code) return;
    fetchApi(`/nfc/${stats.card.id}/activate-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp: code })
    })
      .then(updated => {
        setStats(prev => ({ ...prev, card: updated }));
        alert("NFC Card Activated successfully!");
      })
      .catch((err) => {
        alert("Activation failed or invalid activation code");
      });
  };

  const card = stats.card || {};
  const statusSteps = ['requested', 'printing', 'shipped', 'activated'];
  const currentStepIdx = statusSteps.indexOf((card.cardStatus || 'requested').toLowerCase());

  const t = {
    title: lang === 'en' ? 'NFC Business Card' : 'என்எஃப்சி வணிக அட்டை',
    sub: lang === 'en' ? 'Manage your NFC card and tap-to-pay profile' : 'உங்கள் என்எஃப்சி கார்டு மற்றும் கட்டண சுயவிவரத்தை நிர்வகிக்கவும்',
    reqCard: lang === 'en' ? 'Request New Card' : 'புதிய கார்டு கோரவும்',
    cardLayout: lang === 'en' ? 'NFC Digital Card Layout' : 'என்எஃப்சி டிஜிட்டல் கார்டு வடிவமைப்பு',
    cardStatus: lang === 'en' ? 'Card Status' : 'கார்டு நிலை',
    linkedAccount: lang === 'en' ? 'Linked Payment Account' : 'இணைக்கப்பட்ட கட்டண கணக்கு',
    updatePayment: lang === 'en' ? 'Update Payment Details' : 'கட்டண விவரங்களை மாற்றவும்',
    summary: lang === 'en' ? 'Tap & Transaction Summary' : 'தட்டல் மற்றும் பரிவர்த்தனை சுருக்கம்',
    quickActions: lang === 'en' ? 'Quick Actions' : 'விரைவான செயல்கள்',
    history: lang === 'en' ? 'Recent Tap & Payment History' : 'சமீபத்திய தட்டல் மற்றும் கட்டண வரலாறு',
    viewAll: lang === 'en' ? 'View All Transactions' : 'அனைத்து பரிவர்த்தனைகளையும் காண்க',
    
    totalTaps: lang === 'en' ? 'Total Taps' : 'மொத்த தட்டல்கள்',
    totalPayments: lang === 'en' ? 'Total Payments' : 'மொத்த கட்டணங்கள்',
    successPayments: lang === 'en' ? 'Successful Payments' : 'வெற்றிகரமான கட்டணங்கள்',
    todayTaps: lang === 'en' ? "Today's Taps" : 'இன்றைய தட்டல்கள்',
    
    viewPreview: lang === 'en' ? 'View Card Preview' : 'கார்டு மாதிரியைக் காண்க',
    downloadQr: lang === 'en' ? 'Download QR Code' : 'QR குறியீட்டைப் பதிவிறக்குக',
    blockCard: lang === 'en' ? 'Block This Card' : 'இந்த கார்டை முடக்கவும்',
    reqReissue: lang === 'en' ? 'Request Reissue' : 'மறுபதிப்பு கோரவும்',
    
    dateTime: lang === 'en' ? 'Date & Time' : 'தேதி மற்றும் நேரம்',
    type: lang === 'en' ? 'Type' : 'வகை',
    customer: lang === 'en' ? 'Customer' : 'வாடிக்கையாளர்',
    amount: lang === 'en' ? 'Amount' : 'தொகை',
    status: lang === 'en' ? 'Status' : 'நிலை',
    location: lang === 'en' ? 'Location' : 'இருப்பிடம்',
    
    requested: lang === 'en' ? 'Requested' : 'கோரப்பட்டது',
    printing: lang === 'en' ? 'Printing' : 'அச்சிடப்படுகிறது',
    shipped: lang === 'en' ? 'Shipped' : 'அனுப்பப்பட்டது',
    activated: lang === 'en' ? 'Activated' : 'செயல்படுத்தப்பட்டது'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    const months = lang === 'en' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const formatStepDate = (stepName) => {
    // Return static mockup dates matching image, or fallback based on updatedAt
    if (stepName === 'requested') return '12 May 2025';
    if (stepName === 'printing') return '15 May 2025';
    if (stepName === 'shipped') return '18 May 2025';
    if (stepName === 'activated') return '20 May 2025';
  };

  return (
    <main className={`container mx-auto px-4 py-8 nfc-module-container ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ paddingBottom: '60px' }}>
      
      {/* Breadcrumbs */}
      <div className="breadcrumbs" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '9px', margin: '0 8px' }}></i>
        <Link to="/directory" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{lang === 'en' ? 'Local Business Directory' : 'நம்ம ஊர்'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '9px', margin: '0 8px' }}></i>
        <span style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'NFC Card' : 'என்எஃப்சி கார்டு'}</span>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#6366f1]/10 flex items-center justify-center text-[#6366f1] shadow-sm">
            <i className="fas fa-rss rotate-45 text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{t.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition shadow-sm border-0 cursor-pointer"
        >
          <i className="fas fa-plus"></i> {t.reqCard}
        </button>
      </div>

      {/* ROW 1: Card info & Timeline / UPI Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Card Mockup Visual (Column 1) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between shadow-sm ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <div>
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">{t.cardLayout}</h3>
            
            {/* NFC Card Mockup */}
            <div className="premium-nfc-card relative rounded-2xl p-6 bg-gradient-to-br from-[#090d16] via-zinc-900 to-[#111827] text-white h-44 flex flex-col justify-between shadow-2xl border border-yellow-500/20 overflow-hidden cursor-pointer">
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <i className="fas fa-wifi text-lg text-white rotate-90 opacity-85 text-gray-400"></i>
              </div>
              
              <div></div>
              
              <div className="flex flex-col items-center justify-center text-center">
                <i className="fas fa-crown text-yellow-500 text-3xl mb-1.5 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]"></i>
                <div className="flex items-center gap-1">
                  <span className="font-black text-sm tracking-wider">KING</span>
                  <span className="font-black text-[9px] px-1.5 py-0.5 bg-yellow-500 text-black rounded font-sans leading-none">24x7</span>
                </div>
                <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 mt-1 font-bold">LOCAL BUSINESS</span>
              </div>
              
              <div className="text-center text-[9px] text-gray-400 tracking-wider">
                Tap &nbsp;•&nbsp; Pay &nbsp;•&nbsp; Connect
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-650 dark:text-gray-400 font-semibold text-[13px]">Card ID: {card.shortCode || 'N/A'}</span>
              <button 
                onClick={() => {
                  if (card.shortCode) {
                    navigator.clipboard.writeText(card.shortCode);
                    alert(lang === 'en' ? 'Card ID copied to clipboard!' : 'கார்டு ஐடி நகலெடுக்கப்பட்டது!');
                  }
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-0 cursor-pointer p-0"
                title="Copy Card ID"
              >
                <i className="far fa-copy text-sm"></i>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#f0fdf4] text-[#16a34a] px-2.5 py-1.5 rounded-lg border border-[#bbf7d0]/60 font-bold text-[10px]">
                <span>Status: {card.cardStatus ? t[card.cardStatus.toLowerCase()] || card.cardStatus : t.requested}</span>
                <i className="fas fa-check-circle text-xs text-[#16a34a]"></i>
              </div>
              <span className="text-[11px] text-gray-550 dark:text-gray-400 font-medium">Activated on 20 May 2025</span>
            </div>
          </div>
        </div>

        {/* Timeline Status & UPI Config (Column 2-3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Card Dispatch Timeline */}
          <div className={`p-6 rounded-2xl border shadow-sm min-h-[190px] py-8 flex flex-col justify-center ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-6">{t.cardStatus}</h3>
            
            <div className="relative flex items-center justify-between px-6 mb-2">
              {/* Connecting Line aligned to circle centers */}
              <div className="absolute left-12 right-12 h-0.5 bg-gray-200 dark:bg-gray-800 top-[20px] -translate-y-1/2"></div>
              
              {statusSteps.map((step, i) => {
                const isActive = i <= currentStepIdx;
                const isCurrentActiveStep = i === currentStepIdx;
                const isLast = step === 'activated';
                
                let iconClass = 'far fa-file-alt';
                if (step === 'printing') iconClass = 'fas fa-cogs';
                if (step === 'shipped') iconClass = 'fas fa-truck';
                if (step === 'activated') iconClass = 'fas fa-check';

                return (
                  <div key={step} className="flex flex-col items-center relative z-10" style={{ width: '80px' }}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition mb-2 ${
                      isCurrentActiveStep ? 'timeline-pulse' : ''
                    } ${
                      isLast && isActive
                        ? 'bg-green-500 border-green-500 text-white shadow-md'
                        : isActive 
                          ? 'bg-white border-[#6366f1] text-[#6366f1] shadow-md' 
                          : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 text-gray-300 dark:text-gray-750'
                    }`}>
                      <i className={`${iconClass} text-xs`}></i>
                    </div>
                    <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">{t[step]}</p>
                    <p className="text-[8px] text-gray-400 mt-0.5 text-center">{formatStepDate(step)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Payment Account details */}
          <div className={`p-6 rounded-2xl border shadow-sm ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <i className="fas fa-shield-alt text-gray-400"></i>
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">{t.linkedAccount}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div>
                <p className="text-gray-400">UPI ID</p>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-250 mt-1">{card.upiId || 'Not linked'}</p>
              </div>
              <div>
                <p className="text-gray-400">Account Type</p>
                <p className="font-bold text-sm text-gray-800 dark:text-gray-250 mt-1">UPI</p>
              </div>
            </div>
            
            <div className="flex justify-start">
              <button 
                onClick={() => setShowUpiModal(true)}
                className="bg-[#6366f1]/10 text-[#6366f1] hover:bg-[#6366f1] hover:text-white border border-[#6366f1]/20 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-pen text-[10px]"></i> {t.updatePayment}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: Tap & Transaction Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left side: Metrics (spans 2 columns) */}
        <div className={`p-6 rounded-2xl border shadow-sm lg:col-span-2 ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-6">{t.summary}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Card 1: Total Taps */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-36 transition duration-300 hover:shadow-md ${
              theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-purple-50/20 border-purple-100/60 shadow-sm shadow-purple-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <i className="fas fa-fingerprint text-xs"></i>
                </span>
                <span className="text-[9px] text-purple-650 dark:text-purple-400 uppercase tracking-wider font-bold">{t.totalTaps}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stats.totalTaps}</h4>
                <p className="text-[9.5px] text-green-500 font-bold mt-2.5 flex items-center justify-center gap-0.5">
                  <i className="fas fa-arrow-up text-[8px]"></i> 18% this month
                </p>
              </div>
            </div>

            {/* Card 2: Total Payments */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-36 transition duration-300 hover:shadow-md ${
              theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-blue-50/20 border-blue-100/60 shadow-sm shadow-blue-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <i className="fas fa-wallet text-xs"></i>
                </span>
                <span className="text-[9px] text-blue-655 dark:text-blue-400 uppercase tracking-wider font-bold">{t.totalPayments}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">₹{stats.totalPayments.toLocaleString()}</h4>
                <p className="text-[9.5px] text-green-500 font-bold mt-2.5 flex items-center justify-center gap-0.5">
                  <i className="fas fa-arrow-up text-[8px]"></i> 22% this month
                </p>
              </div>
            </div>

            {/* Card 3: Successful Payments */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-36 transition duration-300 hover:shadow-md ${
              theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-green-50/20 border-green-100/60 shadow-sm shadow-green-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <i className="fas fa-check text-xs"></i>
                </span>
                <span className="text-[9px] text-green-655 dark:text-green-400 uppercase tracking-wider font-bold">{t.successPayments}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stats.successfulPayments}</h4>
                <p className="text-[9.5px] text-green-500 font-bold mt-2.5 flex items-center justify-center gap-0.5">
                  <i className="fas fa-arrow-up text-[8px]"></i> 20% this month
                </p>
              </div>
            </div>

            {/* Card 4: Today's Taps */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-36 transition duration-300 hover:shadow-md ${
              theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-orange-50/20 border-orange-100/60 shadow-sm shadow-orange-500/5'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <i className="fas fa-bolt text-xs"></i>
                </span>
                <span className="text-[9px] text-orange-655 dark:text-orange-400 uppercase tracking-wider font-bold">{t.todayTaps}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stats.todaysTaps}</h4>
                <p className="text-[9.5px] text-gray-500 mt-2.5">
                  Updated just now
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right side: Quick Actions (spans 1 column) */}
        <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
        }`}>
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">{t.quickActions}</h3>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => alert(`Redirect link: http://localhost:5173/t/${card.shortCode}`)}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition cursor-pointer text-left bg-transparent ${
                theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/40 text-white' : 'border-gray-100 hover:bg-gray-50/50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="far fa-eye text-[#6366f1] text-xs"></i>
                <span className="font-semibold text-xs">{t.viewPreview}</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
            </button>

            <button 
              onClick={() => alert("Downloading QR code...")}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition cursor-pointer text-left bg-transparent ${
                theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/40 text-white' : 'border-gray-100 hover:bg-gray-50/50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-qrcode text-[#6366f1] text-xs"></i>
                <span className="font-semibold text-xs">{t.downloadQr}</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
            </button>

            <button 
              onClick={handleBlockCard}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition cursor-pointer text-left bg-transparent ${
                theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/40 text-white' : 'border-gray-100 hover:bg-gray-50/50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-ban text-[#6366f1] text-xs"></i>
                <span className="font-semibold text-xs">{t.blockCard}</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
            </button>

            <button 
              onClick={handleReissueCard}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition cursor-pointer text-left bg-transparent ${
                theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/40 text-white' : 'border-gray-100 hover:bg-gray-50/50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-redo text-[#6366f1] text-xs"></i>
                <span className="font-semibold text-xs">{t.reqReissue}</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400 text-[10px]"></i>
            </button>
          </div>
        </div>

      </div>

      {/* ROW 3: Tap History Table List */}
      <div className={`p-6 rounded-2xl border shadow-sm overflow-hidden ${
        theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">{t.history}</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); alert("Viewing all transactions..."); }} className="text-[#6366f1] hover:underline text-xs font-semibold">{t.viewAll}</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-150 text-gray-400">
                <th className="pb-3 font-semibold">{t.dateTime}</th>
                <th className="pb-3 font-semibold">{t.type}</th>
                <th className="pb-3 font-semibold">{t.customer}</th>
                <th className="pb-3 font-semibold">{t.amount}</th>
                <th className="pb-3 font-semibold">{t.status}</th>
                <th className="pb-3 font-semibold">{t.location}</th>
              </tr>
            </thead>
            <tbody>
              {tapsList.map((tap, i) => (
                <tr key={i} className="premium-table-row border-b border-gray-100/10 last:border-0 hover:bg-gray-500/5 transition">
                  <td className="py-3.5 text-gray-600 dark:text-gray-400">{formatDate(tap.tappedAt)}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      {tap.tapType === 'payment' ? (
                        <>
                          <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <i className="fas fa-wallet text-[10px]"></i>
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Payment</span>
                        </>
                      ) : (
                        <>
                          <span className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <i className="fas fa-wifi text-[10px] rotate-90"></i>
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">Tap Only</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">{tap.customerName}</td>
                  <td className="py-3.5 font-bold text-gray-800 dark:text-gray-200">{tap.amount > 0 ? `₹${tap.amount.toFixed(2)}` : '—'}</td>
                  <td className="py-3.5">
                    {tap.amount > 0 ? (
                      <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        Success
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 text-gray-500 dark:text-gray-450">{tap.locationCity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateUpi} className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="text-md font-bold mb-4">Link Payment Account</h3>
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">UPI ID *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. merchant@ybl" 
                  className="bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Merchant Name (UPI Payee) *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. King Cafe" 
                  className="bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs"
                  value={upiNameInput}
                  onChange={(e) => setUpiNameInput(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">NFC Action Routing *</label>
                <select 
                  className={`bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}
                  value={linkTypeInput}
                  onChange={(e) => setLinkTypeInput(e.target.value)}
                >
                  <option value="payment">Direct Payment Request</option>
                  <option value="profile">Redirect to Business Directory Profile</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowUpiModal(false)} className="px-4 py-2 rounded-lg border border-gray-700/30 text-xs">Cancel</button>
              <button type="submit" className="bg-[#6366f1] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#4f46e5] transition border-0 cursor-pointer">Save Link Details</button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST CARD MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRequestCard} className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border ${
            theme === 'dark' ? 'bg-[#0f172a] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="text-md font-bold mb-4">Request NFC Business Card</h3>
            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">Card Functionality *</label>
                <select 
                  className={`bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}
                  value={requestLinkType}
                  onChange={(e) => setRequestLinkType(e.target.value)}
                >
                  <option value="profile">Profile Card (Showroom/Digital Portfolio)</option>
                  <option value="payment">Payment Enabled Card (Link UPI Account)</option>
                </select>
              </div>
              {requestLinkType === 'payment' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold">UPI Account Payee ID *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="merchant@upi"
                      className="bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs"
                      value={requestUpi}
                      onChange={(e) => setRequestUpi(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold">Merchant Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Registered business bank name"
                      className="bg-transparent border border-gray-750 p-2.5 rounded-lg focus:outline-none text-xs"
                      value={requestUpiName}
                      onChange={(e) => setRequestUpiName(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded-lg border border-gray-700/30 text-xs">Cancel</button>
              <button type="submit" className="bg-[#6366f1] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#4f46e5] transition border-0 cursor-pointer">Place NFC Order</button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
};

export default NfcCardDashboard;
