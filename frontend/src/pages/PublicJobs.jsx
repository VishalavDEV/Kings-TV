import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './PublicJobs.css';

const PublicJobs = () => {
  const { lang } = useContext(LanguageContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const query = `?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}&category=${encodeURIComponent(category)}`;
      const data = await fetchApi(`/public/jobs${query}`);
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [type, category]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadJobs();
  };

  return (
    <div className="public-jobs-container">
      {/* Hero Header */}
      <div className="jobs-hero-banner">
        <h1>{lang === 'en' ? 'Careers & Job Opportunities' : 'வேலைவாய்ப்புச் செய்திகள்'}</h1>
        <p>{lang === 'en' ? 'Find and apply for top local openings, full-time positions, and remote work.' : 'உங்கள் தகுதிக்கு ஏற்ற சிறந்த உள்ளூர் மற்றும் வெளியூர் வேலைகளைக் கண்டறியுங்கள்.'}</p>
      </div>

      {/* Filter Options */}
      <form onSubmit={handleFilterSubmit} className="jobs-search-bar-row">
        <input
          type="text"
          placeholder={lang === 'en' ? "Job Title or keywords..." : "வேலைத் தலைப்பு அல்லது முக்கிய வார்த்தை..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder={lang === 'en' ? "Location (e.g. Chennai)..." : "இடம் (எ.கா: சென்னை)..."}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="location-input"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="select-input">
          <option value="">{lang === 'en' ? 'All Types' : 'அனைத்து வேலை வகைகள்'}</option>
          <option value="full-time">Full-Time</option>
          <option value="part-time">Part-Time</option>
          <option value="contract">Contract</option>
        </select>
        <button type="submit" className="filter-submit-btn">
          {lang === 'en' ? 'Search' : 'தேடு'}
        </button>
      </form>

      {/* List Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p>{lang === 'en' ? 'Syncing latest job postings...' : 'வேலைவாய்ப்புகளை ஏற்றிவருகிறது...'}</p>
        </div>
      ) : (
        <div className="jobs-grid-list">
          {jobs.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>
              {lang === 'en' ? 'No active job opportunities found matching your filters.' : 'உங்கள் தேடலுக்கு ஏற்ற வேலைவாய்ப்புகள் எதுவும் கிடைக்கவில்லை.'}
            </p>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="job-grid-card">
                <div className="job-card-header">
                  <span className="job-type-tag" style={{
                    background: job.jobType === 'full-time' ? '#e0f2fe' : job.jobType === 'contract' ? '#fef3c7' : '#dcfce7',
                    color: job.jobType === 'full-time' ? '#0369a1' : job.jobType === 'contract' ? '#b45309' : '#15803d'
                  }}>
                    {job.jobType || job.employmentType}
                  </span>
                  {job.salaryMin && (
                    <span className="job-salary-tag">₹{job.salaryMin} - {job.salaryMax} LPA</span>
                  )}
                </div>
                <div className="job-card-body">
                  <h3 className="job-title-link">
                    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {job.title}
                    </Link>
                  </h3>
                  <h4 className="job-company-name">{job.companyName}</h4>
                  <p className="job-desc-excerpt">{job.description}</p>
                  
                  <div className="job-meta-row">
                    <span><i className="fa-solid fa-location-dot"></i> {job.location || 'Tamil Nadu'}</span>
                    {job.expiresAt && (
                      <span><i className="fa-regular fa-calendar-xmark"></i> Apply before: {new Date(job.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="job-card-footer">
                  <Link to={`/jobs/${job.id}`} className="apply-now-btn">
                    {lang === 'en' ? 'View Details' : 'விவரம் காண்க'} <i className="fa-solid fa-arrow-right-long"></i>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PublicJobs;
