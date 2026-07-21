import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminContactMessages.css';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/contact-messages');
      if (Array.isArray(res)) {
        setMessages(res);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message inquiry?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await fetchApi(`/admin/contact-messages/${id}`, { method: 'DELETE' });
      setSuccessMsg('Contact message deleted');
      loadMessages();
    } catch (err) {
      setErrorMsg('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.subject || '').toLowerCase().includes(term) ||
      (m.message || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-contacts-container">
      <div className="pages-header">
        <h1>Latest Contact Messages & Inquiries</h1>
        <p className="subtitle">Review customer inquiry notes, feedback messages, and support submissions</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="table-panel">
        <div className="table-header-controls">
          <h2>Contact Messages ({filteredMessages.length})</h2>
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search sender name, email, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading contact inquiries...</div>
        ) : (
          <div className="table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th width="60">ID</th>
                  <th>Sender Info</th>
                  <th>Subject</th>
                  <th>Message Detail</th>
                  <th>Received Date</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      No contact messages found.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((m) => (
                    <tr key={m.id}>
                      <td>#{m.id}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{m.name}</span>
                          <span className="text-xs text-blue-600 font-mono">{m.email}</span>
                          {m.phone && <span className="text-xs text-gray-500">{m.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-slate-700">{m.subject || 'General Inquiry'}</span>
                      </td>
                      <td>
                        <div className="max-w-md text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {m.message}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(m.id)}
                            title="Delete Inquiry"
                          >
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
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;
