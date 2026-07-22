import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import PopupAd from './components/PopupAd';
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
import Obituaries from './pages/PublicObituaries';
import Wishes from './pages/PublicWishes';
import Jobs from './pages/Jobs';
import Classifieds from './pages/Classifieds';
import Advertise from './pages/Advertise';
import NotFound from './pages/NotFound';
import CustomPageView from './pages/CustomPageView';
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
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLiveStream from './pages/admin/AdminLiveStream';
import AdminPushNotifications from './pages/admin/AdminPushNotifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfanity from './pages/admin/AdminProfanity';
import AdminClassifieds from './pages/admin/AdminClassifieds';
import PublicDirectory from './pages/PublicDirectory';
import PublicDirectoryDetail from './pages/PublicDirectoryDetail';
import AdminBusinessDirectory from './pages/admin/AdminBusinessDirectory';
import PublicJobs from './pages/PublicJobs';
import PublicJobDetail from './pages/PublicJobDetail';
import AdminJobs from './pages/admin/AdminJobs';
import PublicDeals from './pages/PublicDeals';
import AdminDeals from './pages/admin/AdminDeals';
import PublicNfcCard from './pages/PublicNfcCard';
import AdminNfc from './pages/admin/AdminNfc';
import PublicRfq from './pages/PublicRfq';
import AdminRfq from './pages/admin/AdminRfq';
import AdminObituariesWishes from './pages/admin/AdminObituariesWishes';

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
    '/contact-messages', '/newsletter', '/roles', '/rss-feeds', '/analytics',
    '/push-notifications', '/livestream-settings', '/settings', '/profanity-filter', '/classifieds-manager', '/admin-directory', '/admin-jobs', '/admin-deals', '/admin-nfc', '/admin-rfq', '/admin-obituaries-wishes'
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
      {!isAdminRoute && <PopupAd />}
      
      <main className={isAdminRoute ? 'admin-main-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes in Public Vani Panel Layout */}
          <Route path="/dashboard" element={wrapAdmin(<AdminDashboard />)} />
          <Route path="/categories" element={wrapAdmin(<AdminCategories />)} />
          <Route path="/categories/subcategories" element={wrapAdmin(<AdminCategories />)} />
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
          <Route path="/analytics" element={wrapAdmin(<AdminAnalytics />)} />
          <Route path="/push-notifications" element={wrapAdmin(<AdminPushNotifications />)} />
          <Route path="/livestream-settings" element={wrapAdmin(<AdminLiveStream />)} />
          <Route path="/settings" element={wrapAdmin(<AdminSettings />)} />
          <Route path="/profanity-filter" element={wrapAdmin(<AdminProfanity />)} />
          <Route path="/classifieds-manager" element={wrapAdmin(<AdminClassifieds />)} />
          <Route path="/admin-directory" element={wrapAdmin(<AdminBusinessDirectory />)} />
          <Route path="/admin-jobs" element={wrapAdmin(<AdminJobs />)} />
          <Route path="/admin-deals" element={wrapAdmin(<AdminDeals />)} />
          <Route path="/admin-nfc" element={wrapAdmin(<AdminNfc />)} />
          <Route path="/admin-rfq" element={wrapAdmin(<AdminRfq />)} />
          <Route path="/admin-obituaries-wishes" element={wrapAdmin(<AdminObituariesWishes />)} />

          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/login.html" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/directory" element={<PublicDirectory />} />
          <Route path="/directory/:slug" element={<PublicDirectoryDetail />} />
          <Route path="/directory.html" element={<Navigate to="/directory" replace />} />
          <Route path="/nfc" element={<NfcCardDashboard />} />
          <Route path="/card/:uid" element={<PublicNfcCard />} />
          <Route path="/deals" element={<PublicDeals />} />
          <Route path="/directory-dashboard" element={<BizDirectoryDashboard />} />
          <Route path="/my-rfqs" element={<MyRfqs />} />
          <Route path="/rfq" element={<PublicRfq />} />
          
          {/* Public News Portal Routes */}
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/article/:id/*" element={<ArticleDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/p/:slug" element={<CustomPageView />} />
          <Route path="/search" element={<AdvancedSearch />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/live-tv" element={<LiveTv />} />
          <Route path="/obituaries" element={<Obituaries />} />
          <Route path="/wishes" element={<Wishes />} />
          <Route path="/jobs" element={<PublicJobs />} />
          <Route path="/jobs/:id" element={<PublicJobDetail />} />
          <Route path="/classifieds" element={<Classifieds />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/institution-news" element={<InstitutionNews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
