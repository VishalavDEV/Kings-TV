import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Careers = () => {
  const { lang } = useContext(LanguageContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApi(`/public/pages/career?lang=${lang}`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Could not fetch page details from backend, falling back", err);
        setLoading(false);
      });
  }, [lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage(lang === 'en' ? 'Please upload your resume file.' : 'தயவுசெய்து உங்கள் சுயவிவரக் கோப்பை பதிவேற்றவும்.');
      setIsSuccess(false);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      // Send multipart form-data to careers application endpoint
      const baseUrl = window.API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/public/pages/career/apply`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(lang === 'en' ? 'Application submitted successfully!' : 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!');
        setName('');
        setEmail('');
        setPhone('');
        setCoverLetter('');
        setResumeFile(null);
        // Clear file input
        const fileEl = document.getElementById('resume-file-input');
        if (fileEl) fileEl.value = '';
      } else {
        setIsSuccess(false);
        setMessage(result.message || 'Failed to submit application');
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage(lang === 'en' ? 'Network error. Try again later.' : 'பிணையப் பிழை. பின்னர் முயற்சிக்கவும்.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h3>{lang === 'en' ? 'Loading Page Details...' : 'பக்கம் ஏற்றப்படுகிறது...'}</h3>
      </div>
    );
  }

  const pageTitle = data?.title || (lang === 'en' ? 'Careers' : 'வேலைவாய்ப்பு');
  const pageContent = data?.content || (lang === 'en' ? 
    'Build the future of digital journalism with KINGS 24x7...' : 
    'கிங்ஸ் 24x7 உடன் இணைந்து டிஜிட்டல் இதழியல் துறையின் எதிர்காலத்தை உருவாக்குங்கள்...');

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '50px' }}>
      <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
        <Link to="/">{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 8px' }}></i>
        <span>{pageTitle}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {/* Info card */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h1 style={{ marginBottom: '15px', color: '#111', fontSize: '2rem', borderBottom: '3px solid #B3732A', display: 'inline-block', paddingBottom: '5px' }}>
            {pageTitle}
          </h1>
          <div 
            style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#444', marginTop: '15px' }}
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />

          <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>{lang === 'en' ? 'Why Join Us?' : 'ஏன் எங்களுடன் இணைய வேண்டும்?'}</h3>
            <ul style={{ listStyleType: 'none', paddingLeft: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fas fa-users" style={{ color: '#B3732A' }}></i>
                <span>{lang === 'en' ? 'Great Culture' : 'சிறந்த கலாச்சாரம்'}</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fas fa-graduation-cap" style={{ color: '#B3732A' }}></i>
                <span>{lang === 'en' ? 'Growth Opportunities' : 'வளர்ச்சி வாய்ப்புகள்'}</span>
              </li>
              <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fas fa-heart" style={{ color: '#B3732A' }}></i>
                <span>{lang === 'en' ? 'Great Benefits' : 'கூடுதல் நன்மைகள்'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {lang === 'en' ? 'Submit General Application' : 'சுயவிவரக் குறிப்பை அனுப்பவும்'}
          </h2>

          {message && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '15px', 
              fontSize: '0.9rem',
              fontWeight: 'bold',
              background: isSuccess ? '#DCFCE7' : '#FEE2E2',
              color: isSuccess ? '#14532D' : '#991B1B'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                {lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                {lang === 'en' ? 'Email Address *' : 'மின்னஞ்சல் முகவரி *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                {lang === 'en' ? 'Phone Number' : 'தொலைபேசி எண்'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                {lang === 'en' ? 'Brief Cover Letter' : 'விண்ணப்பக் கடிதம்'}
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '500' }}>
                {lang === 'en' ? 'Upload Resume (PDF, DOCX) *' : 'சுயவிவரக்கோப்பை பதிவேற்றவும் (PDF, DOCX) *'}
              </label>
              <input
                id="resume-file-input"
                type="file"
                required
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{ width: '100%', padding: '5px 0' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px',
                borderRadius: '6px',
                background: '#B3732A',
                color: 'white',
                border: 'none',
                fontWeight: '705',
                cursor: 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? (lang === 'en' ? 'Submitting...' : 'சமர்ப்பிக்கப்படுகிறது...') : (lang === 'en' ? 'Submit Resume' : 'சுயவிவரக்கோப்பை சமர்ப்பி')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Careers;
