import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import OfflineBanner from './components/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';
import PublicVaniLayout from './components/PublicVaniLayout';
import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import AdvancedSearch from './pages/AdvancedSearch';
import Videos from './pages/Videos';
import LiveTv from './pages/LiveTv';
import Obituaries from './pages/Obituaries';
import Wishes from './pages/Wishes';
import Jobs from './pages/Jobs';
import Classifieds from './pages/Classifieds';
import BusinessStudies from './pages/BusinessStudies';
import Advertise from './pages/Advertise';
import NotFound from './pages/NotFound';
import InstitutionNews from './pages/InstitutionNews';
import BizDirectoryMain from './pages/BizDirectoryMain';
import NfcCardDashboard from './pages/NfcCardDashboard';
import DealsListing from './pages/DealsListing';
import BizDirectoryDashboard from './pages/BizDirectoryDashboard';
import MyRfqs from './pages/MyRfqs';
import { fetchApi } from './utils/api';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubcategories from './pages/admin/AdminSubcategories';
import AddPost from './pages/admin/AddPost';
import PostsList from './pages/admin/PostsList';
import EditPost from './pages/admin/EditPost';
import AdminPages from './pages/admin/AdminPages';
import AdminNavigation from './pages/admin/AdminNavigation';
import AdminThemes from './pages/admin/AdminThemes';
import AdminWidgets from './pages/admin/AdminWidgets';
import AdminPolls from './pages/admin/AdminPolls';
import AdminGallery from './pages/admin/AdminGallery';
import AdminComments from './pages/admin/AdminComments';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminRoles from './pages/admin/AdminRoles';
import AdminBulkPostUpload from './pages/admin/AdminBulkPostUpload';
import AdminRssFeeds from './pages/admin/AdminRssFeeds';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintTitle, setMaintTitle] = useState('');
  const [maintMsg, setMaintMsg] = useState('');

  useEffect(() => {
    fetchApi('/public/settings')
      .then(res => {
        if (res) {
          if (res.maintenanceMode) {
            setMaintenanceMode(true);
            setMaintTitle(res.maintenanceTitle || '');
            setMaintMsg(res.maintenanceMessage || '');
          }
          if (res.siteColor) {
            document.documentElement.style.setProperty('--primary', res.siteColor);
          }
          if (res.siteName) {
            document.title = res.siteName + (res.siteTagline ? ` - ${res.siteTagline}` : '');
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXX', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  if (maintenanceMode && location.pathname !== '/login') {
    return <Maintenance title={maintTitle} message={maintMsg} />;
  }

  const isAdminRoute = [
    '/dashboard', '/categories', '/posts', '/pages', '/navigation',
    '/themes', '/widgets', '/polls', '/gallery', '/comments',
    '/contact-messages', '/newsletter', '/roles', '/rss-feeds'
  ].some(path => location.pathname.startsWith(path)) || location.pathname === '/login';

  const wrapAdmin = (component) => (
    <ProtectedRoute>
      <PublicVaniLayout>{component}</PublicVaniLayout>
    </ProtectedRoute>
  );

  return (
    <div className="app-container">
      <OfflineBanner />
      {showSplash && !isAdminRoute && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {!isAdminRoute && <Header />}
      
      <main className={isAdminRoute ? 'admin-main-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes in Public Vani Panel Layout */}
          <Route path="/dashboard" element={wrapAdmin(<AdminDashboard />)} />
          <Route path="/categories" element={wrapAdmin(<AdminCategories />)} />
          <Route path="/categories/subcategories" element={wrapAdmin(<AdminSubcategories />)} />
          <Route path="/posts" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/add" element={wrapAdmin(<AddPost />)} />
          <Route path="/posts/edit/:id" element={wrapAdmin(<EditPost />)} />
          <Route path="/posts/slider" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/featured" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/breaking" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/recommended" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/pending" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/scheduled" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/drafts" element={wrapAdmin(<PostsList />)} />
          <Route path="/posts/bulk-upload" element={wrapAdmin(<AdminBulkPostUpload />)} />
          <Route path="/rss-feeds" element={wrapAdmin(<AdminRssFeeds />)} />
          <Route path="/pages" element={wrapAdmin(<AdminPages />)} />
          <Route path="/navigation" element={wrapAdmin(<AdminNavigation />)} />
          <Route path="/themes" element={wrapAdmin(<AdminThemes />)} />
          <Route path="/widgets" element={wrapAdmin(<AdminWidgets />)} />
          <Route path="/polls" element={wrapAdmin(<AdminPolls />)} />
          <Route path="/polls/add" element={wrapAdmin(<AdminPolls />)} />
          <Route path="/gallery" element={wrapAdmin(<AdminGallery />)} />
          <Route path="/gallery/add-album" element={wrapAdmin(<AdminGallery />)} />
          <Route path="/comments" element={wrapAdmin(<AdminComments />)} />
          <Route path="/comments/pending" element={wrapAdmin(<AdminComments />)} />
          <Route path="/comments/approved" element={wrapAdmin(<AdminComments />)} />
          <Route path="/contact-messages" element={wrapAdmin(<AdminContactMessages />)} />
          <Route path="/newsletter" element={wrapAdmin(<AdminNewsletter />)} />
          <Route path="/roles" element={wrapAdmin(<AdminRoles />)} />

          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/login.html" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/directory" element={<BizDirectoryMain />} />
          <Route path="/directory.html" element={<Navigate to="/directory" replace />} />
          <Route path="/nfc" element={<NfcCardDashboard />} />
          <Route path="/deals" element={<DealsListing />} />
          <Route path="/directory-dashboard" element={<BizDirectoryDashboard />} />
          <Route path="/my-rfqs" element={<MyRfqs />} />
          
          {/* Public News Portal Routes */}
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/article/:id/*" element={<ArticleDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/search" element={<AdvancedSearch />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/live-tv" element={<LiveTv />} />
          <Route path="/obituaries" element={<Obituaries />} />
          <Route path="/wishes" element={<Wishes />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/classifieds" element={<Classifieds />} />
          <Route path="/business-studies" element={<BusinessStudies />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/institution-news" element={<InstitutionNews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default AppContent;
