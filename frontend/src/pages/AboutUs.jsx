import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const AboutUs = () => {
  const { lang } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApi(`/public/pages/about_us?lang=${lang}`)
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

  const pageTitle = data?.title || (lang === 'en' ? 'About Us' : 'எங்களைப் பற்றி');
  const pageContent = data?.content || (lang === 'en' ? 
    'KINGS 24x7 is a premier Tamil digital news portal...' : 
    'கிங்ஸ் 24x7 என்பது தமிழ்நாட்டைச் சேர்ந்த ஒரு முன்னணி செய்தித்தளமாகும்...');

  let team = [];
  let milestones = [];
  try {
    team = data?.teamMembers ? JSON.parse(data.teamMembers) : [];
  } catch (e) {}
  try {
    milestones = data?.milestones ? JSON.parse(data.milestones) : [];
  } catch (e) {}

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
        <span>{pageTitle}</span>
      </div>

      <div className="about-us-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Intro */}
        <section className="about-intro" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h1 style={{ marginBottom: '15px', color: '#111', fontSize: '2rem', borderBottom: '3px solid #B3732A', display: 'inline-block', paddingBottom: '5px' }}>
            {pageTitle}
          </h1>
          <div 
            style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </section>

        {/* Milestones timeline if present */}
        {milestones.length > 0 && (
          <section className="about-timeline" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {lang === 'en' ? 'Our Milestones' : 'எங்கள் மைல்கற்கள்'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '15px', borderLeft: '2px solid #B3732A', paddingLeft: '20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-6px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#B3732A' }} />
                  <div>
                    <span style={{ fontWeight: '800', color: '#B3732A', fontSize: '1.1rem' }}>{m.year}</span>
                    <h4 style={{ margin: '3px 0 6px 0', color: '#111' }}>{m.title}</h4>
                    <p style={{ margin: '0', fontSize: '0.95rem', color: '#666' }}>{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team Grid if present */}
        {team.length > 0 && (
          <section className="about-team" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {lang === 'en' ? 'Meet the Team' : 'எங்கள் குழு'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {team.map((m, i) => (
                <div key={i} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#fdfdfd' }}>
                  {m.photo ? (
                    <img src={m.photo} alt={m.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px auto', display: 'block' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B3732A', fontSize: '2rem', margin: '0 auto 12px auto' }}>
                      <i className="fas fa-user-circle"></i>
                    </div>
                  )}
                  <h4 style={{ margin: '0 0 4px 0', color: '#111' }}>{m.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#B3732A', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>{m.title}</span>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: '0', lineHeight: '1.4' }}>{m.bio}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutUs;
