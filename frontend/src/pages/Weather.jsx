import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';

const Weather = () => {
  const { lang } = useContext(LanguageContext);
  const [selectedCity, setSelectedCity] = useState('Chennai');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const citiesWeather = {
    Chennai: { temp: '32°C', condition: 'Sunny', humidity: '65%', wind: '15 km/h', ta: 'சென்னை', conditionTa: 'வெயில்' },
    Coimbatore: { temp: '28°C', condition: 'Partly Cloudy', humidity: '55%', wind: '12 km/h', ta: 'கோயம்புத்தூர்', conditionTa: 'பகுதி மேகமூட்டம்' },
    Madurai: { temp: '34°C', condition: 'Sunny', humidity: '48%', wind: '10 km/h', ta: 'மதுரை', conditionTa: 'அதிக வெயில்' },
    Salem: { temp: '31°C', condition: 'Clear Sky', humidity: '52%', wind: '8 km/h', ta: 'சேலம்', conditionTa: 'தெளிவான வானம்' },
    Trichy: { temp: '33°C', condition: 'Sunny', humidity: '50%', wind: '11 km/h', ta: 'திருச்சி', conditionTa: 'வெயில்' },
    Erode: { temp: '30°C', condition: 'Cloudy', humidity: '58%', wind: '9 km/h', ta: 'ஈரோடு', conditionTa: 'மேகமூட்டம்' }
  };

  const current = citiesWeather[selectedCity];

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
        <span>{lang === 'en' ? 'Weather' : 'வானிலை'}</span>
      </div>

      <h1 style={{ marginBottom: '20px', fontWeight: '800' }}>
        {lang === 'en' ? 'Local Weather Forecast' : 'தமிழக மாவட்ட வானிலை நிலவரம்'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {/* District selection sidebar */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <i className="fas fa-map-marker-alt" style={{ color: '#3B82F6', marginRight: '8px' }}></i>
            {lang === 'en' ? 'Select City' : 'நகரத்தைத் தேர்வு செய்க'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.keys(citiesWeather).map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: selectedCity === city ? '#EFF6FF' : '#fff',
                  color: selectedCity === city ? '#1E40AF' : '#334155',
                  fontWeight: '600',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {lang === 'en' ? city : citiesWeather[city].ta}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '30px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1E3A8A' }}>{lang === 'en' ? selectedCity : current.ta}</h2>
              <span style={{ fontSize: '1.1rem', color: '#2563EB', fontWeight: '500', display: 'block', marginTop: '4px' }}>
                {lang === 'en' ? current.condition : current.conditionTa}
              </span>
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div>
                  <small style={{ color: '#4B5563', display: 'block' }}>{lang === 'en' ? 'Humidity' : 'ஈரப்பதம்'}</small>
                  <strong>{current.humidity}</strong>
                </div>
                <div>
                  <small style={{ color: '#4B5563', display: 'block' }}>{lang === 'en' ? 'Wind Speed' : 'காற்றின் வேகம்'}</small>
                  <strong>{current.wind}</strong>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '4.5rem', fontWeight: '800', color: '#1E40AF', display: 'flex', alignItems: 'center' }}>
                {current.temp}
                <i className="fas fa-sun" style={{ color: '#F59E0B', marginLeft: '20px', fontSize: '3.5rem' }}></i>
              </div>
            </div>
          </div>

          {/* Weekly forecast dummy card */}
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {lang === 'en' ? 'Weekly Outlook' : 'வாராந்திர நிலவரம்'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px', textAlign: 'center' }}>
              <div style={{ padding: '15px 10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <small style={{ color: '#64748B' }}>{lang === 'en' ? 'Mon' : 'திங்கள்'}</small>
                <i className="fas fa-sun" style={{ display: 'block', margin: '10px 0', color: '#F59E0B' }}></i>
                <strong>33°C</strong>
              </div>
              <div style={{ padding: '15px 10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <small style={{ color: '#64748B' }}>{lang === 'en' ? 'Tue' : 'செவ்வாய்'}</small>
                <i className="fas fa-cloud-sun" style={{ display: 'block', margin: '10px 0', color: '#F59E0B' }}></i>
                <strong>31°C</strong>
              </div>
              <div style={{ padding: '15px 10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <small style={{ color: '#64748B' }}>{lang === 'en' ? 'Wed' : 'புதன்'}</small>
                <i className="fas fa-cloud" style={{ display: 'block', margin: '10px 0', color: '#94A3B8' }}></i>
                <strong>30°C</strong>
              </div>
              <div style={{ padding: '15px 10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <small style={{ color: '#64748B' }}>{lang === 'en' ? 'Thu' : 'வியாழன்'}</small>
                <i className="fas fa-cloud-showers-heavy" style={{ display: 'block', margin: '10px 0', color: '#3B82F6' }}></i>
                <strong>28°C</strong>
              </div>
              <div style={{ padding: '15px 10px', background: '#F8FAFC', borderRadius: '8px' }}>
                <small style={{ color: '#64748B' }}>{lang === 'en' ? 'Fri' : 'வெள்ளி'}</small>
                <i className="fas fa-sun" style={{ display: 'block', margin: '10px 0', color: '#F59E0B' }}></i>
                <strong>32°C</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
