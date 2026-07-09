import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
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
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  
  // Alternative Header redsign variation selector state
  // 'compact' | 'newspaper' | 'mobile-app'
  const [headerStyle, setHeaderStyle] = useState('compact');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compactUtilityOpen, setCompactUtilityOpen] = useState(false);
  const [newspaperUtilityOpen, setNewspaperUtilityOpen] = useState(false);

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

  const handleDistrictChange = (selected) => {
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

  const getCurrentDistrictName = (key) => {
    const districtNames = {
      'சென்னை': { en: 'Chennai', ta: 'சென்னை' },
      'கோயம்புத்தூர்': { en: 'Coimbatore', ta: 'கோயம்புத்தூர்' },
      'மதுரை': { en: 'Madurai', ta: 'மதுரை' },
      'சேலம்': { en: 'Salem', ta: 'சேலம்' },
      'திருச்சி': { en: 'Trichy', ta: 'திருச்சி' },
      'திருநெல்வேலி': { en: 'Tirunelveli', ta: 'திருநெல்வேலி' },
      'வேலூர்': { en: 'Vellore', ta: 'வேலூர்' },
      'ஈரோடு': { en: 'Erode', ta: 'ஈரோடு' },
      'தஞ்சாவூர்': { en: 'Tanjore', ta: 'தஞ்சாவூர்' },
      'கன்னியாகுமரி': { en: 'Kanyakumari', ta: 'கன்னியாகுமரி' }
    };
    const item = districtNames[key];
    return item ? (lang === 'en' ? item.en : item.ta) : key;
  };

  // Shared UI parts
  const renderLogo = (size = 'normal') => (
    <Link to="/" className="logo-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none' }}>
      <img 
        src="/assets/images/logo-banner-light.png" 
        alt="KING 24x7" 
        className="logo-light-only" 
        style={{ height: size === 'small' ? '40px' : '55px', width: 'auto', objectFit: 'contain', display: 'block' }} 
      />
      <img 
        src="/assets/images/logo-banner-dark.png" 
        alt="KING 24x7" 
        className="logo-dark-only" 
        style={{ height: size === 'small' ? '40px' : '55px', width: 'auto', objectFit: 'contain', display: 'block' }} 
      />
    </Link>
  );

  const renderLiveTvBtn = () => (
    <Link to="/live-tv" className="livetv-btn" style={{
      background: '#B3732A',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <i className="fas fa-play-circle"></i> {lang === 'en' ? 'LIVE TV WATCH NOW' : 'லைவ் டிவி பார்க்க'}
    </Link>
  );

  const renderDistrictSelector = (darkBg = false) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button 
        onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
        style={{
          background: darkBg ? '#000000' : 'transparent',
          border: 'none',
          color: darkBg ? '#FFFFFF' : (theme === 'dark' ? '#FFFFFF' : '#1A1A1A'),
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: '6px 10px',
          borderRadius: '4px',
          transition: 'background 0.2s'
        }}
      >
        <span>{getCurrentDistrictName(district)} 24x7</span>
        <i className="fas fa-pencil-alt" style={{ fontSize: '10px', color: darkBg ? 'rgba(255,255,255,0.7)' : '#666' }}></i>
      </button>
      {showDistrictDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: theme === 'dark' ? '#1E293B' : '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          borderRadius: '6px',
          padding: '4px 0',
          zIndex: 9999,
          minWidth: '160px',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          marginTop: '6px'
        }}>
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
            <button
              key={item.key}
              onClick={() => {
                handleDistrictChange(item.key);
                setShowDistrictDropdown(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: district === item.key ? (theme === 'dark' ? '#334155' : '#EFF6FF') : 'transparent',
                color: district === item.key ? '#3B82F6' : (theme === 'dark' ? '#FFFFFF' : '#1E293B'),
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'block'
              }}
            >
              {lang === 'en' ? item.en : item.ta}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderSocials = () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <a href="#" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
      <a href="#" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
      <a href="#" className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
      <a href="#" className="social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
    </div>
  );

  const renderAuthSection = () => {
    if (session && session.isLoggedIn) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--top-bar-text)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-user-circle" style={{ color: roleColors[session.role] || '#64748B' }}></i>
            {session.username}
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
              gap: '4px'
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      );
    }
    return (
      <Link to="/login" style={{
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        textDecoration: 'none'
      }}>
        <i className="fas fa-sign-in-alt"></i> {lang === 'en' ? 'Login' : 'உள்நுழை'}
      </Link>
    );
  };

  const renderNavMenu = (flexDir = 'row', onLinkClick = () => {}) => {
    if (isRegionalPage) {
      return (
        <ul className="nav-menu" style={{ display: 'flex', flexDirection: flexDir, gap: flexDir === 'column' ? '15px' : '0' }}>
          <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/" className="nav-link">{t('முகப்பு')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/directory' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/directory" className="nav-link">{t('நம்ம ஊர்')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/wishes' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/wishes" className="nav-link">{t('வாழ்த்து')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/obituaries' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/obituaries" className="nav-link">{t('இரங்கல்')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/business-studies' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/business-studies" className="nav-link">{t('வணிகம்')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/jobs' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/jobs" className="nav-link">{t('வேலை')}</Link>
          </li>
          <li className={`nav-item ${location.pathname === '/classifieds' ? 'active' : ''}`} onClick={onLinkClick}>
            <Link to="/classifieds" className="nav-link">{t('தள்ளுபடி')}</Link>
          </li>
        </ul>
      );
    }
    return (
      <ul className="nav-menu" style={{ display: 'flex', flexDirection: flexDir, gap: flexDir === 'column' ? '15px' : '0' }}>
        <li className={`nav-item ${activeClass('/')}`} onClick={onLinkClick}>
          <Link to="/" className="nav-link">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/politics')}`} onClick={onLinkClick}>
          <Link to="/category/politics" className="nav-link">{lang === 'en' ? 'Politics' : 'அரசியல்'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/business')}`} onClick={onLinkClick}>
          <Link to="/category/business" className="nav-link">{lang === 'en' ? 'Business' : 'வணிகம்'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/sports')}`} onClick={onLinkClick}>
          <Link to="/category/sports" className="nav-link">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/cinema')}`} onClick={onLinkClick}>
          <Link to="/category/cinema" className="nav-link">{lang === 'en' ? 'Cinema' : 'பொழுதுபோக்கு'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/tech')}`} onClick={onLinkClick}>
          <Link to="/category/tech" className="nav-link">{lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/directory')}`} onClick={onLinkClick}>
          <Link to="/directory" className="nav-link">{lang === 'en' ? 'Regional' : 'மாநிலம்'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/category/world')}`} onClick={onLinkClick}>
          <Link to="/category/world" className="nav-link">{lang === 'en' ? 'International' : 'சர்வதேசம்'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/videos')}`} onClick={onLinkClick}>
          <Link to="/videos" className="nav-link">{lang === 'en' ? 'Video' : 'வீடியோ'}</Link>
        </li>
        <li className={`nav-item ${activeClass('/web-stories')}`} onClick={onLinkClick}>
          <Link to="/web-stories" className="nav-link">{lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</Link>
        </li>
      </ul>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Live Preview Variation Selector (temporary styling switcher for review) */}
      <div style={{
        background: '#1E293B',
        color: '#FFFFFF',
        padding: '8px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        fontSize: '11px',
        fontWeight: 'bold',
        borderBottom: '2px solid #3B82F6',
        zIndex: 10002,
        position: 'relative'
      }}>
        <span>PREVIEW ALTERNATIVE DESIGN:</span>
        <button onClick={() => { setHeaderStyle('compact'); setDrawerOpen(false); }} style={{ background: headerStyle === 'compact' ? '#3B82F6' : '#334155', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>1. Compact Modern</button>
        <button onClick={() => { setHeaderStyle('newspaper'); setDrawerOpen(false); }} style={{ background: headerStyle === 'newspaper' ? '#3B82F6' : '#334155', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>2. Newspaper Style</button>
        <button onClick={() => { setHeaderStyle('mobile-app'); setDrawerOpen(false); }} style={{ background: headerStyle === 'mobile-app' ? '#3B82F6' : '#334155', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>3. Mobile App Style</button>
      </div>

      {/* ========================================================
          SAMPLE 1: COMPACT MODERN HEADER
          ======================================================== */}
      {headerStyle === 'compact' && (
        <header className="header-compact-modern" style={{ background: 'var(--header-bg, #ffffff)', borderBottom: '1px solid #e2e8f0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {renderLogo('small')}
              {renderDistrictSelector()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {renderLiveTvBtn()}
              {/* Compact Menu Hamburger */}
              <button 
                onClick={() => setCompactUtilityOpen(!compactUtilityOpen)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', color: 'var(--text-dark, #333)', cursor: 'pointer' }}
                aria-label="Toggle utility drawer"
              >
                <i className={`fas ${compactUtilityOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>

          {/* Compact Utilities Collapsible Panel */}
          {compactUtilityOpen && (
            <div style={{
              background: theme === 'dark' ? '#1E293B' : '#FAF8FF',
              borderBottom: '1px solid #e2e8f0',
              padding: '15px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'slideDown 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}><i className="far fa-calendar-alt"></i> {timeStr}</span>
                <span style={{ color: 'var(--text-muted)' }}><i className="fas fa-thermometer-half"></i> {weatherTemp}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
                {renderSocials()}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '14px' }}>
                    <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                  </button>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'transparent', color: 'inherit' }}>
                    <option value="ta">தமிழ்</option>
                    <option value="en">English</option>
                  </select>
                  {renderAuthSection()}
                </div>
              </div>
            </div>
          )}

          {/* Navigation link bar */}
          <nav className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`} style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {renderNavMenu()}
              <div className="nav-search" style={{ cursor: 'pointer' }}><i className="fas fa-search"></i></div>
            </div>
          </nav>
        </header>
      )}

      {/* ========================================================
          SAMPLE 2: NEWSPAPER STYLE HEADER
          ======================================================== */}
      {headerStyle === 'newspaper' && (
        <header className="header-newspaper-style" style={{ background: 'var(--header-bg, #ffffff)', borderBottom: '1px solid #e2e8f0' }}>
          {/* Top Logo and Primary Action Area */}
          <div className="container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 20px 10px 20px',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>{renderDistrictSelector(true)}</div>
              <div>{renderLiveTvBtn()}</div>
            </div>
            
            <div style={{ margin: '10px 0' }}>
              {renderLogo('normal')}
            </div>

            {/* Secondary collapsible menu handler */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}><i className="far fa-calendar-alt"></i> {timeStr}</span>
              <button 
                onClick={() => setNewspaperUtilityOpen(!newspaperUtilityOpen)}
                style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer' }}
              >
                {lang === 'en' ? 'Utility Options' : 'கூடுதல் தேவைகள்'} <i className={`fas ${newspaperUtilityOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
            </div>
          </div>

          {/* Newspaper Secondary Collapsible Options */}
          {newspaperUtilityOpen && (
            <div style={{
              background: theme === 'dark' ? '#1E293B' : '#F8FAFC',
              borderBottom: '1px solid #e2e8f0',
              padding: '12px 20px',
              animation: 'slideDown 0.2s ease-out'
            }}>
              <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span><i className="fas fa-thermometer-half"></i> {weatherTemp}</span>
                  {renderSocials()}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-dark)', cursor: 'pointer' }}>
                    <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                  </button>
                  <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'transparent', color: 'inherit' }}>
                    <option value="ta">தமிழ்</option>
                    <option value="en">English</option>
                  </select>
                  {renderAuthSection()}
                </div>
              </div>
            </div>
          )}

          {/* Clean Primary Navigation below logo */}
          <nav className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {renderNavMenu()}
              <div className="nav-search" style={{ cursor: 'pointer' }}><i className="fas fa-search"></i></div>
            </div>
          </nav>
        </header>
      )}

      {/* ========================================================
          SAMPLE 3: MOBILE APP STYLE HEADER (WITH SIDE DRAWER)
          ======================================================== */}
      {headerStyle === 'mobile-app' && (
        <header className="header-mobile-app-style" style={{ background: 'var(--header-bg, #ffffff)', borderBottom: '1px solid #e2e8f0' }}>
          {/* Mini minimal top bar */}
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setDrawerOpen(true)}
                style={{ background: 'transparent', border: 'none', fontSize: '20px', color: 'var(--text-dark, #333)', cursor: 'pointer' }}
                aria-label="Open side drawer menu"
              >
                <i className="fas fa-bars"></i>
              </button>
              {renderLogo('small')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {renderLiveTvBtn()}
              <div className="nav-search" style={{ cursor: 'pointer', fontSize: '16px' }}><i className="fas fa-search"></i></div>
            </div>
          </div>

          {/* Horizontal scrollable category navigation bar */}
          <nav className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`} style={{ overflowX: 'auto', whiteSpace: 'nowrap', borderTop: '1px solid #f1f5f9' }}>
            <div className="container" style={{ display: 'block', padding: '4px 16px' }}>
              <div className="horizontal-scroll-nav-container" style={{ display: 'inline-flex', gap: '8px' }}>
                {renderNavMenu()}
              </div>
            </div>
          </nav>

          {/* Side Drawer Panel */}
          <div 
            className={`side-drawer-container ${drawerOpen ? 'open' : ''}`} 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              visibility: drawerOpen ? 'visible' : 'hidden',
              zIndex: 99999,
              transition: 'visibility 0.3s'
            }}
          >
            {/* Overlay */}
            <div 
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                opacity: drawerOpen ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />
            {/* Drawer Content */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              height: '100%',
              background: theme === 'dark' ? '#1E293B' : '#ffffff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
              transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              gap: '20px',
              color: theme === 'dark' ? '#ffffff' : '#1e293b',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {renderLogo('small')}
                <button onClick={() => setDrawerOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', color: 'inherit', cursor: 'pointer' }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Drawer category items list */}
              <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '15px', marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {lang === 'en' ? 'Sections' : 'பிரிவுகள்'}
                </h4>
                {renderNavMenu('column', () => setDrawerOpen(false))}
              </div>

              {/* Utility elements inside sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'District News' : 'மாவட்ட செய்திகள்'}
                  </h4>
                  {renderDistrictSelector()}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Weather' : 'வானிலை'}
                  </h4>
                  <span><i className="fas fa-thermometer-half"></i> {weatherTemp}</span>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Settings' : 'அமைப்புகள்'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{lang === 'en' ? 'Theme Mode' : 'பின்னணி'}</span>
                      <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}>
                        <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{lang === 'en' ? 'Language' : 'மொழி'}</span>
                      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'transparent', color: 'inherit' }}>
                        <option value="ta">தமிழ்</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Account' : 'கணக்கு'}
                  </h4>
                  {renderAuthSection()}
                </div>

                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Follow Us' : 'எங்களை பின்தொடர'}
                  </h4>
                  {renderSocials()}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
    </div>
  );
};

export default Header;
