import React, { useState, useEffect } from 'react';
import { LogIn, Calendar, Search, ShieldCheck, ShieldAlert, Monitor } from 'lucide-react';
import api from '../../utils/axios';

export default function LoginLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/audit-logs/logins?page=${page}&size=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (email) url += `&email=${encodeURIComponent(email)}`;
      if (success !== '') url += `&success=${success}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error('Failed to load login logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, success, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <LogIn size={20} className="text-[#B3732A]" /> Login Attempts & Session Logs
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Chronological record of every administrative login attempt, success, or block event</p>
      </div>

      {/* Toolbar Filter */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search IP, Agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          {/* Email Filter */}
          <input
            type="text"
            placeholder="Filter email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          />

          {/* Status Filter */}
          <select
            value={success}
            onChange={(e) => setSuccess(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2"
          >
            <option value="">All Statuses</option>
            <option value="true">Successful Logins</option>
            <option value="false">Failed Logins</option>
          </select>

          {/* Date range */}
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

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#B3732A] hover:bg-[#9c6323] text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setEmail('');
                setSuccess('');
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
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Attempted Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Details / Failure Reason</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Device (User Agent)</th>
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
                    No login attempt records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      <div>{log.emailAttempted}</div>
                      {log.adminUserId && (
                        <div className="text-[10px] text-gray-400 font-mono">Mapped User ID: #{log.adminUserId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700">
                          <ShieldCheck size={11} /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-50 text-red-700">
                          <ShieldAlert size={11} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.success ? (
                        <span className="text-gray-400 font-medium italic">None</span>
                      ) : (
                        <span className="text-red-600 font-bold bg-red-50/30 px-2 py-0.5 rounded">
                          {log.failureReason || 'Authentication Failed'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 max-w-xs truncate" title={log.userAgent}>
                        <Monitor size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">{log.userAgent || 'Unknown Device'}</span>
                      </div>
                    </td>
                  </tr>
                ))
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
