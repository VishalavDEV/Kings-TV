import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminPolls.css';

const AdminPolls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Filtering state
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [filterLang, setFilterLang] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Results Modal State
  const [selectedPollResults, setSelectedPollResults] = useState(null);

  // Form Modal overlay states
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    language: 'ta',
    permission: 'ALL_USERS',
    status: 'active',
    options: [
      { optionText: '', id: null },
      { optionText: '', id: null }
    ]
  });

  const loadPolls = async (page = 0) => {
    setLoading(true);
    setErrorMsg('');
    try {
      let query = `/polls?page=${page}&size=${pageSize}`;
      if (filterLang) query += `&language=${filterLang}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetchApi(query);
      if (res && res.content) {
        setPolls(res.content);
        setTotalCount(res.totalElements);
        setTotalPages(res.totalPages);
        setCurrentPage(res.number);
      } else {
        setPolls([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load active polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls(0);
  }, [pageSize, filterLang]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPolls(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionTextChange = (index, val) => {
    const newOptions = [...formData.options];
    newOptions[index].optionText = val;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOptionInput = () => {
    if (formData.options.length >= 6) return;
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { optionText: '', id: null }]
    }));
  };

  const removeOptionInput = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, idx) => idx !== index);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      question: '',
      language: 'ta',
      permission: 'ALL_USERS',
      status: 'active',
      options: [
        { optionText: '', id: null },
        { optionText: '', id: null }
      ]
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const openEditModal = (poll) => {
    setIsEditMode(true);
    setEditingId(poll.id);
    setFormData({
      question: poll.question || '',
      language: poll.language || 'ta',
      permission: poll.permission || 'ALL_USERS',
      status: poll.status || 'active',
      options: (poll.options && poll.options.length > 0)
        ? poll.options.map(o => ({ optionText: o.optionText, id: o.id, voteCount: o.voteCount }))
        : [
            { optionText: '', id: null },
            { optionText: '', id: null }
          ]
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const submitPollForm = async (confirmDelete = false) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.question.trim()) {
      setErrorMsg('Poll question is required.');
      return;
    }

    const filledOptions = formData.options.filter(o => o.optionText.trim() !== '');
    if (filledOptions.length < 2) {
      setErrorMsg('At least 2 poll options are required.');
      return;
    }

    try {
      const payload = {
        question: formData.question,
        language: formData.language,
        permission: formData.permission,
        status: formData.status,
        options: filledOptions
      };

      let res;
      if (isEditMode) {
        res = await fetchApi(`/polls/${editingId}?confirmOptionDelete=${confirmDelete}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetchApi('/polls', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.error === 'CONFIRM_DELETE') {
        const accept = window.confirm(res.message || 'Some deleted choices have active votes. Proceeding will wipe them out. Confirm?');
        if (accept) {
          // Retry submission with confirmation flag = true
          await submitPollForm(true);
        }
      } else if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(isEditMode ? 'Poll updated successfully!' : 'Poll published successfully!');
        setTimeout(() => {
          setShowModal(false);
          loadPolls(currentPage);
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save poll.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitPollForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opinion poll?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/polls/${id}`, { method: 'DELETE' });
      setSuccessMsg('Poll deleted successfully');
      loadPolls(currentPage);
    } catch (err) {
      setErrorMsg('Failed to delete poll');
    }
  };

  const handleViewResults = async (id) => {
    try {
      const res = await fetchApi(`/polls/${id}/results`);
      if (res) {
        setSelectedPollResults(res);
      }
    } catch (err) {
      console.error('Failed to load poll results:', err);
    }
  };

  return (
    <div className="admin-polls-container">
      <div className="posts-header">
        <div>
          <h1>Opinion Polls & Survey Results</h1>
          <p className="subtitle">Displaying Y to Z of {totalCount} matching polls</p>
        </div>
        <div className="action-buttons-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add Poll
          </button>
        </div>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {/* Filter Row */}
      <form onSubmit={handleSearchSubmit} className="posts-filter-bar">
        <div className="filter-item">
          <label>Show</label>
          <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
            <option value="15">15 entries</option>
            <option value="25">25 entries</option>
            <option value="50">50 entries</option>
            <option value="100">100 entries</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Language</label>
          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
            <option value="">All Languages</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="filter-item flex-grow">
          <label>Search Question</label>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search opinion questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <i className="fa-solid fa-magnifying-glass"></i> Filter
            </button>
          </div>
        </div>
      </form>

      {/* Polls Table */}
      {loading ? (
        <div className="loading-state">Loading opinion polls...</div>
      ) : (
        <div className="posts-table-panel">
          <div className="table-wrapper">
            <table className="posts-table">
              <thead>
                <tr>
                  <th width="60">ID</th>
                  <th>Poll Question</th>
                  <th>Language</th>
                  <th>Permission</th>
                  <th>Status</th>
                  <th>Votes (Total)</th>
                  <th>Date Added</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {polls.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table">No matching opinion polls found.</td>
                  </tr>
                ) : (
                  polls.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>
                        <span className="font-semibold block text-slate-800">{p.question}</span>
                        <span className="text-xs text-gray-500">{(p.options || []).length} choices</span>
                      </td>
                      <td>
                        <span className={`lang-badge ${p.language}`}>
                          {p.language === 'en' ? 'English' : 'Tamil'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-widget-type" style={{ padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>
                          {p.permission === 'ALL_USERS' ? 'All Users Can Vote' : (p.permission === 'REGISTERED_ONLY' ? 'Registered Only' : 'Guests Only')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${p.status === 'active' ? 'published' : 'draft'}`}>
                          {p.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold text-slate-800">{p.voteCount || 0}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-500">
                          {p.createdAt ? p.createdAt.substring(0, 10) : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button className="action-btn edit-btn" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }} onClick={() => handleViewResults(p.id)}>
                            <i className="fa-solid fa-chart-column"></i> Results
                          </button>
                          <button className="action-btn edit-btn" onClick={() => openEditModal(p)}>
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(p.id)}>
                            <i className="fa-solid fa-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            <span className="text-sm text-slate-500 font-medium">
              Showing {polls.length > 0 ? (currentPage * pageSize + 1) : 0} to {currentPage * pageSize + polls.length} of {totalCount} entries
            </span>
            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  disabled={currentPage === 0} 
                  onClick={() => loadPolls(currentPage - 1)}
                  className="pag-btn"
                >
                  Previous
                </button>
                <span className="page-indicator" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>
                  {currentPage + 1} / {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages - 1} 
                  onClick={() => loadPolls(currentPage + 1)}
                  className="pag-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Modal Add/Edit form */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>{isEditMode ? `Edit Poll #${editingId}` : 'Create New Poll'}</h2>
              <button className="close-modal-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="e.g. Do you support the new budget allocations?"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Language *</label>
                  <select name="language" value={formData.language} onChange={handleInputChange}>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Permission select</label>
                  <select name="permission" value={formData.permission} onChange={handleInputChange}>
                    <option value="ALL_USERS">All Users Can Vote</option>
                    <option value="REGISTERED_ONLY">Registered Users Only</option>
                    <option value="GUESTS_ONLY">Guests Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Poll Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active (Accepting Votes)</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Option Choices (Min 2, Max 6) *</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={`Choice #${idx + 1}`}
                      value={opt.optionText}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      required={idx < 2}
                      style={{ flexGrow: 1 }}
                    />
                    {formData.options.length > 2 && (
                      <button 
                        type="button" 
                        className="btn btn-secondary px-3" 
                        onClick={() => removeOptionInput(idx)}
                        style={{ border: '1px solid #cbd5e1', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', color: '#dc2626' }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                ))}
                {formData.options.length < 6 && (
                  <button 
                    type="button" 
                    className="btn btn-secondary w-full" 
                    onClick={addOptionInput}
                    style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#475569', fontSize: '0.8rem', padding: '0.4rem' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add Choice Option
                  </button>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isEditMode ? 'Save Changes' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedPollResults && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>Poll Voting Results</h2>
              <button className="close-modal-btn" onClick={() => setSelectedPollResults(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                {selectedPollResults.question}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Total Votes: <strong>{selectedPollResults.totalVotes || 0}</strong>
              </p>

              <div className="results-bars-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(selectedPollResults.options || []).map((opt) => {
                  const votes = opt.voteCount || 0;
                  const total = selectedPollResults.totalVotes || 1;
                  const percent = total > 0 ? Math.round((votes / total) * 100) : 0;
                  return (
                    <div key={opt.id} className="option-result-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>
                        <span>{opt.optionText}</span>
                        <span>{votes} votes ({percent}%)</span>
                      </div>
                      <div className="bar-track" style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div className="bar-fill" style={{ background: '#2563eb', height: '100%', width: `${percent}%`, borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedPollResults(null)}>Close Results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
