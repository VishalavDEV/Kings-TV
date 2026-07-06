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

  const fallbackObits = [
    { id: 'demo-1', deceasedName: 'தர்மலிங்கம்', age: 72, location: 'சேலம்', demiseDate: '30-06-2026', funeralDetails: '02-07-2026, மாலை 4:00 மணி', shortDescription: 'முன்னாள் அரசு பள்ளி தலைமை ஆசிரியர். அன்னார் தாரமங்கலம் அரசு உயர்நிலைப்பள்ளியில் 30 ஆண்டுகள் பணியாற்றியவர். இவரது இழப்பு குடும்பத்தாருக்கும் மாணவர்களுக்கும் ஈடுசெய்ய முடியாத ஒன்றாகும்.', tributeCount: 118, gender: 'male' },
    { id: 'demo-2', deceasedName: 'மீனாம்பாள்', age: 68, location: 'கோவை', demiseDate: '29-06-2026', funeralDetails: '01-07-2026, காலை 10:00 மணி', shortDescription: 'பாலசுப்ரமணியன் அவர்களின் தர்மபத்தினி. சமூக ஆர்வலர் மற்றும் உதவும் கரங்கள் அறக்கட்டளையின் மூத்த உறுப்பினர். பல ஆதரவற்ற குழந்தைகளுக்கு கல்வி கற்க உதவியவர்.', tributeCount: 84, gender: 'female' },
    { id: 'demo-3', deceasedName: 'ராமநாதன் செட்டியார்', age: 85, location: 'காரைக்குடி', demiseDate: '28-06-2026', funeralDetails: '30-06-2026 (முடிந்தது)', shortDescription: 'உள்ளூர் வணிக சங்கத் தலைவர். செட்டியார் நகைக்கடையின் நிறுவனர். காரைக்குடி பகுதியில் பல்வேறு ஆன்மிக மற்றும் தொண்டுப் பணிகளில் தன்னை ஈடுபடுத்திக் கொண்டவர்.', tributeCount: 230, gender: 'male' }
  ];

  const loadData = () => {
    fetchApi('/obituaries')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => ({
          id: item.obit_id || item.id,
          deceasedName: item.deceasedName || item.deceased_name,
          age: item.age,
          location: item.location,
          demiseDate: item.demiseDate || item.demise_date,
          funeralDetails: item.funeralDetails || item.funeral_details,
          shortDescription: item.shortDescription || item.short_description,
          tributeCount: item.tributeCount || 0,
          gender: 'male'
        })) : [];
        const merged = [...formatted, ...fallbackObits];
        setObits(merged);
        setFilteredObits(merged);

        // Setup initial tributes state
        const initialTributes = {};
        merged.forEach(o => {
          initialTributes[o.id] = o.tributeCount;
        });
        setTributes(initialTributes);
      })
      .catch((err) => {
        console.warn("Could not fetch obituaries from API, using fallback", err);
        setObits(fallbackObits);
        setFilteredObits(fallbackObits);
        const initialTributes = {};
        fallbackObits.forEach(o => {
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
      setObits(prev => [newObit, ...prev]);
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
        <h1>{lang === 'en' ? 'Condolences & Obituary Notices' : 'இரங்கல் செய்திகள்'}</h1>
        <p>{lang === 'en' ? 'Obituary announcements, funeral details, and tribute cards of local citizens' : 'உள்ளூர் இறப்புச் செய்திகள், இறுதிச் சடங்கு விபரங்கள் மற்றும் இரங்கல் குறிப்புகள்'}</p>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Search by name or location...' : 'பெயர் அல்லது ஊர் கொண்டு தேடுக...'} 
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
            <div className="obit-ribbon"><i className="fas fa-ribbon"></i></div>
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
          {lang === 'en' ? 'Submit Obituary' : 'இரங்கல் பதிவு செய்ய'}
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
