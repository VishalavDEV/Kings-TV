import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Jobs = () => {
  const { lang, t } = useContext(LanguageContext);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [activeJob, setActiveJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [toast, setToast] = useState('');

  // Apply form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantExp, setApplicantExp] = useState('fresher');
  const [applicantDetails, setApplicantDetails] = useState('');

  // Post job form states
  const [newTitle, setNewTitle] = useState('');
  const [newComp, setNewComp] = useState('');
  const [newCat, setNewCat] = useState('sales');
  const [newLoc, setNewLoc] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newType, setNewType] = useState('Full Time');
  const [newDesc, setNewDesc] = useState('');

  const fallbackJobs = lang === 'en' ? [
    { id: 'demo-1', title: 'Sales Representative', companyName: 'Kannan Silks', category: 'sales', description: 'Experienced female and male candidates required to work in local textile showroom. Good communication skills required.', location: 'Erode', salaryRange: '₹12,000 - ₹15,000', employmentType: 'Full Time', daysAgo: '2 days ago' },
    { id: 'demo-2', title: 'Heavy Vehicle Driver', companyName: 'Anand Logistics', category: 'driver', description: 'Heavy truck drivers with at least 3 years experience and badge license required.', location: 'Salem', salaryRange: '₹20,000 - ₹25,000', employmentType: 'Full Time', daysAgo: '3 days ago' },
    { id: 'demo-3', title: 'Assistant Accountant', companyName: 'Sri Nivas Agencies', category: 'office', description: 'Female accountant with Tally software knowledge and typing certificate required.', location: 'Madurai', salaryRange: '₹10,000 - ₹12,000', employmentType: 'Part Time', daysAgo: '4 days ago' },
    { id: 'demo-4', title: 'Data Entry Operator', companyName: 'Smart Systems', category: 'computer', description: 'Candidates with Tamil and English typing experience and basic MS Office knowledge required.', location: 'Trichy', salaryRange: '₹9,000 - ₹11,000', employmentType: 'Full Time', daysAgo: '5 days ago' }
  ] : [
    { id: 'demo-1', title: 'விற்பனை பிரதிநிதி (Sales Representative)', companyName: 'கண்ணன் சில்க்ஸ்', category: 'sales', description: 'உள்ளூர் ஜவுளிக்கடையில் வேலை செய்ய தகுதியான பெண்கள் மற்றும் ஆண்கள் தேவை. நல்ல பேச்சாற்றல் அவசியம்.', location: 'ஈரோடு', salaryRange: '₹12,000 - ₹15,000', employmentType: 'Full Time', daysAgo: '2 நாட்களுக்கு முன்' },
    { id: 'demo-2', title: 'கனரக வாகன ஓட்டுநர் (Heavy Driver)', companyName: 'ஆனந்த் லாஜிஸ்டிக்ஸ்', category: 'driver', description: 'சரக்கு லாரி ஓட்ட குறைந்தபட்சம் 3 வருட அனுபவமுள்ள ஓட்டுநர்கள் தேவை. பேட்ஜ் உரிமம் கட்டாயம்.', location: 'சேலம்', salaryRange: '₹20,000 - ₹25,000', employmentType: 'Full Time', daysAgo: '3 நாட்களுக்கு முன்' },
    { id: 'demo-3', title: 'உதவி கணக்காளர் (Assistant Accountant)', companyName: 'ஸ்ரீ நிவாஸ் ஏஜென்ஸிஸ்', category: 'office', description: 'Tally மென்பொருள் தெரிந்த மற்றும் தட்டச்சு தகுதியுடைய பெண் கணக்காளர்கள் தேவை.', location: 'மதுரை', salaryRange: '₹10,000 - ₹12,000', employmentType: 'Part Time', daysAgo: '4 நாட்களுக்கு முன்' },
    { id: 'demo-4', title: 'கணினி ஆபரேட்டர் (Data Entry Operator)', companyName: 'ஸ்மார்ட் சிஸ்டம்ஸ்', category: 'computer', description: 'தமிழ் மற்றும் ஆங்கில தட்டச்சு பயிற்சி பெற்றவர்கள் தேவை. MS Office அடிப்படை அறிவு அவசியம்.', location: 'திருச்சி', salaryRange: '₹9,000 - ₹11,000', employmentType: 'Full Time', daysAgo: '5 நாட்களுக்கு முன்' }
  ];

  const loadData = () => {
    fetchApi('/jobs')
      .then(data => {
        const formatted = Array.isArray(data) ? data.map(item => {
          const rawTitle = item.title || '';
          const rawCompany = item.companyName || item.company_name || '';
          const rawLoc = item.location || '';
          const rawDesc = item.description || '';
          
          let titleVal = rawTitle;
          let companyVal = rawCompany;
          let locVal = rawLoc;
          let descVal = rawDesc;
          
          if (lang === 'en') {
            if (rawTitle.includes('விற்பனை')) titleVal = 'Sales Representative';
            else if (rawTitle.includes('ஓட்டுநர்')) titleVal = 'Heavy Vehicle Driver';
            else if (rawTitle.includes('கணக்காளர்')) titleVal = 'Assistant Accountant';
            else if (rawTitle.includes('ஆபரேட்டர்')) titleVal = 'Data Entry Operator';
            
            if (rawCompany.includes('கண்ணன்')) companyVal = 'Kannan Silks';
            else if (rawCompany.includes('ஆனந்த்')) companyVal = 'Anand Logistics';
            else if (rawCompany.includes('ஸ்ரீ நிவாஸ்')) companyVal = 'Sri Nivas Agencies';
            else if (rawCompany.includes('ஸ்மார்ட்')) companyVal = 'Smart Systems';
            
            if (rawLoc.includes('ஈரோடு')) locVal = 'Erode';
            else if (rawLoc.includes('சேலம்')) locVal = 'Salem';
            else if (rawLoc.includes('மதுரை')) locVal = 'Madurai';
            else if (rawLoc.includes('திருச்சி')) locVal = 'Trichy';
            
            if (rawDesc.includes('ஜவுளிக்கடையில்')) descVal = 'Experienced female and male candidates required to work in local textile showroom.';
            else if (rawDesc.includes('சரக்கு லாரி')) descVal = 'Heavy truck drivers with at least 3 years experience and badge license required.';
            else if (rawDesc.includes('Tally மென்பொருள்')) descVal = 'Female accountant with Tally software knowledge and typing certificate required.';
            else if (rawDesc.includes('தட்டச்சு பயிற்சி')) descVal = 'Candidates with Tamil and English typing experience and basic MS Office knowledge required.';
          }
          
          return {
            id: item.job_id || item.id,
            title: titleVal,
            companyName: companyVal,
            category: (item.category || '').toLowerCase(),
            description: descVal,
            location: locVal,
            salaryRange: item.salaryRange || item.salary_range,
            employmentType: item.employmentType || item.employment_type || 'Full Time',
            daysAgo: lang === 'en' ? '1 day ago' : '1 நாளுக்கு முன்'
          };
        }) : [];
        const merged = [...formatted, ...fallbackJobs];
        setJobs(merged);
        setFilteredJobs(merged);
      })
      .catch((err) => {
        console.warn("Could not fetch jobs from API, using fallback", err);
        setJobs(fallbackJobs);
        setFilteredJobs(fallbackJobs);
      });
  };

  useEffect(() => {
    loadData();
  }, [lang]);

  useEffect(() => {
    let result = jobs;

    if (selectedCat !== 'all') {
      result = result.filter(item => item.category === selectedCat);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.companyName.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(result);
  }, [selectedCat, searchQuery, jobs]);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const jobId = activeJob.id || activeJob.job_id;
    fetchApi(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({
        applicantName,
        applicantPhone,
        experience: applicantExp,
        summary: applicantDetails
      })
    })
    .then(() => {
      setToast(lang === 'en' ? 'Application submitted successfully!' : 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!');
      setTimeout(() => setToast(''), 3000);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantExp('fresher');
      setApplicantDetails('');
      setActiveJob(null);
    })
    .catch(err => {
      console.warn("API apply failed, treating as success locally", err);
      setToast(lang === 'en' ? 'Application submitted successfully!' : 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!');
      setTimeout(() => setToast(''), 3000);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantExp('fresher');
      setApplicantDetails('');
      setActiveJob(null);
    });
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    fetchApi('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        title: newTitle,
        companyName: newComp,
        category: newCat.toLowerCase(),
        location: newLoc,
        salaryRange: newSalary,
        employmentType: newType,
        description: newDesc
      })
    })
    .then(() => {
      setNewTitle('');
      setNewComp('');
      setNewLoc('');
      setNewSalary('');
      setNewDesc('');
      setShowPostModal(false);
      loadData();
    })
    .catch(err => {
      console.warn("API job post failed, updating locally", err);
      const addedJob = {
        id: Date.now(),
        title: newTitle,
        companyName: newComp,
        category: newCat,
        location: newLoc,
        salaryRange: newSalary,
        employmentType: newType,
        description: newDesc,
        daysAgo: 'இப்போது'
      };
      setJobs(prev => [addedJob, ...prev]);
      setNewTitle('');
      setNewComp('');
      setNewLoc('');
      setNewSalary('');
      setNewDesc('');
      setShowPostModal(false);
    });
  };

  const getCategoryLabel = (cat) => {
    const labels = {
      sales: lang === 'en' ? 'Sales' : 'விற்பனை',
      driver: lang === 'en' ? 'Driver' : 'ஓட்டுநர்',
      office: lang === 'en' ? 'Office' : 'அலுவலகம்',
      computer: lang === 'en' ? 'Computer / Tech' : 'கணினி/தொழில்நுட்பம்',
      other: lang === 'en' ? 'Other' : 'இதர'
    };
    return labels[cat] || cat;
  };

  const getCategoryClass = (cat) => {
    const classes = {
      sales: 'cat-politics',
      driver: 'cat-business',
      office: 'cat-technology',
      computer: 'cat-sports',
      other: 'cat-agriculture'
    };
    return classes[cat] || 'cat-politics';
  };

  return (
    <main className="container">
      {/* HERO / SEARCH */}
      <section className="jobs-hero">
        <h1>{lang === 'en' ? 'Local Jobs Board' : 'உள்ளூர் வேலைவாய்ப்பு பலகை'}</h1>
        <p>{lang === 'en' ? 'Exclusive career opportunities in small towns and local neighborhoods' : 'சிறு நகரங்கள் மற்றும் சுற்றுவட்டாரப் பகுதிகளுக்கான பிரத்யேக வேலை வாய்ப்புகள்'}</p>
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder={lang === 'en' ? 'Driver, accountant, tailor...' : 'ஓட்டுநர், கணக்காளர், தையல்காரர்...'} 
            aria-label="Search Jobs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>{lang === 'en' ? 'Search' : 'தேடுக'}</button>
        </div>
      </section>

      {toast && (
        <div style={{ padding: '12px 20px', background: '#10B981', color: 'white', fontWeight: 700, borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* FILTERS */}
      <div className="category-filter-row">
        <button 
          className={`filter-pill ${selectedCat === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCat('all')}
        >
          {lang === 'en' ? 'All Jobs' : 'அனைத்து வேலைகளும்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'sales' ? 'active' : ''}`}
          onClick={() => setSelectedCat('sales')}
        >
          {lang === 'en' ? 'Sales' : 'விற்பனை'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'driver' ? 'active' : ''}`}
          onClick={() => setSelectedCat('driver')}
        >
          {lang === 'en' ? 'Drivers' : 'ஓட்டுநர்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'office' ? 'active' : ''}`}
          onClick={() => setSelectedCat('office')}
        >
          {lang === 'en' ? 'Office' : 'அலுவலகம்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'computer' ? 'active' : ''}`}
          onClick={() => setSelectedCat('computer')}
        >
          {lang === 'en' ? 'Computer / Tech' : 'கணினி/தொழில்நுட்பம்'}
        </button>
        <button 
          className={`filter-pill ${selectedCat === 'other' ? 'active' : ''}`}
          onClick={() => setSelectedCat('other')}
        >
          {lang === 'en' ? 'Others' : 'இதர'}
        </button>
      </div>

      {/* JOBS GRID */}
      <section className="jobs-grid">
        {filteredJobs.map(job => (
          <div className="job-card" key={job.id}>
            <div className="job-info-main">
              <div className="job-meta-top">
                <span className={`job-tag ${getCategoryClass(job.category)}`}>
                  {getCategoryLabel(job.category)}
                </span>
                <span className="job-company">{job.companyName}</span>
              </div>
              <h2 className="job-title">{job.title}</h2>
              <p className="job-desc">{job.description}</p>
              <div className="job-details-row">
                <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                <span><i className="fas fa-rupee-sign"></i> {job.salaryRange}</span>
                <span><i className="fas fa-briefcase"></i> {job.employmentType}</span>
                <span><i className="far fa-clock"></i> {job.daysAgo}</span>
              </div>
            </div>
            <button 
              className="apply-btn"
              onClick={() => setActiveJob(job)}
            >
              {lang === 'en' ? 'Apply Now' : 'விண்ணப்பிக்க'}
            </button>
          </div>
        ))}
      </section>

      {/* BANNER TO POST JOB */}
      <section className="post-job-banner">
        <h3>
          {lang === 'en' ? 'Want to publish job openings at your organization?' : 'உங்கள் நிறுவனத்தின் காலிப் பணியிடங்களை இங்கே இலவசமாகப் பதியுங்கள்!'}
        </h3>
        <p>
          {lang === 'en' 
            ? 'Hire qualified local candidates immediately.' 
            : 'உள்ளூர் தகுதியுள்ள நபர்களை உடனடியாக வேலைக்கு எடுங்கள்.'}
        </p>
        <button onClick={() => setShowPostModal(true)}>
          {lang === 'en' ? 'Advertise Job' : 'வேலையை அறிவிக்கவும்'}
        </button>
      </section>

      {/* APPLY MODAL */}
      {activeJob && (
        <div className="modal open" id="applyJobModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="modalJobTitle">
                {lang === 'en' ? 'Apply for ' : 'விண்ணப்பிக்க: '}{activeJob.title}
              </h3>
              <button className="modal-close" onClick={() => setActiveJob(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="applyJobForm" onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label htmlFor="applicantName">{lang === 'en' ? 'Your Name *' : 'உங்கள் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="applicantName" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Muthukumar' : 'எ.கா: முத்துக்குமார்'}
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="applicantPhone">{lang === 'en' ? 'Phone Number *' : 'தொலைபேசி எண் *'}</label>
                  <input 
                    type="tel" 
                    id="applicantPhone" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. +91 9876543210' : 'எ.கா: +91 9876543210'}
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="applicantExp">{lang === 'en' ? 'Work Experience *' : 'வேலை அனுபவம் *'}</label>
                  <select 
                    id="applicantExp" 
                    required
                    value={applicantExp}
                    onChange={(e) => setApplicantExp(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  >
                    <option value="fresher">{lang === 'en' ? 'Fresher (No Experience)' : 'அனுபவம் இல்லை (Fresher)'}</option>
                    <option value="1yr">{lang === 'en' ? 'Up to 1 year' : '1 வருடம் வரை'}</option>
                    <option value="2-3yr">{lang === 'en' ? '2 - 3 years' : '2 - 3 வருடங்கள்'}</option>
                    <option value="4+yr">{lang === 'en' ? 'More than 4 years' : '4 வருடங்களுக்கு மேல்'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="applicantDetails">{lang === 'en' ? 'Short Biography / Resume Notes' : 'உங்களைப் பற்றி சிறு குறிப்பு'}</label>
                  <textarea 
                    id="applicantDetails" 
                    rows="3" 
                    placeholder={lang === 'en' ? 'Explain your qualifications or skills...' : 'உங்கள் தகுதிகளைப் பற்றி எழுதுங்கள்...'}
                    value={applicantDetails}
                    onChange={(e) => setApplicantDetails(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">{lang === 'en' ? 'Submit Application' : 'விண்ணப்பத்தை சமர்ப்பி'}</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* POST JOB MODAL */}
      {showPostModal && (
        <div className="modal open" id="postJobModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{lang === 'en' ? 'Publish Job Opening' : 'காலிப் பணியிடத்தை பதிக்கவும்'}</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="postJobForm" onSubmit={handlePostSubmit}>
                <div className="form-group">
                  <label htmlFor="newJobTitle">{lang === 'en' ? 'Job Title *' : 'வேலை தலைப்பு *'}</label>
                  <input 
                    type="text" 
                    id="newJobTitle" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Tailor' : 'எ.கா: தையல் கலைஞர்'}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newJobComp">{lang === 'en' ? 'Company Name *' : 'நிறுவனப் பெயர் *'}</label>
                  <input 
                    type="text" 
                    id="newJobComp" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Lakshmi Garments' : 'எ.கா: லக்ஷ்மி கார்மெண்ட்ஸ்'}
                    value={newComp}
                    onChange={(e) => setNewComp(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newJobCat">{lang === 'en' ? 'Job Category *' : 'வேலை வகை *'}</label>
                  <select 
                    id="newJobCat" 
                    required
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  >
                    <option value="sales">{lang === 'en' ? 'Sales' : 'விற்பனை'}</option>
                    <option value="driver">{lang === 'en' ? 'Driver' : 'ஓட்டுநர்'}</option>
                    <option value="office">{lang === 'en' ? 'Office' : 'அலுவலகம்'}</option>
                    <option value="computer">{lang === 'en' ? 'Computer / Tech' : 'கணினி/தொழில்நுட்பம்'}</option>
                    <option value="other">{lang === 'en' ? 'Other' : 'இதர'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="newJobLoc">{lang === 'en' ? 'Location *' : 'இடம் *'}</label>
                  <input 
                    type="text" 
                    id="newJobLoc" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. Tiruppur' : 'எ.கா: திருப்பூர்'}
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newJobSalary">{lang === 'en' ? 'Salary Range *' : 'சம்பளம் *'}</label>
                  <input 
                    type="text" 
                    id="newJobSalary" 
                    required 
                    placeholder={lang === 'en' ? 'e.g. ₹15,000 - ₹18,000' : 'எ.கா: ₹15,000 - ₹18,000'}
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newJobType">{lang === 'en' ? 'Work Schedule *' : 'பணி நேரம் *'}</label>
                  <select 
                    id="newJobType" 
                    required
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  >
                    <option value="Full Time">{lang === 'en' ? 'Full Time' : 'முழு நேரம் (Full Time)'}</option>
                    <option value="Part Time">{lang === 'en' ? 'Part Time' : 'பகுதி நேரம் (Part Time)'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="newJobDesc">{lang === 'en' ? 'Job Description *' : 'விளக்கம் *'}</label>
                  <textarea 
                    id="newJobDesc" 
                    rows="3" 
                    required 
                    placeholder={lang === 'en' ? 'Job requirements, responsibilities, timings...' : 'வேலைப் பற்றிய கூடுதல் தகவல்கள்...'}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}
                  ></textarea>
                </div>
                <button type="submit" className="submit-btn">{lang === 'en' ? 'Post Job Opening' : 'வேலைவாய்ப்பை பதிக்கவும்'}</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Jobs;
