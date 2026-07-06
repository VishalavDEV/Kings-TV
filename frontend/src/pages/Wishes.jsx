import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Wishes = () => {
  const { lang, t } = useContext(LanguageContext);
  const [wishes, setWishes] = useState([]);
  const [filteredWishes, setFilteredWishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [category, setCategory] = useState('birthday');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');

  const fallbackWishes = [
    { id: 'demo-1', recipientName: 'செல்வன். தருண் குமார்', category: 'birthday', message: 'நமது அண்ணா நகரைச் சேர்ந்த செல்வன். தருண் குமார் தனது 10-வது பிறந்தநாளை இன்று கொண்டாடுகிறார். அவர் எல்லா வளமும் பெற்று நீண்ட ஆயுளுடன் வாழ வாழ்த்துகிறோம்!', senderName: 'பெற்றோர் மற்றும் உறவினர்கள்', emoji: '🎂' },
    { id: 'demo-2', recipientName: 'திரு & திருமதி. விவேகானந்தன்', category: 'wedding', message: 'தங்களது 25-வது வெள்ளி விழா திருமண நாளை இன்று கொண்டாடும் தாரமங்கலம் விவேகானந்தன்-கலா தம்பதியினர் மென்மேலும் இன்புற்று வாழ வாழ்த்துகிறோம்!', senderName: 'அன்பு மகன்கள் மற்றும் குடும்பத்தினர்', emoji: '💑' },
    { id: 'demo-3', recipientName: 'செல்வி. கார்த்திகா தேவி', category: 'achievement', message: 'பத்தாம் வகுப்பு பொதுத்தேர்வில் 492 மதிப்பெண்கள் பெற்று பள்ளியில் முதலிடம் பெற்ற நமது ஊரைச் சேர்ந்த மாணவி கார்த்திகா தேவிக்கு மனமார்ந்த வாழ்த்துகள்!', senderName: 'நமது ஊர் மக்கள் மற்றும் ஆசிரியர்கள்', emoji: '🏆' }
  ];

  const loadData = () => {
    fetchApi('/wishes')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => ({
          id: item.wish_id || item.id,
          recipientName: item.recipientName || item.recipient_name,
          category: (item.category || '').toLowerCase(),
          message: item.message,
          senderName: item.senderName || item.sender_name,
          emoji: item.category === 'birthday' ? '🎂' : item.category === 'wedding' ? '💑' : '🏆'
        })) : [];
        const merged = [...formatted, ...fallbackWishes];
        setWishes(merged);
        setFilteredWishes(merged);
      })
      .catch((err) => {
        console.warn("Could not fetch wishes from API, using fallback", err);
        setWishes(fallbackWishes);
        setFilteredWishes(fallbackWishes);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = wishes;

    if (selectedCat !== 'all') {
      result = result.filter(item => item.category === selectedCat);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.recipientName.toLowerCase().includes(query) || 
        item.message.toLowerCase().includes(query) ||
        item.senderName.toLowerCase().includes(query)
      );
    }

    setFilteredWishes(result);
  }, [selectedCat, searchQuery, wishes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/wishes', {
      method: 'POST',
      body: JSON.stringify({
        recipientName,
        category: category.toLowerCase(),
        message,
        senderName
      })
    })
    .then(() => {
      setRecipientName('');
      setMessage('');
      setSenderName('');
      setShowModal(false);
      loadData();
    })
    .catch(err => {
      console.warn("API wish save failed, updating locally", err);
      const newWish = {
        id: Date.now(),
        recipientName,
        category,
        message,
        senderName,
        emoji: category === 'birthday' ? '🎂' : category === 'wedding' ? '💑' : '🏆'
      };
      setWishes(prev => [newWish, ...prev]);
      setRecipientName('');
      setMessage('');
      setSenderName('');
      setShowModal(false);
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      birthday: lang === 'en' ? 'Birthday' : 'பிறந்தநாள்',
      wedding: lang === 'en' ? 'Wedding' : 'திருமண நாள்',
      achievement: lang === 'en' ? 'Achievement' : 'சாதனை'
    };
    return labels[cat] || cat;
  };

  const getGradient = (cat) => {
    const grads = {
      birthday: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      wedding: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
      achievement: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
    };
    return grads[cat] || 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)';
  };

  return (
    <main className="container">
      {/* HERO / SEARCH */}
      <section className="wishes-hero">
        <h1>{lang === 'en' ? 'Wishes & Celebrations' : 'வாழ்த்துகள் & கொண்டாட்டங்கள்'}</h1>
        <p>{lang === 'en' ? 'Birthdays, wedding anniversaries, and achievements of local citizens' : 'உள்ளூர் மக்களின் பிறந்தநாள், திருமண நாள், கல்விச் சாதனை மற்றும் விளையாட்டு வெற்றிகளுக்கான வாழ்த்துகள்'}</p>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Search by name or message...' : 'பெயர் அல்லது செய்தியைத் தேடுக...'} 
            aria-label="Search Wishes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>{lang === 'en' ? 'Search' : 'தேடுக'}</button>
        </div>
      </section>

      {/* FILTERS */}
      <div className="category-filter-row">
        <button 
          className={`filter-pill ${selectedCat === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          {lang === 'en' ? 'All Wishes' : 'அனைத்தும்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'birthday' ? 'active' : ''}`}
          onClick={() => setSelectedCat('birthday')}
        >
          {lang === 'en' ? 'Birthdays' : 'பிறந்தநாள்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'wedding' ? 'active' : ''}`}
          onClick={() => setSelectedCat('wedding')}
        >
          {lang === 'en' ? 'Weddings' : 'திருமண நாள்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'achievement' ? 'active' : ''}`}
          onClick={() => setSelectedCat('achievement')}
        >
          {lang === 'en' ? 'Achievements' : 'சாதனைகள்'}
        </button>
      </div>

      {/* WISHES GRID */}
      <section className="wishes-grid">
        {filteredWishes.map(wish => (
          <div className="wish-card" key={wish.id}>
            <div className="card-banner" style={{ background: getGradient(wish.category) }}>
              <span className="badge">{getCategoryLabel(wish.category)}</span>
              <span className="emoji">{wish.emoji}</span>
              <h3>{wish.recipientName}</h3>
            </div>
            <div className="wish-body">
              <p className="wish-message">{wish.message}</p>
              <span className="wish-from">✍️ {lang === 'en' ? 'From: ' : 'வாழ்த்துபவர்கள்: '} {wish.senderName}</span>
            </div>
            <button 
              className="wish-action-btn"
              onClick={() => alert(lang === 'en' ? 'Thank you for your warm wish!' : 'உங்கள் வாழ்த்துக்கு நன்றி!')}
            >
              <i className="fas fa-heart"></i> {lang === 'en' ? 'Send Love' : 'வாழ்த்துக்களைத் தெரிவி'}
            </button>
          </div>
        ))}
      </section>

      {/* BANNER TO POST WISH */}
      <section className="post-wish-banner">
        <h3>
          {lang === 'en' ? 'Want to share your family birthdays or wedding dates?' : 'உங்கள் குடும்பத்தினரின் பிறந்தநாள் அல்லது திருமண நாட்களைப் பகிர விரும்புகிறீர்களா?'}
        </h3>
        <p>
          {lang === 'en' 
            ? 'Publish a free greeting card so that everyone in town can join in and wish.' 
            : 'நமது ஊர் மக்கள் அனைவரும் இணைந்து வாழ்த்துக்களைத் தெரிவிக்க இலவசமாகப் பதியுங்கள்.'}
        </p>
        <button onClick={() => setShowModal(true)}>
          {lang === 'en' ? 'Send Greeting Card' : 'வாழ்த்து அட்டை அனுப்ப'}
        </button>
      </section>

      {/* POST WISH MODAL */}
      {showModal && (
        <div className="modal open" id="postWishModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Publish Greeting Card' : 'வாழ்த்து அட்டை பதியவும்'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="postWishForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="wishNameInput">{lang === 'en' ? 'Recipient Name *' : 'வாழ்த்தப் பெறுபவர் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="wishNameInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Suresh Kumar' : 'எ.கா: சுரேஷ் குமார்'}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="wishCatInput">{lang === 'en' ? 'Wish Category *' : 'வாழ்த்து வகை *'}</label>
                  <select 
                    id="wishCatInput" 
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  >
                    <option value="birthday">{lang === 'en' ? 'Birthday Wish' : 'பிறந்தநாள் வாழ்த்து'}</option>
                    <option value="wedding">{lang === 'en' ? 'Wedding Wish' : 'திருமண வாழ்த்து'}</option>
                    <option value="achievement">{lang === 'en' ? 'Achievement / Congratulations' : 'சாதனைகள்'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="wishMsgInput">{lang === 'en' ? 'Greeting Message *' : 'வாழ்த்துச் செய்தி *'}</label>
                  <textarea 
                    id="wishMsgInput" 
                    rows="3" 
                    required 
                    placeholder={lang === 'en' ? 'Write your warm message here...' : 'அன்பான வாழ்த்து வரிகளைப் பதியவும்...'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="wishFromInput">{lang === 'en' ? 'Sender Name(s) *' : 'வாழ்த்துபவர் பெயர்(கள்) *'}</label>
                  <input 
                    type="text" 
                    id="wishFromInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Friends Circle' : 'எ.கா: நண்பர்கள் குழு'}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <button type="submit" className="submit-btn">{lang === 'en' ? 'Publish Wish' : 'வாழ்த்து அட்டையை வெளியிடு'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Wishes;
