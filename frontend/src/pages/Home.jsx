import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi, getImageUrl } from '../utils/api';
import AdWidget from '../components/AdWidget';
import SkeletonLoader from '../components/SkeletonLoader';
import { AuthContext } from '../context/AuthContext';
import PersonalizedFeedSection from '../components/PersonalizedFeedSection';
import NearbyNewsSection from '../components/NearbyNewsSection';

const Home = () => {
  const { lang, t } = useContext(LanguageContext);
  const { widgetWidth, slideSpeed, sections } = useContext(ThemeContext);
  const { token, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [liveVideo, setLiveVideo] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [activeStreams, setActiveStreams] = useState([]);
  const [layoutSections, setLayoutSections] = useState([]);
  const [crowdReports, setCrowdReports] = useState([]);
  const [institutionNews, setInstitutionNews] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [commodityPrices, setCommodityPrices] = useState([]);
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
  const [aggregatedNews, setAggregatedNews] = useState([]);
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
    // Primary fetches wrapped in promises for loading state coordination
    const pCategories = fetchApi('/categories')
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

    const pArticles = fetchApi(`/articles?language=${lang}`)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setArticles(list);
      })
      .catch(err => {
        console.warn("Could not load articles from API", err);
        setArticles([]);
      });

    const pBreakingNews = fetchApi(`/breaking-news/getAllWeb?size=10&language=${lang}`)
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

    const pWebStories = fetchApi(`/web-stories/getAllWeb?size=6&language=${lang}`)
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

    const pVideos = fetchApi(`/videos?language=${lang}`)
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

    const pLiveVideo = fetchApi('/videos/live')
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

    const pActiveStreams = fetchApi('/public/livestream/active')
      .then(data => {
        if (Array.isArray(data)) {
          setActiveStreams(data);
        }
      })
      .catch(() => {});

    const pLayout = fetchApi('/public/layout/web')
      .then(data => {
        if (data && data.layout) {
          const parsed = JSON.parse(data.layout);
          if (Array.isArray(parsed)) {
            setLayoutSections(parsed);
          }
        } else if (Array.isArray(data)) {
          setLayoutSections(data);
        }
      })
      .catch(() => {});

    const pTrending = fetchApi('/articles/public/trending')
      .then(data => {
        if (Array.isArray(data)) {
          setTrendingNews(data);
        }
      })
      .catch(() => {});

    const pRss = fetchApi('/rss-aggregator/latest?page=0&size=5')
      .then(data => {
        if (data && Array.isArray(data.content)) {
          setAggregatedNews(data.content);
        }
      })
      .catch(err => console.warn("Could not load RSS aggregated news", err));

    const pInstitution = fetchApi(`/articles/public/institution-news?language=${lang}`)
      .then(data => {
        if (Array.isArray(data)) {
          setInstitutionNews(data);
        }
      })
      .catch(() => {});

    const pCrowd = fetchApi('/report-news/getAllWeb?size=4')
      .then(res => {
        if (res && Array.isArray(res.content)) {
          setCrowdReports(res.content);
        }
      })
      .catch(() => {});

    const pMarketPrices = fetchApi('/market-prices/public')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(item => ({
            nameEn: item.name,
            nameTa: item.name,
            price: item.price,
            change: '+₹0'
          }));
          setCommodityPrices(formatted);
        }
      })
      .catch(err => console.warn("Could not load market prices", err));

    const pClassifieds = fetchApi('/classifieds/latest')
      .then(data => {
        if (Array.isArray(data)) {
          setClassifieds(data);
        }
      })
      .catch(err => console.warn("Could not load classifieds", err));

    // Geolocation Personalized Articles
    const selectedDistId = localStorage.getItem('selectedDistrictId');
    let newsUrl = `/public/articles?limit=12&language=${lang}`;
    if (selectedDistId) {
      newsUrl = `/articles/getAllWeb?districtId=${selectedDistId}&size=12`;
    }

    const pPersonalized = new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            fetchApi(`${newsUrl}&lat=${latitude}&lon=${longitude}`)
              .then(data => {
                const list = data && Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
                if (list.length > 0) setArticles(list);
                resolve();
              })
              .catch(() => { resolve(); });
          },
          () => {
            fetchApi(newsUrl)
              .then(data => {
                const list = data && Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
                if (list.length > 0) setArticles(list);
                resolve();
              })
              .catch(() => { resolve(); });
          }
        );
      } else {
        fetchApi(newsUrl)
          .then(data => {
            const list = data && Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
            if (list.length > 0) setArticles(list);
            resolve();
          })
          .catch(() => { resolve(); });
      }
    });

    // 7. Fetch Weather Forecast from backend for Chennai
    const baseApi = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
    const pWeather = fetch(`${baseApi}/weather?city=Chennai`)
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

    const pCaseStudies = fetchApi('/pdfs')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCaseStudies(data);
        }
      })
      .catch(err => console.warn("Could not load PDFs", err));

    // Resolve loading after critical calls complete
    Promise.allSettled([
      pCategories, pArticles, pBreakingNews, pWebStories, pVideos, pLiveVideo,
      pLayout, pTrending, pRss, pInstitution, pCrowd, pPersonalized, pWeather, pCaseStudies,
      pMarketPrices, pClassifieds
    ]).then((results) => {
      // Check if critical resources failed (e.g., articles could not load)
      const articlesSuccess = results[1].status === 'fulfilled';
      if (!articlesSuccess) {
        setError(lang === 'en' ? 'Fatal: Failed to connect to the backend service.' : 'சேவை இணைப்பு தோல்வியடைந்தது.');
      }
      setLoading(false);
    });
  }, [lang]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % tickers.length);
    }, slideSpeed * 1000);
    return () => clearInterval(timer);
  }, [slideSpeed, tickers.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCommodityPrices(prev => prev.map(item => {
        const numericStr = item.price.replace(/[^\d]/g, '');
        const currentPrice = parseInt(numericStr);
        const changeVal = Math.floor(Math.random() * 21) - 10;
        const newPrice = currentPrice + changeVal;
        const changeSign = changeVal >= 0 ? '+' : '';
        return {
          ...item,
          price: `₹${newPrice.toLocaleString('en-IN')}`,
          change: `${changeSign}₹${changeVal}`
        };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const baseUrl = window.location.origin;
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": `${baseUrl}/`,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    let script = document.getElementById('jsonld-website-schema');
    if (!script) {
      script = document.createElement('script');
      script.id = 'jsonld-website-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(websiteSchema);

    return () => {
      const existingScript = document.getElementById('jsonld-website-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const getSortedSections = (groupKeys) => {
    if (layoutSections.length > 0) {
      const mapped = layoutSections
        .filter(sec => {
          const mappedKey = mapLayoutIdToKey(sec.id);
          return groupKeys.includes(mappedKey) && sec.active;
        })
        .map((sec, idx) => ({
          sectionKey: mapLayoutIdToKey(sec.id),
          displayOrder: idx
        }));
      return mapped;
    }
    return groupKeys.map((k, idx) => ({ sectionKey: k, displayOrder: idx }));
  };

  const mapLayoutIdToKey = (id) => {
    switch (id) {
      case 'Featured': return 'hero';
      case 'Latest': return 'latest_news';
      case 'Breaking Ticker': return 'news_ticker';
      case 'Institution News': return 'institution_news';
      case 'Nearby/District feed': return 'quick_access';
      case 'Classifieds row': return 'classifieds';
      case 'Market Ticker': return 'market_ticker';
      case 'Live TV embed': return 'live_tv';
      default: return id;
    }
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/public/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submitterName: reporterName || 'Reader Submission',
        submitterEmail: reporterContact || 'reader@kings-tv.com',
        title: reportTitle,
        content: reportDetails,
        imageUrl: reportImageUrl || null,
        videoUrl: reportVideoUrl || null,
        source: 'reader'
      })
    })
    .then(() => {
      alert(lang === 'en' ? 'Thank you! Your news report has been submitted to Chief Editor for review.' : 'நன்றி! உங்கள் செய்தி அறிக்கை மதிப்பாய்வுக்காக சமர்ப்பிக்கப்பட்டுள்ளது.');
      setReporterName('');
      setReporterContact('');
      setReportTitle('');
      setReportDetails('');
      setReportImageUrl('');
      setReportVideoUrl('');
      setShowReportModal(false);
    })
    .catch(err => {
      console.warn("API submission failed, submitting via fallback", err);
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

  const renderCommodityTicker = () => {
    return (
      <div style={{
        background: '#1F2937',
        color: 'white',
        padding: '10px 0',
        fontSize: '13px',
        fontWeight: 600,
        overflow: 'hidden',
        borderBottom: '1px solid #374151'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 800 }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%' }}></span>
            {lang === 'en' ? 'Live Markets' : 'நேரடி சந்தை'}
          </div>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 10px', flex: 1 }}>
            {commodityPrices.map((item, idx) => {
              const isUp = item.change.startsWith('+');
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{lang === 'en' ? item.nameEn : item.nameTa}:</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{item.price}</span>
                  <span style={{ color: isUp ? '#22C55E' : '#EF4444', fontSize: '11px', fontWeight: 700 }}>{item.change}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderNewsTicker = () => {
    return (
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
    );
  };

  const renderHero = () => {
    if (!featured) return null;
    return (
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
                  <span><i className="far fa-clock"></i> {lang === 'en' ? `${featured.readingTime || 1} Min Read` : `${featured.readingTime || 1} நிமிட வாசிப்பு`}</span>
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
    );
  };

  const renderQuickAccess = () => {
    return (
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
            <Link to="/directory" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-education"><i className="fas fa-map-marker-alt"></i></div>
              <span>{lang === 'en' ? 'Regional' : 'நம்ம ஊர்'}</span>
            </Link>
            <Link to="/category/international" className="quick-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="icon cat-weather"><i className="fas fa-globe"></i></div>
              <span>{lang === 'en' ? 'International' : 'சர்வதேசம்'}</span>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  const renderLatestNews = () => {
    return (
      <section className="news-section">
        <div className="section-title">
          <h2><i className="fas fa-newspaper"></i> {lang === 'en' ? 'Latest News' : 'சமீபத்திய செய்திகள்'}</h2>
        </div>
        <div className="news-grid-3" id="newsGrid">
          {latestGrid.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
              <i className="fas fa-inbox fa-3x" style={{ marginBottom: '15px', opacity: 0.5 }}></i>
              <h3>{lang === 'en' ? 'No news published yet' : 'இன்னும் செய்திகள் வெளியிடப்படவில்லை'}</h3>
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
                    <span><i className="far fa-clock"></i> {lang === 'en' ? `${art.readingTime || 1} Min Read` : `${art.readingTime || 1} நிமிட வாசிப்பு`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderVideoNews = () => {
    return (
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
    );
  };

  const renderWebStories = () => {
    return (
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
    );
  };

  const renderTrendingSidebar = () => {
    return (
      <div className="trending-list" style={{ marginBottom: '20px' }}>
        <h4>
          <i className="fas fa-fire" style={{ color: '#EF4444' }}></i>{' '}
          {lang === 'en' ? 'Trending News' : 'ட்ரெண்டிங் செய்திகள்'}
        </h4>
        {trendingNews.slice(0, 5).map((art, idx) => (
          <div className="trending-item" key={art.id || art.article_id || idx} style={{ cursor: 'pointer' }}>
            <span className="rank top3">{idx + 1}</span>
            <div className="info">
              <h5>
                <Link to={`/article/${art.id || art.article_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {lang === 'en' ? art.titleEn : art.titleTa}
                </Link>
              </h5>
              <div className="meta">
                <span><i className="far fa-eye"></i> {art.viewsCount || '0'} {lang === 'en' ? 'reads' : 'வாசிப்புகள்'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRssAggregatedNews = () => {
    return (
      <div className="trending-list" style={{ marginBottom: '20px', padding: '15px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 15px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-rss" style={{ color: '#F59E0B' }}></i>{' '}
          {lang === 'en' ? 'From Other Sources' : 'இதர செய்தி ஊடகங்கள்'}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {aggregatedNews && aggregatedNews.length > 0 ? (
            aggregatedNews.slice(0, 5).map((item, idx) => (
              <a href={item.externalLink} target="_blank" rel="noopener noreferrer noindex" key={item.id || idx} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {item.sourceLogo && (
                    <img src={item.sourceLogo} alt={item.sourceName} style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'contain', marginTop: '2px', background: '#f1f5f9', padding: '2px' }} />
                  )}
                  <div>
                    <h5 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '600', lineHeight: '1.4', color: 'var(--text-primary)' }}>{item.title}</h5>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>{item.sourceName}</span>
                      <span>•</span>
                      <span>{new Date(item.publishedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {lang === 'en' ? 'No recent external articles' : 'செய்திகள் எதுவும் இல்லை'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeather = () => {
    return (
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
    );
  };

  const renderLiveTv = () => {
    return (
      <div className="weather-widget" style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-tv" style={{ color: '#EF4444' }}></i>{' '}
          {lang === 'en' ? 'Live Broadcast' : 'நேரலை ஒளிபரப்பு'}
        </h4>
        <div style={{ width: '100%', height: '180px', background: 'black', borderRadius: '8px', overflow: 'hidden' }}>
          {activeStreams && activeStreams.length > 0 ? (
            <video 
              controls
              autoPlay
              muted
              playsInline
              src={activeStreams[0].streamUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : liveVideo ? (
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
    );
  };

  const renderBusinessCase = () => {
    return (
      <div className="case-studies-widget" style={{ marginTop: '20px' }}>
        <div className="case-studies-header">
          <h4><i className="fas fa-briefcase" style={{ color: '#0057FF' }}></i> {lang === 'en' ? 'Business Case Studies' : 'வணிகக் கேஸ் ஸ்டடிஸ்'}</h4>
          <Link to="/business-studies" className="view-all">
            {lang === 'en' ? 'All' : 'அனைத்தும்'} <i className="fas fa-chevron-right" style={{ fontSize: '8px' }}></i>
          </Link>
        </div>
        <div className="case-studies-grid">
          {caseStudies.map((study, idx) => (
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
          ))}
        </div>
      </div>
    );
  };

  const renderCrowdReporterWidget = () => {
    return (
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
    );
  };

  const renderCrowdReporterHighlight = () => {
    return (
      <section className="news-section" style={{ marginTop: '30px' }}>
        <div className="section-title">
          <h2><i className="fas fa-bullhorn" style={{ color: '#F59E0B' }}></i> {lang === 'en' ? 'Crowd Reports (Public Submissions)' : 'மக்கள் செய்தியாளர் பதிவுகள்'}</h2>
          <Link to="/submit-report" className="view-all">{lang === 'en' ? 'Submit Report' : 'செய்தி அனுப்ப'} <i className="fas fa-arrow-right"></i></Link>
        </div>
        <div className="news-grid-3">
          {crowdReports.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'No crowd reports approved yet.' : 'மக்கள் செய்தியாளர் பதிவுகள் இன்னும் இல்லை.'}
            </div>
          ) : crowdReports.slice(0, 3).map((report, idx) => (
            <div 
              className="news-card" 
              key={report.id || idx}
              style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            >
              <div 
                className="card-img" 
                style={{ 
                  background: report.imageUrl ? `url(${getImageUrl(report.imageUrl)}) center/cover` : gradients[idx % gradients.length]
                }}
              >
                <span className="cat-badge" style={{ background: '#F59E0B' }}>
                  {lang === 'en' ? 'Public Report' : 'பொது மக்கள்'}
                </span>
              </div>
              <div className="card-body">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  <i className="far fa-user"></i> {report.reporterName} ({report.location || (lang === 'en' ? 'Tamil Nadu' : 'தமிழகம்')})
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>
                  {report.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {report.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderInstitutionNews = () => {
    return (
      <section className="news-section" style={{ marginTop: '30px' }}>
        <div className="section-title">
          <h2><i className="fas fa-university" style={{ color: '#1E40AF' }}></i> {lang === 'en' ? 'Institution & Press Releases' : 'நிறுவனங்களின் செய்திகள்'}</h2>
        </div>
        <div className="news-grid-3">
          {institutionNews.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              {lang === 'en' ? 'No institutional announcements published yet.' : 'நிறுவனங்களின் செய்திகள் இன்னும் இல்லை.'}
            </div>
          ) : institutionNews.slice(0, 3).map((art, idx) => {
            const gridCat = getCategoryDetails(art.categoryId);
            return (
              <div className={`news-card theme-${gridCat.slug}`} key={art.id || art.article_id}>
                <div 
                  className="card-img" 
                  style={{ 
                    background: art.imageUrl ? `url(${getImageUrl(art.imageUrl)}) center/cover` : gradients[(idx + 4) % gradients.length]
                  }}
                >
                  <span className="cat-badge" style={{ background: '#1E40AF' }}>
                    {lang === 'en' ? 'Press Release' : 'பத்திரிகை செய்தி'}
                  </span>
                </div>
                <div className="card-body">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    <i className="far fa-building"></i> {art.authorName}
                  </span>
                  <h3>
                    <Link to={`/article/${art.id || art.article_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {lang === 'en' ? art.titleEn : art.titleTa}
                    </Link>
                  </h3>
                  <p>
                    {lang === 'en' ? art.shortDescEn : art.shortDescTa}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderNewsDigest = () => {
    return (
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
    );
  };

  const renderClassifieds = () => {
    return (
      <section className="news-section" style={{ marginTop: '30px', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-tags text-amber-500"></i> {lang === 'en' ? 'Latest Classifieds Listings' : 'சமீபத்திய விளம்பரங்கள்'}
          </h2>
          <Link to="/classifieds" style={{ fontSize: '0.85rem', color: '#B3732A', fontWeight: '700', textDecoration: 'none' }}>
            {lang === 'en' ? 'View All' : 'அனைத்தும் காண்க'} <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {classifieds.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {lang === 'en' ? 'No active classifieds listings found.' : 'செயலில் உள்ள விளம்பரங்கள் எதுவும் இல்லை.'}
            </p>
          ) : (
            classifieds.map(ad => (
              <div key={ad.id} style={{ minWidth: '240px', maxWidth: '240px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '140px', background: ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : '#e2e8f0' }}></div>
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#B3732A', fontWeight: '700' }}>{ad.category}</span>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad.title}</h4>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#22c55e' }}>₹{ad.price}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}><i className="fa-solid fa-location-dot"></i> {ad.location}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'en' ? 'en-US' : 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchQuery(speechToText);
      handleSearchSubmit(speechToText);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleSearchSubmit = async (queryStr) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    try {
      const res = await fetchApi(`/public/articles?search=${encodeURIComponent(queryStr)}&language=${lang}`);
      if (res && Array.isArray(res.articles)) {
        setArticles(res.articles);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderVoiceSearchBar = () => {
    return (
      <div className="container" style={{ margin: '1.5rem auto 0 auto', padding: '0 15px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '0.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', alignItems: 'center' }}>
          <i className="fa-solid fa-magnifying-glass text-slate-400" style={{ marginLeft: '0.5rem' }}></i>
          <input
            type="text"
            placeholder={lang === 'en' ? "Search news articles..." : "செய்திகளைத் தேடுங்கள்..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
            style={{ flexGrow: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', background: 'transparent' }}
          />
          <button
            type="button"
            onClick={startVoiceSearch}
            style={{
              border: 'none',
              background: isListening ? '#ef4444' : '#f1f5f9',
              color: isListening ? 'white' : '#B3732A',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines animate-pulse' : 'fa-microphone'}`}></i>
            <span style={{ fontSize: '0.75rem' }}>{isListening ? 'Listening...' : 'Voice Search'}</span>
          </button>
        </div>
      </div>
    );
  };

  const getRenderedSection = (key) => {
    switch (key) {
      case 'news_ticker': return renderNewsTicker();
      case 'hero': return renderHero();
      case 'quick_access': return renderQuickAccess();
      case 'latest_news': return renderLatestNews();
      case 'video_news': return renderVideoNews();
      case 'web_stories': return renderWebStories();
      case 'crowd_reporter_highlight': return renderCrowdReporterHighlight();
      case 'institution_news': return renderInstitutionNews();
      case 'trending_sidebar': return renderTrendingSidebar();
      case 'rss_aggregator': return renderRssAggregatedNews();
      case 'weather': return renderWeather();
      case 'live_tv': return renderLiveTv();
      case 'business_case': return renderBusinessCase();
      case 'crowd_reporter': return renderCrowdReporterWidget();
      case 'news_digest': return renderNewsDigest();
      case 'classifieds': return renderClassifieds();
      case 'market_ticker': return renderCommodityTicker();
      default: return null;
    }
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 15px', textAlign: 'center' }}>
        <div style={{ padding: '30px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: 'var(--text-dark)' }}>
          <h2 style={{ color: '#EF4444', marginBottom: '10px' }}>{lang === 'en' ? 'Connection Error' : 'இணைப்பு பிழை'}</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '15px', padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {lang === 'en' ? 'Retry' : 'மீண்டும் முயல்க'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '20px 15px' }}>
        {/* Ticker Skeleton */}
        <div className="skeleton-item" style={{ height: '40px', width: '100%', borderRadius: '6px', marginBottom: '20px' }}></div>
        
        {/* Hero Section Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }} className="hero-skeleton-grid">
          <div className="skeleton-item" style={{ height: '350px', borderRadius: '12px' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="skeleton-item" style={{ height: '105px', borderRadius: '8px' }}></div>
            <div className="skeleton-item" style={{ height: '105px', borderRadius: '8px' }}></div>
            <div className="skeleton-item" style={{ height: '105px', borderRadius: '8px' }}></div>
          </div>
        </div>

        {/* Main Split Skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '30px' }} className="main-skeleton-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <div className="skeleton-item" style={{ height: '24px', width: '200px', borderRadius: '4px', marginBottom: '15px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="skeleton-cards-grid">
                <SkeletonLoader type="card" count={4} />
              </div>
            </div>
          </div>
          <div>
            <div className="skeleton-item" style={{ height: '24px', width: '150px', borderRadius: '4px', marginBottom: '15px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <SkeletonLoader type="list" count={4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* AI Voice Search Bar */}
      {renderVoiceSearchBar()}

      {/* FULL-WIDTH TOP SECTIONS */}
      {getSortedSections(['market_ticker', 'news_ticker', 'hero', 'quick_access']).map(sec => (
        <React.Fragment key={sec.sectionKey}>
          {getRenderedSection(sec.sectionKey)}
        </React.Fragment>
      ))}

      {/* HEADER BANNER SPONSORED AD */}
      <div className="container" style={{ margin: '20px auto 0 auto', padding: '0 15px' }}>
        <AdWidget placement="header" />
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div className="container main-layout-container">
        <div className="left-content-column">
          {isAuthenticated && token && (
            <PersonalizedFeedSection token={token} />
          )}

          <NearbyNewsSection title={lang === 'en' ? '📍 News Near You' : '📍 உங்களுக்கு அருகில் உள்ள செய்திகள்'} />

          {getSortedSections(['latest_news', 'video_news', 'web_stories', 'crowd_reporter_highlight', 'institution_news', 'classifieds']).map(sec => (
            <React.Fragment key={sec.sectionKey}>
              {getRenderedSection(sec.sectionKey)}
            </React.Fragment>
          ))}
        </div>

        <aside className="trending-sidebar" style={{ maxWidth: `${widgetWidth}px` }}>
          <AdWidget placement="sidebar" />
          {getSortedSections(['trending_sidebar', 'rss_aggregator', 'weather', 'live_tv', 'business_case', 'crowd_reporter']).map(sec => (
            <React.Fragment key={sec.sectionKey}>
              {getRenderedSection(sec.sectionKey)}
            </React.Fragment>
          ))}
        </aside>
      </div>

      {/* FULL-WIDTH BOTTOM SECTIONS */}
      {getSortedSections(['news_digest']).map(sec => (
        <React.Fragment key={sec.sectionKey}>
          {getRenderedSection(sec.sectionKey)}
        </React.Fragment>
      ))}

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
