import React from 'react';
import { Menu, X, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const MobileHeader = ({ onToggleDrawer, isDrawerOpen }) => {
  const { user, logout } = useAuth();
  const { toggleLang, t } = useI18n();

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleDrawer} 
          aria-label="Toggle Menu"
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
          KINGS <span style={{ color: 'var(--text-primary)' }}>TV</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={() => toggleLang()} 
          className="btn-toggle" 
          title="Toggle Language"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.5" cy="9.5" r="6.5" fill="var(--text-primary)" stroke="var(--text-primary)" strokeWidth="1"/>
            <text x="9.5" y="12.5" fontSize="9.5" fontFamily="Inter, sans-serif" fontWeight="800" fill="var(--bg-primary)" textAnchor="middle">A</text>
            <circle cx="15.5" cy="15.5" r="6.5" fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth="1"/>
            <text x="15.5" y="18.5" fontSize="8.5" fontFamily="Inter, sans-serif" fontWeight="800" fill="var(--text-primary)" textAnchor="middle">அ</text>
          </svg>
        </button>

        <button onClick={toggleTheme} className="btn-toggle" title="Toggle Theme">
          <Moon size={15} />
        </button>

        {user && (
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }} title="Logout">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
