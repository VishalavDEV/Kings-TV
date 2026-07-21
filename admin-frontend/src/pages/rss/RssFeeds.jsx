import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, RefreshCw, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import api from '../../utils/axios';

export default function RssFeeds() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const load = () => {
    setLoading(true);
    api.get('/api/admin/rss-feeds')
      .then(r => setFeeds(r.data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const importNow = async (id) => {
    setImportingId(id);
    try {
      const r = await api.post(`/api/admin/rss-feeds/${id}/import-now`);
      showToast(`Import complete — ${r.data.imported} new items`);
      load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Import failed', 'error');
    } finally {
      setImportingId(null);
    }
  };

  const deleteFeed = async (id) => {
    if (!confirm('Delete this feed source?')) return;
    try {
      await api.delete(`/api/admin/rss-feeds/${id}`);
      showToast('Feed source deleted');
      setFeeds(f => f.filter(x => x.id !== id));
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const toggleActive = async (feed) => {
    try {
      await api.put(`/api/admin/rss-feeds/${feed.id}`, { isActive: !feed.isActive });
      setFeeds(f => f.map(x => x.id === feed.id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">RSS Feeds</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage external news sources for aggregation</p>
        </div>
        <Link
          to="/rss-feeds/add"
          className="flex items-center gap-2 px-4 py-2 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323] transition-colors"
        >
          <Plus size={16} />
          Add Feed Source
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
        </div>
      ) : feeds.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📡</div>
          <h3 className="font-semibold text-gray-700">No feed sources yet</h3>
          <p className="text-sm text-gray-400 mt-1">Add an RSS feed source to start aggregating news.</p>
          <Link to="/rss-feeds/add" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#B3732A] text-white rounded-lg text-sm font-medium hover:bg-[#9c6323]">
            <Plus size={16} /> Add Feed Source
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Interval</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Last Import</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeds.map(feed => (
                <tr key={feed.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {feed.logoUrl ? (
                        <img src={feed.logoUrl} alt="" className="w-8 h-8 rounded object-contain bg-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">📡</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{feed.sourceName}</div>
                        <a href={feed.sourceUrl} target="_blank" rel="noopener noreferrer"
                           className="text-xs text-[#B3732A] hover:underline flex items-center gap-0.5">
                          <ExternalLink size={11} /> {feed.sourceUrl.slice(0, 40)}…
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-gray-400" />
                      {feed.importIntervalMinutes >= 60
                        ? `${Math.round(feed.importIntervalMinutes / 60)}h`
                        : `${feed.importIntervalMinutes}m`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {feed.lastImportedAt
                      ? new Date(feed.lastImportedAt).toLocaleString()
                      : '—'}
                    {feed.lastImportCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
                        +{feed.lastImportCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {feed.lastImportStatus === 'OK' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle size={13} /> OK
                      </span>
                    ) : feed.lastImportStatus === 'ERROR' ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium" title={feed.lastImportError}>
                        <XCircle size={13} /> Error
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(feed)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          feed.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {feed.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => importNow(feed.id)}
                        disabled={importingId === feed.id}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
                        title="Import Now"
                      >
                        <RefreshCw size={15} className={importingId === feed.id ? 'animate-spin' : ''} />
                      </button>
                      <Link to={`/rss-feeds/${feed.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-xs">
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteFeed(feed.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
