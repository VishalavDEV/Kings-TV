import React, { useState, useEffect } from 'react';
import { Activity, Search, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page,
        size: 20
      });
      if (roleFilter) params.append('role', roleFilter);
      if (actionFilter) params.append('actionType', actionFilter);

      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, roleFilter, actionFilter]);

  const handleRefresh = () => {
    fetchLogs();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity className="icon" /> System Audit Logs
          </h1>
          <p className="page-description">Review all system activities and administrative actions.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Filter by Role</label>
            <select 
              className="form-control"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="CHIEF_EDITOR">Chief Editor</option>
              <option value="MOBILE_JOURNALIST">Mobile Journalist</option>
              <option value="INSTITUTION_LOGIN">Institution</option>
              <option value="USER">Standard User</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Filter by Action</label>
            <select 
              className="form-control"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading audit logs...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Entity ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ padding: '2rem' }}>
                        No audit logs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <div style={{ fontWeight: '500' }}>{log.actorName || 'Unknown'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {log.actorId}</div>
                        </td>
                        <td>
                          <span className={`badge ${log.actorRole === 'SUPER_ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                            {log.actorRole}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                            {log.actionType}
                          </span>
                        </td>
                        <td>{log.entityType}</td>
                        <td>{log.entityId || '-'}</td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                          {log.details || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div>
                  Showing page {page + 1} of {totalPages} ({totalElements} total entries)
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
