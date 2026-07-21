import React, { useState, useEffect } from 'react';
import { Eye, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../../utils/axios';

export default function Pageviews() {
  const [logs, setLogs] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = (query = '') => {
    setLoading(true);
    const url = query ? `/api/admin/reward-system/pageviews?search=${encodeURIComponent(query)}` : '/api/admin/reward-system/pageviews';
    Promise.all([
      api.get(url),
      api.get('/api/admin/reward-system/settings')
    ]).then(([lRes, sRes]) => {
      setLogs(Array.isArray(lRes.data) ? lRes.data : []);
      if (sRes.data?.currencySymbol) setCurrencySymbol(sRes.data.currencySymbol);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadData(searchTerm);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Pageview Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Filterable view of reader article views and accrued per-view earnings</p>
        </div>

        {/* Filter / Search Form */}
        <form onSubmit={handleFilter} className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search post, author, IP, user agent…"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A] w-64 sm:w-80"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors"
          >
            <Filter size={15} /> Filter
          </button>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); loadData(''); }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="Reset Filters"
          >
            <RefreshCw size={16} />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Eye size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No pageview logs match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold w-14">ID</th>
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">IP Address</th>
                  <th className="px-4 py-3 font-semibold min-w-[180px]">User-Agent</th>
                  <th className="px-4 py-3 font-semibold text-right">Earnings</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const amt = typeof log.earningsAmount === 'number' ? log.earningsAmount : (parseFloat(log.earningsAmount) || 0);
                  return (
                    <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{log.id}</td>
                      <td className="px-4 py-3 font-medium text-[#B3732A]">
                        {log.articleSlug ? log.articleSlug : `Post #${log.articleId}`}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{log.authorName || 'Desk Author'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.ipAddress || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {currencySymbol}{amt.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                        {log.viewedAt ? new Date(log.viewedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
