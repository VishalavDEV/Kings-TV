import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { LogOut, User, Moon, Sun } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { toggleLang, t } = useI18n();

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Breadcrumbs or page title could go here */}
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t('welcome')}, {user?.email}</h2>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => toggleLang()} 
          className="btn-toggle" 
          title="Toggle Language"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.5" cy="9.5" r="6.5" fill="var(--text-primary)" stroke="var(--text-primary)" strokeWidth="1"/>
            <text x="9.5" y="12.5" fontSize="9.5" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fill="var(--bg-primary)" textAnchor="middle">A</text>
            
            <circle cx="15.5" cy="15.5" r="6.5" fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth="1"/>
            <text x="15.5" y="18.5" fontSize="8.5" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fill="var(--text-primary)" textAnchor="middle">அ</text>

            <path d="M 8 14.5 C 8 17.5, 10 18.5, 12 17.5" stroke="var(--text-primary)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M 10.5 18.5 L 12.5 17.5 L 12 15.5" stroke="var(--text-primary)" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>

            <path d="M 16 9.5 C 16 6.5, 14 5.5, 12 6.5" stroke="var(--text-primary)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M 13.5 5.5 L 11.5 6.5 L 12 8.5" stroke="var(--text-primary)" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={toggleTheme} className="btn-toggle" title="Toggle Theme">
          <Moon size={16} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.email}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{user?.role?.replace('_', ' ')}</div>
          </div>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
