import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Moon, Sun } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Breadcrumbs or page title could go here */}
        <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Welcome back, {user?.email}</h2>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
