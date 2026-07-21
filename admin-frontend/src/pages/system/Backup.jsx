import React, { useState } from 'react';
import { Download, Database, Shield, Clock } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const BACKUP_INFO = [
  { icon: Database, label: 'Full Database Dump',  desc: 'All tables, data, and schema' },
  { icon: Shield,   label: 'Secure Download',     desc: 'Direct download — not stored on server' },
  { icon: Clock,    label: 'Point-in-Time',        desc: 'Snapshot of your database right now' },
];

export default function Backup() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const downloadBackup = async () => {
    setDownloading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_jwt_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/backup/database`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const disposition = response.headers.get('content-disposition') || '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `backup-${Date.now()}.sql`;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      setError(e.message || 'Download failed. Please check that mysqldump is available.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Database Backup</h2>
        <p className="text-sm text-gray-500 mt-0.5">Download a full SQL dump of your database</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3">
          {BACKUP_INFO.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4 flex flex-col gap-2">
              <Icon size={20} className="text-[#B3732A]" />
              <div>
                <p className="text-xs font-semibold text-gray-700">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs font-medium text-blue-800 mb-1">ℹ️ How it works</p>
          <p className="text-xs text-blue-700">
            Clicking the button below runs <code className="bg-blue-100 px-1 rounded">mysqldump</code> on your
            server and streams the SQL file directly to your browser. The file is not stored on the server.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={downloadBackup}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#B3732A] text-white rounded-xl font-medium hover:bg-[#9c6323] disabled:opacity-50 transition-colors shadow-sm text-base"
        >
          <Download size={20} className={downloading ? 'animate-bounce' : ''} />
          {downloading ? 'Generating Backup…' : 'Download Database Backup'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Backup includes all tables and data. Recommended to download before major updates.
        </p>
      </div>

      {/* Scheduled Backup Note */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
        <Clock size={16} className="text-[#B3732A] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-700">Automated Daily Backups</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Your system is configured to automatically backup the database every day at 2:00 AM and upload
            it to your configured storage bucket.
          </p>
        </div>
      </div>
    </div>
  );
}
