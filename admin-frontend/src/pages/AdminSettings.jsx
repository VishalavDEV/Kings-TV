import React, { useState, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';
import './AdminSettings.css';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Firebase state
  const [firebaseConfig, setFirebaseConfig] = useState('');
  
  // YouTube state
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [youtubeChannelId, setYoutubeChannelId] = useState('');

  // CDN state
  const [cdnBaseUrl, setCdnBaseUrl] = useState('');
  const [cdnApiKey, setCdnApiKey] = useState('');

  // PWA state
  const [pwaName, setPwaName] = useState('');
  const [pwaShortName, setPwaShortName] = useState('');
  const [pwaThemeColor, setPwaThemeColor] = useState('#B3732A');
  const [pwaBgColor, setPwaBgColor] = useState('#0F172A');

  // Custom typography states
  const [fontsList, setFontsList] = useState([]);
  const [selectedFont, setSelectedFont] = useState('Noto Sans Tamil');
  const [customFontFile, setCustomFontFile] = useState(null);

  // Sitemap exclusions list
  const [sitemaps, setSitemaps] = useState([]);

  // Homepage layout builder state
  const [homepageLayout, setHomepageLayout] = useState([
    { id: 'Featured', active: true },
    { id: 'Latest', active: true },
    { id: 'Breaking Ticker', active: true },
    { id: 'Institution News', active: true },
    { id: 'Nearby/District feed', active: true },
    { id: 'Classifieds row', active: true },
    { id: 'Market Ticker', active: true },
    { id: 'Live TV embed', active: true }
  ]);

  // Market prices states
  const [marketPrices, setMarketPrices] = useState([]);
  const [newCommodity, setNewCommodity] = useState('');
  const [newPriceVal, setNewPriceVal] = useState('');

  // Available Google Web Fonts dropdown list
  const googleFonts = [
    'Noto Sans Tamil',
    'Inter',
    'Roboto',
    'Outfit',
    'Poppins',
    'Open Sans',
    'Lato',
    'Montserrat'
  ];

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      // Load general settings configs
      const configs = await fetchApi('/admin/config');
      if (Array.isArray(configs)) {
        const findVal = (key) => {
          const cfg = configs.find(c => c.configKey === key);
          return cfg ? cfg.configValue || '' : '';
        };

        setFirebaseConfig(findVal('firebase.config'));
        setYoutubeApiKey(findVal('youtube.api_key'));
        setYoutubeChannelId(findVal('youtube.channel_id'));
        setCdnBaseUrl(findVal('cdn.base_url'));
        setCdnApiKey(findVal('cdn.api_key'));
        setPwaName(findVal('pwa.name'));
        setPwaShortName(findVal('pwa.short_name'));
        setPwaThemeColor(findVal('pwa.theme_color') || '#B3732A');
        setPwaBgColor(findVal('pwa.background_color') || '#0F172A');

        // Parse Homepage Layout JSON
        const layoutVal = findVal('general.homepage_layout');
        if (layoutVal) {
          try {
            const parsed = JSON.parse(layoutVal);
            if (Array.isArray(parsed)) setHomepageLayout(parsed);
          } catch (e) {
            console.warn('Failed parsing general.homepage_layout JSON');
          }
        }
      }

      // Load fonts list
      const fonts = await fetchApi('/admin/fonts');
      if (Array.isArray(fonts)) {
        setFontsList(fonts);
        if (fonts.length > 0) {
          setSelectedFont(fonts[0].fontFamily);
        }
      }

      // Load sitemaps
      const sitemapsData = await fetchApi('/admin/sitemap-config');
      if (Array.isArray(sitemapsData)) {
        setSitemaps(sitemapsData);
      }

      // Fetch market prices
      const prices = await fetchApi('/market-prices');
      if (Array.isArray(prices)) {
        setMarketPrices(prices);
      }
    } catch (e) {
      console.error('Failed to load settings dashboards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Card submits
  const handleSaveFirebase = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/admin/config/firebase', {
        method: 'PUT',
        body: JSON.stringify({ config: firebaseConfig })
      });
      if (res && res.error) setErrorMsg(res.error);
      else setSuccessMsg('Firebase config card updated successfully.');
    } catch (err) {
      setErrorMsg('Failed to save Firebase configuration.');
    }
  };

  const handleSaveYoutube = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/admin/config/youtube', {
        method: 'PUT',
        body: JSON.stringify({ apiKey: youtubeApiKey, channelId: youtubeChannelId })
      });
      if (res && res.error) setErrorMsg(res.error);
      else setSuccessMsg('YouTube API keys updated successfully.');
    } catch (err) {
      setErrorMsg('Failed to save YouTube API credentials.');
    }
  };

  const handleSaveCdn = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/admin/config/cdn', {
        method: 'PUT',
        body: JSON.stringify({ baseUrl: cdnBaseUrl, apiKey: cdnApiKey })
      });
      if (res && res.error) setErrorMsg(res.error);
      else setSuccessMsg('CDN URL configurations updated successfully.');
    } catch (err) {
      setErrorMsg('Failed to save CDN settings.');
    }
  };

  const handleSavePwa = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/admin/config/pwa', {
        method: 'PUT',
        body: JSON.stringify({
          name: pwaName,
          shortName: pwaShortName,
          themeColor: pwaThemeColor,
          backgroundColor: pwaBgColor
        })
      });
      if (res && res.error) setErrorMsg(res.error);
      else {
        setSuccessMsg('PWA Manifest settings updated. Refresh to apply service worker updates.');
        // Trigger local PWA dynamic manifest regeneration helper
        localStorage.setItem('pwa_name', pwaName);
        localStorage.setItem('pwa_short_name', pwaShortName);
        localStorage.setItem('pwa_theme_color', pwaThemeColor);
        localStorage.setItem('pwa_bg_color', pwaBgColor);
      }
    } catch (err) {
      setErrorMsg('Failed to save PWA credentials.');
    }
  };

  const handleSaveFont = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      let fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
      
      const res = await fetchApi('/admin/fonts', {
        method: 'POST',
        body: JSON.stringify({
          fontFamily: selectedFont,
          fontSource: 'GOOGLE_FONTS',
          fontWeight: '400;700',
          fontUrl
        })
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Typography font '${selectedFont}' applied site-wide successfully!`);
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
        document.documentElement.style.setProperty('--font-primary', `'${selectedFont}', sans-serif`);
        
        loadAllSettings();
      }
    } catch (err) {
      setErrorMsg('Failed to apply font changes.');
    }
  };

  const handleToggleSitemapExclude = async (item) => {
    try {
      const res = await fetchApi(`/admin/sitemap-config/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isExcluded: !item.isExcluded })
      });
      if (res) {
        setSuccessMsg(`Sitemap exclusions updated for: ${item.pagePath}`);
        loadAllSettings();
      }
    } catch (e) {
      setErrorMsg('Failed to update sitemap options.');
    }
  };

  // Layout Builder helpers
  const handleMoveSection = (index, direction) => {
    const updated = [...homepageLayout];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updated.length) return;

    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHomepageLayout(updated);
  };

  const handleToggleSectionActive = (index) => {
    const updated = [...homepageLayout];
    updated[index].active = !updated[index].active;
    setHomepageLayout(updated);
  };

  const handleSaveHomepageLayout = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetchApi('/admin/settings/general', {
        method: 'PUT',
        body: JSON.stringify({
          general: {
            homepage_layout: JSON.stringify(homepageLayout)
          }
        })
      });
      if (res && res.error) setErrorMsg(res.error);
      else setSuccessMsg('Homepage custom sections layout builder configuration updated.');
    } catch (e) {
      setErrorMsg('Failed to update homepage sections layout configuration.');
    }
  };

  // Market Price Ticker CRUD helpers
  const handleAddCommodity = async (e) => {
    e.preventDefault();
    if (!newCommodity.trim() || !newPriceVal.trim()) return;
    try {
      const res = await fetchApi('/market-prices', {
        method: 'POST',
        body: JSON.stringify({ name: newCommodity, price: newPriceVal })
      });
      if (res) {
        setSuccessMsg(`Market commodity '${newCommodity}' added successfully.`);
        setNewCommodity('');
        setNewPriceVal('');
        const prices = await fetchApi('/market-prices');
        if (Array.isArray(prices)) setMarketPrices(prices);
      }
    } catch (err) {
      setErrorMsg('Failed to add commodity item.');
    }
  };

  const handleDeleteCommodity = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}'?`)) return;
    try {
      await fetchApi(`/market-prices/${id}`, { method: 'DELETE' });
      setSuccessMsg(`Commodity '${name}' removed.`);
      const prices = await fetchApi('/market-prices');
      if (Array.isArray(prices)) setMarketPrices(prices);
    } catch (err) {
      setErrorMsg('Failed to delete commodity.');
    }
  };

  return (
    <div className="admin-settings-container">
      <div className="pages-header">
        <h1>System Configuration</h1>
        <p className="subtitle">Project credentials, PWA properties, custom sitemaps, and design typography</p>
      </div>

      {successMsg && <div className="alert-banner success">{successMsg}</div>}
      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {loading ? (
        <div className="loading-state">Syncing setting cards...</div>
      ) : (
        <div className="settings-grid">
          
          {/* Card 1: Firebase Project config */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-solid fa-fire text-amber-500"></i>
              <h3>Firebase Project config</h3>
            </div>
            <form onSubmit={handleSaveFirebase}>
              <div className="form-group">
                <label>Firebase SDK Settings JSON</label>
                <textarea
                  value={firebaseConfig}
                  onChange={(e) => setFirebaseConfig(e.target.value)}
                  placeholder="Paste Firebase Config JSON here..."
                  rows="4"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Firebase Config</button>
            </form>
          </div>

          {/* Card 2: YouTube API credentials */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-brands fa-youtube text-red-500"></i>
              <h3>YouTube API credentials</h3>
            </div>
            <form onSubmit={handleSaveYoutube}>
              <div className="form-group">
                <label>YouTube API Key</label>
                <input
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>
              <div className="form-group">
                <label>Import Target YouTube Channel ID</label>
                <input
                  type="text"
                  value={youtubeChannelId}
                  onChange={(e) => setYoutubeChannelId(e.target.value)}
                  placeholder="UC..."
                />
              </div>
              <button type="submit" className="btn btn-primary">Save YouTube Keys</button>
            </form>
          </div>

          {/* Card 3: CDN URL configuration */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-solid fa-globe text-blue-500"></i>
              <h3>CDN URL configuration</h3>
            </div>
            <form onSubmit={handleSaveCdn}>
              <div className="form-group">
                <label>CDN Base URL (prepended site-wide)</label>
                <input
                  type="text"
                  value={cdnBaseUrl}
                  onChange={(e) => setCdnBaseUrl(e.target.value)}
                  placeholder="https://cdn.kings24x7.com"
                />
              </div>
              <div className="form-group">
                <label>CDN Api Key</label>
                <input
                  type="password"
                  value={cdnApiKey}
                  onChange={(e) => setCdnApiKey(e.target.value)}
                  placeholder="cdn_secret_api_key"
                />
              </div>
              <button type="submit" className="btn btn-primary">Save CDN Settings</button>
            </form>
          </div>

          {/* Card 4: PWA Configuration */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-solid fa-mobile-screen-button text-emerald-500"></i>
              <h3>PWA installable details</h3>
            </div>
            <form onSubmit={handleSavePwa}>
              <div className="form-group">
                <label>App Name</label>
                <input
                  type="text"
                  value={pwaName}
                  onChange={(e) => setPwaName(e.target.value)}
                  placeholder="KINGS 24x7 News Portal"
                />
              </div>
              <div className="form-group">
                <label>Short Name</label>
                <input
                  type="text"
                  value={pwaShortName}
                  onChange={(e) => setPwaShortName(e.target.value)}
                  placeholder="KINGS 24x7"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Theme Color</label>
                  <input
                    type="color"
                    value={pwaThemeColor}
                    onChange={(e) => setPwaThemeColor(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label>Background Color</label>
                  <input
                    type="color"
                    value={pwaBgColor}
                    onChange={(e) => setPwaBgColor(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Save PWA Manifest</button>
            </form>
          </div>

          {/* Card 5: Typography Fonts picker */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-solid fa-font text-purple-500"></i>
              <h3>Custom site typography</h3>
            </div>
            <form onSubmit={handleSaveFont}>
              <div className="form-group">
                <label>Select Google Web Font</label>
                <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}>
                  {googleFonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Upload Custom Font File (.woff, .woff2, .ttf)</label>
                <input
                  type="file"
                  onChange={(e) => setCustomFontFile(e.target.files[0])}
                  accept=".woff,.woff2,.ttf"
                />
              </div>
              <button type="submit" className="btn btn-primary">Apply Typography</button>
            </form>
          </div>

          {/* Card 6: Homepage dynamic layout ordering builder */}
          <div className="settings-card">
            <div className="card-header-icon">
              <i className="fa-solid fa-layer-group text-sky-500"></i>
              <h3>Homepage Section Layout Builder</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {homepageLayout.map((sec, idx) => (
                <div key={sec.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={sec.active}
                      onChange={() => handleToggleSectionActive(idx)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sec.active ? '#0f172a' : '#94a3b8' }}>
                      {sec.id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onClick={() => handleMoveSection(idx, -1)} disabled={idx === 0} style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <i className="fa-solid fa-arrow-up"></i>
                    </button>
                    <button type="button" onClick={() => handleMoveSection(idx, 1)} disabled={idx === homepageLayout.length - 1} style={{ padding: '0.25rem 0.5rem', border: 'none', background: 'white', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <i className="fa-solid fa-arrow-down"></i>
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleSaveHomepageLayout} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Save Layout Order
              </button>
            </div>
          </div>

          {/* Card 7: Market Prices ticker CRUD */}
          <div className="settings-card span-2">
            <div className="card-header-icon">
              <i className="fa-solid fa-arrow-trend-up text-amber-500"></i>
              <h3>Market Prices Ticker CRUD</h3>
            </div>
            <form onSubmit={handleAddCommodity} style={{ display: 'flex', gap: '8px', margin: '1rem 0' }}>
              <input
                type="text"
                placeholder="Commodity (e.g. Gold)"
                value={newCommodity}
                onChange={(e) => setNewCommodity(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="Price (e.g. Rs.72,000)"
                value={newPriceVal}
                onChange={(e) => setNewPriceVal(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Add Commodity</button>
            </form>
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Commodity Name</th>
                    <th>Ticker Price</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-table">No market commodities configured.</td>
                    </tr>
                  ) : (
                    marketPrices.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td><code className="text-emerald-600 font-bold">{item.price}</code></td>
                        <td>{new Date(item.updatedAt).toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteCommodity(item.id, item.name)}
                            className="action-btn delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 8: Sitemap Exclusions */}
          <div className="settings-card span-2">
            <div className="card-header-icon">
              <i className="fa-solid fa-sitemap text-teal-500"></i>
              <h3>Sitemap Indexing Controls</h3>
            </div>
            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Sitemap Target URL Path</th>
                    <th>Label</th>
                    <th>Weight</th>
                    <th>Exclude status</th>
                  </tr>
                </thead>
                <tbody>
                  {sitemaps.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-table">No pages registered in sitemap configuration.</td>
                    </tr>
                  ) : (
                    sitemaps.map(item => (
                      <tr key={item.id}>
                        <td><code>{item.pagePath}</code></td>
                        <td>{item.pageLabel || 'Static Page'}</td>
                        <td>{item.priority}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleSitemapExclude(item)}
                            style={{
                              border: 'none',
                              padding: '0.25rem 0.65rem',
                              fontSize: '0.75rem',
                              borderRadius: '9999px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              background: item.isExcluded ? '#fee2e2' : '#dcfce7',
                              color: item.isExcluded ? '#b91c1c' : '#15803d'
                            }}
                          >
                            {item.isExcluded ? 'Excluded (NOINDEX)' : 'Included'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminSettings;
