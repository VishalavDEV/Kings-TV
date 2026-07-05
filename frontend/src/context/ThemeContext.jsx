import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('king24x7_theme') || 'light');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('king24x7_primaryColor') || '#0057FF');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('king24x7_fontSize') || 'medium');
  const [widgetWidth, setWidgetWidth] = useState(() => parseInt(localStorage.getItem('king24x7_widgetWidth')) || 640);
  const [slideSpeed, setSlideSpeed] = useState(() => parseInt(localStorage.getItem('king24x7_slideSpeed')) || 8);
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem('king24x7_sections');
      return saved ? JSON.parse(saved) : {
        hero: true, video: true, stories: true, agri: true,
        election: true, livetv: true, poll: true, digest: true,
        newsletter: true, district: true, business: true
      };
    } catch {
      return {
        hero: true, video: true, stories: true, agri: true,
        election: true, livetv: true, poll: true, digest: true,
        newsletter: true, district: true, business: true
      };
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('king24x7_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-dark', primaryColor + 'CC');
    document.documentElement.style.setProperty('--primary-light', primaryColor + '1A');
    localStorage.setItem('king24x7_primaryColor', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.body.style.fontSize = sizes[fontSize];
    localStorage.setItem('king24x7_fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('king24x7_widgetWidth', widgetWidth);
  }, [widgetWidth]);

  useEffect(() => {
    localStorage.setItem('king24x7_slideSpeed', slideSpeed);
  }, [slideSpeed]);

  useEffect(() => {
    localStorage.setItem('king24x7_sections', JSON.stringify(sections));
  }, [sections]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const toggleSection = (sectionId) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const resetAll = () => {
    setTheme('light');
    setPrimaryColor('#0057FF');
    setFontSize('medium');
    setWidgetWidth(640);
    setSlideSpeed(8);
    setSections({
      hero: true, video: true, stories: true, agri: true,
      election: true, livetv: true, poll: true, digest: true,
      newsletter: true, district: true, business: true
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme,
      primaryColor, setPrimaryColor,
      fontSize, setFontSize,
      widgetWidth, setWidgetWidth,
      slideSpeed, setSlideSpeed,
      sections, setSections, toggleSection,
      resetAll
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
