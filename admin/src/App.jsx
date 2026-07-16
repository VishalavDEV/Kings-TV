import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ProfanityFilter from './pages/admin/ProfanityFilter';
import SystemSettings from './pages/admin/SystemSettings';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import TaxonomyManager from './pages/admin/TaxonomyManager';
import RoleManagement from './pages/admin/RoleManagement';
import PushNotifications from './pages/admin/PushNotifications';
import HomeLayoutBuilder from './pages/admin/HomeLayoutBuilder';
import SurveyBuilder from './pages/admin/SurveyBuilder';
import AuditLogs from './pages/admin/AuditLogs';
import ContentQueue from './pages/editor/ContentQueue';
import MyPosts from './pages/journalist/MyPosts';
import PostEditor from './pages/journalist/PostEditor';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="app-container"><div className="glass-panel" style={{margin: 'auto', padding: '2rem'}}>Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />

          {/* Super Admin routes */}
          <Route path="/admin/users" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <UserManagement />
            </ProtectedLayout>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <SystemSettings />
            </ProtectedLayout>
          } />

          <Route path="/admin/profanity" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <ProfanityFilter />
            </ProtectedLayout>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <AnalyticsDashboard />
            </ProtectedLayout>
          } />

          <Route path="/admin/taxonomy" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <TaxonomyManager />
            </ProtectedLayout>
          } />

          <Route path="/admin/push" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <PushNotifications />
            </ProtectedLayout>
          } />

          <Route path="/admin/layout" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <HomeLayoutBuilder />
            </ProtectedLayout>
          } />

          <Route path="/admin/surveys" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <SurveyBuilder />
            </ProtectedLayout>
          } />

          <Route path="/admin/roles" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <RoleManagement />
            </ProtectedLayout>
          } />

          <Route path="/admin/audit-logs" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <AuditLogs />
            </ProtectedLayout>
          } />
          {/* Chief Editor routes */}
          <Route path="/admin/content" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <ContentQueue />
            </ProtectedLayout>
          } />

          {/* Journalist / Institution routes */}
          <Route path="/journalist/posts" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN']}>
              <MyPosts />
            </ProtectedLayout>
          } />
          <Route path="/journalist/create" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN']}>
              <PostEditor />
            </ProtectedLayout>
          } />
          <Route path="/journalist/edit/:id" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR', 'MOBILE_JOURNALIST', 'INSTITUTION_LOGIN']}>
              <PostEditor />
            </ProtectedLayout>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
