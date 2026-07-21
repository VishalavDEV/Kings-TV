import React from 'react';
import { BarChart3, Users, Newspaper, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Articles', value: '—', icon: Newspaper, color: 'bg-blue-50 text-blue-600' },
  { label: 'Total Users', value: '—', icon: Users, color: 'bg-green-50 text-green-600' },
  { label: 'Page Views', value: '—', icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  { label: 'Engagement', value: '—', icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-primary to-[#d4923a] text-white">
        <h2 className="text-xl font-bold">Welcome back, Admin 👋</h2>
        <p className="text-white/80 mt-1 text-sm">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Activity feed will appear here
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Quick action shortcuts will appear here
          </div>
        </div>
      </div>
    </div>
  );
}
