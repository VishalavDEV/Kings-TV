import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Administrators from './pages/users/Administrators';
import PublicUsers from './pages/users/PublicUsers';
import RolesPermissions from './pages/roles/RolesPermissions';
import EditRole from './pages/roles/EditRole';

// Settings
import Preferences from './pages/settings/Preferences';
import VisualSettings from './pages/settings/VisualSettings';
import GeneralSettings from './pages/settings/GeneralSettings';

// RSS
import RssFeeds from './pages/rss/RssFeeds';
import AddRssFeed from './pages/rss/AddRssFeed';

// System
import Storage from './pages/system/Storage';
import CacheSystem from './pages/system/CacheSystem';
import Backup from './pages/system/Backup';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa]">
        <div className="w-10 h-10 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Users */}
        <Route path="users/administrators" element={<Administrators />} />
        <Route path="users" element={<PublicUsers />} />

        {/* Roles */}
        <Route path="roles-permissions" element={<RolesPermissions />} />
        <Route path="roles-permissions/:id/edit" element={<EditRole />} />

        {/* Settings */}
        <Route path="preferences" element={<Preferences />} />
        <Route path="settings/visual" element={<VisualSettings />} />
        <Route path="settings/general" element={<GeneralSettings />} />
        <Route path="settings" element={<Navigate to="settings/general" replace />} />

        {/* RSS Feeds */}
        <Route path="rss-feeds" element={<RssFeeds />} />
        <Route path="rss-feeds/add" element={<AddRssFeed />} />
        <Route path="rss-feeds/:id/edit" element={<AddRssFeed />} />

        {/* System */}
        <Route path="storage" element={<Storage />} />
        <Route path="cache-system" element={<CacheSystem />} />
        <Route path="backup" element={<Backup />} />

        {/* Catch-all for pages not yet built */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}

function ComingSoon() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h3 className="text-base font-semibold text-gray-600">Coming Soon</h3>
        <p className="text-sm text-gray-400 mt-1">This section is under construction.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
