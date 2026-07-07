import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const BusinessStudies = () => {
  const { lang, t } = useContext(LanguageContext);
  const [stories, setStories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const fallbackStories = lang === 'en' ? [
    {
      id: 'demo-1',
      author_name: 'K. Selvakumar',
      business_name: 'Tiruppur Tea Stall',
      title: 'Digital Revolution of a Local Tea Stall: Tiruppur Case Study',
      details: 'A detailed case study on how Mariyappan from Tiruppur revolutionized his traditional tea stall business using UPI payments, WhatsApp orders, and Google Maps listing.',
      category: 'Case Study',
      icon: '☕',
      readTime: '5 Min Read',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      id: 'demo-2',
      author_name: 'R. Kalaivani',
      business_name: 'SHG Eco Friendly Venture',
      title: 'Eco-Friendly Areca Plate Manufacturing Unit by Self-Help Group',
      details: 'A business success model detailing how 10 women from Madurai joined hands to manufacture areca leaf plates and scaled up to export to the international market.',
      category: 'Success Story',
      icon: '🌿',
      readTime: '6 Min Read',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    },
    {
      id: 'demo-3',
      author_name: 'A. Rajesh',
      business_name: 'Amman Dairy Farm',
      title: 'Integrated Dairy Automation in Rural Erode',
      details: 'How Rajesh, a dairy farmer from Erode, implemented digital monitoring technology from milking to final delivery, significantly increasing overall yield and revenue.',
      category: 'Business Model',
      icon: '🥛',
      readTime: '4 Min Read',
      gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
    }
  ] : [
    {
      id: 'demo-1',
      author_name: 'கே. செல்வக்குமார்',
      business_name: 'திருப்பூர் டீ ஸ்டால்',
      title: 'ஒரு தேநீர் கடையின் டிஜிட்டல் புரட்சி: திருப்பூர் கேஸ் ஸ்டடி',
      details: 'திருப்பூரைச் சேர்ந்த மாரியப்பன் தனது பாரம்பரிய தேநீர் கடையை எவ்வாறு UPI பேமெண்ட், வாட்ஸ்அப் ஆர்டர் மற்றும் கூகுள் மேப் மூலம் புதிய உச்சத்திற்குக் கொண்டு சென்றார் என்ற விரிவான ஆய்வு.',
      category: 'கேஸ் ஸ்டடி',
      icon: '☕',
      readTime: '5 நிமிட வாசிப்பு',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      id: 'demo-2',
      author_name: 'ஆர். கலைவாணி',
      business_name: 'சுயஉதவிக் குழு சுற்றுச்சூழல் நிறுவனம்',
      title: 'சுயஉதவிக் குழுவின் சுற்றுச்சூழல் தட்டு தயாரிப்பு நிறுவனம்',
      details: 'மதுரையைச் சேர்ந்த 10 பெண்கள் இணைந்து பாக்கு மட்டை தட்டுகளை உற்பத்தி செய்து சர்வதேச சந்தைக்கு எவ்வாறு ஏற்றுமதி செய்தனர் என்ற வெற்றிகரமான வணிக உத்தி.',
      category: 'வெற்றிக் கதை',
      icon: '🌿',
      readTime: '6 நிமிட வாசிப்பு',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    },
    {
      id: 'demo-3',
      author_name: 'ஏ. ராஜேஷ்',
      business_name: 'அம்மன் பால் பண்ணை',
      title: 'கிராமப்புற பால் பண்ணையின் ஒருங்கிணைந்த ஆட்டோமேஷன்',
      details: 'ஈரோடு பால் பண்ணையாளர் ரமேஷ், நவீன தொழில்நுட்பத்தைப் பயன்படுத்தி கறவை முதல் விற்பனை வரை எவ்வாறு டிஜிட்டல் கண்காணிப்பு முறையைக் கொண்டுவந்து வருவாயைப் பெருக்கினார்.',
      category: 'வணிக மாதிரி',
      icon: '🥛',
      readTime: '4 நிமிட வாசிப்பு',
      gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
    }
  ];

  const loadData = () => {
    fetchApi('/stories')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map((item, index) => {
          const fallback = fallbackStories[index % fallbackStories.length];
          const rawAuthor = item.authorName || item.author_name || '';
          const rawBiz = item.businessName || item.business_name || '';
          const rawTitle = item.title || '';
          const rawDetails = item.details || '';
          
          let authorVal = rawAuthor;
          let bizVal = rawBiz;
          let titleVal = rawTitle;
          let detailsVal = rawDetails;
          
          if (lang === 'en') {
            if (rawAuthor.includes('செல்வக்குமார்')) authorVal = 'K. Selvakumar';
            else if (rawAuthor.includes('கலைவாணி')) authorVal = 'R. Kalaivani';
            else if (rawAuthor.includes('ராஜேஷ்')) authorVal = 'A. Rajesh';
            else if (rawAuthor.includes('கிருஷ்ணன்') || rawAuthor.includes('राधा')) authorVal = 'Radha Krishnan';
            else if (rawAuthor.includes('முருகன்') || rawTitle.includes('Traditional Brand')) authorVal = 'Murugan';
            
            if (rawBiz.includes('திருப்பூர்')) bizVal = 'Tiruppur Tea Stall';
            else if (rawBiz.includes('சுயஉதவிக்')) bizVal = 'SHG Eco Friendly Venture';
            else if (rawBiz.includes('பால் பண்ணை')) bizVal = 'Amman Dairy Farm';
            else if (rawBiz.includes('முருகன்') || rawBiz.includes('காபி')) bizVal = 'Murugan Coffee Works';
            else if (rawBiz.includes('ஆர்கானிக்') || rawBiz.includes('ஃபார்ம்ஸ்') || rawTitle.includes('Agro-Entrepreneur')) bizVal = 'Radha Organic Farms';
            
            if (rawTitle.includes('தேநீர்')) titleVal = 'Digital Revolution of a Local Tea Stall: Tiruppur Case Study';
            else if (rawTitle.includes('சுயஉதவிக்')) titleVal = 'Eco-Friendly Areca Plate Manufacturing Unit by Self-Help Group';
            else if (rawTitle.includes('பால் பண்ணை')) titleVal = 'Integrated Dairy Automation in Rural Erode';
            else if (rawTitle.includes('காபி') || rawTitle.includes('கடை')) titleVal = 'Legacy Coffee Brand Digitalization Journey';
            else if (rawTitle.includes('வகைப்பாடு')) titleVal = 'Case Study: Local Classifieds Advertising Return on Investment';
            else if (rawTitle.includes('Agro-Entrepreneur')) titleVal = 'From Software Engineer to Successful Agro-Entrepreneur';
            
            if (rawDetails.includes('மாரியப்பன்')) detailsVal = 'A detailed case study on how Mariyappan from Tiruppur revolutionized his traditional tea stall business using digital payments.';
            else if (rawDetails.includes('பாக்கு மட்டை')) detailsVal = 'A business success model detailing how 10 women from Madurai manufactured and exported eco-friendly areca leaf plates.';
            else if (rawDetails.includes('ரமேஷ்')) detailsVal = 'How Rajesh, a dairy farmer from Erode, implemented digital dairy monitoring technology to increase revenue.';
            else if (rawDetails.includes('காபி')) detailsVal = 'How Murugan Coffee Works adopted digital supply chain tracking to scale operations globally.';
            else if (rawDetails.includes('கிருஷ்ணன்') || rawDetails.includes('Agro-Entrepreneur') || rawTitle.includes('Agro-Entrepreneur')) detailsVal = 'Radha Krishnan describes how he set up integrated organic dairy and drip irrigation vegetable farms near Coimbatore.';
          }
          
          return {
            id: item.id || item.story_id,
            author_name: authorVal || (lang === 'en' ? 'User' : 'பயனர்'),
            business_name: bizVal || (lang === 'en' ? 'Business' : 'வணிகம்'),
            title: titleVal,
            details: detailsVal,
            category: item.isCaseStudy ? (lang === 'en' ? 'Case Study' : 'கேஸ் ஸ்டடி') : (lang === 'en' ? 'Success Story' : 'வெற்றிக் கதை'),
            icon: item.isCaseStudy ? '📈' : '🌿',
            readTime: lang === 'en' ? '5 Min Read' : '5 நிமிட வாசிப்பு',
            gradient: fallback.gradient
          };
        }) : [];
        setStories([...formatted, ...fallbackStories]);
      })
      .catch((err) => {
        console.warn("Could not fetch stories from API, using fallback", err);
        setStories(fallbackStories);
      });
  };

  useEffect(() => {
    loadData();
  }, [lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/stories', {
      method: 'POST',
      body: JSON.stringify({
        authorName, businessName, title, details, isCaseStudy: false
      })
    })
    .then(() => {
      setAuthorName('');
      setBusinessName('');
      setTitle('');
      setDetails('');
      setShowForm(false);
      loadData();
    })
    .catch(err => {
      console.warn("API write failed, updating UI locally", err);
      const newStory = {
        id: Date.now(),
        author_name: authorName,
        business_name: businessName,
        title,
        details,
        category: 'வெற்றிக் கதை',
        icon: '🌿',
        readTime: '3 நிமிட வாசிப்பு',
        gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
      };
      setStories(prev => [newStory, ...prev]);
      setAuthorName('');
      setBusinessName('');
      setTitle('');
      setDetails('');
      setShowForm(false);
    });
  };

  const handleOpenViewer = (story) => {
    setSelectedStory(story);
    setShowViewer(true);
  };

  return (
    <main className="container">
      {/* HERO / SEARCH */}
      <section className="studies-hero">
        <h1>{lang === 'en' ? 'Business Case Studies & Success Stories' : 'வணிக வழக்கு ஆய்வுகள் & வெற்றிக் கதைகள்'}</h1>
        <p>{lang === 'en' ? 'Strategies of local entrepreneurs who succeeded in small towns' : 'சிறு நகரங்களில் தொழில் தொடங்கி வெற்றி கண்ட உள்ளூர் தொழில்முனைவோரின் உத்திகள்'}</p>
      </section>

      {/* GRID */}
      <section className="studies-grid">
        {stories.map(st => (
          <div className="study-card" key={st.id} onClick={() => handleOpenViewer(st)}>
            <div className="study-banner-img" style={{ background: st.gradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
              <span className="badge">{st.category}</span>
              <span>{st.icon}</span>
            </div>
            <div className="study-body">
              <h2 className="study-title">{st.title}</h2>
              <p className="study-excerpt">{st.details}</p>
              <div className="study-meta">
                <span><i className="far fa-user"></i> {st.author_name} ({st.business_name})</span>
                <span><i className="far fa-clock"></i> {st.readTime}</span>
              </div>
            </div>
            <button className="read-more-btn" onClick={(e) => { e.stopPropagation(); handleOpenViewer(st); }}>
              {lang === 'en' ? 'Read Full Story' : 'முழுமையாகப் படிக்க'}
            </button>
          </div>
        ))}
      </section>

      {/* BANNER TO SUBMIT STORY */}
      <section className="submit-story-banner" style={{ textAlign: 'center', margin: '40px 0', padding: '24px', border: '2px dashed var(--primary)', borderRadius: 'var(--radius-md)' }}>
        <h3>
          {lang === 'en' ? 'Are you a local entrepreneur? Tell your story!' : 'நீங்கள் ஒரு சிறு நகரத் தொழில்முனைவோரா? உங்கள் கதையை உலகுக்குச் சொல்லுங்கள்!'}
        </h3>
        <p>
          {lang === 'en' ? 'Share your business strategies to help others grow.' : 'உங்களது வணிக உத்திகள் மற்றவர்களுக்கும் பயன்பட உங்கள் வெற்றிக் கதையைப் பதியுங்கள்.'}
        </p>
        <button 
          onClick={() => setShowForm(true)} 
          style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', marginTop: '14px' }}
        >
          {lang === 'en' ? 'Submit Success Story' : 'வெற்றிக் கதையை சமர்ப்பிக்க'}
        </button>
      </section>

      {/* STORY VIEWER MODAL */}
      {showViewer && selectedStory && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Business Story' : 'வணிகக் கதை'}</h3>
              <button className="modal-close" onClick={() => setShowViewer(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <h2 className="story-viewer-title" style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>{selectedStory.title}</h2>
              <div className="story-viewer-meta" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '16px' }}>
                <span><i className="far fa-user"></i> {selectedStory.author_name} ({selectedStory.business_name})</span>
                <span><i className="far fa-clock"></i> {selectedStory.readTime}</span>
              </div>
              <div className="story-viewer-content" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--text-dark)' }}>
                {selectedStory.details.split('\n').map((para, i) => (
                  <p key={i} style={{ marginBottom: '16px' }}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT STORY MODAL */}
      {showForm && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Share Your Success Story' : 'உங்கள் வெற்றிக் கதையைப் பகிரவும்'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="storyName">{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="storyName" 
                    required 
                    placeholder={lang === 'en' ? 'e.g., Mariyappan' : 'எ.கா: மாரியப்பன்'}
                    value={authorName} 
                    onChange={e => setAuthorName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storyBizName">{lang === 'en' ? 'Business Name *' : 'வணிகப் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="storyBizName" 
                    required 
                    placeholder={lang === 'en' ? 'e.g., Mariyappan Tea Stall' : 'எ.கா: மாரியப்பன் டீ ஸ்டால்'}
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storyTitleInput">{lang === 'en' ? 'Story Title *' : 'கதையின் தலைப்பு *'}</label>
                  <input 
                    type="text" 
                    id="storyTitleInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g., Digital Growth of Tea Shop' : 'எ.கா: தேநீர் கடையின் டிஜிட்டல் வளர்ச்சி'}
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="storyDetails">{lang === 'en' ? 'Your Business Success & Strategies (Detailed) *' : 'உங்கள் வணிக வெற்றி மற்றும் உத்திகள் (விரிவாக) *'}</label>
                  <textarea 
                    id="storyDetails" 
                    rows="6" 
                    required 
                    placeholder={lang === 'en' ? 'Your start, challenges faced and solutions...' : 'உங்கள் தொடக்கம், எதிர்கொண்ட சவால்கள் மற்றும் தீர்வுகள்...'}
                    value={details} 
                    onChange={e => setDetails(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
                  {lang === 'en' ? 'Submit' : 'சமர்ப்பி'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BusinessStudies;
