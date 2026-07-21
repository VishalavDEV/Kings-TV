import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import './PublicNfcCard.css';

const PublicNfcCard = () => {
  const { uid } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const currentUrl = window.location.href;

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/public/card/${uid}`);
        if (data && !data.error) {
          setCard(data);
          // Increment tap count analytics in background
          fetchApi(`/public/card/${uid}/tap`, { method: 'POST' }).catch(() => {});
        } else {
          setErrorMsg('Business Profile card not found or suspended.');
        }
      } catch (e) {
        setErrorMsg('Card not active or revoked.');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [uid]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading digital business card...</p>
      </div>
    );
  }

  if (errorMsg || !card) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
        <i className="fa-solid fa-triangle-exclamation fa-3x" style={{ color: '#ef4444', marginBottom: '1rem' }}></i>
        <h2>Profile Not Available</h2>
        <p style={{ color: '#94a3b8' }}>{errorMsg || 'The business profile has been revoked.'}</p>
      </div>
    );
  }

  // Parse social links if present
  let socials = {};
  try {
    socials = JSON.parse(card.socialLinks || '{}');
  } catch (e) {}

  const themeClass = card.cardTemplate ? `theme-${card.cardTemplate}` : 'theme-classic';

  return (
    <div className={`nfc-card-profile-page ${themeClass}`}>
      <div className="profile-card-wrapper">
        
        {/* Profile Image & Cover Banner */}
        <div className="profile-cover-decor"></div>
        <div className="profile-avatar-container">
          <img
            src={card.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop'}
            alt={card.ownerName}
            className="profile-avatar-img"
          />
        </div>

        {/* Name / Titles */}
        <div className="profile-info-block">
          <h1 className="profile-name">{card.ownerName}</h1>
          {card.title && <h2 className="profile-title">{card.title}</h2>}
          {card.company && <h3 className="profile-company">{card.company}</h3>}
        </div>

        {/* Quick Contact buttons grid */}
        <div className="profile-action-links">
          {card.phone && (
            <a href={`tel:${card.phone}`} className="action-link-btn call">
              <i className="fa-solid fa-phone"></i>
              <span>Call Phone</span>
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className="action-link-btn email">
              <i className="fa-solid fa-envelope"></i>
              <span>Send Email</span>
            </a>
          )}
        </div>

        {/* Custom info list */}
        <div className="profile-details-list">
          {card.website && (
            <div className="detail-row-item">
              <i className="fa-solid fa-globe"></i>
              <a href={card.website} target="_blank" rel="noopener noreferrer">{card.website}</a>
            </div>
          )}
          {card.email && (
            <div className="detail-row-item">
              <i className="fa-solid fa-envelope"></i>
              <span>{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="detail-row-item">
              <i className="fa-solid fa-phone"></i>
              <span>{card.phone}</span>
            </div>
          )}
        </div>

        {/* Social Icons row */}
        <div className="social-links-icons-row">
          {socials.facebook && (
            <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="social-icon-circle">
              <i className="fa-brands fa-facebook"></i>
            </a>
          )}
          {socials.twitter && (
            <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="social-icon-circle">
              <i className="fa-brands fa-twitter"></i>
            </a>
          )}
          {socials.linkedin && (
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-circle">
              <i className="fa-brands fa-linkedin"></i>
            </a>
          )}
        </div>

        {/* Prominent Save Contact vCard CTA */}
        {card.vcardEnabled !== false && (
          <div className="vcard-cta-wrapper">
            <a href={`/api/public/card/${uid}/vcard`} className="save-contact-vcard-btn">
              <i className="fa-solid fa-user-plus"></i> Save to Contacts
            </a>
          </div>
        )}

        {/* QR Code Sharing module */}
        <div className="qr-sharing-module">
          <p>Scan to Share Contact Profile</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(currentUrl)}`}
            alt="Profile QR Code"
            className="sharing-qr-code"
          />
        </div>

      </div>
    </div>
  );
};

export default PublicNfcCard;
