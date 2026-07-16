import React, { createContext, useState, useContext } from 'react';

const I18nContext = createContext(null);

const translations = {
  en: {
    dashboard: 'Dashboard',
    users: 'User Management',
    settings: 'System Configuration',
    profanity: 'Profanity Manager',
    layout: 'Home Layout',
    push: 'Push Notifications',
    seo: 'SEO Settings',
    sitemap: 'Sitemap',
    fonts: 'Font Manager',
    taxonomy: 'Taxonomy (Categories/Districts)',
    surveys: 'Surveys & Polls',
    webstore: 'Webstore',
    audit: 'Audit Logs',
    logout: 'Log Out',
    welcome: 'Welcome back',
    tamil: 'Tamil',
    english: 'English',
    save: 'Save Changes',
    cancel: 'Cancel',
    status: 'Status',
    action: 'Action',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create New',
    suspend: 'Suspend',
    active: 'Active',
    suspended: 'Suspended',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    review: 'Review Content',
    ugc: 'UGC Queue',
    aiRewrite: 'AI Paraphrase',
    analytics: 'Reports & Analytics',
    videoLength: 'Max Video Length',
    gpsRadius: 'GPS Target Radius (KM)',
    recentLogs: 'Recent Action Logs'
  },
  ta: {
    dashboard: 'முகப்பு பலகை',
    users: 'பயனர்கள் மேலாண்மை',
    settings: 'அமைப்புகள் திருத்தம்',
    profanity: 'தவறான சொற்கள் தடுப்பான்',
    layout: 'முகப்பு தள அமைப்பு',
    push: 'புஷ் அறிவிப்புகள்',
    seo: 'தேடுபொறி உகந்ததாக்கல்',
    sitemap: 'தள வரைபடம்',
    fonts: 'எழுத்துரு மேலாண்மை',
    taxonomy: 'வகைப்பாடு (பகுப்புகள்/மாவட்டங்கள்)',
    surveys: 'கருத்துக்கணிப்புகள்',
    webstore: 'வலை அங்காடி',
    audit: 'தணிக்கை பதிவுகள்',
    logout: 'வெளியேறு',
    welcome: 'நல்வரவு',
    tamil: 'தமிழ்',
    english: 'ஆங்கிலம்',
    save: 'மாற்றங்களைச் சேமி',
    cancel: 'ரத்து செய்',
    status: 'நிலை',
    action: 'செயல்பாடு',
    name: 'பெயர்',
    email: 'மின்னஞ்சல்',
    role: 'பொறுப்பு',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    create: 'புதியதாக உருவாக்கு',
    suspend: 'தற்காலிக நிறுத்தம்',
    active: 'செயலில்',
    suspended: 'நிறுத்தப்பட்டது',
    pending: 'காத்திருக்கிறது',
    approved: 'ஏற்கப்பட்டது',
    rejected: 'நிராகரிக்கப்பட்டது',
    review: 'உள்ளடக்க மதிப்பாய்வு',
    ugc: 'வாசகர் செய்திகள்',
    aiRewrite: 'செயற்கை நுண்ணறிவு திருத்தம்',
    analytics: 'அறிக்கைகள் & பகுப்பாய்வு',
    videoLength: 'அதிகபட்ச வீடியோ நீளம்',
    gpsRadius: 'ஜிபிஎஸ் எல்லை (கிமீ)',
    recentLogs: 'சமீபத்திய தணிக்கை குறிப்புகள்'
  }
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('admin_lang') || 'en');

  const toggleLang = (targetLang) => {
    const nextLang = targetLang || (lang === 'en' ? 'ta' : 'en');
    setLang(nextLang);
    localStorage.setItem('admin_lang', nextLang);
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
