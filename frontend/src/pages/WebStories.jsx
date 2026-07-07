import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import './WebStories.css';

const WebStories = () => {
  const { lang, t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedStory, setSelectedStory] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const storiesList = [
    { id: 1, cat: 'sports', badge: 'NEW', titleTa: 'ஐபிஎல் 2025: சிஎஸ்கே புதிய கேப்டன் யார்?', titleEn: 'IPL 2025: Who is the next captain of CSK?', views: '15.4K', gradient: 'linear-gradient(135deg, #FF5722, #FF9800)', detailsTa: 'சென்னை சூப்பர் கிங்ஸ் அணியின் புதிய கேப்டன் பதவிக்கு ருதுராஜ் கெய்க்வாட் அல்லது மாற்று வீரர்கள் தேர்வு குறித்து ஆலோசிக்கப்பட்டு வருகிறது.', detailsEn: 'CSK management is currently discussing the transition of the captaincy to Ruturaj Gaikwad or other senior players.' },
    { id: 2, cat: 'cinema', badge: 'HOT', titleTa: 'விஜய்யின் கடைசி படம்: என்ன எதிர்பார்க்கலாம்?', titleEn: 'Vijay final movie: What can we expect?', views: '28.1K', gradient: 'linear-gradient(135deg, #E91E63, #9C27B0)', detailsTa: 'நடிகர் விஜய்யின் இறுதிப் படமான ஜனநாயகன் அரசியல் த்ரில்லர் பாணியில் பிரம்மாண்டமாக உருவாகிறது.', detailsEn: 'Vijay\'s final movie Jana Nayagan is high on political thriller elements with top action and emotional sequences.' },
    { id: 3, cat: 'politics', badge: 'NEW', titleTa: 'தமிழக கூட்டணி அரசியல் தற்போதைய நிலவரம்', titleEn: 'TN alliance politics current updates', views: '12.9K', gradient: 'linear-gradient(135deg, #2196F3, #00BCD4)', detailsTa: 'தமிழகத்தில் புதிய கூட்டணிகள் மற்றும் தேர்தல் வியூகங்கள் குறித்த அரசியல் பரபரப்பு நிலவி வருகிறது.', detailsEn: 'Political circles in Tamil Nadu are abuzz with talks of new alliances and post-poll alignments.' },
    { id: 4, cat: 'tech', badge: 'HOT', titleTa: 'சாட்ஜிபிடி 5.6 புதிய வசதிகள் என்னென்ன?', titleEn: 'ChatGPT 5.6 what are the new features?', views: '32.5K', gradient: 'linear-gradient(135deg, #4CAF50, #8BC34A)', detailsTa: 'ஓபன்ஏஐ தனது புதிய ஜிபிடி-5.6 மாடலான சால் வெளியீட்டை அறிவித்துள்ளது, இது மனித உணர்வுகளைப் புரிந்துகொள்ளும் திறன் கொண்டது.', detailsEn: 'OpenAI announced GPT-5.6 Sol, featuring advanced emotional intelligence and reasoning capabilities.' },
    { id: 5, cat: 'regional', badge: 'NEW', titleTa: 'சென்னை மெட்ரோ 2-ம் கட்ட வழித்தடம் எப்போது திறப்பு?', titleEn: 'Chennai Metro Phase 2 elevated stretch updates', views: '14.2K', gradient: 'linear-gradient(135deg, #795548, #9E9E9E)', detailsTa: 'பூந்தமல்லி முதல் வடபழனி வரையிலான மெட்ரோ சேவை பாதுகாப்பு சான்றிதழ் பெற்று விரைவில் திறக்கப்பட உள்ளது.', detailsEn: 'Poonamallee to Vadapalani elevated corridor has received CMRS clearance and is awaiting inauguration.' },
    { id: 6, cat: 'business', badge: 'HOT', titleTa: 'தங்கத்தின் விலை சரிவு: காரணங்கள் என்ன?', titleEn: 'Gold rates decrease: What are the reasons?', views: '18.7K', gradient: 'linear-gradient(135deg, #607D8B, #B0BEC5)', detailsTa: 'உலகளாவிய வர்த்தக மாற்றங்கள் காரணமாக தங்கம் மற்றும் வெள்ளியின் விலை சந்தையில் சரிவைச் சந்தித்துள்ளது.', detailsEn: 'Bullion rates fall across major Indian cities following global market changes and economic shifts.' },
    { id: 7, cat: 'international', badge: 'NEW', titleTa: 'இஸ்ரோ ககன்யான் சால்வ் மோட்டார் சோதனை வெற்றி', titleEn: 'ISRO Gaganyaan SOLVE ground test success', views: '22.3K', gradient: 'linear-gradient(135deg, #9C27B0, #E040FB)', detailsTa: 'இஸ்ரோ ஸ்ரீஹரிகோட்டாவில் ககன்யான் மனித விண்கலத் திட்டத்தின் மீட்பு அமைப்புகளுக்கான சாலிட் மோட்டார் சோதனையை வெற்றிகரமாக முடித்துள்ளது.', detailsEn: 'ISRO has successfully tested the solid motor test platform SOLVE for the Gaganyaan deceleration module.' },
    { id: 8, cat: 'sports', badge: 'HOT', titleTa: 'ஜிம்பாப்வே தொடருக்கான இந்திய டி20 அணி விவரம்', titleEn: 'India T20 Squad updates for Zimbabwe tour', views: '21.5K', gradient: 'linear-gradient(135deg, #FF9800, #FFC107)', detailsTa: 'ஜிம்பாப்வே டி20 தொடருக்கு ஸ்ரேயாஸ் ஐயர் தலைமையில் இளம் வீரர்கள் கொண்ட புதிய இந்திய அணி களமிறங்குகிறது.', detailsEn: 'Shreyas Iyer leads a refreshed, younger T20I squad to Zimbabwe featuring several main call-ups.' },
    { id: 9, cat: 'cinema', badge: 'NEW', titleTa: 'விடுதலை 2-ம் பாகம் வெளியீட்டுத் தகவல்கள்', titleEn: 'Viduthalai Part 2 theatrical release updates', views: '24.9K', gradient: 'linear-gradient(135deg, #E91E63, #FF4081)', detailsTa: 'வெற்றிமாறன் இயக்கத்தில் சூரி, விஜய் சேதுபதி நடிப்பில் உருவாகும் விடுதலை 2 படம் விரைவில் வெளியாக உள்ளது.', detailsEn: 'Director Vetrimaaran\'s Viduthalai Part 2 starring Soori and Vijay Sethupathi is set for a grand release.' },
    { id: 10, cat: 'business', badge: 'NEW', titleTa: 'இந்தியா-இங்கிலாந்து வர்த்தக ஒப்பந்தம் ஜூலை 15 முதல் அமல்', titleEn: 'India-UK CETA trade pact starting July 15', views: '11.8K', gradient: 'linear-gradient(135deg, #009688, #4DB6AC)', detailsTa: 'இந்தியா மற்றும் இங்கிலாந்து இடையேயான Comprehensive Economic & Trade ஒப்பந்தம் ஜூலை 15 முதல் அமலாகிறது.', detailsEn: 'The historic bilateral trade agreement between India and the United Kingdom is set to take effect on July 15, 2026.' },
    { id: 11, cat: 'politics', badge: 'HOT', titleTa: 'வாக்கு எண்ணிக்கை நேரடி நிலவரம்', titleEn: 'Assembly election counting live updates', views: '38.4K', gradient: 'linear-gradient(135deg, #3F51B5, #2196F3)', detailsTa: 'சட்டமன்றத் தேர்தல் வாக்கு எண்ணிக்கை முடிவுகள் மற்றும் கட்சி வாரியான முன்னிலை விவரங்கள்.', detailsEn: 'Live coverage and party-wise leads of the state legislative assembly election results.' },
    { id: 12, cat: 'tech', badge: 'NEW', titleTa: 'ஆப்பிள் ஐபோன் 17 புதிய மெலிதான வடிவமைப்பு கசிவு', titleEn: 'Apple iPhone 17 series slim redesign leaks', views: '29.7K', gradient: 'linear-gradient(135deg, #673AB7, #9575CD)', detailsTa: 'ஆப்பிள் நிறுவனம் தனது அடுத்த அறிமுகமான ஐபோன் 17 தொடரில் மிக மெலிதான வடிவமைப்பு கொண்ட மாடலை வெளியிட உள்ளதாக தகவல்கள் கசிந்துள்ளன.', detailsEn: 'Leaked blueprints hint at a completely redesigned ultra-slim profile for Apple\'s upcoming iPhone 17 family.' }
  ];

  const getCategoryDetails = (catSlug) => {
    const categories = {
      politics: { en: 'Politics', ta: 'அரசியல்', color: '#1E3A8A' },
      business: { en: 'Business', ta: 'வணிகம்', color: '#065F46' },
      sports: { en: 'Sports', ta: 'விளையாட்டு', color: '#C2410C' },
      cinema: { en: 'Cinema', ta: 'திரைப்படம்', color: '#BE185D' },
      tech: { en: 'Technology', ta: 'தொழில்நுட்பம்', color: '#6D28D9' },
      regional: { en: 'Regional', ta: 'மாநிலம்', color: '#4B5563' },
      international: { en: 'International', ta: 'சர்வதேசம்', color: '#0D9488' }
    };
    return categories[catSlug] || { en: catSlug, ta: catSlug, color: '#3B82F6' };
  };

  const filteredStories = activeTab === 'all'
    ? storiesList
    : storiesList.filter(story => story.cat === activeTab);

  // Handle open viewer
  const handleOpenViewer = (story, listIndex) => {
    setSelectedStory(story);
    setActiveStoryIndex(listIndex);
    setProgress(0);
  };

  // Handle close viewer
  const handleCloseViewer = () => {
    setSelectedStory(null);
    setProgress(0);
  };

  // Navigate viewer
  const handleNextStory = () => {
    if (activeStoryIndex < filteredStories.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextIdx);
      setSelectedStory(filteredStories[nextIdx]);
      setProgress(0);
    } else {
      handleCloseViewer();
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
      setSelectedStory(filteredStories[prevIdx]);
      setProgress(0);
    }
  };

  // Autoplay / Progress bar timer
  useEffect(() => {
    if (!selectedStory) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 2; // Increments to hit 100% in 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedStory, activeStoryIndex, filteredStories]);

  return (
    <div className="web-stories-page">
      <div className="container">
        {/* Page Header */}
        <div className="stories-header">
          <div className="breadcrumbs">
            <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
            <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
            <span>{lang === 'en' ? 'Web Stories' : 'வெப் ஸ்டோரிஸ்'}</span>
          </div>

          <h1>
            <i className="fas fa-bolt text-primary-gold"></i>
            {lang === 'en' ? ' Web Stories' : ' வெப் ஸ்டோரிஸ்'}
          </h1>
          <p className="subtitle">
            {lang === 'en'
              ? 'Swipe through short, visual news snapshots and quick updates.'
              : 'குறுகிய, காட்சிப் செய்திப் பதிவுகள் மற்றும் விரைவான தகவல்களை உடனுக்குடன் பாருங்கள்.'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="stories-tabs-container">
          <div className="stories-tabs">
            {['all', 'politics', 'business', 'sports', 'cinema', 'tech', 'regional', 'international'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' && (lang === 'en' ? 'All Stories' : 'அனைத்தும்')}
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

        {/* Stories Grid */}
        {filteredStories.length > 0 ? (
          <div className="stories-grid">
            {filteredStories.map((story, index) => {
              const catDetails = getCategoryDetails(story.cat);
              return (
                <div
                  key={story.id}
                  className="story-card-item"
                  style={{ background: story.gradient }}
                  onClick={() => handleOpenViewer(story, index)}
                >
                  <span className="badge-tag" style={{ background: story.badge === 'NEW' ? '#EF4444' : '#F97316' }}>
                    {story.badge}
                  </span>
                  <div className="story-card-overlay">
                    <span className="story-cat-badge" style={{ background: catDetails.color }}>
                      {lang === 'en' ? catDetails.en : catDetails.ta}
                    </span>
                    <h3>{lang === 'en' ? story.titleEn : story.titleTa}</h3>
                    <span className="story-views-badge"><i className="far fa-eye"></i> {story.views}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-stories">
            <i className="far fa-sticky-note fa-3x"></i>
            <p>{lang === 'en' ? 'No web stories found in this category.' : 'இவ்வகையில் வெப் ஸ்டோரிஸ் ஏதும் இல்லை.'}</p>
          </div>
        )}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {selectedStory && (
        <div className="story-viewer-modal">
          <div className="story-viewer-backdrop" onClick={handleCloseViewer}></div>
          
          {/* Main Story Card container */}
          <div className="story-viewer-card" style={{ background: selectedStory.gradient }}>
            {/* Top Progress bar and Header controls */}
            <div className="story-viewer-header">
              <div className="progress-bars-container">
                {filteredStories.map((s, idx) => {
                  let widthPercent = 0;
                  if (idx < activeStoryIndex) widthPercent = 100;
                  else if (idx === activeStoryIndex) widthPercent = progress;
                  return (
                    <div className="progress-bar-bg" key={s.id}>
                      <div className="progress-bar-fill" style={{ width: `${widthPercent}%` }}></div>
                    </div>
                  );
                })}
              </div>

              <div className="header-meta">
                <span className="category-pill" style={{ background: getCategoryDetails(selectedStory.cat).color }}>
                  {lang === 'en' ? getCategoryDetails(selectedStory.cat).en : getCategoryDetails(selectedStory.cat).ta}
                </span>
                <span className="views-pill"><i className="far fa-eye"></i> {selectedStory.views}</span>
                <button className="close-viewer-btn" onClick={handleCloseViewer} aria-label="Close stories">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Tap areas for next/prev navigation */}
            <div className="story-tap-areas">
              <div className="tap-left" onClick={handlePrevStory}></div>
              <div className="tap-right" onClick={handleNextStory}></div>
            </div>

            {/* Story Text Content */}
            <div className="story-viewer-content">
              <h2>{lang === 'en' ? selectedStory.titleEn : selectedStory.titleTa}</h2>
              <p>{lang === 'en' ? selectedStory.detailsEn : selectedStory.detailsTa}</p>
            </div>

            {/* Bottom Navigation Indicators */}
            <div className="story-viewer-footer">
              <button 
                className="nav-btn prev" 
                onClick={handlePrevStory} 
                disabled={activeStoryIndex === 0}
                style={{ opacity: activeStoryIndex === 0 ? 0.3 : 1 }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="slide-indicator">
                {activeStoryIndex + 1} / {filteredStories.length}
              </span>
              <button className="nav-btn next" onClick={handleNextStory}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebStories;
