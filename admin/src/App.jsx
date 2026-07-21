import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
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
import NewsManagement from './pages/admin/NewsManagement';
import NewsEditor from './pages/admin/NewsEditor';
import BreakingNewsDashboard from './pages/admin/BreakingNewsDashboard';
import UgcQueue from './pages/admin/UgcQueue';
import EditorialCalendar from './pages/admin/EditorialCalendar';
import AdManagement from './pages/admin/AdManagement';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  React.useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  if (loading) return <div className="app-container"><div className="glass-panel" style={{margin: 'auto', padding: '2rem'}}>Loading...</div></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
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

          <Route path="/admin/news" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <NewsManagement />
            </ProtectedLayout>
          } />

          <Route path="/admin/news/create" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <NewsEditor />
            </ProtectedLayout>
          } />

          <Route path="/admin/breaking" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <BreakingNewsDashboard />
            </ProtectedLayout>
          } />

          <Route path="/admin/ugc-queue" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR', 'SUB_EDITOR']}>
              <UgcQueue />
            </ProtectedLayout>
          } />

          <Route path="/admin/editorial-calendar" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <EditorialCalendar />
            </ProtectedLayout>
          } />

          <Route path="/admin/ads" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN']}>
              <AdManagement />
            </ProtectedLayout>
          } />


          <Route path="/admin/news/:id/edit" element={
            <ProtectedLayout allowedRoles={['SUPER_ADMIN', 'CHIEF_EDITOR']}>
              <NewsEditor />
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

          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
     </I18nProvider>
    </AuthProvider>
  );
}

export default App;
