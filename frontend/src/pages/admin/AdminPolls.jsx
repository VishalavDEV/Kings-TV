import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminPolls.css';

const AdminPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Results Modal State
  const [selectedPollResults, setSelectedPollResults] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    language: 'ta',
    votePermission: 'ALL_USERS',
    status: 'ACTIVE',
    options: ['', '']
  });

  const loadPolls = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/polls');
      if (Array.isArray(res)) {
        setPolls(res);
      }
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOptionInput = () => {
    setFormData((prev) => ({ ...prev, options: [...prev.options, ''] }));
  };

  const removeOptionInput = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, idx) => idx !== index);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const resetForm = () => {
    setFormData({
      question: '',
      language: 'ta',
      votePermission: 'ALL_USERS',
      status: 'ACTIVE',
      options: ['', '']
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.question.trim()) {
      setErrorMsg('Poll question is required');
      return;
    }

    const validOptions = formData.options.filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) {
      setErrorMsg('At least 2 poll options are required');
      return;
    }

    try {
      const res = await fetchApi('/admin/polls', {
        method: 'POST',
        body: JSON.stringify({ ...formData, options: validOptions })
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Poll created successfully!');
        resetForm();
        loadPolls();
      }
    } catch (err) {
      setErrorMsg('Failed to create poll');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opinion poll?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/polls/${id}`, { method: 'DELETE' });
      setSuccessMsg('Poll deleted successfully');
      loadPolls();
    } catch (err) {
      setErrorMsg('Failed to delete poll');
    }
  };

  const handleViewResults = async (id) => {
    try {
      const res = await fetchApi(`/admin/polls/${id}/results`);
      if (res) {
        setSelectedPollResults(res);
      }
    } catch (err) {
      console.error('Failed to load poll results:', err);
    }
  };

  return (
    <div className="admin-polls-container">
      <div className="pages-header">
        <h1>Opinion Polls & Survey Results</h1>
        <p className="subtitle">Create interactive voting polls and review real-time audience voting counts</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Create Poll form */}
        <div className="form-panel">
          <h2>Create New Opinion Poll</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="question">Poll Question *</label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="e.g. Which topic would you like to see covered?"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="language">Language</label>
                <select id="language" name="language" value={formData.language} onChange={handleInputChange}>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="form-group half">
                <label htmlFor="status">Poll Status</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive / Closed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="votePermission">Who can vote?</label>
              <select id="votePermission" name="votePermission" value={formData.votePermission} onChange={handleInputChange}>
                <option value="ALL_USERS">All Audience Visitors</option>
                <option value="REGISTERED_ONLY">Registered Members Only</option>
              </select>
            </div>

            <div className="form-group">
              <label>Poll Options (Choices) *</label>
              {formData.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`Option #${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                  />
                  {formData.options.length > 2 && (
                    <button type="button" className="btn btn-secondary px-3" onClick={() => removeOptionInput(idx)}>
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary text-sm w-full mt-1" onClick={addOptionInput}>
                + Add Another Option
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-3">
              Publish Poll
            </button>
          </form>
        </div>

        {/* Right: Polls Table */}
        <div className="table-panel">
          <h2>Active Polls ({polls.length})</h2>
          {loading ? (
            <div className="loading-state">Loading polls...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Language</th>
                    <th>Permission</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {polls.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">
                        No polls created yet.
                      </td>
                    </tr>
                  ) : (
                    polls.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <span className="font-semibold block text-slate-800">{p.question}</span>
                          <span className="text-xs text-gray-500">{(p.options || []).length} Choices</span>
                        </td>
                        <td>
                          <span className={`lang-badge ${p.language}`}>{p.language === 'en' ? 'English' : 'Tamil'}</span>
                        </td>
                        <td>
                          <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                            {p.votePermission}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${p.status ? p.status.toLowerCase() : 'active'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="action-btn edit-btn"
                              onClick={() => handleViewResults(p.id)}
                            >
                              <i className="fa-solid fa-chart-column"></i> Results
                            </button>
                            <button type="button" className="action-btn delete-btn" onClick={() => handleDelete(p.id)}>
                              <i className="fa-solid fa-trash"></i>
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
      </div>

      {/* Results Bar Chart Modal */}
      {selectedPollResults && (
        <div className="modal-backdrop">
          <div className="modal-content-box">
            <div className="modal-header">
              <h2>Poll Voting Results</h2>
              <button className="close-btn" onClick={() => setSelectedPollResults(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedPollResults.question}</h3>
              <p className="text-sm text-gray-500 mb-4">Total Votes Count: {selectedPollResults.totalVotes}</p>

              <div className="results-bars-list">
                {(selectedPollResults.options || []).map((opt) => {
                  const votes = opt.voteCount || 0;
                  const total = selectedPollResults.totalVotes || 1;
                  const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
                  return (
                    <div key={opt.id} className="option-result-item">
                      <div className="flex justify-between text-sm font-semibold mb-1 text-slate-700">
                        <span>{opt.optionText}</span>
                        <span>
                          {votes} votes ({percent}%)
                        </span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPollResults(null)}>
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
