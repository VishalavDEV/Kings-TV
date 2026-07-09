import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Obituaries = () => {
  const { lang, t } = useContext(LanguageContext);
  const [obits, setObits] = useState([]);
  const [filteredObits, setFilteredObits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tributes, setTributes] = useState({});

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [demiseDate, setDemiseDate] = useState('');
  const [funeral, setFuneral] = useState('');
  const [desc, setDesc] = useState('');

  const fallbackObits = lang === 'en' ? [
    { id: 'demo-1', deceasedName: 'Kanthasamy', age: 74, location: 'Trichy', demiseDate: '30-06-2026', funeralDetails: '02-07-2026, 4:00 PM', shortDescription: 'Former Cooperative Bank Manager. He actively participated in various social works in the locality.', tributeCount: 118, gender: 'male' },
    { id: 'demo-2', deceasedName: 'Saraswathi', age: 70, location: 'Madurai', demiseDate: '29-06-2026', funeralDetails: '01-07-2026, 10:00 AM', shortDescription: 'Beloved homemaker. Her demise is an irreparable loss to her family and relatives.', tributeCount: 84, gender: 'female' },
    { id: 'demo-3', deceasedName: 'Chidambaram', age: 80, location: 'Tanjore', demiseDate: '28-06-2026', funeralDetails: '30-06-2026 (Completed)', shortDescription: 'Retired government official. A hard worker and an honest human being.', tributeCount: 230, gender: 'male' }
  ] : [
    { id: 'demo-1', deceasedName: 'கந்தசாமி', age: 74, location: 'திருச்சி', demiseDate: '30-06-2026', funeralDetails: '02-07-2026, மாலை 4:00 மணி', shortDescription: 'முன்னாள் கூட்டுறவு வங்கி மேலாளர். அன்னார் அப்பகுதியில் பல்வேறு சமூகப் பணிகளில் தன்னை ஈடுபடுத்திக் கொண்டவர்.', tributeCount: 118, gender: 'male' },
    { id: 'demo-2', deceasedName: 'சரஸ்வதி', age: 70, location: 'மதுரை', demiseDate: '29-06-2026', funeralDetails: '01-07-2026, காலை 10:00 மணி', shortDescription: 'அன்பான குடும்பத்தலைவி. அன்னார் குடும்பத்தாருக்கும் உறவினர்களுக்கும் ஈடுசெய்ய முடியாத பேரிழப்பு.', tributeCount: 84, gender: 'female' },
    { id: 'demo-3', deceasedName: 'சிதம்பரம்', age: 80, location: 'தஞ்சாவூர்', demiseDate: '28-06-2026', funeralDetails: '30-06-2026 (முடிந்தது)', shortDescription: 'ஓய்வு பெற்ற அரசு அதிகாரி. சிறந்த உழைப்பாளி மற்றும் நேர்மையான மனிதர்.', tributeCount: 230, gender: 'male' }
  ];

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
      return new Date(dateStr);
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts[2].length === 4) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(dateStr);
    }
    return new Date(dateStr);
  };

  const isWithinOneWeek = (demiseDateStr) => {
    const demiseDate = parseDate(demiseDateStr);
    if (!demiseDate || isNaN(demiseDate.getTime())) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(demiseDate);
    compareDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - compareDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const loadData = () => {
    fetchApi('/obituaries')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => {
          const rawName = item.deceasedName || item.deceased_name || '';
          const rawLocation = item.location || '';
          const rawFuneral = item.funeralDetails || item.funeral_details || '';
          const rawDesc = item.shortDescription || item.short_description || '';
          
          let nameVal = rawName;
          let locationVal = rawLocation;
          let funeralVal = rawFuneral;
          let descVal = rawDesc;
          
          if (lang === 'en') {
            if (rawName.includes('சரஸ்வதி')) nameVal = 'Saraswathi';
            else if (rawName.includes('மீனாம்பாள்')) nameVal = 'Meenambal';
            else if (rawName.includes('ராமநாதன்')) nameVal = 'Ramanathan Chettiar';
            else if (rawName.includes('தர்மலிங்கம்')) nameVal = 'Dharmalingam';
            else if (rawName.includes('கந்தசாமி')) nameVal = 'Kanthasamy';
            else if (rawName.includes('சிதம்பரம்')) nameVal = 'Chidambaram';

            if (rawLocation.includes('கோவை')) locationVal = 'Coimbatore';
            else if (rawLocation.includes('திருச்சி')) locationVal = 'Trichy';
            else if (rawLocation.includes('மதுரை')) locationVal = 'Madurai';
            else if (rawLocation.includes('தஞ்சாவூர்')) locationVal = 'Tanjore';
            else if (rawLocation.includes('சேலம்')) locationVal = 'Salem';
            else if (rawLocation.includes('காரைக்குடி')) locationVal = 'Karaikudi';

            if (rawFuneral.includes('மாலை')) funeralVal = rawFuneral.replace('மாலை', 'PM').replace('மணி', '');
            else if (rawFuneral.includes('காலை')) funeralVal = rawFuneral.replace('காலை', 'AM').replace('மணி', '');
            if (rawDesc.includes('அன்பான குடும்பத்தலைவி')) descVal = 'Beloved homemaker. Her demise is an irreparable loss to her family.';
            else if (rawDesc.includes('முன்னாள் அரசு பள்ளி')) descVal = 'Former government school headmaster. A great loss to his family and students.';
          }
          
          return {
            id: item.obit_id || item.id,
            deceasedName: nameVal,
            age: item.age,
            location: locationVal,
            demiseDate: item.demiseDate || item.demise_date,
            funeralDetails: funeralVal,
            shortDescription: descVal,
            tributeCount: item.tributeCount || 0,
            gender: rawName.includes('சரஸ்வதி') || rawName.includes('மீனாம்பாள்') ? 'female' : 'male'
          };
        }) : [];
        
        // De-duplicate: only add a fallback notice if the name doesn't exist in the database list
        const merged = [...formatted];
        fallbackObits.forEach(fallback => {
          const exists = formatted.some(f => f.deceasedName.trim().toLowerCase() === fallback.deceasedName.trim().toLowerCase());
          if (!exists) {
            merged.push(fallback);
          }
        });

        const activeObits = merged.filter(o => isWithinOneWeek(o.demiseDate));
        
        setObits(activeObits);
        setFilteredObits(activeObits);

        // Setup initial tributes state
        const initialTributes = {};
        activeObits.forEach(o => {
          initialTributes[o.id] = o.tributeCount;
        });
        setTributes(initialTributes);
      })
      .catch((err) => {
        console.warn("Could not fetch obituaries from API, using fallback", err);
        const activeFallback = fallbackObits.filter(o => isWithinOneWeek(o.demiseDate));
        setObits(activeFallback);
        setFilteredObits(activeFallback);
        const initialTributes = {};
        activeFallback.forEach(o => {
          initialTributes[o.id] = o.tributeCount;
        });
        setTributes(initialTributes);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredObits(obits);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = obits.filter(item => 
        item.deceasedName.toLowerCase().includes(query) || 
        item.shortDescription.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
      setFilteredObits(filtered);
    }
  }, [searchQuery, obits]);

  const handleTributeClick = (id) => {
    setTributes(prev => {
      const newCount = (prev[id] || 0) + 1;
      return { ...prev, [id]: newCount };
    });

    // Fire API call silently
    fetchApi(`/obituaries/${id}/tribute`, { method: 'POST' })
      .catch(err => console.warn("Tribute post failed, updated state locally only", err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/obituaries', {
      method: 'POST',
      body: JSON.stringify({
        deceasedName: name,
        age: parseInt(age),
        location,
        demiseDate,
        funeralDetails: funeral,
        shortDescription: desc
      })
    })
    .then(() => {
      setName('');
      setAge('');
      setLocation('');
      setDemiseDate('');
      setFuneral('');
      setDesc('');
      setShowModal(false);
      loadData();
    })
    .catch(err => {
      console.warn("API obituary save failed, updating locally", err);
      const newObit = {
        id: Date.now(),
        deceasedName: name,
        age: parseInt(age),
        location,
        demiseDate,
        funeralDetails: funeral,
        shortDescription: desc,
        tributeCount: 0,
        gender: 'male'
      };
      setObits(prev => [newObit, ...prev].filter(o => isWithinOneWeek(o.demiseDate)));
      setTributes(prev => ({ ...prev, [newObit.id]: 0 }));
      setName('');
      setAge('');
      setLocation('');
      setDemiseDate('');
      setFuneral('');
      setDesc('');
      setShowModal(false);
    });
  };

  return (
    <main className="container">
      {/* HERO / SEARCH */}
      <section className="obituaries-hero">
        <h1>{lang === 'en' ? 'Condolences & Obituaries' : 'கண்ணீர் அஞ்சலி & இரங்கல் செய்திகள்'}</h1>
        <p>{lang === 'en' ? 'Obituary announcements and funeral details of local citizens.' : 'நமது ஊர் காலமானவர்களின் விபரங்கள் மற்றும் இறுதி அஞ்சலி முன்னறிவிப்புகள்'}</p>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Search by name or town...' : 'பெயர் அல்லது ஊர் உள்ளிடவும்...'} 
            aria-label="Search Obituaries"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>{lang === 'en' ? 'Search' : 'தேடுக'}</button>
        </div>
      </section>

      {/* OBITUARIES GRID */}
      <section className="obituaries-grid">
        {filteredObits.map(obit => (
          <div className="obit-card" key={obit.id}>
            <div className="obit-photo-frame">
              <i className={obit.gender === 'female' ? "fas fa-user-circle" : "fas fa-user-tie"} style={{ fontSize: '70px', color: '#94a3b8' }}></i>
            </div>
            <h2 className="obit-name">{obit.deceasedName}</h2>
            <div className="obit-age">
              {lang === 'en' ? `Age ${obit.age} | ${obit.location}` : `வயது ${obit.age} | ${obit.location}`}
            </div>
            <div className="obit-dates">
              {lang === 'en' ? `Passed away: ${obit.demiseDate}` : `இறப்பு: ${obit.demiseDate}`}
            </div>
            <p className="obit-desc">{obit.shortDescription}</p>
            <div className="obit-funeral">
              <i className="fas fa-calendar-day"></i> {lang === 'en' ? 'Funeral: ' : 'இறுதிச் சடங்கு: '}{obit.funeralDetails}
            </div>
            <div className="tribute-box">
              <button className="tribute-btn" onClick={() => handleTributeClick(obit.id)}>
                <i className="fas fa-heart"></i> {lang === 'en' ? 'Pay Tribute' : 'கண்ணீர் அஞ்சலி செலுத்த'}
              </button>
              <span className="tribute-count">
                {tributes[obit.id] || 0} {lang === 'en' ? 'tributes paid' : 'அஞ்சலிகள் செலுத்தப்பட்டுள்ளன'}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* BANNER TO POST OBITUARY */}
      <section className="post-obit-banner">
        <h3>
          {lang === 'en' ? 'Want to publish obituary details of your loved ones?' : 'உங்கள் இல்லத்தில் நடந்த இழப்புகளைப் பதிவு செய்ய விரும்புகிறீர்களா?'}
        </h3>
        <p>
          {lang === 'en' 
            ? 'Publish a free obituary notice so local citizens can attend final services and pay condolences.' 
            : 'நமது ஊர் மக்கள் அஞ்சலி செலுத்தவும் இறுதிச் சடங்கு விபரங்களை அறியவும் இலவசமாகப் பதியுங்கள்.'}
        </p>
        <button onClick={() => setShowModal(true)}>
          <i className="fas fa-plus-circle"></i> {lang === 'en' ? 'Submit Obituary' : 'இரங்கல் பதிவு செய்ய'}
        </button>
      </section>

      {/* POST OBITUARY MODAL */}
      {showModal && (
        <div className="modal open" id="postObitModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Add Obituary Notice' : 'இரங்கல் செய்தி பதிவு'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="postObitForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="obitNameInput">{lang === 'en' ? 'Deceased Name *' : 'காலமானவர் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="obitNameInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Subramani' : 'எ.கா: சுப்ரமணி'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="obitAgeInput">{lang === 'en' ? 'Age *' : 'வயது *'}</label>
                  <input 
                    type="number" 
                    id="obitAgeInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. 72' : 'எ.கா: 72'}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="obitLocInput">{lang === 'en' ? 'Town/Location *' : 'ஊர் *'}</label>
                  <input 
                    type="text" 
                    id="obitLocInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Trichy' : 'எ.கா: திருச்சி'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="obitDateInput">{lang === 'en' ? 'Demise Date *' : 'மறைந்த தேதி *'}</label>
                  <input 
                    type="date" 
                    id="obitDateInput" 
                    required
                    value={demiseDate}
                    onChange={(e) => setDemiseDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="obitFuneralInput">{lang === 'en' ? 'Funeral Details *' : 'இறுதிச் சடங்கு விபரங்கள் *'}</label>
                  <input 
                    type="text" 
                    id="obitFuneralInput" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. 03-07-2026, 11:00 AM' : 'எ.கா: 03-07-2026, காலை 11 மணி'}
                    value={funeral}
                    onChange={(e) => setFuneral(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="obitDescInput">{lang === 'en' ? 'Short Biography / Description *' : 'மறைந்தவரைப் பற்றிய சிறு குறிப்பு *'}</label>
                  <textarea 
                    id="obitDescInput" 
                    rows="3" 
                    required 
                    placeholder={lang === 'en' ? 'Add family details, achievements, or summary...' : 'குடும்ப விபரம் அல்லது அவர்தம் சிறப்புகளைப் பதியவும்...'}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">{lang === 'en' ? 'Publish Obituary' : 'பதிவு செய்'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Obituaries;
