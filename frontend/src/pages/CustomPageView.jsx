import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const CustomPageView = () => {
  const { slug } = useParams();
  const { lang } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(false);
    fetchApi(`/public/pages/${slug}`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Could not fetch static page from backend", err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#4b5563' }}>
          {lang === 'en' ? 'Loading Page...' : 'பக்கம் ஏற்றப்படுகிறது...'}
        </h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>404</h2>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          {lang === 'en' ? 'Page not found.' : 'பக்கம் கண்டறியப்படவில்லை.'}
        </p>
        <Link 
          to="/" 
          className="btn btn-primary" 
          style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', background: '#2563eb', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
        >
          {lang === 'en' ? 'Go to Home' : 'முகப்பு பக்கத்திற்குச் செல்லவும்'}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '60px', maxWidth: '900px' }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs" style={{ marginBottom: '24px', fontSize: '13px', color: '#6b7280' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 500 }}>
          {lang === 'en' ? 'Home' : 'முகப்பு'}
        </Link>
        <span style={{ margin: '0 8px', color: '#d1d5db' }}>&gt;</span>
        <span style={{ color: '#374151', fontWeight: 600 }}>{data.title}</span>
      </div>

      {/* Styled Page Content Box */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '16px', lineHeight: 1.25 }}>
          {data.title}
        </h1>
        
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
          <span>
            <i className="fa-regular fa-calendar-days" style={{ marginRight: '6px' }}></i>
            {new Date(data.createdAt || data.updatedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ta-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span style={{ color: '#d1d5db' }}>•</span>
          <span>
            <i className="fa-solid fa-globe" style={{ marginRight: '6px' }}></i>
            {data.language === 'en' ? 'English' : 'தமிழ்'}
          </span>
        </div>

        {/* Dynamic formatted HTML body */}
        <div 
          className="html-content-view" 
          style={{ lineHeight: 1.8, fontSize: '16px', color: '#374151' }}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </div>
  );
};

export default CustomPageView;
