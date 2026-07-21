import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { 
  LayoutDashboard, Users, Settings, FileText, AlertTriangle, 
  PieChart, Edit3, Tags, BellRing, Layout, HelpCircle, 
  Key, Activity, Calendar, DollarSign, X, Globe
} from 'lucide-react';

const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, hasAnyRole } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const getNewsSiteUrl = () => {
    const host = window.location.hostname;
    return (host === 'localhost' || host === '127.0.0.1')
      ? 'http://localhost:5173'
      : 'https://king-tv.test-technoprint.online/kingstv/';
  };

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
            KINGS <span style={{ color: 'var(--text-primary)' }}>TV ADMIN</span>
          </span>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close Menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">{t('main')}</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            {t('dashboard')}
          </NavLink>

          {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
            <>
              <div className="nav-section-title">📰 {t('newsroom')}</div>
              <NavLink to="/admin/editorial-calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Calendar size={18} />
                {t('editorialCalendar')}
              </NavLink>
              <NavLink to="/admin/news" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={18} />
                {t('newsManagement')}
              </NavLink>
              <NavLink to="/admin/news/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Edit3 size={18} />
                {t('createArticle')}
              </NavLink>
              <NavLink to="/admin/ugc-queue" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                {t('ugcQueue')}
              </NavLink>
              <NavLink to="/admin/breaking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <AlertTriangle size={18} />
                {t('breakingNews')}
              </NavLink>

              <div className="nav-section-title">📊 {t('analytics')}</div>
              <NavLink to="/admin/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PieChart size={18} />
                {t('analytics')}
              </NavLink>

              <div className="nav-section-title">🏗️ {t('content')}</div>
              <NavLink to="/admin/content" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={18} />
                {t('contentQueue')}
              </NavLink>
            </>
          )}

          {hasAnyRole(['MOBILE_JOURNALIST', 'INSTITUTION_LOGIN', 'SUPER_ADMIN']) && (
            <>
              <div className="nav-section-title">{t('workspace')}</div>
              <NavLink to="/journalist/posts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Edit3 size={18} />
                {t('myPosts')}
              </NavLink>
            </>
          )}

          {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
            <>
              <div className="nav-section-title">{t('engagementLayout')}</div>
              <NavLink to="/admin/push" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <BellRing size={18} />
                {t('push')}
              </NavLink>
              <NavLink to="/admin/layout" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Layout size={18} />
                {t('layout')}
              </NavLink>
            </>
          )}

          {hasAnyRole(['SUPER_ADMIN']) && (
            <>
              <div className="nav-section-title">💰 {t('monetization')}</div>
              <NavLink to="/admin/ads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <DollarSign size={18} />
                {t('adManagement')}
              </NavLink>

              <div className="nav-section-title">⚙️ {t('administration')}</div>
              <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                {t('userAccounts')}
              </NavLink>
              <NavLink to="/admin/roles" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Key size={18} />
                {t('rolesPermissions')}
              </NavLink>
              <NavLink to="/admin/taxonomy" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Tags size={18} />
                {t('taxonomy')}
              </NavLink>
              <NavLink to="/admin/surveys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <HelpCircle size={18} />
                {t('surveys')}
              </NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Settings size={18} />
                {t('settings')}
              </NavLink>
              <NavLink to="/admin/profanity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <AlertTriangle size={18} />
                {t('profanity')}
              </NavLink>
              <NavLink to="/admin/audit-logs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Activity size={18} />
                {t('audit')}
              </NavLink>
            </>
          )}

          <a href={getNewsSiteUrl()} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: 'var(--primary)' }}>
            <Globe size={18} />
            <span>{t('viewNewsSite')}</span>
          </a>
        </nav>
      </aside>
    </>
  );
};

export default MobileDrawer;
