import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminThemes.css';

const AdminThemes = () => {
  const [themes, setThemes] = useState([]);
  const [activeThemeId, setActiveThemeId] = useState('theme-default');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activatingId, setActivatingId] = useState(null);

  const loadThemesData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/themes');
      if (res && Array.isArray(res.themes)) {
        setThemes(res.themes);
        setActiveThemeId(res.activeThemeId || 'theme-default');
      }
    } catch (err) {
      console.error('Failed to fetch site themes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemesData();
  }, []);

  const handleActivateTheme = async (themeId) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActivatingId(themeId);
    try {
      const res = await fetchApi(`/admin/themes/${themeId}/activate`, {
        method: 'POST'
      });
      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setActiveThemeId(themeId);
        setSuccessMsg('Theme activated successfully! Site appearance updated.');
      }
    } catch (err) {
      setErrorMsg('Failed to activate theme.');
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="admin-themes-container">
      <div className="pages-header">
        <h1>Appearance & Themes</h1>
        <p className="subtitle">Select and switch website design skins and color templates</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      {loading ? (
        <div className="loading-state">Loading themes grid...</div>
      ) : (
        <div className="themes-grid-layout">
          {themes.map((theme) => {
            const isActive = theme.id === activeThemeId;
            return (
              <div key={theme.id} className={`theme-card-wrapper ${isActive ? 'active-border' : ''}`}>
                <div className="theme-thumbnail-wrapper">
                  <img src={theme.thumbnailUrl} alt={theme.name} />
                  {isActive && <span className="active-tag-badge">Active Theme</span>}
                </div>
                <div className="theme-card-body">
                  <h3>{theme.name}</h3>
                  <div className="card-actions-wrapper">
                    {isActive ? (
                      <button type="button" className="btn btn-secondary w-full" disabled>
                        Activated & Locked
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={() => handleActivateTheme(theme.id)}
                        disabled={activatingId !== null}
                      >
                        {activatingId === theme.id ? 'Activating...' : 'Activate Theme'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminThemes;
