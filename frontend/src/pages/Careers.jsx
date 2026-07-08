import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Careers = () => {
  const { lang } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApi('/pages/careers')
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Could not fetch page details from backend, falling back", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3>{lang === 'en' ? 'Loading Page Details...' : 'பக்கம் ஏற்றப்படுகிறது...'}</h3>
      </div>
    );
  }

  const pageTitle = data ? (lang === 'en' ? data.titleEn : data.titleTa) : (lang === 'en' ? 'Careers' : 'வேலைவாய்ப்பு');
  const pageContent = data ? (lang === 'en' ? data.contentEn : data.contentTa) : '';

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
        <span>{pageTitle}</span>
      </div>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ marginBottom: '15px', color: '#111', fontSize: '2rem', borderBottom: '3px solid var(--primary-color, #3B82F6)', display: 'inline-block', paddingBottom: '5px' }}>
          {pageTitle}
        </h1>
        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444', whiteSpace: 'pre-line', marginTop: '15px' }}>
          {pageContent}
        </p>

        {/* Benefits section */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>{lang === 'en' ? 'Why Join Us?' : 'ஏன் எங்களுடன் இணைய வேண்டும்?'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '8px' }}>
              <i className="fas fa-users fa-2x" style={{ color: '#3B82F6', marginBottom: '10px' }}></i>
              <h4>{lang === 'en' ? 'Great Culture' : 'சிறந்த கலாச்சாரம்'}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{lang === 'en' ? 'Work with a passionate and collaborative team.' : 'ஊக்கமளிக்கும் மற்றும் கூட்டுறவு மனப்பான்மை கொண்ட குழுவுடன் இணைந்து பணியாற்றுங்கள்.'}</p>
            </div>
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '8px' }}>
              <i className="fas fa-graduation-cap fa-2x" style={{ color: '#3B82F6', marginBottom: '10px' }}></i>
              <h4>{lang === 'en' ? 'Growth Opportunities' : 'வளர்ச்சி வாய்ப்புகள்'}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{lang === 'en' ? 'Enhance your career and master new media skills.' : 'உங்கள் தொழில் வாழ்க்கையை மேம்படுத்தி புதிய திறன்களைக் கற்றுக்கொள்ளுங்கள்.'}</p>
            </div>
            <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '8px' }}>
              <i className="fas fa-heart fa-2x" style={{ color: '#3B82F6', marginBottom: '10px' }}></i>
              <h4>{lang === 'en' ? 'Great Benefits' : 'கூடுதல் நன்மைகள்'}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{lang === 'en' ? 'Competitive salaries and welfare schemes.' : 'நிகரான ஊதியம் மற்றும் இதர நலத்திட்டங்களைப் பெறுங்கள்.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
