import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminJobs.css';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Queue filtering status
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Job for inspection
  const [selectedJob, setSelectedJob] = useState(null);

  // Applications listing state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [viewingAppsForId, setViewingAppsForId] = useState(null);

  // Reject / Request More Info Prompt States
  const [promptMode, setPromptMode] = useState(null); // 'reject' or 'more-info'
  const [promptText, setPromptText] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/jobs');
      if (Array.isArray(data)) setJobs(data);
    } catch (e) {
      console.error("Could not load jobs queue", e);
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
      setSuccessMsg('Job posting approved and live.');
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob(prev => ({ ...prev, status: 'active' }));
      }
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to approve job posting.');
    }
  };

  const handleRejectSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${selectedJob.id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason: promptText })
      });
      setSuccessMsg('Job posting rejected.');
      setSelectedJob(prev => ({ ...prev, status: 'closed', rejectionReason: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to reject job posting.');
    }
  };

  const handleMoreInfoSubmit = async () => {
    if (!promptText.trim()) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${selectedJob.id}/more-info`, {
        method: 'PUT',
        body: JSON.stringify({ note: promptText })
      });
      setSuccessMsg('Request for more information sent.');
      setSelectedJob(prev => ({ ...prev, status: 'pending', moreInfoNote: promptText }));
      setPromptMode(null);
      setPromptText('');
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to request more info.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/jobs/${id}`, { method: 'DELETE' });
      setSuccessMsg('Job posting deleted.');
      setSelectedJob(null);
      setViewingAppsForId(null);
      loadJobs();
    } catch (e) {
      setErrorMsg('Failed to delete job.');
    }
  };

  const handleViewApplications = async (jobId) => {
    setViewingAppsForId(jobId);
    setLoadingApps(true);
    try {
      // Endpoint returns [{ application, compatibilityScore }]
      const data = await fetchApi(`/admin/jobs/${jobId}/applications`);
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (e) {
      console.error("Could not load applications", e);
    } finally {
      setLoadingApps(false);
    }
  };

  const filteredJobs = jobs.filter(item => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return item.status === 'pending';
    if (statusFilter === 'approved') return item.status === 'active';
    if (statusFilter === 'rejected') return item.status === 'closed';
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="admin-jobs-container">
      <div className="posts-header">
        <h1>Jobs Board Moderation Queue</h1>
        <p className="subtitle">Review employer job openings, request additional specifications, and inspect applicant profiles</p>
      </div>

      {successMsg && <div className="alert-banner success"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="alert-banner error"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="jobs-layout-grid" style={{ display: 'grid', gridTemplateColumns: selectedJob || viewingAppsForId ? '3fr 2fr' : '1fr', gap: '20px' }}>
        {/* Main List Column */}
        <div className="jobs-list-col">
          <div className="filters-container" style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#475569' }}>Filter Queue:</span>
            {['all', 'pending', 'approved', 'rejected'].map(st => (
              <button
                key={st}
                className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? '#B3732A' : '#f1f5f9',
                  color: statusFilter === st ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'uppercase'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Loading job openings...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Job Role</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Date Limit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">No job postings found in this queue.</td>
                    </tr>
                  ) : (
                    filteredJobs.map(job => (
                      <tr
                        key={job.id}
                        className={`job-row ${selectedJob?.id === job.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedJob(job); setViewingAppsForId(null); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{job.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.categoryName || job.category || 'General'}</div>
                        </td>
                        <td>{job.companyName}</td>
                        <td>{job.location || 'Tamil Nadu'}</td>
                        <td>
                          <span className={`status-badge ${job.status}`}>
                            {job.status === 'active' ? 'APPROVED' : job.status === 'closed' ? 'REJECTED' : job.status}
                          </span>
                        </td>
                        <td>{job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => { setSelectedJob(null); handleViewApplications(job.id); }}
                            >
                              <i className="fa-solid fa-users"></i> Apps ({job.applicantCount || 0})
                            </button>
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

        {/* Inspection Panel Column */}
        {selectedJob && (
          <div className="jobs-inspection-col">
            <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Inspect Job Role</h3>
                <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedJob(null)}>×</button>
              </div>

              <div className="detail-body">
                <h4 style={{ margin: '0 0 4px 0' }}>{selectedJob.title}</h4>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{selectedJob.companyName} • {selectedJob.location}</div>

                <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#1e293b' }}>Description</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>
                </div>

                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Employment Type</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b', textTransform: 'capitalize' }}>{selectedJob.jobType || selectedJob.employmentType || 'Full-Time'}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Salary (LPA)</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#B3732A' }}>
                      {selectedJob.salaryMin && selectedJob.salaryMax ? `₹ ${selectedJob.salaryMin} - ${selectedJob.salaryMax} LPA` : 'Not Specified'}
                    </strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Apply Mode</span>
                    <strong className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{selectedJob.applyMethod}</strong>
                  </div>
                  <div className="detail-item">
                    <span className="label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Expiration Limit</span>
                    <span className="value" style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      {selectedJob.expiresAt ? new Date(selectedJob.expiresAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedJob.status === 'closed' && selectedJob.rejectionReason && (
                  <div className="detail-section reason-alert reject" style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#991b1b', fontSize: '0.85rem' }}>Rejection Reason</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d' }}>{selectedJob.rejectionReason}</p>
                  </div>
                )}

                {selectedJob.moreInfoNote && (
                  <div className="detail-section reason-alert info" style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '1rem' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#1e3a8a', fontSize: '0.85rem' }}>Request Note (More Info)</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#172554' }}>{selectedJob.moreInfoNote}</p>
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {selectedJob.status !== 'active' && (
                    <button className="btn btn-approve" onClick={() => handleApprove(selectedJob.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      Approve & Publish
                    </button>
                  )}
                  <button className="btn btn-reject" onClick={() => setPromptMode('reject')} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Reject
                  </button>
                  <button className="btn btn-info" onClick={() => setPromptMode('more-info')} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Request More Info
                  </button>
                  <button className="btn btn-delete" onClick={() => handleDelete(selectedJob.id)} style={{ background: '#475569', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                </div>

                {promptMode && (
                  <div className="prompt-overlay" style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{promptMode === 'reject' ? 'Provide Rejection Reason' : 'Provide Request More Info Note'}</h4>
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Type details..."
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => { setPromptMode(null); setPromptText(''); }} style={{ background: '#e2e8f0', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      <button className="btn btn-primary" onClick={promptMode === 'reject' ? handleRejectSubmit : handleMoreInfoSubmit} style={{ background: '#B3732A', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Applications View Panel */}
          {viewingAppsForId && (
            <div className="jobs-applications-col">
              <div className="card detail-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>In-App Candidates</h3>
                  <button className="close-btn" style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setViewingAppsForId(null)}>×</button>
                </div>

                <div className="detail-body">
                  {loadingApps ? (
                    <div>Syncing applications list...</div>
                  ) : applications.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No candidates have applied for this job opening yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                      {applications.map(item => {
                        const app = item.application;
                        const score = item.compatibilityScore;
                        return (
                          <div key={app.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <div>
                                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem' }}>{app.applicantName}</h4>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.applicantEmail} {'\u2022'} {app.applicantPhone}</div>
                              </div>

                              {/* Compatibility Score badge */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '800',
                                  color: getScoreColor(score),
                                  background: `${getScoreColor(score)}15`,
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  border: `1px solid ${getScoreColor(score)}30`
                                }}>
                                  {score}% MATCH
                                </span>
                              </div>
                            </div>

                            <p style={{ margin: '6px 0', fontSize: '0.8rem', color: '#475569' }}>
                              <strong>Experience:</strong> {app.experience || 'Not listed'}
                            </p>
                            {app.coverNote && (
                              <p style={{ margin: '6px 0', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', background: '#ffffff', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                "{app.coverNote}"
                              </p>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.75rem' }}>
                              <span style={{ color: '#94a3b8' }}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                              {app.resumeFile && (
                                <a href={app.resumeFile} target="_blank" rel="noreferrer" style={{ color: '#B3732A', fontWeight: '800', textDecoration: 'none' }}>
                                  <i className="fa-solid fa-file-pdf"></i> Resume Document
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminJobs;
