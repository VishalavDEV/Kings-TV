import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';
import './Jobs.css';

const Jobs = () => {
  const { lang } = useContext(LanguageContext);
  
  // Data lists
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Selection / Filters
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, candidates
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDist, setSelectedDist] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // all, Full Time, Part Time, Work From Home, Internship
  const [selectedSort, setSelectedSort] = useState('newest');

  // Loading & Pagination
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  // Modals / Panels
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardRole, setDashboardRole] = useState('candidate'); // candidate, employer
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareJob, setShareJob] = useState(null);

  // Apply Form
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantExp, setApplicantExp] = useState('1yr');
  const [applicantSummary, setApplicantSummary] = useState('');
  const [resumeFile, setResumeFile] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Post Job Form
  const [newTitle, setNewTitle] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newExpMin, setNewExpMin] = useState(1);
  const [newExpMax, setNewExpMax] = useState(5);
  const [newSalMin, setNewSalMin] = useState(4.0);
  const [newSalMax, setNewSalMax] = useState(8.0);
  const [newTypeSelect, setNewTypeSelect] = useState('Full Time');
  const [newModeSelect, setNewModeSelect] = useState('Work From Office');
  const [newVacancies, setNewVacancies] = useState(1);
  const [newDistrictId, setNewDistrictId] = useState('');

  // ATS match simulation
  const [atsScore, setAtsScore] = useState(null);
  const [atsFeedback, setAtsFeedback] = useState([]);

  // Fetch Category lists and Districts
  useEffect(() => {
    fetchApi('/jobs/categories')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(fallbackCategories);
        }
      })
      .catch(() => setCategories(fallbackCategories));

    fetchApi('/districts')
      .then(data => {
        if (Array.isArray(data)) setDistricts(data);
      })
      .catch(err => console.warn("Failed to load districts", err));
  }, []);

  // Fetch Jobs
  const loadJobs = () => {
    setLoading(true);
    let endpoint = '/jobs';
    let params = [];

    if (searchQuery.trim() !== '') {
      endpoint = '/jobs/search';
      params.push(`query=${encodeURIComponent(searchQuery)}`);
    } else {
      endpoint = '/jobs/filter';
      if (selectedCat !== 'all') {
        const catObj = categories.find(c => c.slug === selectedCat);
        if (catObj) params.push(`categoryId=${catObj.id}`);
      }
      if (selectedDist !== 'all') {
        params.push(`districtId=${selectedDist}`);
      }
      if (selectedType !== 'all') {
        params.push(`employmentType=${selectedType}`);
      }
      if (selectedSort !== 'newest') {
        params.push(`sort=${selectedSort}`);
      }
    }

    params.push(`page=${page}`);
    params.push(`size=${size}`);

    const queryString = params.length > 0 ? `?${params.join('&')}` : '';

    fetchApi(`${endpoint}${queryString}`)
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Failed to load jobs from API, using fallback", err);
        setJobs(fallbackJobs);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadJobs();
  }, [selectedCat, selectedDist, selectedType, selectedSort, searchQuery, page]);

  // Open job details
  const handleOpenDetails = (job) => {
    setSelectedJob(job);
    fetchApi(`/jobs/${job.id}`)
      .then(data => {
        setJobDetails(data);
        // Log view
        fetchApi(`/jobs/${job.id}/view`, { method: 'POST' }).catch(() => {});
      })
      .catch(() => {
        setJobDetails(job);
      });
  };

  // Upload Resume & ATS score analysis simulation
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `${import.meta.env.VITE_API_BASE || 'http://localhost:8080/api/v1'}/jobs/upload`;
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error("Resume upload failed");
      const data = await response.json();
      setResumeFile(data.url);

      // Simulate ATS Parser Skill Gap scoring
      setTimeout(() => {
        setAtsScore(84);
        setAtsFeedback([
          "✓ ATS Readable Format detected.",
          "✓ Found core skills: React, Javascript, REST APIs.",
          "⚠ Suggestion: Add Cloud platforms or AWS deployment details to hit 95% match."
        ]);
        alert(lang === 'en' ? "Resume parsed successfully! Score: 84%" : "விவரக்குறிப்பு பகுப்பாய்வு செய்யப்பட்டது! தகுதி மதிப்பெண்: 84%");
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(lang === 'en' ? "Failed to upload resume." : "விவரக்குறிப்பு பதிவேற்ற முடியவில்லை.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Submit Job Application
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) {
      alert(lang === 'en' ? "Please fill name and phone." : "பெயர் மற்றும் தொலைபேசி எண்ணை நிரப்பவும்.");
      return;
    }

    const targetJobId = selectedJob.id;
    fetchApi(`/jobs/${targetJobId}/apply?applicantName=${encodeURIComponent(applicantName)}&applicantPhone=${encodeURIComponent(applicantPhone)}&experience=${encodeURIComponent(applicantExp)}&summary=${encodeURIComponent(applicantSummary)}`, {
      method: 'POST'
    })
      .then(() => {
        alert(lang === 'en' ? "Application submitted successfully!" : "வேலைக்கு வெற்றிகரமாக விண்ணப்பிக்கப்பட்டது!");
        setShowApplyModal(false);
        setApplicantName('');
        setApplicantPhone('');
        setApplicantSummary('');
        loadJobs();
      })
      .catch(err => {
        console.error(err);
        alert(lang === 'en' ? "You have already applied for this job." : "இந்த வேலைக்கு நீங்கள் ஏற்கனவே விண்ணப்பித்துள்ளீர்கள்.");
      });
  };

  // Submit new Job vacancy (Employer Form)
  const handlePostJobSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newCompanyId || !newCatId) {
      alert(lang === 'en' ? "Please fill all required fields." : "தேவையான அனைத்து புலங்களையும் நிரப்பவும்.");
      return;
    }

    const payload = {
      title: newTitle,
      description: newDesc,
      company: { id: newCompanyId },
      categoryObj: { id: newCatId },
      experienceMin: newExpMin,
      experienceMax: newExpMax,
      salaryMin: newSalMin,
      salaryMax: newSalMax,
      employmentType: newTypeSelect,
      workMode: newModeSelect,
      vacancies: newVacancies,
      districtId: newDistrictId || null,
      requiredSkills: newSkills
    };

    fetchApi('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(() => {
        alert(lang === 'en' ? "Job posted successfully!" : "வேலை வாய்ப்பு வெற்றிகரமாக பதிவிடப்பட்டது!");
        setShowPostModal(false);
        setNewTitle('');
        setNewDesc('');
        setNewSkills('');
        loadJobs();
      })
      .catch(err => {
        console.error(err);
        alert(lang === 'en' ? "Failed to save job posting." : "வேலை வாய்ப்பை சேமிக்க முடியவில்லை.");
      });
  };

  const handleShareClick = (job, platform) => {
    const pageUrl = window.location.origin + `/jobs?id=${job.id}`;
    const shareText = encodeURIComponent(`Check out this job opportunity! ${job.title} at ${job.companyName}`);
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(pageUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(pageUrl);
      alert(lang === 'en' ? 'Link copied!' : 'இணைப்பு நகலெடுக்கப்பட்டது!');
    }
    setShowShareModal(false);
  };

  const fallbackCategories = [
    { id: 1, name: 'IT & Software', slug: 'it-software', icon: 'fa-laptop-code', activeJobCount: 2845, companiesHiringCount: 120 },
    { id: 2, name: 'Sales & Marketing', slug: 'sales-marketing', icon: 'fa-bullhorn', activeJobCount: 4126, companiesHiringCount: 180 },
    { id: 3, name: 'Education', slug: 'education', icon: 'fa-book-reader', activeJobCount: 3245, companiesHiringCount: 95 },
    { id: 4, name: 'Healthcare', slug: 'healthcare', icon: 'fa-heartbeat', activeJobCount: 2087, companiesHiringCount: 60 },
    { id: 5, name: 'Engineering', slug: 'engineering', icon: 'fa-cog', activeJobCount: 3789, companiesHiringCount: 140 },
    { id: 6, name: 'Government', slug: 'government', icon: 'fa-landmark', activeJobCount: 1678, companiesHiringCount: 20 },
    { id: 7, name: 'Banking & Finance', slug: 'banking-finance', icon: 'fa-money-check-alt', activeJobCount: 2345, companiesHiringCount: 75 },
    { id: 8, name: 'Others', slug: 'others', icon: 'fa-th-large', activeJobCount: 5678, companiesHiringCount: 300 }
  ];

  const fallbackJobs = [
    { id: 1, title: 'Java Full Stack Developer', companyName: 'Tata Consultancy Services', experienceMin: 3, experienceMax: 6, salaryMin: 5, salaryMax: 9, location: 'Coimbatore, Tamil Nadu', employmentType: 'Full Time', workMode: 'Work From Office', requiredSkills: 'Java, Spring Boot, React, SQL', featured: true },
    { id: 2, title: 'Software Engineer', companyName: 'Zoho Corporation', experienceMin: 1, experienceMax: 3, salaryMin: 4, salaryMax: 7, location: 'Chennai, Tamil Nadu', employmentType: 'Full Time', workMode: 'Work From Office', requiredSkills: 'JavaScript, Java, C++', featured: true },
    { id: 3, title: 'Relationship Manager', companyName: 'HDFC Bank', experienceMin: 2, experienceMax: 5, salaryMin: 4, salaryMax: 8, location: 'Salem, Tamil Nadu', employmentType: 'Full Time', workMode: 'Work From Office', requiredSkills: 'Sales, Customer Relationship', featured: true },
    { id: 4, title: 'Staff Nurse', companyName: 'Apollo Hospitals', experienceMin: 0, experienceMax: 2, salaryMin: 2, salaryMax: 4, location: 'Trichy, Tamil Nadu', employmentType: 'Full Time', workMode: 'Work From Office', requiredSkills: 'Nursing, Patient Care', featured: true }
  ];

  return (
    <main className="container jobs-module-container" style={{ paddingTop: '20px' }}>
      
      {/* Breadcrumbs */}
      <div className="breadcrumbs" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{lang === 'en' ? 'Home' : 'முகப்பு'}</Link>
        <i className="fas fa-chevron-right" style={{ fontSize: '9px', margin: '0 8px' }}></i>
        <span>{lang === 'en' ? 'Jobs Board' : 'வேலைவாய்ப்பு'}</span>
      </div>

      {/* HERO BANNER SECTION */}
      <section className="jobs-hero-banner">
        <div className="jobs-hero-left">
          <h1 className="jobs-hero-title">
            {lang === 'en' ? 'Find Jobs. Build Your Future.' : 'வேலை தேடுங்கள். எதிர்காலத்தை உருவாக்குங்கள்.'}
          </h1>
          <p className="jobs-hero-subtitle">
            {lang === 'en'
              ? 'Discover opportunities that match your skills and grow your career.'
              : 'உங்கள் திறமைக்கு ஏற்ற வேலை வாய்ப்புகளைக் கண்டறிந்து உங்கள் வாழ்க்கையை மேம்படுத்துங்கள்.'}
          </p>
          <div className="jobs-hero-btns">
            <button className="jobs-hero-btn-find" onClick={loadJobs}>
              {lang === 'en' ? 'Find Jobs' : 'வேலை தேடுக'}
            </button>
            <button className="jobs-hero-btn-post" onClick={() => setShowPostModal(true)}>
              {lang === 'en' ? 'Post a Job' : 'வேலைவாய்ப்பு பதிவிட'}
            </button>
          </div>
        </div>

        {/* Float stat badges overlay */}
        <div className="jobs-stat-badge-float active-jobs">
          <i className="fas fa-briefcase"></i>
          <div>
            <div className="jobs-stat-number">50K+</div>
            <div className="jobs-stat-label">{lang === 'en' ? 'Active Jobs' : 'செயலில் உள்ள வேலைகள்'}</div>
          </div>
        </div>
        <div className="jobs-stat-badge-float employers">
          <i className="fas fa-building"></i>
          <div>
            <div className="jobs-stat-number">25K+</div>
            <div className="jobs-stat-label">{lang === 'en' ? 'Employers' : 'நிறுவனங்கள்'}</div>
          </div>
        </div>

        {/* Right side background candidate illustration */}
        <div className="jobs-banner-illustration" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400")' }}></div>
      </section>

      {/* SEARCH TABS & FILTER PANEL BAR */}
      <div className="jobs-search-tabs-bar">
        <button className={`jobs-search-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
          <i className="fas fa-search"></i> {lang === 'en' ? 'Search Jobs' : 'வேலை தேடல்'}
        </button>
        <button className={`jobs-search-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
          <i className="fas fa-user-tie"></i> {lang === 'en' ? 'Search Candidates' : 'வேட்பாளர் தேடல்'}
        </button>
      </div>

      <div className="jobs-filter-panel">
        <div className="jobs-filter-row">
          <div className="jobs-filter-input-wrap">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Job title, keywords or company...' : 'வேலை தலைப்பு, நிறுவனம்...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="jobs-filter-input-wrap">
            <i className="fas fa-laptop-code"></i>
            <select value={selectedCat} onChange={(e) => { setSelectedCat(e.target.value); setPage(0); }}>
              <option value="all">{lang === 'en' ? 'All Categories' : 'அனைத்து பிரிவுகள்'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="jobs-filter-input-wrap">
            <i className="fas fa-user-clock"></i>
            <select value={selectedExp} onChange={(e) => setSelectedExp(e.target.value)}>
              <option value="all">{lang === 'en' ? 'Experience (All)' : 'அனுபவம் (அனைத்தும்)'}</option>
              <option value="fresher">{lang === 'en' ? '0-1 Years' : '0-1 ஆண்டுகள்'}</option>
              <option value="mid">{lang === 'en' ? '1-3 Years' : '1-3 ஆண்டுகள்'}</option>
              <option value="senior">{lang === 'en' ? '3-6 Years' : '3-6 ஆண்டுகள்'}</option>
            </select>
          </div>

          <div className="jobs-filter-input-wrap">
            <i className="fas fa-rupee-sign"></i>
            <select value={selectedSalary} onChange={(e) => setSelectedSalary(e.target.value)}>
              <option value="all">{lang === 'en' ? 'Salary Range' : 'சம்பள வரம்பு'}</option>
              <option value="low">₹3 - ₹5 LPA</option>
              <option value="mid">₹5 - ₹8 LPA</option>
              <option value="high">₹8+ LPA</option>
            </select>
          </div>

          <button className="jobs-search-action-btn" onClick={loadJobs}>
            {lang === 'en' ? 'Search Jobs' : 'தேடுக'}
          </button>
        </div>

        {/* Popular Searches keyword tags */}
        <div className="jobs-popular-keywords-row">
          <span>{lang === 'en' ? 'Popular Searches:' : 'பிரபல தேடல்கள்:'}</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Sales')}>Sales Executive</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Driver')}>Delivery Driver</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Developer')}>Software Developer</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Teacher')}>Teacher</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Nurse')}>Nurse</span>
          <span className="jobs-keyword-badge" onClick={() => setSearchQuery('Accountant')}>Accountant</span>
        </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="jobs-main-layout">
        
        {/* Left Content column */}
        <div className="jobs-left-content">
          
          {/* Featured Jobs Row Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#1e293b' }}>
              {lang === 'en' ? 'Featured Jobs' : 'சிறப்பு வேலைவாய்ப்புகள்'}
            </h2>
            <span style={{ fontSize: '12.5px', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setSelectedSort('newest')}>
              {lang === 'en' ? 'View all' : 'அனைத்தையும் பார்க்க'} &rarr;
            </span>
          </div>

          <div className="featured-jobs-grid">
            {(jobs.length > 0 ? jobs : fallbackJobs).slice(0, 4).map(job => (
              <div className="featured-job-card" key={job.id} onClick={() => handleOpenDetails(job)}>
                <span className="featured-card-badge">Featured</span>
                <div>
                  <div className="featured-job-card-top">
                    <div className="featured-job-logo-box">
                      {job.company?.logo ? <img src={job.company.logo} alt="logo" /> : job.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="featured-job-company">{job.companyName} <i className="fas fa-check-circle" style={{ color: '#2563eb', fontSize: '10px' }}></i></div>
                      <h3 className="featured-job-title">{job.title}</h3>
                    </div>
                  </div>
                  <div className="featured-job-loc">
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i> {job.location}
                  </div>
                </div>

                <div className="featured-job-meta-row">
                  <span className="featured-job-meta-pill">{job.experienceMin}-{job.experienceMax} Yrs</span>
                  <span className="featured-job-meta-pill">{job.salaryRange}</span>
                </div>

                <div className="featured-job-footer">
                  <span>2 days ago</span>
                  <i className="far fa-bookmark" style={{ cursor: 'pointer', fontSize: '13px' }}></i>
                </div>
              </div>
            ))}
          </div>

          {/* Latest Jobs Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#1e293b' }}>
              {lang === 'en' ? 'Latest Jobs' : 'சமீபத்திய வேலைகள்'}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['all', 'Full Time', 'Part Time', 'Work From Home', 'Internship'].map(t => (
                  <button 
                    key={t}
                    onClick={() => { setSelectedType(t); setPage(0); }}
                    style={{ border: 'none', background: selectedType === t ? '#eff6ff' : 'none', color: selectedType === t ? '#2563eb' : '#64748b', fontSize: '11px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}
                  >
                    {t === 'all' ? (lang === 'en' ? 'Latest' : 'அனைத்தும்') : t}
                  </button>
                ))}
              </div>

              <select 
                value={selectedSort} 
                onChange={(e) => setSelectedSort(e.target.value)}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 8px', fontSize: '11.5px', color: '#475569', fontWeight: '600' }}
              >
                <option value="newest">{lang === 'en' ? 'Sort by: Newest' : 'வரிசைப்படுத்து: சமீபத்தியது'}</option>
                <option value="salary_desc">{lang === 'en' ? 'Salary: High to Low' : 'சம்பளம்: அதிக முதல் குறைவு'}</option>
                <option value="most_applied">{lang === 'en' ? 'Most applied' : 'அதிகம் விண்ணப்பித்தவை'}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: '#2563eb' }}></i>
              <p style={{ marginTop: '10px' }}>{lang === 'en' ? 'Loading jobs list...' : 'பணிகள் ஏற்றப்படுகின்றன...'}</p>
            </div>
          ) : (
            <div className="latest-jobs-list">
              {(jobs.length > 0 ? jobs : fallbackJobs).map(job => (
                <div className="latest-job-row" key={job.id} onClick={() => handleOpenDetails(job)}>
                  <div className="latest-job-left">
                    <div className="featured-job-logo-box" style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                      {job.company?.logo ? <img src={job.company.logo} alt="logo" /> : job.companyName.charAt(0)}
                    </div>
                    <div className="latest-job-details-block">
                      <div className="latest-job-title-row">
                        <h3 style={{ fontSize: '14.5px', fontWeight: '800', margin: 0 }}>{job.title}</h3>
                        <span className="latest-job-badge-pill">{job.employmentType}</span>
                      </div>
                      <div className="latest-job-pills-row">
                        <span><strong>{job.companyName}</strong> <i className="fas fa-check-circle" style={{ color: '#2563eb', fontSize: '9px' }}></i></span>
                        <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                        <span><i className="fas fa-briefcase"></i> {job.experienceMin}-{job.experienceMax} Yrs</span>
                        <span><i className="fas fa-rupee-sign"></i> {job.salaryRange}</span>
                      </div>
                    </div>
                  </div>

                  <div className="latest-job-right-meta">
                    <span>5 hours ago</span>
                    <i className="far fa-bookmark" style={{ cursor: 'pointer', fontSize: '13px' }}></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div className="jobs-right-sidebar">
          
          {/* Job Seeker Zone */}
          <div className="jobs-sidebar-card">
            <div className="jobs-sidebar-zone-details">
              <div className="jobs-zone-icon-box seeker">
                <i className="fas fa-user-circle"></i>
              </div>
              <div>
                <h4 className="jobs-sidebar-zone-title">{lang === 'en' ? 'Job Seeker Zone' : 'வேலை தேடுபவர் பகுதி'}</h4>
                <div className="jobs-sidebar-zone-desc">{lang === 'en' ? 'Create profile and get best job matches.' : 'சுயவிவரம் அமைத்து தகுதியான பணிகளைப் பெறுங்கள்.'}</div>
              </div>
            </div>
            <button className="jobs-sidebar-zone-btn" onClick={() => { setDashboardRole('candidate'); setShowDashboardModal(true); }}>
              {lang === 'en' ? 'Create Profile' : 'சுயவிவரம்'}
            </button>
          </div>

          {/* Employer Zone */}
          <div className="jobs-sidebar-card">
            <div className="jobs-sidebar-zone-details">
              <div className="jobs-zone-icon-box employer">
                <i className="fas fa-building"></i>
              </div>
              <div>
                <h4 className="jobs-sidebar-zone-title">{lang === 'en' ? 'Employer Zone' : 'வேலை வழங்குபவர் பகுதி'}</h4>
                <div className="jobs-sidebar-zone-desc">{lang === 'en' ? 'Post jobs and manage candidates.' : 'வேலைகளைப் பதிவிட்டு விண்ணப்பதாரர்களை நிர்வகியுங்கள்.'}</div>
              </div>
            </div>
            <button className="jobs-sidebar-zone-btn" onClick={() => { setDashboardRole('employer'); setShowDashboardModal(true); }}>
              {lang === 'en' ? 'Employer Login' : 'உள்நுழைக'}
            </button>
          </div>

          {/* Upload Resume */}
          <div className="jobs-sidebar-card" style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
            <div className="jobs-sidebar-zone-details">
              <div className="jobs-zone-icon-box resume">
                <i className="fas fa-file-upload"></i>
              </div>
              <div>
                <h4 className="jobs-sidebar-zone-title">{lang === 'en' ? 'Upload Resume' : 'விவரக்குறிப்பு பதிவேற்ற'}</h4>
                <div className="jobs-sidebar-zone-desc">{lang === 'en' ? 'Let employers search you easily.' : 'நிறுவனங்கள் உங்களை எளிதாகத் தொடர்புகொள்ளட்டும்.'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="file" 
                id="sidebar-resume-input" 
                accept=".pdf,.docx" 
                onChange={handleResumeUpload} 
                style={{ display: 'none' }}
              />
              <button 
                className="jobs-sidebar-zone-btn" 
                style={{ background: '#16a34a', color: 'white', border: 'none' }}
                onClick={() => document.getElementById('sidebar-resume-input').click()}
              >
                {uploadingResume ? 'Parsing...' : (lang === 'en' ? 'Upload' : 'பதிவேற்று')}
              </button>
            </div>
          </div>

          {/* ATS score match display */}
          {atsScore && (
            <div className="ats-score-box">
              <div className="ats-score-header">
                <span>ATS Resume Match Score</span>
                <span style={{ color: '#16a34a' }}>{atsScore}%</span>
              </div>
              <div className="ats-score-bar-bg">
                <div className="ats-score-bar-fill" style={{ width: `${atsScore}%` }}></div>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', lineHeight: '1.4' }}>
                {atsFeedback.map((f, i) => <div key={i}>{f}</div>)}
              </div>
            </div>
          )}

          {/* Jobs by Category hiring lists */}
          <div className="jobs-sidebar-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{lang === 'en' ? 'Jobs by Category' : 'பிரிவுகள் வாரியாக வேலைகள்'}</h4>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setSelectedCat('all')}>View all</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {categories.slice(0, 8).map(c => (
                <div className="jobs-category-list-item" key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedCat(c.slug); setPage(0); }}>
                  <div className="jobs-category-list-item-left">
                    <i className={`fas ${c.icon}`}></i>
                    <span>{c.name}</span>
                  </div>
                  <span className="jobs-category-list-item-right">{c.activeJobCount} jobs</span>
                </div>
              ))}
            </div>
          </div>

          {/* Get Job Alerts alert button widget */}
          <div className="jobs-sidebar-card" style={{ background: '#fffbeb', border: '1.5px solid #fef3c7', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <i className="far fa-bell" style={{ fontSize: '20px', color: '#d97706' }}></i>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{lang === 'en' ? 'Get Job Alerts' : 'வேலைவாய்ப்பு அறிவிப்புகள்'}</strong>
                <p style={{ fontSize: '10.5px', color: '#6b7280', margin: '4px 0 0 0' }}>Never miss an opportunity. Get alerts to mobile.</p>
              </div>
            </div>
            <button 
              onClick={() => alert(lang === 'en' ? 'Alerts successfully enabled!' : 'அறிவிப்புகள் வெற்றிகரமாக செயல்படுத்தப்பட்டது!')}
              style={{ width: '100%', padding: '8px', border: '1px solid #f59e0b', background: 'white', color: '#d97706', borderRadius: '8px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px' }}
            >
              Enable Alerts &gt;
            </button>
          </div>

          {/* Top Employers log banner list */}
          <div className="jobs-sidebar-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{lang === 'en' ? 'Top Employers' : 'முன்னணி நிறுவனங்கள்'}</h4>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>View all</span>
            </div>
            <div className="jobs-employers-logo-row">
              <span className="jobs-employer-logo-badge">TCS</span>
              <span className="jobs-employer-logo-badge">Infosys</span>
              <span className="jobs-employer-logo-badge">Wipro</span>
              <span className="jobs-employer-logo-badge">HCL</span>
              <span className="jobs-employer-logo-badge">Zoho</span>
            </div>
          </div>

        </div>
      </div>

      {/* JOB DETAILS MODAL VIEW */}
      {selectedJob && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1000' }}>
          <div className="modal-content" style={{ maxWidth: '750px', width: '90%', padding: '0', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0 }}>{lang === 'en' ? 'Job vacancy Detail' : 'வேலை வாய்ப்பு விவரங்கள்'}</h3>
              <button className="modal-close" onClick={() => setSelectedJob(null)}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="featured-job-logo-box" style={{ width: '56px', height: '56px', fontSize: '24px' }}>
                  {selectedJob.company?.logo ? <img src={selectedJob.company.logo} alt="logo" /> : selectedJob.companyName.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{selectedJob.title}</h2>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{selectedJob.companyName} <i className="fas fa-check-circle" style={{ color: '#2563eb', fontSize: '11px' }}></i></span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '12.5px', color: '#475569' }}>
                <div><strong>Location:</strong> {selectedJob.location}</div>
                <div><strong>Salary range:</strong> {selectedJob.salaryRange}</div>
                <div><strong>Experience:</strong> {selectedJob.experienceMin}-{selectedJob.experienceMax} Years</div>
                <div><strong>Shift/Type:</strong> {selectedJob.employmentType}</div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', color: '#1e293b' }}>Job Description</h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: 0 }}>{selectedJob.description}</p>
              </div>

              {selectedJob.requiredSkills && (
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', color: '#1e293b' }}>Required Skills</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {selectedJob.requiredSkills.split(',').map(s => (
                      <span key={s} style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '6px' }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button 
                  onClick={() => setShowApplyModal(true)}
                  style={{ flex: 2, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Quick Apply
                </button>
                <button 
                  onClick={() => { setShareJob(selectedJob); setShowShareModal(true); }}
                  style={{ flex: 1, background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Share Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK APPLY MODAL */}
      {showApplyModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1100' }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '24px' }}>
            <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Apply for {selectedJob?.title}</h3>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Your Full Name *</label>
                <input 
                  type="text" 
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required 
                  placeholder="e.g. Priya"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Phone Number *</label>
                <input 
                  type="text" 
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  required 
                  placeholder="e.g. +91 9876543210"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Work Experience *</label>
                <select 
                  value={applicantExp}
                  onChange={(e) => setApplicantExp(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                >
                  <option value="fresher">Fresher (0-1 Yrs)</option>
                  <option value="1yr">1-3 Years</option>
                  <option value="2-3yr">3-6 Years</option>
                  <option value="4+yr">6+ Years</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Cover Note / Summary</label>
                <textarea 
                  value={applicantSummary}
                  onChange={(e) => setApplicantSummary(e.target.value)}
                  rows="3"
                  placeholder="Brief summary of skills..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                ></textarea>
              </div>

              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DASHBOARDS VIEW MODAL */}
      {showDashboardModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1000' }}>
          <div className="modal-content" style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>
                {dashboardRole === 'candidate' ? 'Candidate Zone Profile' : 'Employer Recruitment Console'}
              </h3>
              <button className="modal-close" onClick={() => setShowDashboardModal(false)}>&times;</button>
            </div>
            
            {dashboardRole === 'candidate' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Candidate Dashboard */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>Profile Completion: 75%</h4>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '75%', height: '100%', background: '#2563eb' }}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <h4 style={{ marginBottom: '8px' }}>Applied Jobs History</h4>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: 'white' }}>
                      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                        <strong>Full Stack Developer</strong> - TCS
                        <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>Under Review</div>
                      </div>
                      <div>
                        <strong>Software Engineer</strong> - Zoho Corp
                        <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>Interview Scheduled</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ marginBottom: '8px' }}>Resume Parser Details</h4>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: 'white', fontSize: '12px' }}>
                      <p><strong>Detected Skills:</strong> React, Spring Boot, MySQL, CSS</p>
                      <p><strong>Education:</strong> B.E. Computer Science & Eng</p>
                      <p><strong>ATS Matching score:</strong> 82%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Employer Dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                    <h2>8</h2>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Active Job Postings</span>
                  </div>
                  <div style={{ background: '#fdf2f8', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                    <h2>143</h2>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Total Applicants</span>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                    <h2>24</h2>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Interviews Scheduled</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '10px' }}>Recent Vacancies Postings</h4>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                      <span><strong>Java Developer</strong> (6 Applicants)</span>
                      <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert("Manage candidate list coming soon!")}>Manage</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>React Frontend Developer</strong> (12 Applicants)</span>
                      <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => alert("Manage candidate list coming soon!")}>Manage</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE JOB VACANCY MODAL */}
      {showPostModal && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1000' }}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{lang === 'en' ? 'Post New Job Vacancy' : 'புதிய வேலைவாய்ப்பு வெளியிட'}</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>&times;</button>
            </div>

            <div className="modal-body" style={{ padding: '0' }}>
              <form onSubmit={handlePostJobSubmit} className="space-y-4 text-left" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Job Title *</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required 
                      placeholder="e.g. Senior Java Dev"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Hiring Company *</label>
                    <select 
                      value={newCompanyId}
                      onChange={(e) => setNewCompanyId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    >
                      <option value="">-- Choose Company --</option>
                      <option value="1">Tata Consultancy Services</option>
                      <option value="2">Zoho Corporation</option>
                      <option value="3">HDFC Bank</option>
                      <option value="4">Apollo Hospitals</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Job Category *</label>
                    <select 
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>District Locality</label>
                    <select 
                      value={newDistrictId}
                      onChange={(e) => setNewDistrictId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    >
                      <option value="">-- Choose District --</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{lang === 'en' ? d.nameEn : d.nameTa}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Min Exp *</label>
                    <input 
                      type="number" 
                      value={newExpMin} 
                      onChange={(e) => setNewExpMin(parseInt(e.target.value))} 
                      required 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Max Exp</label>
                    <input 
                      type="number" 
                      value={newExpMax} 
                      onChange={(e) => setNewExpMax(parseInt(e.target.value))} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Min Sal *</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={newSalMin} 
                      onChange={(e) => setNewSalMin(parseFloat(e.target.value))} 
                      required 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Max Sal</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={newSalMax} 
                      onChange={(e) => setNewSalMax(parseFloat(e.target.value))} 
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Employment Type</label>
                    <select 
                      value={newTypeSelect} 
                      onChange={(e) => setNewTypeSelect(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Work Mode</label>
                    <select 
                      value={newModeSelect} 
                      onChange={(e) => setNewModeSelect(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                    >
                      <option value="Work From Office">Work From Office</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Required Skills (comma separated) *</label>
                  <input 
                    type="text" 
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    required 
                    placeholder="e.g. Java, React, SQL"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Job Description *</label>
                  <textarea 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required 
                    rows="3"
                    placeholder="Enter key details about roles and responsibilities..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: 'black' }}
                  ></textarea>
                </div>

                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px', fontSize: '14.5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                  {lang === 'en' ? 'Post Vacancy' : 'வேலை வாய்ப்பை பதிவிடு'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SHARE DIALOG */}
      {showShareModal && shareJob && (
        <div className="modal open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1100' }}>
          <div className="modal-content" style={{ maxWidth: '400px', width: '90%', padding: '24px' }}>
            <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0 }}>{lang === 'en' ? 'Share Job' : 'வேலையைப் பகிர்க'}</h3>
              <button className="modal-close" onClick={() => { setShowShareModal(false); setShareJob(null); }}>&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', padding: '16px 0' }}>
              <button onClick={() => handleShareClick(shareJob, 'whatsapp')} style={{ padding: '10px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <i className="fab fa-whatsapp"></i> WhatsApp
              </button>
              <button onClick={() => handleShareClick(shareJob, 'facebook')} style={{ padding: '10px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <i className="fab fa-facebook-f"></i> Facebook
              </button>
            </div>
            <button 
              onClick={() => handleShareClick(shareJob, 'copy')} 
              style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <i className="far fa-copy"></i> {lang === 'en' ? 'Copy Link' : 'நகலெடுக்க'}
            </button>
          </div>
        </div>
      )}

    </main>
  );
};

export default Jobs;
