import React, { createContext, useState, useContext, useEffect } from 'react';
import enCommon from '../locales/en/common.json';
import taCommon from '../locales/ta/common.json';

const I18nContext = createContext(null);

const translations = {
  en: enCommon,
  ta: taCommon
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('king24x7_lang') || 'en');

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggleLang = (targetLang) => {
    const nextLang = targetLang || (lang === 'en' ? 'ta' : 'en');
    setLang(nextLang);
    localStorage.setItem('king24x7_lang', nextLang);
  };

  const t = (key) => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
