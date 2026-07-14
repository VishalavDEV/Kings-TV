import React, { useContext, useEffect, useState } from 'react';
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
          setStats(data);
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
        if (Array.isArray(taps)) {
          setTapsList(taps);
        }
      })
      .catch(() => {
        // Fallback tap list matching mockup
        setTapsList([
          { id: 1, tappedAt: "2025-05-24T11:32:00", tapType: "payment", customerName: "Hari Prakash", amount: 250.00, status: "success", locationCity: "Anna Nagar, Chennai" },
          { id: 2, tappedAt: "2025-05-24T10:15:00", tapType: "profile", customerName: "Unknown", amount: 0.0, status: "success", locationCity: "T. Nagar, Chennai" },
          { id: 3, tappedAt: "2025-05-23T19:45:00", tapType: "payment", customerName: "Priya Sharma", amount: 1120.00, status: "success", locationCity: "Anna Nagar, Chennai" },
          { id: 4, tappedAt: "2025-05-23T18:20:00", tapType: "payment", customerName: "Vignesh R", amount: 560.00, status: "success", locationCity: "Anna Nagar, Chennai" }
        ]);
      });
  };

  useEffect(() => {
    loadData();
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

  return (
    <div className={`p-4 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <i className="fas fa-microchip text-red-500 text-2xl"></i>
            {lang === 'en' ? 'NFC Business Card' : 'என்எஃப்சி வணிக அட்டை'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {lang === 'en' ? 'Manage your NFC card and tap-to-pay profile' : 'உங்கள் என்எஃப்சி கார்டு மற்றும் பணம் செலுத்தும் சுயவிவரத்தை நிர்வகிக்கவும்'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <i className="fas fa-plus"></i> Request New Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Card Mockup Visual (Column 1) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h3 className="font-bold text-sm mb-4">NFC Digital Card Layout</h3>
            <div className="relative rounded-2xl p-6 bg-gradient-to-br from-black via-zinc-900 to-stone-900 text-white h-44 flex flex-col justify-between shadow-2xl border border-yellow-500/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <i className="fas fa-crown text-yellow-500 text-lg"></i>
                  <span className="font-black text-xs tracking-wider">KINGS 24x7</span>
                </div>
                <i className="fas fa-wifi text-lg text-yellow-500 rotate-90 opacity-80"></i>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-gray-400">Card Identifier</p>
                <h4 className="font-mono text-sm tracking-wider mt-0.5">{card.shortCode || 'NO-CARD-ORDERED'}</h4>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>Status: <strong className="text-green-400 capitalize">{card.cardStatus || 'None'}</strong></span>
                <span>Active: Pay &amp; Profile</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Card ID:</span>
              <span className="font-bold">{card.shortCode || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shortcode Url:</span>
              <span className="font-bold text-red-500">/t/{card.shortCode || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card Status & UPI Config (Column 2) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          {/* Timeline Status */}
          <div>
            <h3 className="font-bold text-sm mb-6">Card Dispatch Timeline</h3>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 h-0.5 bg-gray-700 top-1/2 -translate-y-1/2 -z-10"></div>
              {statusSteps.map((step, i) => {
                const isActive = i <= currentStepIdx;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold ${
                      isActive 
                        ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                        : (theme === 'dark' ? 'bg-[#111827] border-gray-700 text-gray-500' : 'bg-white border-gray-300 text-gray-400')
                    }`}>
                      {isActive ? <i className="fas fa-check"></i> : i + 1}
                    </div>
                    <span className="text-[10px] capitalize font-semibold text-gray-500">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPI details */}
          <div className="border-t border-gray-800/10 pt-6 mt-6">
            <h4 className="font-bold text-xs mb-3">Linked Payment UPI Account</h4>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-gray-500/5 border border-gray-700/20">
              <div>
                <p className="text-gray-500">UPI Payee ID</p>
                <p className="font-bold text-sm mt-0.5">{card.upiId || 'Not linked'}</p>
              </div>
              <button 
                onClick={() => setShowUpiModal(true)}
                className="bg-red-600/10 text-red-500 border border-red-500/20 px-3.5 py-1.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition"
              >
                Update UPI
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions (Column 3) */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h3 className="font-bold text-sm mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-2.5 text-xs font-bold">
              <button 
                onClick={() => alert(`Redirect link: http://localhost:5173/t/${card.shortCode}`)}
                className="w-full text-left py-2.5 px-4 rounded-xl border border-gray-700/20 hover:bg-gray-500/5 flex items-center justify-between"
              >
                <span>View Digital Profile Card Link</span> &rarr;
              </button>
              <button 
                onClick={handleVerifyOtp}
                className="w-full text-left py-2.5 px-4 rounded-xl border border-gray-700/20 hover:bg-gray-500/5 flex items-center justify-between text-green-500"
              >
                <span>Activate Card with OTP Code</span> &rarr;
              </button>
              <button 
                onClick={handleBlockCard}
                className="w-full text-left py-2.5 px-4 rounded-xl border border-gray-700/20 hover:bg-gray-500/5 flex items-center justify-between text-amber-500"
              >
                <span>Temporary Block NFC Card</span> &rarr;
              </button>
              <button 
                onClick={handleReissueCard}
                className="w-full text-left py-2.5 px-4 rounded-xl border border-gray-700/20 hover:bg-gray-500/5 flex items-center justify-between text-red-500"
              >
                <span>Request Card Replacement</span> &rarr;
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 2. TAPS & PAYMENTS SUMMARY GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total Card Taps</span>
          <h2 className="text-2xl md:text-3xl font-black mt-1 text-red-500">{stats.totalTaps}</h2>
        </div>
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Total Payments</span>
          <h2 className="text-2xl md:text-3xl font-black mt-1 text-green-500">₹{stats.totalPayments.toLocaleString()}</h2>
        </div>
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Completed Payments</span>
          <h2 className="text-2xl md:text-3xl font-black mt-1 text-blue-500">{stats.successfulPayments}</h2>
        </div>
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'}`}>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Today Taps</span>
          <h2 className="text-2xl md:text-3xl font-black mt-1 text-yellow-500">{stats.todaysTaps}</h2>
        </div>
      </div>

      {/* 3. TAP HISTORY TABLE LIST */}
      <div className={`p-6 rounded-2xl border overflow-hidden ${
        theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <h3 className="font-bold text-sm mb-4">NFC Taps &amp; Transactions History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-800/20 text-gray-500">
                <th className="pb-3 font-bold">Date &amp; Time</th>
                <th className="pb-3 font-bold">Tap Type</th>
                <th className="pb-3 font-bold">Customer Name</th>
                <th className="pb-3 font-bold">Transaction Value</th>
                <th className="pb-3 font-bold">Location</th>
                <th className="pb-3 font-bold">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {tapsList.map((tap, i) => (
                <tr key={i} className="border-b border-gray-800/10 last:border-0">
                  <td className="py-3.5">{new Date(tap.tappedAt).toLocaleString()}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tap.tapType === 'payment' ? 'bg-green-600/10 text-green-500' : 'bg-blue-600/10 text-blue-500'
                    }`}>
                      {tap.tapType === 'payment' ? 'Payment Linked' : 'Profile Direct'}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold">{tap.customerName}</td>
                  <td className="py-3.5">{tap.amount > 0 ? `₹${tap.amount.toFixed(2)}` : '--'}</td>
                  <td className="py-3.5 text-gray-500">{tap.locationCity}</td>
                  <td className="py-3.5 text-green-500 font-bold capitalize">{tap.status}</td>
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
                  className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none"
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
                  className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none"
                  value={upiNameInput}
                  onChange={(e) => setUpiNameInput(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold">NFC Action Routing *</label>
                <select 
                  className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}
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
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition">Save Link Details</button>
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
                  className={`bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'}`}
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
                      className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none"
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
                      className="bg-transparent border border-gray-700/30 p-2.5 rounded-lg focus:outline-none"
                      value={requestUpiName}
                      onChange={(e) => setRequestUpiName(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 rounded-lg border border-gray-700/30 text-xs">Cancel</button>
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition">Place NFC Order</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default NfcCardDashboard;
