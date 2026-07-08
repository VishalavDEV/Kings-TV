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
            <a href="#">{lang === 'en' ? 'Politics' : 'அரசியல்'}</a>
            <a href="#">{lang === 'en' ? 'Tamil Nadu' : 'தமிழ்நாடு'}</a>
            <a href="#">{lang === 'en' ? 'India' : 'இந்தியா'}</a>
            <a href="#">{lang === 'en' ? 'World' : 'உலகம்'}</a>
            <a href="#">{lang === 'en' ? 'Business' : 'வணிகம்'}</a>
            <a href="#">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</a>
            <a href="#">{lang === 'en' ? 'Cinema' : 'சினிமா'}</a>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'More' : 'கூடுதல்'}</h5>
            <a href="#">{lang === 'en' ? 'Videos' : 'வீடியோக்கள்'}</a>
            <a href="#">{lang === 'en' ? 'Live TV' : 'லைவ் டிவி'}</a>
            <a href="#">{lang === 'en' ? 'Podcasts' : 'பாட்காஸ்ட்கள்'}</a>
            <a href="#">{lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</a>
            <a href="#">{lang === 'en' ? 'Weather' : 'வானிலை'}</a>
            <a href="#">{lang === 'en' ? 'Election Hub' : 'தேர்தல் மையம்'}</a>
            <a href="#">{lang === 'en' ? 'Market Rates' : 'சந்தை விலை'}</a>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'Information' : 'தகவல்'}</h5>
            <Link to="/about-us">{lang === 'en' ? 'About Us' : 'எங்களைப் பற்றி'}</Link>
            <Link to="/about-us">{lang === 'en' ? 'Contact' : 'தொடர்புக்கு'}</Link>
            <a href="#">{lang === 'en' ? 'Advertise' : 'விளம்பரம்'}</a>
            <Link to="/careers">{lang === 'en' ? 'Careers' : 'வேலைவாய்ப்பு'}</Link>
            <Link to="/privacy-policy">{lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை'}</Link>
            <Link to="/terms-of-use">{lang === 'en' ? 'Terms of Use' : 'பயன்பாட்டு விதிமுறைகள்'}</Link>
          </div>

          <div className="footer-col">
            <h5>{lang === 'en' ? 'Download' : 'பதிவிறக்கம்'}</h5>
            <a href="#"><i className="fab fa-google-play"></i> Google Play</a>
            <a href="#"><i className="fab fa-apple"></i> App Store</a>
            <div style={{ marginTop: '12px' }}>
              <h5 style={{ marginBottom: '8px' }}>{lang === 'en' ? 'Follow Us' : 'பின்தொடர'}</h5>
              <div className="footer-social">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                <a href="#" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                <a href="#" aria-label="Telegram"><i className="fab fa-telegram-plane"></i></a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {currentYear} <strong>KING 24x7</strong> - All Rights Reserved.</div>
          <div>
            <a href="#">RSS Feeds</a> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <a href="#">Sitemap</a> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <a href="#">Accessibility</a> <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
