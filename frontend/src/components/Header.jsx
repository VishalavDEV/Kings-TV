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

  const [timeStr, setTimeStr] = useState('');
  const [districtText, setDistrictText] = useState('சென்னை');
  const [weatherTemp, setWeatherTemp] = useState('32°C');

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

  const activeClass = (path) => (location.pathname === path ? 'active' : '');

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="live-badge">{t('நேரலை')}</span>
          <span id="tamilDateTime" className="top-bar-date">{timeStr}</span>
          <span className="weather-widget">
            <i className="fas fa-cloud-sun"></i> 
            <span id="topWeatherDistrict" style={{marginLeft: '4px'}}>{districtText}</span>: 
            <span id="topWeatherTemp" style={{fontWeight: '700'}}>{weatherTemp}</span>
          </span>
        </div>
        <div className="top-bar-right">
          <a href="#" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" className="social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          <a href="#" className="social-icon" aria-label="Telegram"><i className="fab fa-telegram-plane"></i></a>
          
          <button className="dark-toggle" id="darkToggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i> 
            {theme === 'light' ? t('இருள்') : t('ஒளி')}
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
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--top-bar-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  <i className="fas fa-sign-out-alt"></i> {t('வெளியேறு')}
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
                <i className="fas fa-sign-in-alt"></i> {t('உள்நுழை')}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="brand-header">
        <div className="brand-logo-container">
          <Link to="/" className="brand-logo-link" style={{textDecoration: 'none'}}>
            <div className="brand-logo">KINGS 24x7</div>
            <div className="brand-tagline">உண்மை. பொறுப்பு. தமிழில்.</div>
          </Link>
        </div>
        <div className="header-ad">
          <div className="ad-placeholder-text">ADVERTISEMENT / விளம்பரம்</div>
        </div>
      </div>

      <nav className="main-nav">
        <div className="nav-container">
          <ul className="nav-links">
            <li><Link to="/" className={activeClass('/')}><i className="fas fa-home"></i> {t('முகப்பு')}</Link></li>
            <li><Link to="/directory" className={activeClass('/directory')}><i className="fas fa-folder-open"></i> {t('வழிகாட்டி')}</Link></li>
            <li><Link to="/classifieds" className={activeClass('/classifieds')}><i className="fas fa-tags"></i> {t('விளம்பரங்கள்')}</Link></li>
            <li><Link to="/wishes" className={activeClass('/wishes')}><i className="fas fa-gift"></i> {t('வாழ்த்துகள்')}</Link></li>
            <li><Link to="/obituaries" className={activeClass('/obituaries')}><i className="fas fa-monument"></i> {t('மரண அறிவிப்புகள்')}</Link></li>
            <li><Link to="/jobs" className={activeClass('/jobs')}><i className="fas fa-briefcase"></i> {t('வேலைவாய்ப்பு')}</Link></li>
            <li><Link to="/business-studies" className={activeClass('/business-studies')}><i className="fas fa-chart-line"></i> {t('வணிகக் கதைகள்')}</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
