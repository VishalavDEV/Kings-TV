import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';

const Home = () => {
  const { lang, t } = useContext(LanguageContext);
  const { widgetWidth, slideSpeed, sections } = useContext(ThemeContext);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [liveVideo, setLiveVideo] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const getCategoryDetails = (categoryId) => {
    const categories = {
      1: { slug: 'politics', en: 'Politics', ta: 'அரசியல்' },
      2: { slug: 'business', en: 'Business', ta: 'வணிகம்' },
      3: { slug: 'sports', en: 'Sports', ta: 'விளையாட்டு' },
      4: { slug: 'cinema', en: 'Cinema', ta: 'பொழுதுபோக்கு' },
      5: { slug: 'tech', en: 'Tech', ta: 'தொழில்நுட்பம்' },
      6: { slug: 'regional', en: 'Regional', ta: 'மாநில செய்திகள்' },
      7: { slug: 'international', en: 'International', ta: 'சர்வதேச செய்திகள்' }
    };
    return categories[categoryId] || { slug: 'politics', en: 'Politics', ta: 'அரசியல்' };
  };

  const fallbackArticles = [
    {
      id: 1,
      categoryId: 1,
      titleTa: "தமிழக சட்டப்பேரவையில் புதிய மசோதா தாக்கல் - எதிர்க்கட்சிகள் எதிர்ப்பு",
      titleEn: "New bill tabled in TN assembly - opposition registers strong protest",
      shortDescTa: "சட்டப்பேரவையில் இன்று தாக்கல் செய்யப்பட்ட புதிய மசோதாவுக்கு எதிர்க்கட்சிகள் கடும் எதிர்ப்பு தெரிவித்துள்ளனர். இந்த மசோதா மக்கள் நலனுக்கு பாதகமானது என கூறியுள்ளனர்.",
      shortDescEn: "Opposition parties voiced strong protests against the new bill tabled in the assembly today, calling it detrimental to public welfare.",
      imageUrl: "",
      viewsCount: 4500,
      publishedAt: new Date().toISOString()
    },
    {
      id: 2,
      categoryId: 2,
      titleTa: "இந்திய கிரிக்கெட் அணி ஆஸ்திரேலியாவை வீழ்த்தியது - 3-0 அபாரம்",
      titleEn: "Indian cricket team beats Australia 3-0 in T20 series",
      shortDescTa: "ஆஸ்திரேலியாவுக்கு எதிரான டி20 தொடரை 3-0 என்ற கணக்கில் இந்திய அணி முழுமையாக வென்றது. விராட் கோலி அபார ஆட்டம்.",
      shortDescEn: "India clean sweeps T20 series against Australia 3-0. Virat Kohli shines with a brilliant match-winning performance.",
      imageUrl: "",
      viewsCount: 18200,
      publishedAt: new Date().toISOString()
    },
    {
      id: 3,
      categoryId: 3,
      titleTa: "பங்குச் சந்தை புதிய உச்சம் - முதலீட்டாளர்களுக்கு வார இறுதி பரிசு",
      titleEn: "Share market reaches new peak - weekend gift for investors",
      shortDescTa: "சென்செக்ஸ் 82,000 புள்ளிகளை தாண்டி புதிய சாதனை படைத்தது. ஐடி, பேங்கிங் பங்குகள் முன்னணி.",
      shortDescEn: "Sensex creates new record by crossing 82,000 points. IT and Banking sectors lead the gainers list.",
      imageUrl: "",
      viewsCount: 7800,
      publishedAt: new Date().toISOString()
    },
    {
      id: 4,
      categoryId: 4,
      titleTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் சாதனை - சர்வதேச அங்கீகாரம்",
      titleEn: "Tamil Nadu youth excel in AI research - receive international awards",
      shortDescTa: "செயற்கை நுண்ணறிவில் தமிழக இளைஞர்கள் செய்த புதிய கண்டுபிடிப்புகளுக்கு சர்வதேச அறிவியல் சபை விருது வழங்கி கௌரவித்துள்ளது.",
      shortDescEn: "International science council honors youth from Tamil Nadu for their ground-breaking developments in AI.",
      imageUrl: "",
      viewsCount: 6100,
      publishedAt: new Date().toISOString()
    },
    {
      id: 5,
      categoryId: 5,
      titleTa: "தளபதி விஜய்யின் அடுத்த படம் குறித்த முக்கிய அறிவிப்பு வெளியானது",
      titleEn: "Major update released on Thalapathy Vijay's upcoming movie",
      shortDescTa: "இயக்குனர் வெங்கட் பிரபு இயக்கத்தில் விஜய் நடிக்கும் 69-வது படம் குறித்த அதிகாரப்பூர்வ தகவல் வெளியாகியுள்ளது.",
      shortDescEn: "Official details and title launch info released for Vijay's 69th film directed by Venkat Prabhu.",
      imageUrl: "",
      viewsCount: 32500,
      publishedAt: new Date().toISOString()
    },
    {
      id: 6,
      categoryId: 6,
      titleTa: "நெல் கொள்முதல் விலை உயர்வு - விவசாயிகள் சங்கம் வரவேற்பு",
      titleEn: "Paddy procurement price increased - farmers association welcomes move",
      shortDescTa: "நெல்லுக்கான குறைந்தபட்ச ஆதரவு விலையை மத்திய அரசு உயர்த்தியுள்ள நிலையில் விவசாயிகள் மகிழ்ச்சி தெரிவித்துள்ளனர்.",
      shortDescEn: "Farmers express joy as central government increases the minimum support price (MSP) for paddy procurement.",
      imageUrl: "",
      viewsCount: 5300,
      publishedAt: new Date().toISOString()
    }
  ];

  const fallbackVideos = [
    { id: 1, title: "தமிழக பட்ஜெட் 2026 - முக்கிய அம்சங்கள் விளக்கம்", viewsCount: 45000, duration: "4:32", color: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
    { id: 2, title: "கிரிக்கெட் போட்டி சிறப்பம்சங்கள் - இந்தியா vs ஆஸ்திரேலியா", viewsCount: 18200, duration: "2:18", color: "linear-gradient(135deg, #DC2626, #F97316)" },
    { id: 3, title: "விவசாயிகளுக்கான புதிய திட்டங்கள் - நேரடி அறிக்கை", viewsCount: 8500, duration: "6:45", color: "linear-gradient(135deg, #16A34A, #4ADE80)" },
    { id: 4, title: "பங்குச் சந்தை ஆய்வு - நிபுணர்களின் முக்கிய ஆலோசனை", viewsCount: 12100, duration: "8:10", color: "linear-gradient(135deg, #059669, #22C55E)" }
  ];

  const storiesList = [
    { id: 1, titleTa: "உலக கோப்பை கிரிக்கெட் 2027 அட்டவணை", titleEn: "World Cup Cricket 2027 Schedule", cat: "sports", badge: "NEW", views: "12.4K", gradient: "linear-gradient(135deg, #667eea, #764ba2)" },
    { id: 2, titleTa: "ரஜினி அடுத்த படம் - முதல் பார்வை", titleEn: "Rajini next movie first look out", cat: "cinema", badge: "HOT", views: "18.2K", gradient: "linear-gradient(135deg, #D946EF, #EC4899)" },
    { id: 3, titleTa: "பாராளுமன்ற தேர்தல் 2029 - முன்னோட்டம்", titleEn: "General Election 2029 - Preview", cat: "politics", badge: "TREND", views: "9.5K", gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
    { id: 4, titleTa: "AI மூலம் மருத்துவ துறையில் புரட்சி", titleEn: "Revolution in healthcare using AI", cat: "tech", badge: "NEW", views: "15K", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)" },
    { id: 5, titleTa: "கரிம வேளாண்மை - விவசாயிகள் வருமானம்", titleEn: "Organic farming boost to farmers income", cat: "agri", badge: "NEW", views: "8.4K", gradient: "linear-gradient(135deg, #16A34A, #4ADE80)" },
    { id: 6, titleTa: "புதிய முதலீட்டு வாய்ப்பப்புகள் 2026", titleEn: "New Investment avenues in 2026", cat: "business", badge: "TREND", views: "11.2K", gradient: "linear-gradient(135deg, #059669, #22C55E)" }
  ];

  const mockTickers = [
    lang === 'en' ? "Paddy procurement price increased - farmers express delight!" : "🌾 நெல் கொள்முதல் விலை உயர்வு - விவசாயிகள் மகிழ்ச்சி",
    lang === 'en' ? "Vijay 69th movie announcement sends fans into celebration mode!" : "🎬 விஜய் 69-வது படம் அறிவிப்பு - ரசிகர்கள் கொண்டாட்டம்",
    lang === 'en' ? "Class 12 board results to be declared soon - education department updates." : "📚 +2 தேர்வு முடிவுகள் விரைவில் - கல்வித்துறை தகவல்",
    lang === 'en' ? "Electricity tariff hike in Chennai creates public concern." : "⚡ சென்னையில் மின் கட்டணம் உயர்வு - நுகர்வோர் அதிருப்தி",
    lang === 'en' ? "New Vande Bharat rail service introduced by Southern Railway." : "🚆 புதிய வந்தே பாரத் ரயில் சேவை அறிமுகம் - தெற்கு ரயில்வே",
    lang === 'en' ? "Heavy rain alert issued for tomorrow in Tamil Nadu." : "🔴 தமிழகத்தில் நாளை முதல் கனமழை எச்சரிக்கை - வானிலை மையம்"
  ];

  const prefixedFallbackArticles = fallbackArticles.map(art => ({ ...art, id: `demo-${art.id}` }));
  const prefixedFallbackVideos = fallbackVideos.map(vid => ({ ...vid, id: `demo-${vid.id}` }));

  useEffect(() => {
    fetchApi('/articles')
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setArticles([...list, ...prefixedFallbackArticles]);
      })
      .catch(err => {
        console.warn("Could not load articles from API, using fallback", err);
        setArticles(prefixedFallbackArticles);
      });

    fetchApi('/videos')
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setVideos([...list, ...prefixedFallbackVideos]);
      })
      .catch(err => {
        console.warn("Could not load videos from API, using fallback", err);
        setVideos(prefixedFallbackVideos);
      });

    fetchApi('/videos/live')
      .then(data => setLiveVideo(data))
      .catch(err => console.warn("Could not load live video from API", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % mockTickers.length);
    }, slideSpeed * 1000);
    return () => clearInterval(timer);
  }, [slideSpeed, mockTickers.length]);

  const featured = articles[0] || prefixedFallbackArticles[0];
  const featuredCat = getCategoryDetails(featured.categoryId);
  const sideArticles = articles.slice(1, 4).length > 0 ? articles.slice(1, 4) : prefixedFallbackArticles.slice(1, 4);
  const latestGrid = articles.slice(0, 6).length > 0 ? articles.slice(0, 6) : prefixedFallbackArticles.slice(0, 6);

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
      <div className="breaking-news">
        <div className="container">
          <div className="breaking-label" style={{ backgroundColor: '#FFD700', color: '#000' }}>
            <i className="fas fa-bolt"></i> BREAKING NEWS
          </div>
          <div className="breaking-ticker">
            <div className="breaking-track" id="breakTrack">
              <a href="#">{mockTickers[tickerIndex]}</a>
            </div>
          </div>
          <div className="breaking-controls">
            <button onClick={() => setTickerIndex(prev => (prev - 1 + mockTickers.length) % mockTickers.length)}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button onClick={() => setTickerIndex(prev => (prev + 1) % mockTickers.length)}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      {sections.hero !== false && (
        <section className="hero-section" id="section-hero">
          <div className="container">
            <div className="hero-grid">
              <div className={`featured-card theme-${featuredCat.slug}`}>
                <div 
                  className="card-img" 
                  style={{ 
                    background: featured.imageUrl ? `url(${featured.imageUrl}) center/cover` : 'linear-gradient(135deg, #1E40AF, #3B82F6)' 
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
                          background: art.imageUrl ? `url(${art.imageUrl}) center/cover` : gradients[(idx + 1) % gradients.length] 
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

      {/* MAIN CONTAINER */}
      <div className="container main-layout-container">
        <div className="left-content-column">
          {/* LATEST NEWS */}
          <section className="news-section">
            <div className="section-title">
              <h2><i className="fas fa-newspaper"></i> {lang === 'en' ? 'Latest News' : 'சமீபத்திய செய்திகள்'}</h2>
              <a href="#" className="view-all">{lang === 'en' ? 'View All' : 'அனைத்தும் காண'} <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="news-grid-3" id="newsGrid">
              {latestGrid.map((art, idx) => {
                const gridCat = getCategoryDetails(art.categoryId);
                return (
                  <div className={`news-card theme-${gridCat.slug}`} key={art.id || art.article_id}>
                    <div 
                      className="card-img" 
                      style={{ 
                        background: art.imageUrl ? `url(${art.imageUrl}) center/cover` : gradients[idx % gradients.length] 
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

          {/* VIDEO NEWS */}
          {sections.video !== false && (
            <section className="video-section" id="section-video">
              <div className="section-title">
                <h2><i className="fas fa-video" style={{ color: '#EF4444' }}></i> {lang === 'en' ? 'Video News' : 'வீடியோ செய்திகள்'}</h2>
                <a href="#" className="view-all">{lang === 'en' ? 'More Videos' : 'மேலும் வீடியோக்கள்'} <i className="fas fa-arrow-right"></i></a>
              </div>
              <div className="video-categories">
                <button className="video-cat-btn active">{lang === 'en' ? 'All' : 'அனைத்தும்'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Politics' : 'அரசியல்'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Sports' : 'விளையாட்டு'}</button>
                <button className="video-cat-btn">{lang === 'en' ? 'Agriculture' : 'விவசாயம்'}</button>
              </div>
              <div className="video-grid-4">
                {videos.slice(0, 4).map((vid, idx) => (
                  <div className="video-card" key={vid.id || vid.videoId || idx}>
                    <div className="thumb-area">
                      {vid.thumbnailUrl ? (
                        <img src={vid.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={vid.title} />
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
                <a href="#" class="view-all">{lang === 'en' ? 'View All' : 'அனைத்தும் காண'} <i className="fas fa-arrow-right"></i></a>
              </div>
              <div className="stories-track">
                {storiesList.map(story => {
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
                    <div className="story-card" style={{ background: story.gradient }} key={story.id}>
                      <span className="badge-tag" style={{ background: story.badge === 'NEW' ? '#EF4444' : '#F97316' }}>{story.badge}</span>
                      <div className="story-overlay">
                        <span className={`story-cat cat-${catSlug}`}>
                          {lang === 'en' ? catNames.en : catNames.ta}
                        </span>
                        <h5>{lang === 'en' ? story.titleEn : story.titleTa}</h5>
                        <span className="views"><i className="far fa-eye"></i> {story.views}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="trending-sidebar" style={{ maxWidth: `${widgetWidth}px` }}>
          {/* Trending list */}
          <div className="trending-list" style={{ marginBottom: '20px' }}>
            <h4>
              <i className="fas fa-fire" style={{ color: '#EF4444' }}></i>{' '}
              {lang === 'en' ? 'Trending News' : 'ட்ரெண்டிங் செய்திகள்'}
            </h4>
            <div className="trending-item">
              <span className="rank top3">1</span>
              <div className="info">
                <h5>{lang === 'en' ? 'New Metro expansion announced in Chennai' : 'சென்னை பெருநகரில் புதிய மெட்ரோ ரயில் திட்டம் அறிவிப்பு'}</h5>
                <div className="meta"><span><i className="far fa-eye"></i> 45.2K</span><span className="trend-score">+2.4K/hr</span></div>
              </div>
            </div>
            <div className="trending-item">
              <span className="rank top3">2</span>
              <div className="info">
                <h5>{lang === 'en' ? 'Supreme Court updates on Cauvery water management' : 'காவிரி நீர் மேலாண்மை குறித்த உச்சநீதிமன்றம் முக்கிய உத்தரவு'}</h5>
                <div className="meta"><span><i className="far fa-eye"></i> 38.7K</span><span className="trend-score">+1.8K/hr</span></div>
              </div>
            </div>
            <div className="trending-item">
              <span className="rank top3">3</span>
              <div className="info">
                <h5>{lang === 'en' ? 'Indian economy records 8% growth - World Bank' : 'இந்திய பொருளாதாரம் 8% வளர்ச்சி - உலக வங்கி அறிக்கை'}</h5>
                <div className="meta"><span><i className="far fa-eye"></i> 32.1K</span><span className="trend-score">+1.5K/hr</span></div>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="weather-widget">
            <h4>
              <i className="fas fa-cloud-sun" style={{ color: 'var(--primary)' }}></i>{' '}
              {lang === 'en' ? 'Chennai Weather' : 'சென்னை வானிலை'}
            </h4>
            <div className="weather-current">
              <div className="temp" id="weatherTemp">32°C</div>
              <div className="details">
                <strong>{lang === 'en' ? 'Cloudy' : 'மேகமூட்டம்'}</strong>
                <span>{lang === 'en' ? 'Humidity: 72%' : 'ஈரப்பதம்: 72%'}</span>
                <span>{lang === 'en' ? 'Wind: 18 km/h' : 'காற்று: 18 km/h'}</span>
              </div>
            </div>
            <div className="weather-forecast-grid">
              <div className="weather-forecast-col">
                <div className="day">{lang === 'en' ? 'Mon' : 'தி'}</div>
                <div className="icon">☀️</div>
                <div className="temp">32°</div>
              </div>
              <div className="weather-forecast-col">
                <div className="day">{lang === 'en' ? 'Tue' : 'செ'}</div>
                <div className="icon">⛅</div>
                <div className="temp">31°</div>
              </div>
              <div className="weather-forecast-col">
                <div className="day">{lang === 'en' ? 'Wed' : 'பு'}</div>
                <div className="icon">🌤️</div>
                <div className="temp">33°</div>
              </div>
            </div>
          </div>

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
                <div className="case-study-col">
                  <div className="company-logo"><i className="fas fa-building" style={{ color: '#0057FF' }}></i> Infosys</div>
                  <span className="tag">{lang === 'en' ? 'Tech' : 'தொழில்நுட்பம்'}</span>
                  <h5>Infosys: டிஜிட்டல் மாற்றுப் பயணம்</h5>
                  <a href="#" className="pdf-btn"><i className="fas fa-file-pdf"></i> PDF</a>
                </div>
                <div className="case-study-col">
                  <div className="company-logo"><i className="fas fa-car" style={{ color: '#EF4444' }}></i> TVS</div>
                  <span className="tag">ஆட்டோமொபைல்</span>
                  <h5>TVS Motor: நிலையான வளர்ச்சி</h5>
                  <a href="#" className="pdf-btn"><i className="fas fa-file-pdf"></i> PDF</a>
                </div>
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
            <a href="#" className="report-btn"><i className="fas fa-pen-fancy"></i> {lang === 'en' ? 'Send Report' : 'செய்தி அனுப்பவும்'}</a>
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
    </div>
  );
};

export default Home;
