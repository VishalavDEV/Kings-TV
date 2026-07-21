import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminRfq.css';

const AdminRfq = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Quotes sub-view state
  const [selectedRfqForQuotes, setSelectedRfqForQuotes] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const loadRfqs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/rfq');
      if (Array.isArray(data)) setRfqs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const handleCloseRfq = async (id) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/rfq/${id}/close`, { method: 'PUT' });
      setSuccessMsg('RFQ request closed successfully.');
      loadRfqs();
    } catch (e) {
      setErrorMsg('Failed to close RFQ.');
    }
  };

  const handleDeleteRfq = async (id) => {
    if (!window.confirm("Are you sure you want to delete this RFQ request?")) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await fetchApi(`/admin/rfq/${id}`, { method: 'DELETE' });
      setSuccessMsg('RFQ deleted successfully.');
      loadRfqs();
    } catch (e) {
      setErrorMsg('Failed to delete RFQ.');
    }
  };

  const handleViewQuotes = async (rfq) => {
    setSelectedRfqForQuotes(rfq);
    setLoadingQuotes(true);
    try {
      const data = await fetchApi(`/admin/rfq/${rfq.id}/quotes`);
      if (Array.isArray(data)) {
        setQuotes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuotes(false);
    }
  };

  return (
    <div className="admin-rfq-container">
      <div className="posts-header">
        <h1>RFQ Requirement Moderation</h1>
        <p className="subtitle">Review buyer Request-For-Quotes, manage active bid submissions, and close matched requests</p>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {selectedRfqForQuotes && (
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Quotations Submitted for: {selectedRfqForQuotes.productOrService || selectedRfqForQuotes.title}</h3>
            <button className="action-btn delete-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedRfqForQuotes(null)}>Close Quotes</button>
          </div>
          {loadingQuotes ? (
            <p>Fetching quotes list...</p>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table" style={{ background: 'white' }}>
                <thead>
                  <tr>
                    <th>Quote ID</th>
                    <th>Seller Business ID</th>
                    <th>Quoted Price</th>
                    <th>Proposal Message</th>
                    <th>Status</th>
                    <th>Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table" style={{ padding: '20px' }}>No quotes submitted by merchants for this requirement yet.</td>
                    </tr>
                  ) : (
                    quotes.map(q => (
                      <tr key={q.id}>
                        <td><code>QUOTE-{q.id}</code></td>
                        <td>Merchant Business: #{q.sellerBusinessId || q.businessId}</td>
                        <td><strong style={{ color: '#16a34a' }}>₹{q.quotedPrice}</strong></td>
                        <td><p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>{q.notes || q.message || 'N/A'}</p></td>
                        <td>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: q.status === 'accepted' ? '#dcfce7' : q.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: q.status === 'accepted' ? '#166534' : q.status === 'rejected' ? '#991b1b' : '#854d0e'
                          }}>
                            {q.status}
                          </span>
                        </td>
                        <td>{new Date(q.createdAt).toLocaleDateString()}</td>
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
        <div className="loading-state">Syncing RFQ listings...</div>
      ) : (
        <div className="table-wrapper">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Product / Service</th>
                <th>Buyer Name</th>
                <th>Category</th>
                <th>Quotes Count</th>
                <th>Location</th>
                <th>Status</th>
                <th>Date Posted</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table">No RFQ requirements registered.</td>
                </tr>
              ) : (
                rfqs.map(item => {
                  const r = item.rfq;
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.productOrService || r.title}</strong>
                        {r.budgetMin && (
                          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>Budget: ₹{r.budgetMin} - {r.budgetMax}</div>
                        )}
                      </td>
                      <td>
                        <strong>{r.buyerName || 'Anonymous Guest'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.buyerContact || 'N/A'}</div>
                      </td>
                      <td>{r.category}</td>
                      <td>
                        <button className="action-btn edit-btn" style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534' }} onClick={() => handleViewQuotes(r)}>
                          <i className="fa-solid fa-file-invoice-dollar"></i> {item.quotesCount || 0} Quotes
                        </button>
                      </td>
                      <td><i className="fa-solid fa-location-dot"></i> {r.location || 'Tamil Nadu'}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: r.status === 'open' ? '#dcfce7' : '#fee2e2',
                          color: r.status === 'open' ? '#166534' : '#991b1b'
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status === 'open' && (
                            <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#dc2626' }} onClick={() => handleCloseRfq(r.id)}>Close RFQ</button>
                          )}
                          <button className="action-btn delete-btn" style={{ fontSize: '0.75rem' }} onClick={() => handleDeleteRfq(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRfq;
