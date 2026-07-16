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

const Sidebar = () => {
  const { user, hasAnyRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/assets/logo-banner-light.png" alt="King TV Admin" />
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        
        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <NavLink to="/admin/analytics" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <PieChart size={18} />
            Analytics
          </NavLink>
        )}
        
        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <>
            <div className="nav-section-title">Management</div>
            <NavLink to="/admin/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              User Accounts
            </NavLink>
            <NavLink to="/admin/content" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              Content Queue
            </NavLink>
          </>
        )}

        {hasAnyRole(['MOBILE_JOURNALIST', 'INSTITUTION_LOGIN']) && (
          <>
            <div className="nav-section-title">Workspace</div>
            <NavLink to="/journalist/posts" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Edit3 size={18} />
              My Posts
            </NavLink>
          </>
        )}

        {hasAnyRole(['SUPER_ADMIN', 'CHIEF_EDITOR']) && (
          <>
            <div className="nav-section-title">Engagement & Layout</div>
            <NavLink to="/admin/push" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <BellRing size={18} />
              Push Notifications
            </NavLink>
            <NavLink to="/admin/layout" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Layout size={18} />
              Home Layout
            </NavLink>
          </>
        )}

        {hasAnyRole(['SUPER_ADMIN']) && (
          <>
            <div className="nav-section-title">Configuration</div>
            <NavLink to="/admin/roles" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Key size={18} />
              Roles & Permissions
            </NavLink>
            <NavLink to="/admin/taxonomy" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tags size={18} />
              Taxonomy Manager
            </NavLink>
            <NavLink to="/admin/surveys" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <HelpCircle size={18} />
              Survey Builder
            </NavLink>
            <NavLink to="/admin/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={18} />
              System Settings
            </NavLink>
            <NavLink to="/admin/profanity" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <AlertTriangle size={18} />
              Profanity Filter
            </NavLink>
            <NavLink to="/admin/audit-logs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Activity size={18} />
              Audit Logs
            </NavLink>
          </>
        )}
        
        <div className="nav-section-title">Personal</div>
        <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          My Profile
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
