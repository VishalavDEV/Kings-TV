import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { t, lang, setLang } = useContext(LanguageContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { session, logout } = useContext(AuthContext);
  const location = useLocation();

  const regionalPaths = ['/directory', '/wishes', '/obituaries', '/jobs', '/classifieds', '/business-studies'];
  const isRegionalPage = regionalPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  const [timeStr, setTimeStr] = useState('');
  const [district, setDistrict] = useState('சென்னை');
  const [weatherTemp, setWeatherTemp] = useState('32°C');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const daysTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsTa = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
      const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const d = new Date();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const secs = String(d.getSeconds()).padStart(2, '0');

      if (lang === 'en') {
        const day = daysEn[d.getDay()];
        const date = d.getDate();
        const month = monthsEn[d.getMonth()];
        const year = d.getFullYear();
        setTimeStr(`${day}, ${month} ${date}, ${year} | ${hours}:${mins}:${secs}`);
      } else {
        const day = daysTa[d.getDay()];
        const date = d.getDate();
        const month = monthsTa[d.getMonth()];
        const year = d.getFullYear();
        setTimeStr(`${day}, ${month} ${date}, ${year} | ${hours}:${mins}:${secs}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const activeClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive ? 'active' : '';
  };

  const handleDistrictChange = (e) => {
    const selected = e.target.value;
    setDistrict(selected);
    const temps = {
      'சென்னை': '32°C',
      'கோயம்புத்தூர்': '28°C',
      'மதுரை': '34°C',
      'சேலம்': '31°C',
      'திருச்சி': '33°C',
      'திருநெல்வேலி': '35°C',
      'வேலூர்': '33°C',
      'ஈரோடு': '30°C',
      'தஞ்சாவூர்': '32°C',
      'கன்னியாகுமரி': '29°C'
    };
    setWeatherTemp(temps[selected] || '32°C');
  };

  const getTamilRole = (role) => {
    const roles = {
      admin: 'நிர்வாகி',
      vendor: 'வணிகர்',
      editor: 'ஆசிரியர்',
      reporter: 'செய்தியாளர்',
      user: 'வாசகர்'
    };
    return roles[role] || 'வாசகர்';
  };

  const roleColors = {
    admin: '#EF4444',
    vendor: '#10B981',
    editor: '#8B5CF6',
    reporter: '#F59E0B',
    user: '#3B82F6'
  };

  return (
    <header style={{ width: '100%' }}>
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-left">
            <span>
              <i className="far fa-calendar-alt"></i>{' '}
              <span id="tamilDateTime">{timeStr}</span>
            </span>
            <span>
              <i className="fas fa-map-marker-alt"></i>{' '}
              <select 
                id="districtSelector" 
                className="district-select-top"
                value={district}
                onChange={handleDistrictChange}
                aria-label="District"
                style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', cursor: 'pointer' }}
              >
                {[
                  { key: 'சென்னை', en: 'Chennai', ta: 'சென்னை' },
                  { key: 'கோயம்புத்தூர்', en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
                  { key: 'மதுரை', en: 'Madurai', ta: 'மதுரை' },
                  { key: 'சேலம்', en: 'Salem', ta: 'சேலம்' },
                  { key: 'திருச்சி', en: 'Trichy', ta: 'திருச்சி' },
                  { key: 'திருநெல்வேலி', en: 'Tirunelveli', ta: 'திருநெல்வேலி' },
                  { key: 'வேலூர்', en: 'Vellore', ta: 'வேலூர்' },
                  { key: 'ஈரோடு', en: 'Erode', ta: 'ஈரோடு' },
                  { key: 'தஞ்சாவூர்', en: 'Tanjore', ta: 'தஞ்சாவூர்' },
                  { key: 'கன்னியாகுமரி', en: 'Kanyakumari', ta: 'கன்னியாகுமரி' }
                ].map(item => (
                  <option key={item.key} value={item.key} style={{ color: 'var(--text-dark)' }}>
                    {lang === 'en' ? item.en : item.ta}
                  </option>
                ))}
              </select>
            </span>
            <span>
              <i className="fas fa-thermometer-half"></i>{' '}
              <span id="topTemp">{weatherTemp}</span>
            </span>
          </div>
          <div className="top-bar-right">
            <a href="#" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" className="social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="#" className="social-icon" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            <a href="#" className="social-icon" aria-label="Telegram"><i className="fab fa-telegram-plane"></i></a>
            
            <button className="dark-toggle" id="darkToggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>{' '}
              {theme === 'light' ? (lang === 'en' ? 'Dark' : 'இருள்') : (lang === 'en' ? 'Light' : 'ஒளி')}
            </button>
            
            <select 
              className="lang-switcher" 
              value={lang} 
              onChange={(e) => setLang(e.target.value)} 
              aria-label="Language"
            >
              <option value="ta">தமிழ்</option>
              <option value="en">English</option>
            </select>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: '12px',
              paddingLeft: '12px',
              borderLeft: '1px solid var(--top-bar-border)'
            }}>
              {session && session.isLoggedIn ? (
                <>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--top-bar-text)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-user-circle" style={{ color: roleColors[session.role] || '#64748B' }}></i>
                    {session.username}
                    <span style={{
                      fontSize: '10px',
                      background: roleColors[session.role] || '#64748B',
                      color: 'white',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      {lang === 'en' ? session.role.toUpperCase() : getTamilRole(session.role)}
                    </span>
                  </span>
                  <button 
                    onClick={logout} 
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      outline: 'none'
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> {lang === 'en' ? 'Logout' : 'வெளியேறு'}
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <i className="fas fa-sign-in-alt"></i> {lang === 'en' ? 'Login' : 'உள்நுழை'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER MAIN */}
      <header className="header-main">
        <div className="container">
          <div className="header-left">
            <Link to="/" className="logo-link">
              <img src="/assets/images/logo-banner-light.png" alt="KING 24x7" className="main-logo-img logo-light-only" />
              <img src="/assets/images/logo-banner-dark.png" alt="KING 24x7" className="main-logo-img logo-dark-only" />
              <span className="logo-sub-text">LIVE • TRUE • TAMIL</span>
            </Link>
          </div>
          <div className="header-center"></div>
          <div className="header-right">
            <Link to="/" className="livetv-btn">
              <i className="fas fa-play-circle"></i> LIVE TV WATCH NOW
            </Link>
          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`} id="mainNav">
        <div className="container">
          <div 
            className="mobile-menu-btn" 
            id="mobileMenuBtn" 
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </div>
          {isRegionalPage ? (
            <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="navMenu">
              <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} id="sub-nav-home">
                <Link to="/" className="nav-link">{t('முகப்பு')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/directory' ? 'active' : ''}`} id="sub-nav-directory">
                <Link to="/directory" className="nav-link">{t('நம்ம ஊர்')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/wishes' ? 'active' : ''}`} id="sub-nav-wishes">
                <Link to="/wishes" className="nav-link">{t('வாழ்த்து')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/obituaries' ? 'active' : ''}`} id="sub-nav-obituaries">
                <Link to="/obituaries" className="nav-link">{t('இரங்கல்')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/business-studies' ? 'active' : ''}`} id="sub-nav-business">
                <Link to="/business-studies" className="nav-link">{t('வணிகம்')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/jobs' ? 'active' : ''}`} id="sub-nav-jobs">
                <Link to="/jobs" className="nav-link">{t('வேலை')}</Link>
              </li>
              <li className={`nav-item ${location.pathname === '/classifieds' ? 'active' : ''}`} id="sub-nav-classifieds">
                <Link to="/classifieds" className="nav-link">{t('தள்ளுபடி')}</Link>
              </li>
            </ul>
          ) : (
            <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`} id="navMenu">
              <li className={`nav-item ${activeClass('/')}`} id="nav-home">
                <Link to="/" className="nav-link">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/politics')}`} id="nav-politics">
                <Link to="/category/politics" className="nav-link">{lang === 'en' ? 'Politics' : 'அரசியல்'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/business')}`} id="nav-business">
                <Link to="/category/business" className="nav-link">{lang === 'en' ? 'Business' : 'வணிகம்'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/sports')}`} id="nav-sports">
                <Link to="/category/sports" className="nav-link">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/cinema')}`} id="nav-cinema">
                <Link to="/category/cinema" className="nav-link">{lang === 'en' ? 'Cinema' : 'பொழுதுபோக்கு'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/tech')}`} id="nav-tech">
                <Link to="/category/tech" className="nav-link">{lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/directory')}`} id="nav-directory">
                <Link to="/directory" className="nav-link">{lang === 'en' ? 'Regional' : 'மாநிலம்'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/category/world')}`} id="nav-world">
                <Link to="/category/world" className="nav-link">{lang === 'en' ? 'International' : 'சர்வதேசம்'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/videos')}`} id="nav-videos">
                <Link to="/videos" className="nav-link">{lang === 'en' ? 'Video' : 'வீடியோ'}</Link>
              </li>
              <li className={`nav-item ${activeClass('/web-stories')}`} id="nav-web-stories">
                <Link to="/web-stories" className="nav-link">{lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</Link>
              </li>
            </ul>
          )}
          <div className="nav-search" id="searchToggle" aria-label="Search"><i className="fas fa-search"></i></div>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          id="mobileOverlay" 
          style={{ display: 'block' }}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
