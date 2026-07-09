import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

const Footer = () => {
  const { lang } = useContext(LanguageContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/assets/icons/logo-icon-light.png" alt="KING 24x7" style={{ height: '40px', width: 'auto' }} className="logo-light-only" />
              <img src="/assets/icons/logo-icon-dark.png" alt="KING 24x7" style={{ height: '40px', width: 'auto' }} className="logo-dark-only" />
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>KING 24x7</span>
            </div>
            <div className="tagline" style={{ color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
              {lang === 'en' ? 'Truth. Responsibility. In Tamil.' : 'உண்மை. பொறுப்புடன். தமிழ்.'}
            </div>
            <p style={{ marginTop: '12px' }}>
              {lang === 'en' 
                ? 'KING 24x7 is a leading Tamil news portal. We deliver instant, reliable news from Tamil Nadu, India, and across the globe.'
                : 'KING 24x7 ஒரு முன்னணி தமிழ் செய்தி போர்டல். தமிழகம், இந்தியா மற்றும் உலகம் முழுவதும் இருந்து தமிழில் உடனடி, நம்பகமான செய்திகளை வழங்குகிறோம்.'}
            </p>
          </div>
          
          <div className="footer-col">
            <h5>{lang === 'en' ? 'News' : 'செய்திகள்'}</h5>
            <Link to="/category/politics">{lang === 'en' ? 'Politics' : 'அரசியல்'}</Link>
            <Link to="/category/business">{lang === 'en' ? 'Business' : 'வணிகம்'}</Link>
            <Link to="/category/sports">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</Link>
            <Link to="/category/cinema">{lang === 'en' ? 'Cinema' : 'சினிமா'}</Link>
            <Link to="/category/tech">{lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்'}</Link>
            <Link to="/directory">{lang === 'en' ? 'Regional' : 'மாநிலம்'}</Link>
            <Link to="/category/international">{lang === 'en' ? 'International' : 'சர்வதேசம்'}</Link>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'More' : 'கூடுதல்'}</h5>
            <Link to="/videos">{lang === 'en' ? 'Videos' : 'வீடியோக்கள்'}</Link>
            <Link to="/live-tv">{lang === 'en' ? 'Live TV' : 'லைவ் டிவி'}</Link>
            <Link to="/web-stories">{lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</Link>
            <Link to="/weather">{lang === 'en' ? 'Weather' : 'வானிலை'}</Link>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'Information' : 'தகவல்'}</h5>
            <Link to="/about-us">{lang === 'en' ? 'About Us' : 'எங்களைப் பற்றி'}</Link>
            <Link to="/contact">{lang === 'en' ? 'Contact' : 'தொடர்புக்கு'}</Link>
            <Link to="/advertise">{lang === 'en' ? 'Advertise' : 'விளம்பரம்'}</Link>
            <Link to="/careers">{lang === 'en' ? 'Careers' : 'வேலைவாய்ப்பு'}</Link>
            <Link to="/privacy-policy">{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</Link>
            <Link to="/terms-of-use">{lang === 'en' ? 'Terms of Use' : 'பயன்பாட்டு விதிமுறைகள்'}</Link>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'Download' : 'பதிவிறக்கம்'}</h5>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-google-play"></i> Google Play</a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-apple"></i> App Store</a>
            <div style={{ marginTop: '12px' }}>
              <h5 style={{ marginBottom: '8px' }}>{lang === 'en' ? 'Follow Us' : 'பின்தொடர'}</h5>
              <div className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><i className="fab fa-telegram-plane"></i></a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {currentYear} <strong>KING 24x7</strong> - All Rights Reserved.</div>
          <div>
            <Link to="/">RSS Feeds</Link> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <Link to="/">Sitemap</Link> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <Link to="/">Accessibility</Link> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <Link to="/terms-of-use">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
