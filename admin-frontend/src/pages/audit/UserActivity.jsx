import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Search, User, Compass } from 'lucide-react';
import api from '../../utils/axios';

export default function UserActivity() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [actor, setActor] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/audit-logs/activities?page=${page}&size=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (actor) url += `&actor=${encodeURIComponent(actor)}`;
      if (type) url += `&type=${type}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error('Failed to load user activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, type, startDate, endDate]);

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
          <Activity size={20} className="text-[#B3732A]" /> Admin User Activity Trail
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Lighter-weight audit trail documenting page views and navigation hits per administrator</p>
      </div>

      {/* Toolbar Filter */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search page/endpoint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          {/* Actor Filter */}
          <input
            type="text"
            placeholder="Actor (ID or email)..."
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
          />

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="page_view">Page Views (GET)</option>
            <option value="action">Actions (POST/PUT/DELETE)</option>
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
                setActor('');
                setType('');
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
                <th className="px-6 py-4">Admin Email</th>
                <th className="px-6 py-4">Activity Type</th>
                <th className="px-6 py-4">HTTP Action & Endpoint Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400 italic">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                      <User size={13} className="text-[#B3732A]" />
                      <div>
                        <div>{log.adminEmail}</div>
                        <div className="text-[10px] text-gray-400 font-mono">User ID: #{log.adminUserId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.activityType === 'action' ? (
                        <span className="px-2.5 py-0.5 rounded font-extrabold uppercase text-[10px] bg-amber-50 text-[#B3732A]">
                          Write Action
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded font-extrabold uppercase text-[10px] bg-slate-50 text-slate-500">
                          Page View
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 flex items-center gap-1.5 mt-2">
                      <Compass size={13} className="text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-750">{log.pageOrEndpoint}</span>
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
