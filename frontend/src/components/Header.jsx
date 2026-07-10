import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { fetchApi } from '../utils/api';

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
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allArticles, setAllArticles] = useState([]);
  const [allVideos, setAllVideos] = useState([]);

  const fallbackArticles = [
    {
      id: "demo-1",
      titleTa: "தமிழக சட்டப்பேரவையில் புதிய மசோதா தாக்கல் - எதிர்க்கட்சிகள் எதிர்ப்பு",
      titleEn: "New bill tabled in TN assembly - opposition registers strong protest",
      shortDescTa: "சட்டப்பேரவையில் இன்று தாக்கல் செய்யப்பட்ட புதிய மசோதாவுக்கு எதிர்க்கட்சிகள் கடும் எதிர்ப்பு தெரிவித்துள்ளனர். இந்த மசோதா மக்கள் நலனுக்கு பாதகமானது என கூறியுள்ளனர்.",
      shortDescEn: "Opposition parties voiced strong protests against the new bill tabled in the assembly today, calling it detrimental to public welfare."
    },
    {
      id: "demo-2",
      titleTa: "இந்திய கிரிக்கெட் அணி ஆஸ்திரேலியாவை வீழ்த்தியது - 3-0 அபாரம்",
      titleEn: "Indian cricket team beats Australia 3-0 in T20 series",
      shortDescTa: "ஆஸ்திரேலியாவுக்கு எதிரான டி20 தொடரை 3-0 என்ற கணக்கில் இந்திய அணி முழுமையாக வென்றது. விராட் கோலி அபார ஆட்டம்.",
      shortDescEn: "India clean sweeps T20 series against Australia 3-0. Virat Kohli shines with a brilliant match-winning performance."
    },
    {
      id: "demo-3",
      titleTa: "பங்குச் சந்தை புதிய உச்சம் - முதலீட்டாளர்களுக்கு வார இறுதி பரிசு",
      titleEn: "Share market reaches new peak - weekend gift for investors",
      shortDescTa: "சென்செக்ஸ் 82,000 புள்ளிகளை தாண்டி புதிய சாதனை படைத்தது. ஐடி, பேங்கிங் பங்குகள் முன்னணி.",
      shortDescEn: "Sensex creates new record by crossing 82,000 points. IT and Banking sectors lead the gainers list."
    },
    {
      id: "demo-4",
      titleTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் சாதனை - சர்வதேச அங்கீகாரம்",
      titleEn: "Tamil Nadu youth excel in AI research - receive international awards",
      shortDescTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் செய்த புதிய கண்டுபிடிப்புகளுக்கு சர்வதேச அறிவியல் சபை விருது வழங்கி கௌரவித்துள்ளது.",
      shortDescEn: "International science council honors youth from Tamil Nadu for their ground-breaking developments in AI."
    },
    {
      id: "demo-5",
      titleTa: "தளபதி விஜய்யின் அடுத்த படம் குறித்த முக்கிய அறிவிப்பு வெளியானது",
      titleEn: "Major update released on Thalapathy Vijay's upcoming movie",
      shortDescTa: "இயக்குனர் வெங்கட் பிரபு இயக்கத்தில் விஜய் நடிக்கும் 69-வது படம் குறித்த அதிகாரப்பூர்வ தகவல் வெளியாகியுள்ளது.",
      shortDescEn: "Official details and title launch info released for Vijay's 69th film directed by Venkat Prabhu."
    },
    {
      id: "demo-6",
      titleTa: "நெல் கொள்முதல் விலை உயர்வு - விவசாயிகள் சங்கம் வரவேற்பு",
      titleEn: "Paddy procurement price increased - farmers association welcomes move",
      shortDescTa: "நெல்லுக்கான குறைந்தபட்ச ஆதரவு விலையை மத்திய அரசு உயர்த்தியுள்ள நிலையில் விவசாயிகள் மகிழ்ச்சி தெரிவித்துள்ளனர்.",
      shortDescEn: "Farmers express joy as central government increases the minimum support price (MSP) for paddy procurement."
    }
  ];

  const fallbackVideos = [
    { id: "demo-1", title: "தமிழக பட்ஜெட் 2026 - முக்கிய அம்சங்கள் விளக்கம்" },
    { id: "demo-2", title: "கிரிக்கெட் போட்டி சிறப்பம்சங்கள் - இந்தியா vs ஆஸ்திரேலியா" },
    { id: "demo-3", title: "விவசாயிகளுக்கான புதிய திட்டங்கள் - நேரடி அறிக்கை" },
    { id: "demo-4", title: "பங்குச் சந்தை ஆய்வு - நிபுணர்களின் முக்கிய ஆலோசனை" }
  ];

  useEffect(() => {
    fetchApi('/articles')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllArticles([...data, ...fallbackArticles]);
        } else {
          setAllArticles(fallbackArticles);
        }
      })
      .catch(err => {
        console.warn("Header normal search failed to load articles", err);
        setAllArticles(fallbackArticles);
      });

    fetchApi('/videos')
      .then(data => {
        const translatedFallbackVideos = fallbackVideos.map(vid => {
          let titleVal = vid.title;
          if (lang === 'en') {
            if (vid.title.includes('பட்ஜெட்')) titleVal = 'Tamil Nadu Budget 2026 - Key Highlights Explained';
            else if (vid.title.includes('கிரிக்கெட்')) titleVal = 'Cricket Match Highlights - India vs Australia';
            else if (vid.title.includes('விவசாயிகளுக்கான')) titleVal = 'New Schemes for Farmers - Ground Report';
            else if (vid.title.includes('பங்கு')) titleVal = 'Stock Market Analysis - Expert Advice';
          }
          return { ...vid, title: titleVal };
        });
        if (Array.isArray(data) && data.length > 0) {
          setAllVideos([...data, ...translatedFallbackVideos]);
        } else {
          setAllVideos(translatedFallbackVideos);
        }
      })
      .catch(err => {
        console.warn("Header normal search failed to load videos", err);
        const translatedFallbackVideos = fallbackVideos.map(vid => {
          let titleVal = vid.title;
          if (lang === 'en') {
            if (vid.title.includes('பட்ஜெட்')) titleVal = 'Tamil Nadu Budget 2026 - Key Highlights Explained';
            else if (vid.title.includes('கிரிக்கெட்')) titleVal = 'Cricket Match Highlights - India vs Australia';
            else if (vid.title.includes('விவசாயிகளுக்கான')) titleVal = 'New Schemes for Farmers - Ground Report';
            else if (vid.title.includes('பங்கு')) titleVal = 'Stock Market Analysis - Expert Advice';
          }
          return { ...vid, title: titleVal };
        });
        setAllVideos(translatedFallbackVideos);
      });
  }, [lang]);

  const getFilteredResults = () => {
    if (!searchQuery.trim()) return { articles: [], videos: [] };
    const query = searchQuery.toLowerCase().trim();
    
    const filteredArts = allArticles.filter(art => 
      (art.titleEn || '').toLowerCase().includes(query) ||
      (art.titleTa || '').toLowerCase().includes(query) ||
      (art.shortDescEn || '').toLowerCase().includes(query) ||
      (art.shortDescTa || '').toLowerCase().includes(query)
    );

    const filteredVids = allVideos.filter(vid =>
      (vid.title || '').toLowerCase().includes(query)
    );

    return {
      articles: filteredArts.slice(0, 5),
      videos: filteredVids.slice(0, 3)
    };
  };

  const { articles: searchArticles, videos: searchVideos } = getFilteredResults();

  useEffect(() => {
    const handleToggleDrawer = () => {
      setDrawerOpen(prev => !prev);
    };
    window.addEventListener('toggle-side-drawer', handleToggleDrawer);
    return () => window.removeEventListener('toggle-side-drawer', handleToggleDrawer);
  }, []);

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
      'கன்னியாகுமரி': '29°C',
      'நாமக்கல்': '31°C'
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
      'கன்னியாகுமரி': { en: 'Kanyakumari', ta: 'கன்னியாகுமரி' },
      'நாமக்கல்': { en: 'Namakkal', ta: 'நாமக்கல்' }
    };
    const item = districtNames[key];
    return item ? (lang === 'en' ? item.en : item.ta) : key;
  };

  const renderLogo = (size = 'normal', forceDark = false) => {
    const isDark = forceDark || theme === 'dark';
    const logoUrl = isDark ? "/assets/images/logo-banner-dark.png" : "/assets/images/logo-banner-light.png";
    return (
      <Link to="/" className="logo-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none' }}>
        <img 
          src={logoUrl} 
          alt="KING 24x7" 
          style={{ height: size === 'small' ? '40px' : '55px', width: 'auto', objectFit: 'contain', display: 'block' }} 
        />
      </Link>
    );
  };

  const renderLiveTvBtn = () => (
    <Link to="/live-tv" className="livetv-btn" style={{
      background: '#EF4444',
      color: '#FFFFFF',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      textDecoration: 'none',
      border: 'none'
    }}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#FFFFFF'
      }}></span>
      {lang === 'en' ? 'LIVE' : 'லைவ்'}
    </Link>
  );

  const renderProfileIcon = () => {
    const linkTarget = (session && session.isLoggedIn) ? "/profile" : "/login";
    return (
      <Link to={linkTarget} style={{ color: '#ffffff', fontSize: '22px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} aria-label="User Account">
        <i className="fas fa-user-circle"></i>
      </Link>
    );
  };

  const renderDistrictSelector = (isHeader = false) => (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button 
        onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
        style={{
          background: 'transparent',
          border: 'none',
          color: isHeader ? '#FFFFFF' : (theme === 'dark' ? '#FFFFFF' : '#1A1A1A'),
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          padding: isHeader ? '4px 6px 1px 6px' : '6px 10px',
          borderRadius: '4px',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap'
        }}
      >
        <span>{getCurrentDistrictName(district)} 24x7</span>
        <i className="fas fa-pencil-alt" style={{ fontSize: '10px', color: isHeader ? '#FFFFFF' : '#666' }}></i>
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
            { key: 'கோயம்புத்தூர்', en: 'Coimbatore', ta: 'Coimbatore' },
            { key: 'மதுரை', en: 'Madurai', ta: 'மதுரை' },
            { key: 'சேலம்', en: 'Salem', ta: 'சேலம்' },
            { key: 'திருச்சி', en: 'Trichy', ta: 'திருச்சி' },
            { key: 'திருநெல்வேலி', en: 'Tirunelveli', ta: 'திருநெல்வேலி' },
            { key: 'வேலூர்', en: 'Vellore', ta: 'வேலூர்' },
            { key: 'ஈரோடு', en: 'Erode', ta: 'ஈரோடு' },
            { key: 'தஞ்சாவூர்', en: 'Tanjore', ta: 'தஞ்சாவூர்' },
            { key: 'கன்னியாகுமரி', en: 'Kanyakumari', ta: 'கன்னியாகுமரி' },
            { key: 'நாமக்கல்', en: 'Namakkal', ta: 'நாமக்கல்' }
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

  const renderScrollNavMenu = (onLinkClick = () => {}) => {
    const navItems = isRegionalPage 
      ? [
          { path: '/', label: t('முகப்பு') },
          { path: '/directory', label: t('நம்ம ஊர்') },
          { path: '/wishes', label: t('வாழ்த்து') },
          { path: '/obituaries', label: t('இரங்கல்') },
          { path: '/business-studies', label: t('வணிகம்') },
          { path: '/jobs', label: t('வேலை') },
          { path: '/classifieds', label: t('தள்ளுபடி') }
        ]
      : [
          { path: '/', label: lang === 'en' ? 'Home' : 'முகப்பு' },
          { path: '/category/politics', label: lang === 'en' ? 'Politics' : 'அரசியல்' },
          { path: '/category/business', label: lang === 'en' ? 'Business' : 'வணிகம்' },
          { path: '/category/sports', label: lang === 'en' ? 'Sports' : 'விளையாட்டு' },
          { path: '/category/cinema', label: lang === 'en' ? 'Cinema' : 'பொழுதுபோக்கு' },
          { path: '/category/tech', label: lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்' },
          { path: '/directory', label: lang === 'en' ? 'Regional' : 'மாநிலம்' },
          { path: '/category/world', label: lang === 'en' ? 'International' : 'சர்வதேசம்' },
          { path: '/videos', label: lang === 'en' ? 'Video' : 'வீடியோ' },
          { path: '/web-stories', label: lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்' }
        ];

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: '15px',
        width: '100%',
        padding: '8px 0'
      }}>
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={idx}
              to={item.path}
              onClick={onLinkClick}
              style={{
                color: isActive ? 'var(--primary, #B3732A)' : '#FFFFFF',
                opacity: isActive ? '1' : '0.9',
                background: isActive ? '#FAF4EB' : 'transparent',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  };

  const renderNavMenuVertical = (onLinkClick = () => {}) => {
    const navItems = isRegionalPage 
      ? [
          { path: '/', label: t('முகப்பு') },
          { path: '/directory', label: t('நம்ம ஊர்') },
          { path: '/wishes', label: t('வாழ்த்து') },
          { path: '/obituaries', label: t('இரங்கல்') },
          { path: '/business-studies', label: t('வணிகம்') },
          { path: '/jobs', label: t('வேலை') },
          { path: '/classifieds', label: t('தள்ளுபடி') }
        ]
      : [
          { path: '/', label: lang === 'en' ? 'Home' : 'முகப்பு' },
          { path: '/category/politics', label: lang === 'en' ? 'Politics' : 'அரசியல்' },
          { path: '/category/business', label: lang === 'en' ? 'Business' : 'வணிகம்' },
          { path: '/category/sports', label: lang === 'en' ? 'Sports' : 'விளையாட்டு' },
          { path: '/category/cinema', label: lang === 'en' ? 'Cinema' : 'பொழுதுபோக்கு' },
          { path: '/category/tech', label: lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்' },
          { path: '/directory', label: lang === 'en' ? 'Regional' : 'மாநிலம்' },
          { path: '/category/world', label: lang === 'en' ? 'International' : 'சர்வதேசம்' },
          { path: '/videos', label: lang === 'en' ? 'Video' : 'வீடியோ' },
          { path: '/web-stories', label: lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்' }
        ];

    return (
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: 0, listStyle: 'none', margin: 0 }}>
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <li key={idx}>
              <Link 
                to={item.path} 
                onClick={onLinkClick} 
                style={{
                  color: isActive ? 'var(--primary, #B3732A)' : 'inherit',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'block',
                  padding: '4px 0'
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  };

  if (!isMobile) {
    return (
      <div className="header-wrapper">
        {/* TOP BAR */}
        <div className="top-bar" style={{ background: theme === 'dark' ? '#0f172a' : '#f1f5f9', color: theme === 'dark' ? '#cbd5e1' : '#475569', borderBottom: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
            <div className="top-bar-left" style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px' }}>
              <span><i className="far fa-clock"></i> {timeStr}</span>
              <span><i className="fas fa-thermometer-half"></i> {weatherTemp}</span>
              {renderDistrictSelector()}
            </div>
            <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {renderSocials()}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}>
                  <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                </button>
                <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1', background: 'transparent', color: 'inherit' }}>
                  <option value="ta">தமிழ்</option>
                  <option value="en">English</option>
                </select>
                {renderAuthSection()}
              </div>
            </div>
          </div>
        </div>

        {/* HEADER MAIN */}
        <header className="header-main" style={{ background: theme === 'dark' ? '#000000' : '#ffffff', borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0', padding: '20px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div className="header-left">
              {renderLogo('normal')}
            </div>
            <div className="header-center"></div>
            <div className="header-right">
              <Link to="/live-tv" className="livetv-btn" style={{
                background: '#EF4444',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}>
                <i className="fas fa-play-circle" style={{ fontSize: '16px' }}></i>
                {lang === 'en' ? 'LIVE TV WATCH NOW' : 'லைவ் டிவி இப்பொழுது பாருங்கள்'}
              </Link>
            </div>
          </div>
        </header>

        {/* NAVIGATION */}
        <nav className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`} style={{ background: '#000000', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div 
              className="mobile-menu-btn" 
              id="mobileMenuBtn" 
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
              style={{ display: 'none' }}
            >
              <i className="fas fa-bars"></i>
            </div>
            
            {/* Normal categories navigation menu */}
            <div style={{ display: 'flex', flexGrow: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {renderScrollNavMenu()}
            </div>
            
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant', { detail: { tab: 'search' } }))}
              style={{ color: '#ffffff', cursor: 'pointer', padding: '10px', fontSize: '16px' }} 
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <header className="header-mobile-app-style" style={{ position: 'relative', background: '#000000', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', width: '100%' }}>
      {/* Minimal top bar */}
      {isSearchOpen ? (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px', background: theme === 'dark' ? '#1E293B' : '#1e1e1e', padding: '6px 12px', borderRadius: '24px' }}>
            <i className="fas fa-search" style={{ color: '#888888', fontSize: '14px' }}></i>
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search news, videos...' : 'செய்திகள், வீடியோக்களைத் தேடுக...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#888888', padding: '2px' }}
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ffffff', padding: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}
            aria-label="Cancel Search"
          >
            {lang === 'en' ? 'Cancel' : 'ரத்து'}
          </button>
        </div>
      ) : (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexShrink: 0, paddingBottom: '3px' }}>
            <button 
              onClick={() => setDrawerOpen(true)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontSize: '20px', 
                color: '#ffffff', 
                cursor: 'pointer', 
                paddingRight: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '2px' 
              }}
              aria-label="Open side drawer menu"
            >
              <i className="fas fa-bars"></i>
            </button>
            {renderLogo('small', true)}
            {renderDistrictSelector(true)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <button 
              onClick={() => setIsSearchOpen(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#ffffff', padding: '4px' }}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
            {renderLiveTvBtn()}
            {renderProfileIcon()}
          </div>
        </div>
      )}

      {/* Normal Search Results Dropdown Overlay */}
      {isSearchOpen && searchQuery.trim() !== '' && (
        <div style={{
          position: 'absolute',
          top: '55px',
          left: 0,
          right: 0,
          background: theme === 'dark' ? '#121212' : '#ffffff',
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 99999,
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '12px 16px'
        }}>
          {searchArticles.length === 0 && searchVideos.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: theme === 'dark' ? '#888888' : '#666666', fontSize: '14px' }}>
              {lang === 'en' ? 'No results found.' : 'தேடல் முடிவுகள் எதுவும் இல்லை.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {searchArticles.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'News Articles' : 'செய்தி கட்டுரைகள்'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {searchArticles.map((art) => (
                      <Link
                        key={art.id || art.article_id}
                        to={`/article/${art.id || art.article_id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textDecoration: 'none',
                          color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          transition: 'background 0.2s',
                          cursor: 'pointer'
                        }}
                        className="search-result-item"
                      >
                        <i className="far fa-newspaper" style={{ color: 'var(--primary, #B3732A)', flexShrink: 0 }}></i>
                        <span style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lang === 'en' ? (art.titleEn || art.titleTa) : (art.titleTa || art.titleEn)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {searchVideos.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Videos' : 'வீடியோக்கள்'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {searchVideos.map((vid) => (
                      <Link
                        key={vid.id}
                        to="/videos"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textDecoration: 'none',
                          color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          transition: 'background 0.2s',
                          cursor: 'pointer'
                        }}
                        className="search-result-item"
                      >
                        <i className="fas fa-play-circle" style={{ color: '#EF4444', flexShrink: 0 }}></i>
                        <span style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vid.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Horizontal scrollable category navigation bar in single line */}
      <nav 
        className={`main-nav ${isRegionalPage ? 'regional-theme' : ''}`} 
        style={{ 
          overflowX: 'auto', 
          whiteSpace: 'nowrap', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#000000',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 16px' }}>
          {renderScrollNavMenu()}
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
          background: theme === 'dark' ? '#000000' : '#ffffff',
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

          {/* Profile section below the logo */}
          <div style={{ 
            marginTop: '5px', 
            padding: '12px', 
            borderRadius: '8px', 
            background: theme === 'dark' ? '#1E293B' : '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Link 
              to={(session && session.isLoggedIn) ? "/profile" : "/login"} 
              onClick={() => setDrawerOpen(false)}
              style={{ 
                color: theme === 'dark' ? '#ffffff' : '#1e293b', 
                fontSize: '28px', 
                display: 'inline-flex', 
                alignItems: 'center' 
              }}
              aria-label="User Account"
            >
              <i className="fas fa-user-circle"></i>
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {session && session.isLoggedIn ? (
                <>
                  <span style={{ fontSize: '14px', fontWeight: '700' }}>{session.username}</span>
                  <button 
                    onClick={() => {
                      logout();
                      setDrawerOpen(false);
                    }} 
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '2px',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> {lang === 'en' ? 'Logout' : 'வெளியேறு'}
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setDrawerOpen(false)}
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: 'var(--primary, #B3732A)',
                    textDecoration: 'none'
                  }}
                >
                  {lang === 'en' ? 'Login / Register' : 'உள்நுழை / பதிவு செய்'}
                </Link>
              )}
            </div>
          </div>

          {/* Drawer category items list */}
          <div style={{ borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1', paddingBottom: '15px', marginTop: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {lang === 'en' ? 'Sections' : 'பிரிவுகள்'}
            </h4>
            {renderNavMenuVertical(() => setDrawerOpen(false))}
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
                  <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #cbd5e1', background: 'transparent', color: 'inherit' }}>
                    <option value="ta">தமிழ்</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
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
  );
};

export default Header;
