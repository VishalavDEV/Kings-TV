import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PieChart, Settings, Users } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const BottomNav = () => {
  const { t } = useI18n();

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>{t('dashboard')}</span>
      </NavLink>

      <NavLink to="/admin/news" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={18} />
        <span>செய்திகள்</span>
      </NavLink>

      <NavLink to="/admin/analytics" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <PieChart size={18} />
        <span>{t('analytics')}</span>
      </NavLink>

      <NavLink to="/admin/users" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Users size={18} />
        <span>பயனர்கள்</span>
      </NavLink>

      <NavLink to="/admin/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Settings size={18} />
        <span>அமைப்புகள்</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
