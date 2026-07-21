import React, { useState, useEffect } from 'react';
import { FileText, Clock, FileEdit, Calendar, MessageSquare, Mail, Users, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    drafts: 0,
    scheduledPosts: 0,
    recentPendingComments: [],
    recentContactMessages: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [dismissedWidgets, setDismissedWidgets] = useState({
    comments: false,
    messages: false,
    users: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/admin/dashboard/stats')
      .then(res => setStats(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDismiss = (widgetKey) => {
    setDismissedWidgets(prev => ({ ...prev, [widgetKey]: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Real-time stats overview and activity widgets</p>
      </div>

      {/* 4 Color-coded Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Posts (Green) */}
        <div
          onClick={() => navigate('/posts')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Posts</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalPosts}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={22} />
          </div>
        </div>

        {/* Card 2: Pending Posts (Red) */}
        <div
          onClick={() => navigate('/posts')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Posts</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">{stats.pendingPosts}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={22} />
          </div>
        </div>

        {/* Card 3: Drafts (Purple) */}
        <div
          onClick={() => navigate('/posts')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Drafts</p>
            <p className="text-3xl font-extrabold text-purple-600 mt-1">{stats.drafts}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileEdit size={22} />
          </div>
        </div>

        {/* Card 4: Scheduled Posts (Yellow) */}
        <div
          onClick={() => navigate('/posts')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Posts</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.scheduledPosts}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* 3 Dismissible Activity Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget 1: Pending Comments */}
        {!dismissedWidgets.comments && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#B3732A]" />
                  <h3 className="font-bold text-gray-800 text-sm">Pending Comments</h3>
                </div>
                <button onClick={() => toggleDismiss('comments')} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              </div>

              {stats.recentPendingComments?.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No pending comments</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {stats.recentPendingComments?.map((c) => (
                    <div key={c.id} className="py-2.5 space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{c.commentorName}</span>
                        <span className="text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{c.commentText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                onClick={() => navigate('/comments')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B3732A] hover:underline"
              >
                View All Pending Comments <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Widget 2: Latest Contact Messages */}
        {!dismissedWidgets.messages && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Mail size={18} className="text-[#B3732A]" />
                  <h3 className="font-bold text-gray-800 text-sm">Latest Contact Messages</h3>
                </div>
                <button onClick={() => toggleDismiss('messages')} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              </div>

              {stats.recentContactMessages?.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No contact messages</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {stats.recentContactMessages?.map((m) => (
                    <div key={m.id} className="py-2.5 space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{m.name}</span>
                        <span className="text-gray-400">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B3732A] hover:underline"
              >
                View All Messages <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Widget 3: Latest Users */}
        {!dismissedWidgets.users && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#B3732A]" />
                  <h3 className="font-bold text-gray-800 text-sm">Latest Registered Users</h3>
                </div>
                <button onClick={() => toggleDismiss('users')} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              </div>

              {stats.recentUsers?.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No users registered</p>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {stats.recentUsers?.map((u) => (
                    <div key={u.id} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs">
                          {(u.fullName || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{u.fullName || 'User'}</p>
                          <p className="text-[10px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-semibold">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-right">
              <button
                onClick={() => navigate('/users')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#B3732A] hover:underline"
              >
                View All Users <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
