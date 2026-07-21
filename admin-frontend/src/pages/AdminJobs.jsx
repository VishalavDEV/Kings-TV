import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Applications sub-view state
  const [selectedJobForApps, setSelectedJobForApps] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [applyMethod, setApplyMethod] = useState('in-app');
  const [applyTarget, setApplyTarget] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState('pending');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/jobs');
      if (Array.isArray(data)) setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApprove = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${id}/approve`, { method: 'PUT' });
      setSuccessMsg('Job posting activated successfully.');
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to approve job posting.');
    }
  };

  const handleReject = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${id}/reject`, { method: 'PUT' });
      setSuccessMsg('Job posting rejected / closed.');
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to reject job posting.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${id}`, { method: 'DELETE' });
      setSuccessMsg('Job posting deleted.');
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to delete job.');
    }
  };

  const handleViewApplications = async (job) => {
    setSelectedJobForApps(job);
    setLoadingApps(true);
    try {
      const data = await fetchApi(`/admin/jobs/${job.id}/applications`);
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setTitle(job.title || '');
    setCompanyName(job.companyName || '');
    setCategoryName(job.categoryName || job.category || '');
    setLocation(job.location || '');
    setJobType(job.jobType || job.employmentType || 'full-time');
    setSalaryMin(job.salaryMin || '');
    setSalaryMax(job.salaryMax || '');
    setDescription(job.description || '');
    setApplyMethod(job.applyMethod || 'in-app');
    setApplyTarget(job.applyTarget || '');
    setExpiresAt(job.expiresAt ? job.expiresAt.substring(0, 16) : '');
    setStatus(job.status || 'pending');
    setShowForm(true);
    setSelectedJobForApps(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCompanyName('');
    setCategoryName('');
    setLocation('');
    setJobType('full-time');
    setSalaryMin('');
    setSalaryMax('');
    setDescription('');
    setApplyMethod('in-app');
    setApplyTarget('');
    setExpiresAt('');
    setStatus('pending');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const payload = {
      title,
      companyName,
      categoryName,
      category: categoryName,
      location,
      employmentType: jobType,
      jobType,
      salaryMin: parseFloat(salaryMin) || 0.0,
      salaryMax: parseFloat(salaryMax) || 0.0,
      description,
      applyMethod,
      applyTarget,
      expiresAt: expiresAt ? expiresAt + ":00" : null,
      status
    };

    try {
      if (editingId) {
        await fetchApi(`/admin/jobs/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Job posting updated successfully.');
      } else {
        await fetchApi('/admin/jobs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccessMsg('Job posting published successfully.');
      }
      resetForm();
      loadJobs();
    } catch (err) {
      setErrorMsg('Failed to save job posting.');
    }
  };

  return (
    <div className="admin-jobs-container">
      <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Jobs Board Manager</h1>
          <p className="subtitle">Moderate employer job vacancies, configure auto-expirations, and review in-app applications</p>
        </div>
        <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); setSelectedJobForApps(null); }}>
          {showForm ? 'Close Form' : '+ Add Job Posting'}
        </button>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="classified-ad-form" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <h3>{editingId ? 'Edit Job Posting' : 'Publish New Job Posting'}</h3>
          <div className="form-row">
            <div className="form-group half">
              <label>Job Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Company Name *</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Category (e.g. IT, Admin) *</label>
              <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Location *</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Chennai" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Job Type *</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div className="form-group half" style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <label>Salary Min (LPA)</label>
                <input type="number" step="0.1" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Salary Max (LPA)</label>
                <input type="number" step="0.1" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Apply Method *</label>
              <select value={applyMethod} onChange={(e) => setApplyMethod(e.target.value)}>
                <option value="in-app">In-App Form</option>
                <option value="email">Email</option>
                <option value="link">External Link</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Apply Target (Email address or redirect link)</label>
              <input type="text" value={applyTarget} onChange={(e) => setApplyTarget(e.target.value)} placeholder="e.g. hr@company.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Expiration Date & Time *</label>
              <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
            </div>
            <div className="form-group half">
              <label>Moderation Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending Review</option>
                <option value="active">Active (Published)</option>
                <option value="expired">Expired</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required></textarea>
          </div>

          <button type="submit" className="btn btn-primary">{editingId ? 'Update Posting' : 'Publish Job'}</button>
        </form>
      )}

      {selectedJobForApps && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Applications for: {selectedJobForApps.title} ({selectedJobForApps.companyName})</h3>
            <button className="action-btn delete-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedJobForApps(null)}>Close sub-view</button>
          </div>
          {loadingApps ? (
            <p>Syncing applications list...</p>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table" style={{ background: 'white' }}>
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Resume File</th>
                    <th>Cover Note</th>
                    <th>Date Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table" style={{ padding: '20px' }}>No candidates have applied for this job yet.</td>
                    </tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id}>
                        <td><strong>{app.applicantName}</strong></td>
                        <td>{app.applicantEmail || 'N/A'}</td>
                        <td>{app.applicantPhone}</td>
                        <td>
                          {app.resumeFile ? (
                            <a href={app.resumeFile} target="_blank" rel="noopener noreferrer" style={{ color: '#B3732A', fontWeight: '700' }}>
                              <i className="fa-solid fa-file-pdf"></i> View Resume
                            </a>
                          ) : (
                            <span style={{ color: '#64748b' }}>No file</span>
                          )}
                        </td>
                        <td><p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-all' }}>{app.coverNote || 'N/A'}</p></td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading jobs...</div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Applicants</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table">No job postings registered.</td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.categoryName || job.category}</div>
                    </td>
                    <td>{job.companyName}</td>
                    <td>{job.location || 'Tamil Nadu'}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{job.jobType || job.employmentType}</span></td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: job.status === 'active' ? '#dcfce7' : job.status === 'expired' ? '#fee2e2' : '#fef3c7',
                        color: job.status === 'active' ? '#166534' : job.status === 'expired' ? '#991b1b' : '#854d0e'
                      }}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button className="action-btn edit-btn" style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1' }} onClick={() => handleViewApplications(job)}>
                        <i className="fa-solid fa-users"></i> {job.applicantCount || 0} Apps
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {job.status === 'pending' && (
                          <>
                            <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#16a34a' }} onClick={() => handleApprove(job.id)}>Approve</button>
                            <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#dc2626' }} onClick={() => handleReject(job.id)}>Reject</button>
                          </>
                        )}
                        <button className="action-btn edit-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleEdit(job)}>Edit</button>
                        <button className="action-btn delete-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleDelete(job.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
