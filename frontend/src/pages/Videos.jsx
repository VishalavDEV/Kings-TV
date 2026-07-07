import React, { useState, useEffect, useContext } from 'react';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './Videos.css';

const Videos = () => {
  const { lang } = useContext(LanguageContext);
  const [videos, setVideos] = useState([]);
  const [liveVideo, setLiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Fetch non-live videos
    fetchApi('/videos')
      .then(data => {
        if (Array.isArray(data)) {
          const translated = data.map(vid => {
            const rawTitle = vid.title || '';
            const rawDesc = vid.description || '';
            let titleVal = rawTitle;
            let descVal = rawDesc;
            
            if (lang === 'en') {
              if (rawTitle.includes('Rain Update') || rawTitle.includes('கனமழை')) {
                titleVal = 'Rain Update in Tamil Nadu | Heavy Rain Alert in Chennai and Districts';
                descVal = 'Weather department issues heavy rain warning for next 24 hours in Chennai and surrounding districts.';
              } else if (rawTitle.includes('Gold Rate') || rawTitle.includes('தங்க விலை')) {
                titleVal = 'Gold Rate Drops Sharply | Today\'s Gold Price details in Chennai';
                descVal = 'Good news for gold buyers as sovereign rate decreases significantly today.';
              } else if (rawTitle.includes('Vijay TVK') || rawTitle.includes('விஜய் மாநாடு')) {
                titleVal = 'Vijay TVK First State Conference | Massive crowd gathers in Vikravandi';
                descVal = 'Detailed ground report from the historic debut state conference of actor Vijay\'s TVK.';
              } else if (rawTitle.includes('IPL') || rawTitle.includes('ஐபிஎல்')) {
                titleVal = 'IPL Final Highlights: Thrilling last over finish';
                descVal = 'Catch the complete match analysis and exciting moments of the league finale.';
              } else if (rawTitle.includes('Gaganyaan') || rawTitle.includes('ககன்யான்')) {
                titleVal = 'ISRO Gaganyaan Test Success | Indian Astronaut Space Mission Updates';
                descVal = 'India\'s space agency successfully tests the solid booster system for the upcoming human flight.';
              } else if (rawTitle.includes('Metro') || rawTitle.includes('சென்னை மெட்ரோ')) {
                titleVal = 'Chennai Metro Phase 2 updates | Driverless train tests began';
                descVal = 'Trial runs of driverless trainsets started between Poonamallee and Vadapalani elevated line.';
              }
            }
            
            return {
              ...vid,
              title: titleVal,
              description: descVal
            };
          });
          setVideos(translated);
        }
      })
      .catch(err => console.error("Error loading videos", err));

    // Fetch Live TV video
    fetchApi('/videos/live')
      .then(data => {
        if (data && data.youtubeUrl) {
          let titleVal = data.title;
          let descVal = data.description;
          if (lang === 'en') {
            titleVal = 'KINGS 24x7 Live TV News Stream';
            descVal = 'Watch continuous Tamil and English live news coverage, debates and special updates.';
          }
          const updated = {
            ...data,
            title: titleVal,
            description: descVal
          };
          setLiveVideo(updated);
          setSelectedVideo(updated); // Set Live TV as the initially selected active video
        }
      })
      .catch(err => console.error("Error loading live video", err));
  }, [lang]);

  const getYoutubeId = (url) => {
    if (!url) return '';
    // Handle embed URLs like https://www.youtube.com/embed/coYw5G37n18
    if (url.includes('/embed/')) {
      const parts = url.split('/embed/');
      if (parts[1]) {
        // Remove query parameters if any (like ?channel=...)
        return parts[1].split('?')[0];
      }
    }
    // Handle watch URLs like https://www.youtube.com/watch?v=coYw5G37n18
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Categories mapping matching the Category ID
  const catIdMap = {
    'all': null,
    'politics': 1,
    'business': 2,
    'sports': 3,
    'cinema': 4,
    'tech': 5,
    'regional': 6,
    'international': 7
  };

  const filteredVideos = activeTab === 'all' 
    ? videos 
    : videos.filter(vid => vid.categoryId === catIdMap[activeTab]);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    // Scroll to the main player on mobile
    const playerEl = document.getElementById('main-video-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="videos-page">
      <div className="container">
        {/* Page Header */}
        <div className="videos-header">
          <h1>
            <i className="fas fa-play-circle text-primary"></i> 
            {lang === 'en' ? ' Video Dashboard' : ' வீடியோ தளம்'}
          </h1>
          <p className="subtitle">
            {lang === 'en' 
              ? 'Watch latest news coverage, live television and trending report analysis.' 
              : 'சமீபத்திய செய்திகள், நேரடித் தொலைக்காட்சி மற்றும் ட்ரெண்டிங் அலசல்களைக் காணுங்கள்.'}
          </p>
        </div>

        {/* Main Section: Video Player & Up Next List */}
        <div className="main-video-layout" id="main-video-player">
          {/* Main Video Player Panel */}
          <div className="video-player-container">
            {selectedVideo ? (
              <div className="responsive-iframe-container">
                <iframe
                  src={selectedVideo.youtubeUrl.includes('?') ? `${selectedVideo.youtubeUrl}&autoplay=1` : `${selectedVideo.youtubeUrl}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="no-video-placeholder">
                <i className="fas fa-video-slash"></i>
                <p>{lang === 'en' ? 'Select a video to start watching' : 'பார்க்க ஒரு வீடியோவைத் தேர்ந்தெடுக்கவும்'}</p>
              </div>
            )}
            {selectedVideo && (
              <div className="player-details">
                {selectedVideo.isLiveTv === 1 && (
                  <span className="badge-live"><i className="fas fa-broadcast-tower"></i> LIVE TV</span>
                )}
                <h2>{selectedVideo.title}</h2>
                <div className="player-meta">
                  <span><i className="far fa-eye"></i> {selectedVideo.viewsCount || '15K'} {lang === 'en' ? 'views' : 'பார்வைகள்'}</span>
                  {selectedVideo.publishedAt && (
                    <span><i className="far fa-calendar-alt"></i> {new Date(selectedVideo.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="description">{selectedVideo.description}</p>
              </div>
            )}
          </div>

          {/* Up Next List Side Panel */}
          <div className="side-playlist-container">
            <h3>{lang === 'en' ? 'Up Next' : 'அடுத்ததாக'}</h3>
            <div className="side-playlist">
              {liveVideo && (
                <div 
                  className={`playlist-item ${selectedVideo?.id === liveVideo.id ? 'active' : ''}`}
                  onClick={() => handleSelectVideo(liveVideo)}
                >
                  <div className="item-thumb">
                    <img 
                      src={`https://img.youtube.com/vi/${getYoutubeId(liveVideo.youtubeUrl)}/0.jpg`} 
                      onError={(e) => { e.target.src = liveVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300'; }}
                      alt={liveVideo.title} 
                    />
                    <span className="duration-tag live">LIVE</span>
                  </div>
                  <div className="item-info">
                    <h4>{liveVideo.title}</h4>
                    <span className="live-label"><i className="fas fa-circle"></i> Live Now</span>
                  </div>
                </div>
              )}

              {videos.map((vid) => (
                <div 
                  key={vid.id}
                  className={`playlist-item ${selectedVideo?.id === vid.id ? 'active' : ''}`}
                  onClick={() => handleSelectVideo(vid)}
                >
                  <div className="item-thumb">
                    <img 
                      src={`https://img.youtube.com/vi/${getYoutubeId(vid.youtubeUrl)}/hqdefault.jpg`} 
                      onError={(e) => { e.target.src = vid.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300'; }}
                      alt={vid.title} 
                    />
                    <span className="duration-tag">{vid.duration || '3:15'}</span>
                  </div>
                  <div className="item-info">
                    <h4>{vid.title}</h4>
                    <span>{vid.viewsCount || '10K'} {lang === 'en' ? 'views' : 'பார்வைகள்'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Catalog Grid Section */}
        <div className="video-catalog-section">
          <div className="section-header">
            <h2>{lang === 'en' ? 'Browse Video Categories' : 'வகைகளின்படி வீடியோக்கள்'}</h2>
            
            {/* Category tabs */}
            <div className="catalog-tabs">
              {['all', 'politics', 'business', 'sports', 'cinema', 'tech', 'regional', 'international'].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' && (lang === 'en' ? 'All Videos' : 'அனைத்தும்')}
                  {tab === 'politics' && (lang === 'en' ? 'Politics' : 'அரசியல்')}
                  {tab === 'business' && (lang === 'en' ? 'Business' : 'வணிகம்')}
                  {tab === 'sports' && (lang === 'en' ? 'Sports' : 'விளையாட்டு')}
                  {tab === 'cinema' && (lang === 'en' ? 'Cinema' : 'திரைப்படம்')}
                  {tab === 'tech' && (lang === 'en' ? 'Technology' : 'தொழில்நுட்பம்')}
                  {tab === 'regional' && (lang === 'en' ? 'Regional' : 'மாநிலம்')}
                  {tab === 'international' && (lang === 'en' ? 'International' : 'சர்வதேசம்')}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className="videos-grid-container">
              {filteredVideos.map((vid) => (
                <div 
                  key={vid.id} 
                  className="grid-video-card"
                  onClick={() => handleSelectVideo(vid)}
                >
                  <div className="card-thumb">
                    <img 
                      src={`https://img.youtube.com/vi/${getYoutubeId(vid.youtubeUrl)}/hqdefault.jpg`} 
                      onError={(e) => { e.target.src = vid.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500'; }}
                      alt={vid.title} 
                    />
                    <div className="play-btn-overlay">
                      <i className="fas fa-play"></i>
                    </div>
                    <span className="duration-label">{vid.duration || '3:15'}</span>
                  </div>
                  <div className="card-body">
                    <h3>{vid.title}</h3>
                    <p className="desc-text">{vid.description}</p>
                    <div className="card-meta-info">
                      <span><i className="far fa-eye"></i> {vid.viewsCount || '12K'} {lang === 'en' ? 'views' : 'பார்வைகள்'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-videos-message">
              <i className="fas fa-video-slash"></i>
              <h3>{lang === 'en' ? 'No Videos Found' : 'வீடியோக்கள் எதுவும் இல்லை'}</h3>
              <p>{lang === 'en' ? 'Currently there are no videos in this category.' : 'இந்த பிரிவில் தற்சமயம் வீடியோக்கள் எதுவும் பதிவேற்றப்படவில்லை.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
