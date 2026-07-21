import { useI18n } from '../../context/I18nContext';
import React, { useState, useEffect } from 'react';
import api from '../../api';

const NotificationPreferences = () => {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState({
    email_breaking_news: false,
    email_daily_digest: false,
    sms_breaking_news: false,
    sms_otp_only: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/config/group/notifications');
      if (res.data) {
        const mapped = { ...prefs };
        res.data.forEach(item => {
          if (item.configKey === 'notify.email.breaking') mapped.email_breaking_news = item.configValue === 'true';
          if (item.configKey === 'notify.email.daily') mapped.email_daily_digest = item.configValue === 'true';
          if (item.configKey === 'notify.sms.breaking') mapped.sms_breaking_news = item.configValue === 'true';
          if (item.configKey === 'notify.sms.otp') mapped.sms_otp_only = item.configValue === 'true';
        });
        setPrefs(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPrefs(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    try {
      await api.put('/admin/config/notifications', {
        emailBreaking: prefs.email_breaking_news ? 'true' : 'false',
        emailDaily: prefs.email_daily_digest ? 'true' : 'false',
        smsBreaking: prefs.sms_breaking_news ? 'true' : 'false',
        smsOtp: prefs.sms_otp_only ? 'true' : 'false'
      });
      alert('Notification preferences saved.');
    } catch (e) {
      alert('Failed to save preferences.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">Email Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" name="email_breaking_news" checked={prefs.email_breaking_news} onChange={handleChange} className="form-checkbox h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">Send Breaking News Alerts to all Subscribers</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" name="email_daily_digest" checked={prefs.email_daily_digest} onChange={handleChange} className="form-checkbox h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">Send Daily Digest (Automated via cron)</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">SMS Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" name="sms_breaking_news" checked={prefs.sms_breaking_news} onChange={handleChange} className="form-checkbox h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">Send Breaking News via SMS (High Cost)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" name="sms_otp_only" checked={prefs.sms_otp_only} onChange={handleChange} className="form-checkbox h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">Restrict SMS to OTP/Auth ONLY</span>
          </label>
        </div>
      </div>

      <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700">
        Save Preferences
      </button>
    </div>
  );
};

export default NotificationPreferences;
