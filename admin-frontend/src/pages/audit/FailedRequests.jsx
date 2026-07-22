import React, { useState, useEffect } from 'react';
import { ShieldAlert, Calendar, Search, Cpu } from 'lucide-react';
import api from '../../utils/axios';

export default function FailedRequests() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/audit-logs/failures?page=${page}&size=20`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error('Failed to load failed requests logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadLogs();
  };

  const getStatusBadge = (code) => {
    if (code >= 500) {
      return <span className="px-2 py-0.5 rounded font-extrabold bg-red-100 text-red-800 font-mono">{code} Error</span>;
    }
    return <span className="px-2 py-0.5 rounded font-extrabold bg-amber-100 text-amber-800 font-mono">{code} Failure</span>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert size={20} className="text-red-600 animate-pulse" /> Failed Requests (Errors 4xx/5xx)
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Isolated performance view displaying only HTTP transactions resulting in client errors or server exceptions</p>
      </div>

      {/* Toolbar Filter */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search endpoint, method, caller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

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
              className="flex-1 bg-red-650 hover:bg-red-700 bg-red-600 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
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
                <th className="px-6 py-4">Method & Endpoint</th>
                <th className="px-6 py-4">Response Status</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Caller Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-600 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400 italic">
                    Great! No failed HTTP transactions recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-red-50/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-red-750">
                      <span className="font-bold mr-2 text-red-600">{log.method}</span>
                      <span className="font-semibold">{log.endpoint}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.statusCode)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-gray-700">
                        <Cpu size={12} className="text-gray-450 shrink-0" />
                        <span>{log.responseTimeMs.toLocaleString()} ms</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-500 font-semibold">
                      {log.callerType}
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
