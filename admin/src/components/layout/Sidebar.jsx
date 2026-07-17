import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText,
  AlertTriangle,
  PieChart,
  Edit3,
  Tags,
  BellRing,
  Layout,
  HelpCircle,
  Key,
  Activity
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

const Sidebar = () => {
  const { user, hasAnyRole } = useAuth();
  const { t } = useI18n();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="assets/logo-banner-light.png" alt="King TV Admin" />
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section-title">{t('main')}</div>
        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          {t('dashboard')}
        </NavLink>
        
        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <NavLink to="/admin/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <PieChart size={18} />
            {t('analytics')}
          </NavLink>
        )}
        
        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <>
            <div className="nav-section-title">{t('management')}</div>
            <NavLink to="/admin/news" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              News Management
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              {t('userAccounts')}
            </NavLink>
            <NavLink to="/admin/content" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              {t('contentQueue')}
            </NavLink>
          </>
        )}

        {hasAnyRole(['MOBILE_JOURNALIST', 'INSTITUTION_LOGIN']) && (
          <>
            <div className="nav-section-title">{t('workspace')}</div>
            <NavLink to="/journalist/posts" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Edit3 size={18} />
              {t('myPosts')}
            </NavLink>
          </>
        )}

        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <>
            <div className="nav-section-title">{t('engagementLayout')}</div>
            <NavLink to="/admin/push" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <BellRing size={18} />
              {t('push')}
            </NavLink>
            <NavLink to="/admin/layout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Layout size={18} />
              {t('layout')}
            </NavLink>
          </>
        )}

        {hasAnyRole(['SUPER_ADMIN']) && (
          <>
            <div className="nav-section-title">{t('configuration')}</div>
            <NavLink to="/admin/roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Key size={18} />
              {t('rolesPermissions')}
            </NavLink>
            <NavLink to="/admin/taxonomy" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tags size={18} />
              {t('taxonomy')}
            </NavLink>
            <NavLink to="/admin/surveys" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <HelpCircle size={18} />
              {t('surveys')}
            </NavLink>
            <NavLink to="/admin/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={18} />
              {t('settings')}
            </NavLink>
            <NavLink to="/admin/profanity" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={18} />
              {t('profanity')}
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              {t('audit')}
            </NavLink>
          </>
        )}
        
        <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          {t('myProfile')}
        </NavLink>
        
        {(() => {
          const getNewsSiteUrl = () => {
            const host = window.location.hostname;
            return (host === 'localhost' || host === '127.0.0.1')
              ? 'http://localhost:5173'
              : 'https://king-tv.test-technoprint.online/kingstv/';
          };
          return (
            <a href={getNewsSiteUrl()} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: 'var(--primary)' }}>
              <i className="fas fa-globe" style={{ fontSize: '18px', width: '18px', display: 'inline-flex', justifyContent: 'center' }}></i>
              <span style={{ marginLeft: '6px' }}>View News Site</span>
            </a>
          );
        })()}
      </nav>
    </aside>
  );
};

export default Sidebar;
