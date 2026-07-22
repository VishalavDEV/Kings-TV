import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const PrivacyPolicy = () => {
  const { lang } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApi(`/public/pages/privacy_policy?lang=${lang}`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Could not fetch page details from backend, falling back", err);
        setLoading(false);
      });
  }, [lang]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3>{lang === 'en' ? 'Loading Page Details...' : 'பக்கம் ஏற்றப்படுகிறது...'}</h3>
      </div>
    );
  }

  const pageTitle = data?.title || (lang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை');
  const pageContent = data?.content || (lang === 'en' ? 
    'At KINGS 24x7, we prioritize the confidentiality of our visitors...' : 
    'கிங்ஸ் 24x7 இணையதளத்தில் வாசகர்களின் தரவுப் பாதுகாப்பு மற்றும் தனியுரிமையை நாங்கள் மதிக்கிறோம்...');
  const version = data?.version || 1;
  const effectiveDate = data?.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : '';

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
        <span>{pageTitle}</span>
      </div>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #B3732A', paddingBottom: '10px', marginBottom: '20px' }}>
          <h1 style={{ margin: '0', color: '#111', fontSize: '2rem' }}>
            {pageTitle}
          </h1>
          <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#666' }}>
            <div>{lang === 'en' ? 'Version' : 'பதிப்பு'}: <strong style={{ color: '#B3732A' }}>v{version}</strong></div>
            {effectiveDate && <div>{lang === 'en' ? 'Effective Date' : 'அமலுக்கு வரும் தேதி'}: {effectiveDate}</div>}
          </div>
        </div>
        <div 
          style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}
          dangerouslySetInnerHTML={{ __html: pageContent }}
        />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
