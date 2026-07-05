import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { fetchApi } from '../utils/api';

const Home = () => {
  const { t, lang } = useContext(LanguageContext);
  const { widgetWidth, slideSpeed, sections } = useContext(ThemeContext);
  const [articles, setArticles] = useState([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  const mockTickers = [
    "தமிழகத்தில் நாளை முதல் கனமழை பெய்யக்கூடும் என வானிலை ஆய்வு மையம் எச்சரிக்கை!",
    "தங்கத்தின் விலை இன்று சற்றே சரிந்தது - சவரனுக்கு ரூ.120 குறைவு.",
    "சென்னை மெட்ரோ இரயில் சேவை 2-ஆம் கட்ட பணிகள் விறுவிறுப்பாக நடைபெற்று வருகின்றன."
  ];

  useEffect(() => {
    fetchApi('/articles')
      .then(data => setArticles(data))
      .catch(err => {
        console.warn("Could not load articles from API, using fallback", err);
        setArticles([
          {
            article_id: 1,
            title_ta: "தமிழகத்தில் புதிய மின்சார திட்டங்கள் துவக்கம்!",
            title_en: "New power projects launched in Tamil Nadu!",
            short_desc_ta: "மின் தட்டுப்பாட்டை போக்க புதிய சோலார் பூங்காக்கள் அமைக்கப்படுகின்றன.",
            short_desc_en: "Solar parks constructed to mitigate electricity demands.",
            image_url: "",
            views_count: 320,
            published_at: new Date().toISOString()
          }
        ]);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % mockTickers.length);
    }, slideSpeed * 1000);
    return () => clearInterval(timer);
  }, [slideSpeed]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="ticker-wrapper" style={{ display: 'flex', background: 'var(--primary)', color: 'white', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden', alignItems: 'center' }}>
        <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', marginRight: '16px' }}>BREAKING</div>
        <div className="ticker-item" style={{ fontSize: '14px', fontWeight: 600 }}>
          {mockTickers[tickerIndex]}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `${widgetWidth}px 1fr`, gap: '30px' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sections.livetv && (
            <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: 'var(--text-dark)', fontWeight: 800, fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-play" style={{ color: 'red' }}></i> {t('நேரலை')}
              </h3>
              <div style={{ width: '100%', height: '180px', background: 'black', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px' }}>
                [ LIVE FEED INTERACTION WINDOW ]
              </div>
            </div>
          )}

          {sections.digest && (
            <div className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: 'var(--text-dark)', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>News Digest</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ fontSize: '13px', color: 'var(--text-light)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                  • {t('தமிழகத்தில் புதிய மின்சார திட்டங்கள் துவக்கம்!')}
                </li>
              </ul>
            </div>
          )}
        </aside>

        <section style={{ overflow: 'hidden' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '24px', background: 'var(--primary)', display: 'inline-block', borderRadius: '2px' }}></span>
            {t('இன்றைய முக்கிய செய்திகள்')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {articles.map(art => (
              <div key={art.article_id} className="news-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '20px' }}>
                <div style={{ width: '200px', height: '120px', background: '#e2e8f0', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '12px' }}>
                  [ IMAGE ]
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                    {lang === 'en' ? art.title_en : art.title_ta}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {lang === 'en' ? art.short_desc_en : art.short_desc_ta}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
                    <span>👁️ {art.views_count} views</span>
                    <Link to={`/article/${art.article_id}`} style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                      Read More &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
