import React, { useState, useEffect } from 'react';
import { fetchApi, SERVER_BASE } from '../utils/api';

export default function PopupAd() {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkAndFetchPopup = async () => {
      try {
        const ads = await fetchApi('/public/ads?slot=popup');
        if (Array.isArray(ads) && ads.length > 0) {
          const popupAd = ads[0];
          
          // Check frequency constraint (once per session)
          if (popupAd.displayFrequency === 'session') {
            const hasShown = sessionStorage.getItem(`popup_shown_${popupAd.id}`);
            if (hasShown) {
              return; // skip showing
            }
          }

          // Delay display if delaySeconds is specified
          const delay = popupAd.delaySeconds ? popupAd.delaySeconds * 1000 : 0;
          
          const timer = setTimeout(() => {
            setAd(popupAd);
            setVisible(true);
            
            // Mark as shown in session storage if frequency is once per session
            if (popupAd.displayFrequency === 'session') {
              sessionStorage.setItem(`popup_shown_${popupAd.id}`, 'true');
            }
          }, delay);

          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn('Failed to load popup ad', e);
      }
    };

    checkAndFetchPopup();
  }, []);

  const handleAdClick = () => {
    if (ad) {
      const form = document.getElementById(`popup-ad-click-form-${ad.id}`);
      if (form) {
        form.submit();
      } else if (ad.clickUrl) {
        window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
      }
      setVisible(false);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setVisible(false);
  };

  if (!visible || !ad) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={handleClose}
    >
      {/* Invisible POST form to log clicks */}
      <form 
        id={`popup-ad-click-form-${ad.id}`} 
        action={`${SERVER_BASE}/api/public/ads/${ad.id}/click`} 
        method="POST" 
        target="_blank" 
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
      />

      <div 
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '12px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        onClick={handleAdClick}
      >
        {/* Sponsored header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sponsored Announcement
          </span>
          {ad.closeButtonRequired !== false && (
            <button 
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              &times;
            </button>
          )}
        </div>

        {/* Ad Content */}
        <div style={{ width: '100%', cursor: 'pointer' }}>
          {ad.imageUrl ? (
            <img 
              src={ad.imageUrl} 
              alt="Advertisement" 
              style={{
                width: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
                borderRadius: '10px'
              }}
            />
          ) : ad.htmlCode ? (
            <div 
              dangerouslySetInnerHTML={{ __html: ad.htmlCode }} 
              style={{ width: '100%', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : null}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
