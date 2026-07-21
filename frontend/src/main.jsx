import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'

// Dynamic PWA and Font settings initialization
const baseApiUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';

const initSitePreferences = async () => {
  try {
    const configsResponse = await fetch(baseApiUrl + '/public/settings');
    if (configsResponse.ok) {
      const settings = await configsResponse.json();
      if (settings) {
        const pwaName = settings.siteName || "KINGS 24x7 News Portal";
        const pwaShortName = settings.siteName || "KINGS 24x7";
        const themeColor = settings.siteColor || "#B3732A";
        const pwaBgColor = "#0F172A";

        const manifestContent = {
          "short_name": pwaShortName,
          "name": pwaName,
          "icons": [
            { "src": "/assets/icons/favicon-light.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/assets/icons/favicon-light.png", "sizes": "512x512", "type": "image/png" }
          ],
          "start_url": "/",
          "background_color": pwaBgColor,
          "theme_color": themeColor,
          "display": "standalone",
          "orientation": "portrait"
        };

        const stringManifest = JSON.stringify(manifestContent);
        const blob = new Blob([stringManifest], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(blob);
        const linkTag = document.getElementById('manifest-link');
        if (linkTag) {
          linkTag.setAttribute('href', manifestURL);
        }
      }
    }
  } catch (e) {
    console.warn("Dynamic PWA manifest initialization skipped, falling back to local static manifest.", e);
  }

  try {
    const fontsResponse = await fetch(baseApiUrl + '/admin/fonts'); // assume admin or mock public read
    if (fontsResponse.ok) {
      const fontsList = await fontsResponse.json();
      if (Array.isArray(fontsList) && fontsList.length > 0) {
        const activeFont = fontsList[0];
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = activeFont.fontUrl;
        document.head.appendChild(link);
        document.documentElement.style.setProperty('--font-primary', `'${activeFont.fontFamily}', sans-serif`);
      }
    }
  } catch (e) {
    console.warn("Typography dynamic loading skipped.");
  }
};

initSitePreferences();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
