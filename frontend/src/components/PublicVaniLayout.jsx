import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './PublicVaniLayout.css';

const PublicVaniLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [userData, setUserData] = useState({
    fullName: 'Super Admin',
    email: 'admin@king24x7.com',
    role: 'SUPERADMIN'
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-gauge-high' },
    { label: 'Analytics Reports', path: '/analytics', icon: 'fa-solid fa-chart-column' },
    { label: 'Add Post', path: '/posts/add', icon: 'fa-solid fa-plus-circle' },
    { label: 'Manage All Posts', path: '/posts', icon: 'fa-solid fa-newspaper' },
    { label: 'Slider Posts', path: '/posts/slider', icon: 'fa-solid fa-images' },
    { label: 'Featured Posts', path: '/posts/featured', icon: 'fa-solid fa-star' },
    { label: 'Breaking News', path: '/posts/breaking', icon: 'fa-solid fa-bolt' },
    { label: 'Recommended Posts', path: '/posts/recommended', icon: 'fa-solid fa-thumbs-up' },
    { label: 'Pending Posts', path: '/posts/pending', icon: 'fa-solid fa-clock' },
    { label: 'Scheduled Posts', path: '/posts/scheduled', icon: 'fa-solid fa-calendar-days' },
    { label: 'Drafts', path: '/posts/drafts', icon: 'fa-solid fa-file-pen' },
    { label: 'Bulk Post Upload', path: '/posts/bulk-upload', icon: 'fa-solid fa-cloud-arrow-up' },
    { label: 'RSS Feeds', path: '/rss-feeds', icon: 'fa-solid fa-rss' },
    { label: 'Categories', path: '/categories', icon: 'fa-solid fa-folder-tree' },
    { label: 'Subcategories', path: '/categories/subcategories', icon: 'fa-solid fa-list-check' },
    { label: 'Navigation Menu', path: '/navigation', icon: 'fa-solid fa-bars-staggered' },
    { label: 'Pages', path: '/pages', icon: 'fa-solid fa-file-lines' },
    { label: 'Widgets', path: '/widgets', icon: 'fa-solid fa-cubes' },
    { label: 'Opinion Polls', path: '/polls', icon: 'fa-solid fa-square-poll-vertical' },
    { label: 'Photo Gallery', path: '/gallery', icon: 'fa-solid fa-images' },
    { label: 'Comments Queue', path: '/comments', icon: 'fa-solid fa-comments' },
    { label: 'Contact Messages', path: '/contact-messages', icon: 'fa-solid fa-envelope' },
    { label: 'Newsletter', path: '/newsletter', icon: 'fa-solid fa-paper-plane' },
    { label: 'Roles & Permissions', path: '/roles', icon: 'fa-solid fa-user-shield' },
    { label: 'Push Alerts', path: '/push-notifications', icon: 'fa-solid fa-bell' },
    { label: 'Live Streams', path: '/livestream-settings', icon: 'fa-solid fa-tower-broadcast' },
    { label: 'System Settings', path: '/settings', icon: 'fa-solid fa-gears' },
    { label: 'Profanity Moderation', path: '/profanity-filter', icon: 'fa-solid fa-filter' },
    { label: 'Classifieds Manager', path: '/classifieds-manager', icon: 'fa-solid fa-tags' },
    { label: 'Directory Listings', path: '/admin-directory', icon: 'fa-solid fa-store' },
    { label: 'Jobs Manager', path: '/admin-jobs', icon: 'fa-solid fa-briefcase' },
    { label: 'Deals & Offers', path: '/admin-deals', icon: 'fa-solid fa-gift' },
    { label: 'NFC Card Manager', path: '/admin-nfc', icon: 'fa-solid fa-id-card' },
    { label: 'RFQ Moderation', path: '/admin-rfq', icon: 'fa-solid fa-file-contract' },
    { label: 'Obits & Wishes', path: '/admin-obituaries-wishes', icon: 'fa-solid fa-ribbon' },
    { label: 'Themes & Skins', path: '/themes', icon: 'fa-solid fa-palette' }
  ];

  return (
    <div className={`pv-admin-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Dark Sidebar */}
      <aside className="pv-sidebar">
        <div className="pv-sidebar-header">
          <div className="app-brand-logo">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <span className="app-brand-name">Public Vani Panel</span>
        </div>

        {/* Online status block */}
        <div className="pv-admin-profile-block">
          <div className="avatar-circle">
            {(userData.fullName || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <span className="profile-name">{userData.fullName || 'Admin User'}</span>
            <div className="status-indicator">
              <span className="online-dot"></span>
              <span className="status-text">Online</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="pv-sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-link-item ${isActive ? 'active' : ''}`}>
                    <i className={`${item.icon} nav-icon`}></i>
                    <span className="nav-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="pv-main-wrapper">
        {/* Top Header Bar */}
        <header className="pv-header-bar">
          <div className="header-left">
            <button
              type="button"
              className="toggle-sidebar-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle Sidebar"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>

          <div className="header-right">
            {/* View Site Green Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-view-site"
              title="Open Public Site in New Tab"
            >
              <i className="fa-solid fa-arrow-up-right-from-square mr-1.5"></i>
              View Site
            </a>

            {/* Language Switcher */}
            <div className="lang-switcher">
              <button
                type="button"
                className="lang-btn"
                onClick={() => setCurrentLang(currentLang === 'en' ? 'ta' : 'en')}
              >
                <i className="fa-solid fa-globe"></i>
                <span>{currentLang === 'en' ? 'English' : 'தமிழ்'}</span>
              </button>
            </div>

            {/* Admin User Profile Dropdown */}
            <div className="admin-user-dropdown-container">
              <button
                type="button"
                className="admin-dropdown-trigger"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="mini-avatar">
                  {(userData.fullName || 'A').charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{userData.fullName}</span>
                <i className="fa-solid fa-chevron-down text-xs ml-1"></i>
              </button>

              {userDropdownOpen && (
                <div className="admin-dropdown-menu">
                  <div className="dropdown-user-header">
                    <strong>{userData.fullName}</strong>
                    <span className="text-xs text-gray-500 block">{userData.email}</span>
                  </div>
                  <hr className="my-1 border-gray-200" />
                  <button
                    type="button"
                    className="dropdown-item danger text-red-600 w-full text-left"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="pv-content-body">{children}</main>
      </div>
    </div>
  );
};

export default PublicVaniLayout;
