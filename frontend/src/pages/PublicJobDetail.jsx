import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicJobs.css';

const PublicJobDetail = () => {
  const { id } = useParams();
  const { lang } = useContext(LanguageContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application Form States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [resumeFile, setResumeFile] = useState('');
  const [coverNote, setCoverNote] = useState('');
  
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/public/jobs/${id}`);
        if (data && !data.error) {
          setJob(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleApplyFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    const payload = {
      applicantName,
      applicantEmail,
      applicantPhone,
      resumeFile: resumeFile || null,
      coverNote
    };

    try {
      const res = await fetchApi(`/public/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res) {
        setSubmitSuccess(lang === 'en' ? 'Application submitted successfully! The hiring team has been notified.' : 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! வேலை வழங்குபவருக்கு தகவல் அனுப்பப்பட்டுள்ளது.');
        setApplicantName('');
        setApplicantEmail('');
        setApplicantPhone('');
        setResumeFile('');
        setCoverNote('');
        setTimeout(() => setShowApplyModal(false), 3000);
      }
    } catch (err) {
      setSubmitError('Failed to submit application. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="spinner"></div>
        <p>{lang === 'en' ? 'Loading job specifications...' : 'வேலைவாய்ப்பு விவரங்களை ஏற்றிவருகிறது...'}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: '60px 15px', textAlign: 'center' }}>
        <h2>{lang === 'en' ? 'Job Posting Not Found' : 'வேலைவாய்ப்பு விவரங்கள் கிடைக்கவில்லை'}</h2>
        <p>{lang === 'en' ? 'The job posting you are looking for does not exist or has already expired.' : 'நீங்கள் தேடும் வேலைவாய்ப்பு காலாவதியாகிவிட்டது அல்லது நீக்கப்பட்டுவிட்டது.'}</p>
        <Link to="/jobs" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
          {lang === 'en' ? 'Back to Jobs Board' : 'பணிப் பலகைக்குத் திரும்பு'}
        </Link>
      </div>
    );
  }

  return (
    <div className="public-job-detail-container">
      {/* Header Info Banner */}
      <div className="job-detail-header-card">
        <span className="detail-job-type-tag">{job.jobType || job.employmentType}</span>
        <h1>{job.title}</h1>
        <h2>{job.companyName}</h2>
        <div className="detail-job-meta-list">
          <span><i className="fa-solid fa-location-dot"></i> {job.location || 'Tamil Nadu'}</span>
          {job.salaryMin && (
            <span><i className="fa-solid fa-wallet"></i> ₹{job.salaryMin} - {job.salaryMax} LPA</span>
          )}
          {job.expiresAt && (
            <span><i className="fa-regular fa-calendar-xmark"></i> Apply Before: {new Date(job.expiresAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '30px', margin: '2rem auto' }} className="detail-split-grid">
        {/* Main Details */}
        <div className="detail-main-description">
          <div className="info-card">
            <h3>Job Description</h3>
            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.95rem', color: '#334155' }}>
              {job.description}
            </p>
          </div>
        </div>

        {/* Action Sidebar */}
        <aside className="detail-sidebar">
          <div className="info-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', textAlign: 'center' }}>
            <h3>Ready to Apply?</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
              Submit your resume today and stand out to recruiters.
            </p>

            {job.applyMethod === 'email' && (
              <a href={`mailto:${job.applyTarget}`} className="sidebar-apply-cta" style={{ display: 'block', textDecoration: 'none' }}>
                <i className="fa-solid fa-envelope"></i> Apply via Email
              </a>
            )}

            {job.applyMethod === 'link' && (
              <a href={job.applyTarget} target="_blank" rel="noopener noreferrer" className="sidebar-apply-cta" style={{ display: 'block', textDecoration: 'none' }}>
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Apply on Website
              </a>
            )}

            {job.applyMethod === 'in-app' && (
              <button className="sidebar-apply-cta" style={{ width: '100%' }} onClick={() => { setSubmitSuccess(''); setSubmitError(''); setShowApplyModal(true); }}>
                <i className="fa-solid fa-paper-plane"></i> Apply in App
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="modal-header" style={{ background: '#B3732A' }}>
              <h3>Submit Job Application</h3>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {submitSuccess ? (
                <div className="alert-banner success">{submitSuccess}</div>
              ) : (
                <form onSubmit={handleApplyFormSubmit}>
                  {submitError && <div className="alert-banner error">{submitError}</div>}
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input type="text" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Resume File URL *</label>
                    <input type="url" value={resumeFile} onChange={(e) => setResumeFile(e.target.value)} placeholder="e.g. Link to PDF resume" required />
                  </div>
                  <div className="form-group">
                    <label>Cover Note / Message</label>
                    <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows="3" placeholder="Tell us why you are a good fit..."></textarea>
                  </div>
                  
                  <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '10px', padding: '12px 24px', background: '#B3732A', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                    Send Application
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicJobDetail;
