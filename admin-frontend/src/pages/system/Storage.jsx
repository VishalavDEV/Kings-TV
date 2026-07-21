import React, { useState, useEffect } from 'react';
import { HardDrive, Folder, RefreshCw, Trash2 } from 'lucide-react';
import api from '../../utils/axios';

function UsageBar({ percent, color = '#B3732A' }) {
  return (
    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(percent, 100)}%`, background: color }}
      />
    </div>
  );
}

export default function Storage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/api/admin/storage/usage')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cleanup = async () => {
    setCleaning(true);
    try {
      const r = await api.delete('/api/admin/storage/cleanup');
      setToast(r.data.message || 'Cleanup complete');
      setTimeout(() => setToast(''), 4000);
    } catch {
      setToast('Cleanup failed');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setCleaning(false);
    }
  };

  const FOLDER_COLORS = ['#B3732A','#3B82F6','#10B981','#F59E0B','#6366F1','#EF4444'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Storage</h2>
          <p className="text-sm text-gray-500">Disk usage and media file management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={cleanup}
            disabled={cleaning}
            className="flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Clean Up Unused
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Disk Overview */}
          {data.disk && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive size={18} className="text-[#B3732A]" />
                <h3 className="font-semibold text-gray-800">System Disk</h3>
              </div>
              <UsageBar percent={data.disk.usedPercent} />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Used: <strong className="text-gray-700">{data.disk.usedHuman}</strong></span>
                <span>{data.disk.usedPercent}% used</span>
                <span>Total: <strong className="text-gray-700">{data.disk.totalHuman}</strong></span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: data.disk.totalHuman, color: 'bg-gray-100 text-gray-700' },
                  { label: 'Used',  value: data.disk.usedHuman,  color: 'bg-orange-50 text-orange-700' },
                  { label: 'Free',  value: data.disk.freeHuman,  color: 'bg-green-50 text-green-700' },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-3 ${item.color}`}>
                    <div className="text-xs opacity-70 mb-0.5">{item.label}</div>
                    <div className="font-bold text-lg">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Folders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Folder size={18} className="text-[#B3732A]" />
              <h3 className="font-semibold text-gray-800">Upload Storage</h3>
              <span className="ml-auto text-sm text-gray-500">
                {data.totalUploadHuman} in {data.totalUploadFiles?.toLocaleString()} files
              </span>
            </div>

            {data.breakdown && Object.keys(data.breakdown).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.breakdown).map(([folder, info], i) => {
                  const pct = data.totalUploadBytes > 0
                    ? Math.round((info.bytes / data.totalUploadBytes) * 100)
                    : 0;
                  return (
                    <div key={folder}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="font-medium text-gray-700 capitalize">{folder}</span>
                        <span className="text-gray-500 text-xs">{info.humanSize} · {info.files?.toLocaleString()} files</span>
                      </div>
                      <UsageBar percent={pct} color={FOLDER_COLORS[i % FOLDER_COLORS.length]} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Folder size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No upload folders found</p>
                <p className="text-xs mt-1">{data.uploadsDirectory}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
          Failed to load storage info.
        </div>
      )}
    </div>
  );
}
