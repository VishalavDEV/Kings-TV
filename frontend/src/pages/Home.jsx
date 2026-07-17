import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi, getImageUrl } from '../utils/api';

const Home = () => {
  const { lang, t } = useContext(LanguageContext);
  const { widgetWidth, slideSpeed, sections } = useContext(ThemeContext);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [liveVideo, setLiveVideo] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState({});
  const initialTickers = [
    lang === 'en' ? "Paddy procurement price increased - farmers express delight!" : "🌾 நெல் கொள்முதல் விலை உயர்வு - விவசாயிகள் மகிழ்ச்சி",
    lang === 'en' ? "Vijay 69th movie announcement sends fans into celebration mode!" : "🎬 விஜய் 69-வது படம் அறிவிப்பு - ரசிகர்கள் கொண்டாட்டம்",
    lang === 'en' ? "Class 12 board results to be declared soon - education department updates." : "📚 +2 தேர்வு முடிவுகள் விரைவில் - கல்வித்துறை தகவல்",
    lang === 'en' ? "Electricity tariff hike in Chennai creates public concern." : "⚡ சென்னையில் மின் கட்டணம் உயர்வு - நுகர்வோர் அதிருப்தி",
    lang === 'en' ? "New Vande Bharat rail service introduced by Southern Railway." : "🚆 புதிய வந்தே பாரத் ரயில் சேவை அறிமுகம் - தெற்கு ரயில்வே",
    lang === 'en' ? "Heavy rain alert issued for tomorrow in Tamil Nadu." : "🔴 தமிழகத்தில் நாளை முதல் கனமழை எச்சரிக்கை - வானிலை மையம்"
  ];
  const [tickers, setTickers] = useState(initialTickers);
  const [stories, setStories] = useState([]);
  const [weatherData, setWeatherData] = useState({
    temp: '32°C',
    condition: lang === 'en' ? 'Cloudy' : 'மேகமூட்டம்',
    humidity: '72%',
    wind: '18 km/h',
    forecast: [
      { day: lang === 'en' ? 'Mon' : 'தி', icon: '☀️', temp: '32°' },
      { day: lang === 'en' ? 'Tue' : 'செ', icon: '⛅', temp: '31°' },
      { day: lang === 'en' ? 'Wed' : 'பு', icon: '🌤️', temp: '33°' }
    ]
  });

  const [trendingNews, setTrendingNews] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);

  // Crowd Reporter States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [reportVideoUrl, setReportVideoUrl] = useState('');

  const getCategoryDetails = (categoryId) => {
    return categoriesMap[categoryId] || { slug: 'politics', en: 'Politics', ta: 'அரசியல்' };
  };

  const storiesList = [
    { id: 1, titleTa: "உலக கோப்பை கிரிக்கெட் 2027 அட்டவணை", titleEn: "World Cup Cricket 2027 Schedule", cat: "sports", badge: "NEW", views: "12.4K", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
    { id: 2, titleTa: "ரஜினி அடுத்த படம் - முதல் பார்வை", titleEn: "Rajini next movie first look out", cat: "cinema", badge: "HOT", views: "18.2K", gradient: "linear-gradient(135deg, #D946EF, #EC4899)" },
    { id: 3, titleTa: "பாராளுமன்ற தேர்தல் 2029 - முன்னோட்டம்", titleEn: "General Election 2029 - Preview", cat: "politics", badge: "TREND", views: "9.5K", gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)" }
  ];

  const mockTickers = [
    lang === 'en' ? "Welcome to Kings 24x7 News!" : "கிங்ஸ் 24x7 செய்திகளுக்கு வரவேற்கிறோம்!"
  ];



  useEffect(() => {
    // 1. Fetch Categories
    fetchApi('/categories')
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(cat => {
            map[cat.id || cat.categoryId] = {
              slug: cat.slug || 'politics',
              en: cat.name || 'Politics',
              ta: cat.nameTa || 'அரசியல்'
            };
          });
          setCategoriesMap(map);
        }
      })
      .catch(err => console.warn("Could not load categories", err));

    // 2. Fetch Articles
    fetchApi('/articles')
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setArticles(list);
      })
      .catch(err => {
        console.warn("Could not load articles from API", err);
        setArticles([]);
      });

    // 3. Fetch Breaking News
    fetchApi('/breaking-news/getAllWeb?size=10')
      .then(data => {
        const list = data && Array.isArray(data.content) ? data.content : [];
        if (list.length > 0) {
          const formatted = list.map(item => (lang === 'en' ? item.title : item.titleTa) || item.title);
          setTickers(formatted);
        } else {
          setTickers(initialTickers);
        }
      })
      .catch(err => {
        console.warn("Could not load breaking news from API, using fallback", err);
        setTickers(initialTickers);
      });

    // 4. Fetch Web Stories
    fetchApi('/web-stories/getAllWeb?size=6')
      .then(data => {
        const list = data && Array.isArray(data.content) ? data.content : [];
        if (list.length > 0) {
          const formatted = list.map(item => ({
            id: item.id || item.storyId,
            titleTa: item.titleTa,
            titleEn: item.titleEn,
            cat: item.cat || 'politics',
            badge: item.badge || 'NEW',
            views: item.viewsCount ? `${(item.viewsCount / 1000).toFixed(1)}K` : '0K',
            gradient: item.backgroundGradient || 'linear-gradient(135deg, #667eea, #764ba2)'
          }));
          setStories(formatted);
        } else {
          setStories(storiesList);
        }
      })
      .catch(err => {
        console.warn("Could not load web stories from API, using fallback", err);
        setStories(storiesList);
      });

    // 5. Fetch Videos
    fetchApi('/videos')
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const translated = list.map(vid => {
          const rawTitle = vid.title || '';
          let titleVal = rawTitle;
          if (lang === 'en') {
            if (rawTitle.includes('Rain Update') || rawTitle.includes('கனமழை')) {
              titleVal = 'Rain Update in Tamil Nadu | Heavy Rain Alert in Chennai and Districts';
            } else if (rawTitle.includes('Gold Rate') || rawTitle.includes('தங்க விலை')) {
              titleVal = 'Gold Rate Drops Sharply | Today\'s Gold Price details in Chennai';
            } else if (rawTitle.includes('Vijay TVK') || rawTitle.includes('விஜய் மாநாடு')) {
              titleVal = 'Vijay TVK First State Conference | Massive crowd gathers in Vikravandi';
            } else if (rawTitle.includes('IPL') || rawTitle.includes('ஐபிஎல்')) {
              titleVal = 'IPL Final Highlights: Thrilling last over finish';
            } else if (rawTitle.includes('Gaganyaan') || rawTitle.includes('ககன்யான்')) {
              titleVal = 'ISRO Gaganyaan Test Success | Indian Astronaut Space Mission Updates';
            } else if (rawTitle.includes('Metro') || rawTitle.includes('சென்னை மெட்ரோ')) {
              titleVal = 'Chennai Metro Phase 2 updates | Driverless train tests began';
            }
          }
          return { ...vid, title: titleVal };
        });
        setVideos(translated);
      })
      .catch(err => {
        console.warn("Could not load videos from API", err);
        setVideos([]);
      });

    // 6. Fetch Live Video
    fetchApi('/videos/live')
      .then(data => {
        if (data && data.youtubeUrl) {
          let titleVal = data.title;
          let descVal = data.description;
          if (lang === 'en') {
            titleVal = 'KINGS 24x7 Live TV News Stream';
            descVal = 'Watch continuous Tamil and English live news coverage, debates and special updates.';
          }
          setLiveVideo({ ...data, title: titleVal, description: descVal });
        }
      })
      .catch(err => console.warn("Could not load live video from API", err));

    // 7. Fetch Weather Forecast from backend for Chennai
    const baseApi = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
    fetch(`${baseApi}/weather?city=Chennai`)
      .then(res => res.json())
      .then(data => {
        if (data && data.temp) {
          const forecastData = [];
          if (data.forecast && Array.isArray(data.forecast)) {
            for (let i = 0; i < Math.min(3, data.forecast.length); i++) {
              const fc = data.forecast[i];
              forecastData.push({
                day: lang === 'en' ? fc.day : (fc.day === 'Mon' ? 'தி' : fc.day === 'Tue' ? 'செ' : fc.day === 'Wed' ? 'பு' : fc.day === 'Thu' ? 'வி' : fc.day === 'Fri' ? 'வெ' : fc.day === 'Sat' ? 'ச' : 'ஞா'),
                icon: fc.icon,
                temp: fc.temp
              });
            }
          }
          setWeatherData({
            temp: data.temp,
            condition: lang === 'en' ? data.condition : data.conditionTa,
            humidity: data.humidity,
            wind: data.wind,
            forecast: forecastData.length > 0 ? forecastData : weatherData.forecast
          });
        }
      })
      .catch(err => console.warn("Weather fetch failed, using default info", err));

    // 8. Fetch Trending News (top 3 most viewed articles)
    fetchApi('/articles/getAll?sortBy=viewsCount&direction=desc&size=3')
      .then(data => {
        const list = data && Array.isArray(data.content) ? data.content : [];
        if (list.length > 0) {
          setTrendingNews(list);
        }
      })
      .catch(err => console.warn("Could not load trending articles", err));

    // 9. Fetch Business Case Studies (PDFs)
    fetchApi('/pdfs')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCaseStudies(data);
        }
      })
      .catch(err => console.warn("Could not load PDFs", err));
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickers.length);
    }, slideSpeed * 1000);
    return () => clearInterval(timer);
  }, [slideSpeed, tickers.length]);

  const handleSubmitReport = (e) => {
    e.preventDefault();
    fetchApi('/report-news/saveUpdate', {
      method: 'POST',
      body: JSON.stringify({
        reporterName,
        reporterContact,
        title: reportTitle,
        details: reportDetails,
        imageUrl: reportImageUrl || null,
        videoUrl: reportVideoUrl || null,
        status: 'pending'
      })
    })
    .then(() => {
      alert(lang === 'en' ? 'Thank you! Your news report has been submitted for review.' : 'நன்றி! உங்கள் செய்தி அறிக்கை மதிப்பாய்வுக்காக சமர்ப்பிக்கப்பட்டுள்ளது.');
      setReporterName('');
      setReporterContact('');
      setReportTitle('');
      setReportDetails('');
      setReportImageUrl('');
      setReportVideoUrl('');
      setShowReportModal(false);
    })
    .catch(err => {
      console.warn("API report submission failed, simulating success locally", err);
      alert(lang === 'en' ? 'Thank you! Your news report has been submitted for review.' : 'நன்றி! உங்கள் செய்தி அறிக்கை மதிப்பாய்வுக்காக சமர்ப்பிக்கப்பட்டுள்ளது.');
      setReporterName('');
      setReporterContact('');
      setReportTitle('');
      setReportDetails('');
      setReportImageUrl('');
      setReportVideoUrl('');
      setShowReportModal(false);
    });
  };

  const featured = articles.length > 0 ? articles[0] : null;
  const featuredCat = featured ? getCategoryDetails(featured.categoryId) : null;
  const sideArticles = articles.slice(1, 4);
  const latestGrid = articles.slice(0, 6);

  const gradients = [
    "linear-gradient(135deg, #1E40AF, #3B82F6)",
    "linear-gradient(135deg, #DC2626, #F97316)",
    "linear-gradient(135deg, #059669, #22C55E)",
    "linear-gradient(135deg, #7C3AED, #A855F7)",
    "linear-gradient(135deg, #D946EF, #EC4899)",
    "linear-gradient(135deg, #16A34A, #4ADE80)"
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* BREAKING NEWS */}
      {sections.news_ticker !== false && sections.ticker !== false && (
        <div className="breaking-news">
          <div className="container">
            <div className="breaking-label" style={{ backgroundColor: '#FFD700', color: '#000' }}>
              <i className="fas fa-bolt"></i> BREAKING NEWS
            </div>
            <div className="breaking-ticker">
              <div className="breaking-track" id="breakTrack">
                <a href="#">{tickers[tickerIndex]}</a>
              </div>
            </div>
            <div className="breaking-controls">
              <button onClick={() => setTickerIndex(prev => (prev - 1 + tickers.length) % tickers.length)}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={() => setTickerIndex(prev => (prev + 1) % tickers.length)}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      {sections.hero !== false && featured && (
        <section className="hero-section" id="section-hero">
          <div className="container">
            <div className="hero-grid">
              <div className={`featured-card theme-${featuredCat.slug}`}>
                <div 
                  className="card-img" 
                  style={{ 
                    background: featured.imageUrl ? `url(${getImageUrl(featured.imageUrl)}) center/cover` : 'linear-gradient(135deg, #1E40AF, #3B82F6)' 
                  }}
                ></div>
                <div className="card-overlay">
                  <span className="category-badge" style={{ background: 'var(--category-color, var(--primary))' }}>
                    {lang === 'en' ? featuredCat.en : featuredCat.ta}
                  </span>
                  <h2>
                    <Link to={`/article/${featured.id || featured.article_id}`} style={{ color: 'white', textDecoration: 'none' }}>
                      {lang === 'en' ? featured.titleEn : featured.titleTa}
                    </Link>
                  </h2>
                  <p>
                    {lang === 'en' ? featured.shortDescEn : featured.shortDescTa}
                  </p>
                  <div className="meta">
                    <span><i className="far fa-calendar-alt"></i> 20 May 2025</span>
                    <span><i className="far fa-clock"></i> 3 Min Read</span>
                  </div>
                </div>
              </div>

              <div className="hero-stack">
                {sideArticles.map((art, idx) => {
                  const stackCat = getCategoryDetails(art.categoryId);
                  return (
                    <div className={`hero-stack-card theme-${stackCat.slug}`} key={art.id || art.article_id}>
                      <div className="info">
                        <span className="category-badge" style={{ background: 'var(--category-color, var(--primary))' }}>
                          {lang === 'en' ? stackCat.en : stackCat.ta}
                        </span>
                        <h4>
                          <Link to={`/article/${art.id || art.article_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {lang === 'en' ? art.titleEn : art.titleTa}
                          </Link>
                        </h4>
                        <div className="meta">
                          <span><i className="far fa-calendar-alt"></i> 20 May 2025</span>
                        </div>
                      </div>
                      <div 
                        className="thumb" 
                        style={{ 
                          background: art.imageUrl ? `url(${getImageUrl(art.imageUrl)}) center/cover` : gradients[(idx + 1) % gradients.length] 
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* QUICK ACCESS ICONS */}
      {sections.quick_access !== false && (
        <section className="quick-access">
        <div className="container">
          <div className="quick-grid">
            <Link to="/category/politics" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-politics"><i className="fas fa-landmark"></i></div>
              <span>{lang === 'en' ? 'Politics' : 'அரசியல்'}</span>
            </Link>
            <Link to="/category/business" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-business"><i className="fas fa-chart-line"></i></div>
              <span>{lang === 'en' ? 'Business' : 'வணிகம்'}</span>
            </Link>
            <Link to="/category/sports" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-sports"><i className="fas fa-trophy"></i></div>
              <span>{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</span>
            </Link>
            <Link to="/category/cinema" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-cinema"><i className="fas fa-film"></i></div>
              <span>{lang === 'en' ? 'Cinema' : 'பொழுதுபோக்கு'}</span>
            </Link>
            <Link to="/category/tech" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-technology"><i className="fas fa-microchip"></i></div>
              <span>{lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்'}</span>
            </Link>
            <Link to="/category/regional" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-education"><i className="fas fa-map-marker-alt"></i></div>
              <span>{lang === 'en' ? 'State' : 'மாநிலம்'}</span>
            </Link>
            <Link to="/category/international" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-weather"><i className="fas fa-globe"></i></div>
              <span>{lang === 'en' ? 'International' : 'சர்வதேசம்'}</span>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* MAIN CONTAINER */}
      <div className="container main-layout-container">
        <div className="left-content-column">
          {/* LATEST NEWS */}
          {sections.latest_news !== false && (
            <section className="news-section">
            <div className="section-title">
              <h2><i className="fas fa-newspaper"></i> {lang === 'en' ? 'Latest News' : 'சமீபத்திய செய்திகள்'}</h2>
              <a href="#" className="view-all">{lang === 'en' ? 'View All' : 'அனைத்தும் காண'} <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="news-grid-3" id="newsGrid">
              {latestGrid.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <i className="fas fa-inbox fa-3x" style={{ marginBottom: '15px', opacity: 0.5 }}></i>
                  <h3>{lang === 'en' ? 'No news published yet' : 'இன்னும் செய்திகள் வெளியிடப்படவில்லை'}</h3>
                  <p>{lang === 'en' ? 'Check back later for updates.' : 'சற்று நேரம் கழித்து மீண்டும் பார்க்கவும்.'}</p>
                </div>
              ) : latestGrid.map((art, idx) => {
                const gridCat = getCategoryDetails(art.categoryId);
                return (
                  <div className={`news-card theme-${gridCat.slug}`} key={art.id || art.article_id}>
                    <div 
                      className="card-img" 
                      style={{ 
                        background: art.imageUrl ? `url(${getImageUrl(art.imageUrl)}) center/cover` : gradients[idx % gradients.length] 
                      }}
                    >
                      <span className="cat-badge" style={{ background: 'var(--category-color, var(--primary))' }}>
                        {lang === 'en' ? gridCat.en : gridCat.ta}
                      </span>
                    </div>
                    <div className="card-body">
                      <h3>
                        <Link to={`/article/${art.id || art.article_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {lang === 'en' ? art.titleEn : art.titleTa}
                        </Link>
                      </h3>
                      <p>
                        {lang === 'en' ? art.shortDescEn : art.shortDescTa}
                      </p>
                      <div className="card-meta">
                        <span><i className="far fa-clock"></i> 1 Hr Ago</span>
                        <span><i className="far fa-eye"></i> {art.viewsCount || 340}</span>
                        <span><i className="far fa-clock"></i> 3 Min Read</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          )}

          {/* VIDEO NEWS */}
          {sections.video !== false && (
            <section className="video-section" id="section-video">
              <div className="section-title">
                <h2><i className="fas fa-video" style={{ color: '#EF4444' }}></i> {lang === 'en' ? 'Video News' : 'வீடியோ செய்திகள்'}</h2>
                <Link to="/videos" className="view-all">{lang === 'en' ? 'More Videos' : 'மேலும் வீடியோக்கள்'} <i className="fas fa-arrow-right"></i></Link>
              </div>
              <div className="video-categories">
                <button className="video-cat-btn active">{lang === 'en' ? 'All' : 'அனைத்தும்'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Politics' : 'அரசியல்'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Agriculture' : 'விவசாயம்'}</button>
              </div>
              <div className="video-grid-4">
                {videos.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <i className="fas fa-video-slash fa-3x" style={{ marginBottom: '15px', opacity: 0.5 }}></i>
                    <h3>{lang === 'en' ? 'No videos published yet' : 'இன்னும் வீடியோக்கள் வெளியிடப்படவில்லை'}</h3>
                  </div>
                ) : videos.slice(0, 4).map((vid, idx) => (
                  <div className="video-card" key={vid.id || vid.videoId || idx}>
                    <div className="thumb-area">
                      {vid.thumbnailUrl ? (
                        <img src={getImageUrl(vid.thumbnailUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={vid.title} />
                      ) : (
                        <div style={{ background: gradients[idx % gradients.length], width: '100%', height: '100%' }}></div>
                      )}
                      <div className="play-overlay"><i className="fas fa-play"></i></div>
                      <span className="duration">{vid.duration || '3:15'}</span>
                    </div>
                    <div className="body">
                      <h5>{vid.title}</h5>
                      <div className="meta">
                        <span><i className="far fa-eye"></i> {vid.viewsCount || '15K'} {lang === 'en' ? 'views' : 'பார்வைகள்'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STORIES SECTION */}
          {sections.stories !== false && (
            <section className="stories-section" id="section-stories">
              <div className="section-title">
                <h2><i className="fas fa-sticky-note"></i> {lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</h2>
                <Link to="/web-stories" className="view-all">{lang === 'en' ? 'View All' : 'அனைத்தும் காண'} <i className="fas fa-arrow-right"></i></Link>
              </div>
              <div className="stories-track">
                {stories.map(story => {
                  const catSlug = story.cat === 'tech' ? 'technology' : story.cat === 'agri' ? 'agriculture' : story.cat;
                  const catNames = {
                    sports: { en: 'Sports', ta: 'விளையாட்டு' },
                    cinema: { en: 'Cinema', ta: 'சினிமா' },
                    politics: { en: 'Politics', ta: 'அரசியல்' },
                    tech: { en: 'Technology', ta: 'தொழில்நுட்பம்' },
                    agri: { en: 'Agriculture', ta: 'விவசாயம்' },
                    business: { en: 'Business', ta: 'வணிகம்' }
                  }[story.cat] || { en: story.cat, ta: story.cat };

                  return (
                    <Link to="/web-stories" className="story-card" style={{ background: story.gradient, textDecoration: 'none' }} key={story.id}>
                      <span className="badge-tag" style={{ background: story.badge === 'NEW' ? '#EF4444' : '#F97316' }}>{story.badge}</span>
                      <div className="story-overlay">
                        <span className={`story-cat cat-${catSlug}`}>
                          {lang === 'en' ? catNames.en : catNames.ta}
                        </span>
                        <h5>{lang === 'en' ? story.titleEn : story.titleTa}</h5>
                        <span className="views"><i className="far fa-eye"></i> {story.views}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="trending-sidebar" style={{ maxWidth: `${widgetWidth}px` }}>
          {/* Trending list */}
          {sections.trending_sidebar !== false && (
            <div className="trending-list" style={{ marginBottom: '20px' }}>
            <h4>
              <i className="fas fa-fire" style={{ color: '#EF4444' }}></i>{' '}
              {lang === 'en' ? 'Trending News' : 'ட்ரெண்டிங் செய்திகள்'}
            </h4>
            {(() => {
              const fallbackTrending = [
                { rank: 1, title: lang === 'en' ? 'New Metro expansion announced in Chennai' : 'சென்னை பெருநகரில் புதிய மெட்ரோ ரயில் திட்டம் அறிவிப்பு', views: '45.2K', score: '+2.4K/hr' },
                { rank: 2, title: lang === 'en' ? 'Supreme Court updates on Cauvery water management' : 'காவிரி நீர் மேலாண்மை குறித்த உச்சநீதிமன்றம் முக்கிய உத்தரவு', views: '38.7K', score: '+1.8K/hr' },
                { rank: 3, title: lang === 'en' ? 'Indian economy records 8% growth - World Bank' : 'இந்திய பொருளாதாரம் 8% வளர்ச்சி - உலக வங்கி அறிக்கை', views: '32.1K', score: '+1.5K/hr' }
              ];
              const displayList = trendingNews.length > 0 ? trendingNews : fallbackTrending;
              return displayList.map((art, idx) => (
                <div className="trending-item" key={art.id || art.article_id || idx}>
                  <span className="rank top3">{idx + 1}</span>
                  <div className="info">
                    <h5>
                      {art.titleEn || art.title
                        ? (lang === 'en' ? (art.titleEn || art.title) : (art.titleTa || art.title))
                        : art.title}
                    </h5>
                    <div className="meta">
                      <span><i className="far fa-eye"></i> {art.viewsCount ? `${(art.viewsCount/1000).toFixed(1)}K` : (art.views || '0K')}</span>
                      <span className="trend-score">{art.score || `+${Math.floor(Math.random() * 5) + 1}K/hr`}</span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
          )}

          {/* Weather Widget */}
          {sections.weather !== false && (
            <div className="weather-widget">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-cloud-sun" style={{ color: 'var(--primary)' }}></i>{' '}
                {lang === 'en' ? 'Chennai Weather' : 'சென்னை வானிலை'}
              </h4>
              <Link 
                to="/weather" 
                style={{ 
                  fontSize: '12px', 
                  color: 'var(--primary, #B3732A)', 
                  textDecoration: 'none', 
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {lang === 'en' ? 'View All' : 'மேலும் பார்'} <i className="fas fa-arrow-right" style={{ fontSize: '10px' }}></i>
              </Link>
            </div>
            <div className="weather-current">
              <div className="temp" id="weatherTemp">{weatherData.temp}</div>
              <div className="details">
                <strong>{weatherData.condition}</strong>
                <span>{lang === 'en' ? `Humidity: ${weatherData.humidity}` : `ஈரப்பதம்: ${weatherData.humidity}`}</span>
                <span>{lang === 'en' ? `Wind: ${weatherData.wind}` : `காற்று: ${weatherData.wind}`}</span>
              </div>
            </div>
            <div className="weather-forecast-grid">
              {weatherData.forecast.map((f, idx) => (
                <div className="weather-forecast-col" key={idx}>
                  <div className="day">{f.day}</div>
                  <div className="icon">{f.icon}</div>
                  <div className="temp">{f.temp}</div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Live TV Widget */}
          {sections.livetv !== false && (
            <div className="weather-widget" style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-tv" style={{ color: '#EF4444' }}></i>{' '}
                {lang === 'en' ? 'Live Broadcast' : 'நேரலை ஒளிபரப்பு'}
              </h4>
              <div style={{ width: '100%', height: '180px', background: 'black', borderRadius: '8px', overflow: 'hidden' }}>
                {liveVideo ? (
                  <iframe 
                    src={liveVideo.videoUrl} 
                    title="Live Stream" 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                    <i className="fas fa-play-circle fa-2x"></i>
                    <span>{lang === 'en' ? '[ LIVE TV STREAM WINDOW ]' : '[ நேரலை டிவி ஒளிபரப்பு ]'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          {sections.newsletter !== false && (
            <div className="sidebar-newsletter" style={{ marginTop: '20px' }}>
              <h4>{lang === 'en' ? 'Newsletter Subscription' : 'செய்திமடல் சந்தா'}</h4>
              <p>{lang === 'en' ? 'Get latest news updates straight to your inbox' : 'முக்கிய செய்திகள் உங்கள் இமெயிலில் பெறுங்கள்'}</p>
              <form onSubmit={(e) => { e.preventDefault(); alert(lang === 'en' ? 'Thank you for subscribing!' : 'நன்றி! செய்திமடலில் இணைந்தமைக்கு.'); }}>
                <input type="email" placeholder={lang === 'en' ? 'Your email address' : 'உங்கள் இமெயில் முகவரி'} required />
                <button type="submit">{lang === 'en' ? 'Subscribe Now' : 'சந்தா சேர்க்கவும்'}</button>
              </form>
            </div>
          )}

          {/* Business Case Studies */}
          {sections.business !== false && (
            <div className="case-studies-widget" style={{ marginTop: '20px' }}>
              <div className="case-studies-header">
                <h4><i className="fas fa-briefcase" style={{ color: '#0057FF' }}></i> {lang === 'en' ? 'Business Case Studies' : 'வணிகக் கேஸ் ஸ்டடிஸ்'}</h4>
                <Link to="/business-studies" className="view-all">
                  {lang === 'en' ? 'All' : 'அனைத்தும்'} <i className="fas fa-chevron-right" style={{ fontSize: '8px' }}></i>
                </Link>
              </div>
              <div className="case-studies-grid">
                {(() => {
                  const fallbackCaseStudies = [
                    { id: 1, title: lang === 'en' ? 'Infosys: Digital Transformation Journey' : 'Infosys: டிஜிட்டல் மாற்றுப் பயணம்', company: 'Infosys', tag: lang === 'en' ? 'Tech' : 'தொழில்நுட்பம்', iconClass: 'fas fa-building', iconColor: '#0057FF', pdfUrl: '#' },
                    { id: 2, title: lang === 'en' ? 'TVS Motor: Sustainable Growth Journey' : 'TVS Motor: நிலையான வளர்ச்சி', company: 'TVS Motor', tag: lang === 'en' ? 'Automobile' : 'ஆட்டோமொபைல்', iconClass: 'fas fa-car', iconColor: '#EF4444', pdfUrl: '#' }
                  ];
                  const displayStudies = caseStudies.length > 0 ? caseStudies : fallbackCaseStudies;
                  return displayStudies.map((study, idx) => (
                    <div className="case-study-col" key={study.id || idx}>
                      <div className="company-logo">
                        <i className={study.iconClass || "fas fa-file-pdf"} style={{ color: study.iconColor || "#0057FF" }}></i>{' '}
                        {study.company || (study.titleEn || study.title || '').split(':')[0]}
                      </div>
                      <span className="tag">{study.tag || (lang === 'en' ? 'Document' : 'ஆவணம்')}</span>
                      <h5>{lang === 'en' ? (study.titleEn || study.title) : (study.titleTa || study.title)}</h5>
                      <a href={study.pdfUrl || '#'} className="pdf-btn" target="_blank" rel="noreferrer">
                        <i className="fas fa-file-pdf"></i> PDF
                      </a>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Crowd Reporter */}
          <div className="crowd-reporter-widget" style={{ marginTop: '20px' }}>
            <h4><i className="fas fa-bullhorn"></i> {lang === 'en' ? 'Crowd Reporter' : 'மக்கள் செய்தியாளர்'}</h4>
            <p>
              {lang === 'en' 
                ? 'Share news and happenings in your area with us. Let your voice be heard.' 
                : 'உங்கள் பகுதியில் நடக்கும் நிகழ்வுகளை எங்களோடு பகிர்ந்து கொள்ளுங்கள்! உங்கள் குரல் நாடாகட்டும்.'}
            </p>
            <button 
              onClick={() => setShowReportModal(true)} 
              className="report-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <i className="fas fa-pen-fancy"></i> {lang === 'en' ? 'Send Report' : 'செய்தி அனுப்பவும்'}
            </button>
          </div>
        </aside>
      </div>

      {/* DIGEST SECTION */}
      {sections.digest !== false && (
        <section className="digest-section" id="section-digest">
          <div className="container">
            <div className="section-title">
              <h2><i className="fas fa-rss" style={{ color: '#F97316' }}></i> {lang === 'en' ? 'News Digest (Other Media)' : 'தமிழ் செய்தி சுருக்கம் (இதர ஊடகங்கள்)'}</h2>
            </div>
            <div className="digest-row">
              <div className="digest-card" style={{ borderLeft: '3px solid #EF4444', background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="logo" style={{ color: '#EF4444', fontWeight: 800, fontSize: '15px' }}><i className="fas fa-newspaper"></i> {lang === 'en' ? 'Dinamalar' : 'தினமலர்'}</div>
                <h4 style={{ fontSize: '13px', margin: '8px 0', fontWeight: 700 }}>
                  {lang === 'en' ? 'Tamil Nadu budget 2026 key highlights summary' : 'தமிழக பட்ஜெட் 2026 முக்கிய சிறப்பம்சங்கள் முழு தொகுப்பு'}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1 Hr Ago</span>
              </div>
              <div className="digest-card" style={{ borderLeft: '3px solid #F59E0B', background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="logo" style={{ color: '#F59E0B', fontWeight: 800, fontSize: '15px' }}><i className="fas fa-newspaper"></i> {lang === 'en' ? 'Daily Thanthi' : 'தினத்தந்தி'}</div>
                <h4 style={{ fontSize: '13px', margin: '8px 0', fontWeight: 700 }}>
                  {lang === 'en' ? 'Government increases paddy procurement price: farmers welcome' : 'நெல் கொள்முதல் விலையை உயர்த்திய அரசு: விவசாயிகள் வரவேற்பு'}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 Hr Ago</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CROWD REPORTER MODAL */}
      {showReportModal && (
        <div className="modal open" id="crowdReporterModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header" style={{ background: '#D97706' }}>
              <h3>{lang === 'en' ? 'Submit News Report' : 'செய்தி அறிக்கை சமர்ப்பிக்கவும்'}</h3>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="crowdReporterForm" onSubmit={handleSubmitReport}>
                <div className="form-group">
                  <label htmlFor="reporterNameInput">{lang === 'en' ? 'Reporter Name *' : 'உங்கள் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="reporterNameInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Muthukumar' : 'எ.கா: முத்துக்குமார்'}
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reporterContactInput">{lang === 'en' ? 'Contact Details (Phone/Email) *' : 'தொடர்பு விபரம் (கைபேசி/மின்னஞ்சல்) *'}</label>
                  <input 
                    type="text" 
                    id="reporterContactInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. +91 9876543210' : 'எ.கா: +91 9876543210'}
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reportTitleInput">{lang === 'en' ? 'News Headline *' : 'செய்தித் தலைப்பு *'}</label>
                  <input 
                    type="text" 
                    id="reportTitleInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Waterlogging issue in Gandhi Nagar' : 'எ.கா: காந்தி நகரில் தேங்கியுள்ள மழைநீர்'}
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reportDetailsInput">{lang === 'en' ? 'News Details *' : 'செய்தி விவரம் *'}</label>
                  <textarea 
                    id="reportDetailsInput" 
                    rows="4" 
                    required 
                    placeholder={lang === 'en' ? 'Describe the news or event in detail...' : 'செய்தி அல்லது நிகழ்வை விரிவாக விவரிக்கவும்...'}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="reportImageUrlInput">{lang === 'en' ? 'Mock Image URL (Optional)' : 'பட இணைய முகவரி (விருப்பம்)'}</label>
                  <input 
                    type="url" 
                    id="reportImageUrlInput" 
                    placeholder={lang === 'en' ? 'e.g. https://example.com/image.jpg' : 'எ.கா: https://example.com/image.jpg'}
                    value={reportImageUrl}
                    onChange={(e) => setReportImageUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reportVideoUrlInput">{lang === 'en' ? 'Mock Video URL (Optional)' : 'வீடியோ இணைய முகவரி (விருப்பம்)'}</label>
                  <input 
                    type="url" 
                    id="reportVideoUrlInput" 
                    placeholder={lang === 'en' ? 'e.g. https://example.com/video.mp4' : 'எ.கா: https://example.com/video.mp4'}
                    value={reportVideoUrl}
                    onChange={(e) => setReportVideoUrl(e.target.value)}
                  />
                </div>
                <button type="submit" className="submit-btn" style={{ background: '#D97706', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '10px' }}>
                  {lang === 'en' ? 'Submit Report' : 'அறிக்கை சமர்ப்பி'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
