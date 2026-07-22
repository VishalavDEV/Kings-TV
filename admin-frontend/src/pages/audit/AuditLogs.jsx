import React, { useState, useEffect } from 'react';
import { Shield, Calendar, Filter, Search, ChevronDown, ChevronUp, Eye, FileJson } from 'lucide-react';
import api from '../../utils/axios';

export default function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Row expansion tracking
  const [expandedRow, setExpandedRow] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/audit-logs?page=${page}&size=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actor) url += `&actor=${encodeURIComponent(actor)}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, role, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  const renderJsonDiff = (beforeStr, afterStr) => {
    try {
      const beforeObj = beforeStr ? JSON.parse(beforeStr) : null;
      const afterObj = afterStr ? JSON.parse(afterStr) : null;

      if (!beforeObj && !afterObj) {
        return <p className="text-xs text-gray-400 italic">No snapshot details available.</p>;
      }

      // Collect all keys from both snapshots
      const allKeys = new Set([
        ...Object.keys(beforeObj || {}),
        ...Object.keys(afterObj || {})
      ]);

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Before Column */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
            <h5 className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Before Value (Deleted/Previous State)
            </h5>
            {beforeObj ? (
              <pre className="text-[10px] font-mono text-red-800 overflow-x-auto max-h-72 whitespace-pre-wrap">
                {JSON.stringify(beforeObj, null, 2)}
              </pre>
            ) : (
              <p className="text-[11px] text-red-500 italic">No previous state exists (Created entity).</p>
            )}
          </div>

          {/* After Column */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
            <h5 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> After Value (Current/New State)
            </h5>
            {afterObj ? (
              <pre className="text-[10px] font-mono text-emerald-800 overflow-x-auto max-h-72 whitespace-pre-wrap">
                {JSON.stringify(afterObj, null, 2)}
              </pre>
            ) : (
              <p className="text-[11px] text-emerald-500 italic">No remaining state (Deleted entity).</p>
            )}
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs font-mono">
          <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
            <strong>Raw Before:</strong><br />{beforeStr || 'null'}
          </div>
          <div className="bg-gray-50 border border-gray-150 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
            <strong>Raw After:</strong><br />{afterStr || 'null'}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield size={20} className="text-[#B3732A]" /> Administrative Audit Logs
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Append-only administrative operations ledger detailing data-level snapshots</p>
      </div>

      {/* Toolbar Filter */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search actions/IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          {/* Actor */}
          <input
            type="text"
            placeholder="Actor (ID or email)..."
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          />

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="CHIEF_EDITOR">Chief Editor</option>
            <option value="DISTRICT_ADMIN">District Admin</option>
            <option value="MOBILE_JOURNALIST">Mobile Journalist</option>
            <option value="INSTITUTION_LOGIN">Institution</option>
          </select>

          {/* Dates */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] w-full"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#B3732A] hover:bg-[#9c6323] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all"
            >
              Apply Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActor('');
                setRole('');
                setStartDate('');
                setEndDate('');
                setPage(0);
                setTimeout(loadLogs, 0);
              }}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase">
                <th className="w-10 px-4 py-4"></th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity type</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400 italic">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-amber-50/10' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-4 text-center">
                          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt || log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{log.actorEmail || 'System'}</div>
                          <div className="text-[10px] text-gray-400 capitalize">
                            ID: #{log.actorId} &bull; {log.actorRole?.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[10px] ${
                            log.action === 'create' ? 'bg-emerald-50 text-emerald-600' :
                            log.action === 'delete' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{log.entityType}</div>
                          <div className="text-[10px] text-gray-400 font-mono">Entity ID: #{log.entityId}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500">
                          {log.ipAddress}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/40">
                          <td colSpan="6" className="px-6 py-4 border-t border-b border-gray-100">
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                                <FileJson size={14} className="text-[#B3732A]" /> State Snapshots Comparison
                              </div>
                              {renderJsonDiff(log.beforeValue, log.afterValue)}
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

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-150 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing page {page + 1} of {totalPages} ({totalElements} entries)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-[#B3732A] bg-[#B3732A] text-white rounded-lg text-xs disabled:opacity-50 hover:bg-[#9c6323] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
