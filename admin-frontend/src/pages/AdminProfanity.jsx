import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminProfanity.css';

const AdminProfanity = () => {
  const [dictionary, setDictionary] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTerm, setNewTerm] = useState('');
  const [newLang, setNewLang] = useState('ALL');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadDictionary = async () => {
    setLoading(true);
    try {
      const [words, reports] = await Promise.all([
        fetchApi('/admin/profanity/dictionary'),
        fetchApi('/admin/profanity/violations?size=15')
      ]);
      if (Array.isArray(words)) setDictionary(words);
      if (reports && Array.isArray(reports.violations)) setViolations(reports.violations);
    } catch (e) {
      console.error('Failed to load profanity records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDictionary();
  }, []);

  const handleAddTerm = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!newTerm.trim()) return;

    try {
      const res = await fetchApi('/admin/profanity/dictionary', {
        method: 'POST',
        body: JSON.stringify({ term: newTerm.trim(), language: newLang })
      });
      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Banned term '${newTerm}' added successfully.`);
        setNewTerm('');
        loadDictionary();
      }
    } catch (err) {
      setErrorMsg('Failed to add term to profanity filter.');
    }
  };

  const handleDeleteTerm = async (id, term) => {
    if (!window.confirm(`Are you sure you want to remove '${term}' from the profanity filter?`)) return;
    try {
      await fetchApi(`/admin/profanity/dictionary/${id}`, { method: 'DELETE' });
      setSuccessMsg(`Banned term '${term}' removed.`);
      loadDictionary();
    } catch (e) {
      setErrorMsg('Failed to remove term.');
    }
  };

  const handleReviewViolation = async (id, status) => {
    try {
      await fetchApi(`/admin/profanity/violations/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes: 'Reviewed and processed by moderator' })
      });
      setSuccessMsg('Flagged violation review status updated.');
      loadDictionary();
    } catch (e) {
      setErrorMsg('Failed to review violation.');
    }
  };

  return (
    <div className="admin-profanity-container">
      <div className="posts-header">
        <h1>Profanity Dictionary & Moderation</h1>
        <p className="subtitle">Manage blacklisted keywords and inspect flagged content violations</p>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      <div className="split-view-layout">
        {/* Dictionary CRUD */}
        <div className="form-panel">
          <h2>Dictionary Terms ({dictionary.length})</h2>
          <form onSubmit={handleAddTerm} className="category-form" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label>Add Prohibited Term</label>
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="e.g. offensive_word"
                required
              />
            </div>
            <div className="form-group">
              <label>Language Context</label>
              <select value={newLang} onChange={(e) => setNewLang(e.target.value)}>
                <option value="ALL">All Languages</option>
                <option value="en">English Only</option>
                <option value="ta">Tamil Only</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full">Add Banned Word</button>
          </form>

          {loading ? (
            <div className="loading-state">Loading filter words...</div>
          ) : (
            <div className="dictionary-terms-list">
              {dictionary.map(word => (
                <div className="dictionary-term-pill" key={word.id}>
                  <span>{word.term} <small>({word.language})</small></span>
                  <button type="button" onClick={() => handleDeleteTerm(word.id, word.term)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
              {dictionary.length === 0 && <p className="text-slate-400 text-xs">No prohibited terms added yet.</p>}
            </div>
          )}
        </div>

        {/* Violations reports */}
        <div className="table-panel">
          <h2>Flagged Content Queue</h2>
          {loading ? (
            <div className="loading-state">Loading violations...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Target Type</th>
                    <th>Post Name</th>
                    <th>Matched Words</th>
                    <th>Publisher</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">No profanity violations flagged yet.</td>
                    </tr>
                  ) : (
                    violations.map(v => (
                      <tr key={v.id}>
                        <td><span className="text-xs font-mono">{v.contentType}</span></td>
                        <td><strong>{v.contentTitle || 'Untitled'}</strong></td>
                        <td><code className="text-red-600 font-bold">{v.matchedTerms}</code></td>
                        <td>{v.authorEmail || 'Guest Reader'}</td>
                        <td><span className={`status-badge ${v.status.toLowerCase()}`}>{v.status}</span></td>
                        <td>
                          {v.status === 'PENDING' ? (
                            <div className="action-buttons-cell" style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleReviewViolation(v.id, 'APPROVED')}
                                style={{ background: '#dcfce7', color: '#15803d' }}
                              >
                                Approve
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleReviewViolation(v.id, 'REJECTED')}
                                style={{ background: '#fee2e2', color: '#b91c1c' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfanity;
