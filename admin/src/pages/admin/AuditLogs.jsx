import { useI18n } from '../../context/I18nContext';
import React, { useState, useEffect } from 'react';
import { Activity, Search, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api';

const AuditLogs = () => {
  const { t } = useI18n();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      if (debouncedSearch) params.append('search', debouncedSearch);

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
  }, [page, roleFilter, actionFilter, debouncedSearch]);

  const handleRefresh = () => {
    fetchLogs();
  };

  const toggleExpandLog = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' };
      case 'CHIEF_EDITOR':
        return { backgroundColor: 'var(--warning-glow)', color: 'var(--warning)', border: '1px solid var(--warning)' };
      case 'MOBILE_JOURNALIST':
      case 'INSTITUTION_LOGIN':
        return { backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' };
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' };
    }
  };

  const getActionStyle = (action) => {
    switch (action) {
      case 'CREATE':
      case 'APPROVE':
        return { backgroundColor: 'var(--success-glow)', color: 'var(--success)', border: '1px solid var(--success)' };
      case 'UPDATE':
        return { backgroundColor: 'var(--warning-glow)', color: 'var(--warning)', border: '1px solid var(--warning)' };
      case 'DELETE':
      case 'REJECT':
        return { backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid var(--danger)' };
      case 'LOGIN':
        return { backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)' };
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity className="icon" /> {t('systemAuditLogs')}
          </h1>
          <p className="page-description">{t('systemAuditLogsDesc')}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {t('refresh')}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '2 1 300px' }}>
            <label className="form-label">{t('searchLogs')}</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder={t("searchLogsPlaceholder")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label className="form-label">{t('filterByRole')}</label>
            <select 
              className="form-control"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            >
              <option value="">{t('allRoles')}</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="CHIEF_EDITOR">Chief Editor</option>
              <option value="MOBILE_JOURNALIST">Mobile Journalist</option>
              <option value="INSTITUTION_LOGIN">Institution</option>
              <option value="USER">Standard User</option>
            </select>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label className="form-label">{t('filterByAction')}</label>
            <select 
              className="form-control"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            >
              <option value="">{t('allActions')}</option>
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
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem' }} />
            <div>{t('loadingAuditLogs')}</div>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('timestamp')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('actor')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('role')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('action')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('entity')}</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('details')}</th>
                    <th style={{ padding: '1rem', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                        {t('noAuditLogsFound')}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      return (
                        <React.Fragment key={log.id}>
                          <tr 
                            onClick={() => toggleExpandLog(log.id)}
                            style={{ 
                              borderBottom: '1px solid var(--border-color)', 
                              cursor: 'pointer',
                              background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                              transition: 'background 0.2s'
                            }}
                          >
                            <td style={{ padding: '1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{log.actorEmail || 'System'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {log.actorId || 'N/A'}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className="badge" style={getRoleStyle(log.actorRole)}>
                                {log.actorRole || 'SYSTEM'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <span className="badge" style={getActionStyle(log.actionType)}>
                                {log.actionType}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                              <div style={{ fontWeight: '500' }}>{log.entityType}</div>
                              {log.entityId && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {log.entityId}</div>
                              )}
                            </td>
                            <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.details || '-'}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)' }}>
                              <td colSpan="7" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                                    <div><strong style={{ color: 'var(--text-muted)' }}>IP Address:</strong> {log.ipAddress || 'N/A'}</div>
                                    <div><strong style={{ color: 'var(--text-muted)' }}>Actor Email:</strong> {log.actorEmail || 'System'}</div>
                                    <div><strong style={{ color: 'var(--text-muted)' }}>Entity Type:</strong> {log.entityType}</div>
                                    <div><strong style={{ color: 'var(--text-muted)' }}>Entity ID:</strong> {log.entityId || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Event Details</strong>
                                    <pre style={{ 
                                      whiteSpace: 'pre-wrap', 
                                      wordBreak: 'break-all', 
                                      background: 'rgba(0, 0, 0, 0.4)', 
                                      padding: '1rem', 
                                      borderRadius: 'var(--radius-sm)', 
                                      fontFamily: 'monospace',
                                      fontSize: '0.85rem',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-color)',
                                      margin: 0
                                    }}>
                                      {log.details || 'No additional details.'}
                                    </pre>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total entries)
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
