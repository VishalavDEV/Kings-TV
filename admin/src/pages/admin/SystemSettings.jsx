import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Save, Server, Mail, Smartphone, MapPin, Video, HardDrive, Send } from 'lucide-react';

const SystemSettings = () => {
  const [config, setConfig] = useState({
    gpsNewsRadius: 15,
    videoLengthLimit: 55,
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smsGatewayKey: '',
    firebaseProjectId: '',
    cdnBaseUrl: '',
    cdnApiKey: '',
    telegramBotToken: '',
    telegramChatId: '',
    telegramEnabled: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/admin/config');
        if (Array.isArray(res.data)) {
          const mapped = {};
          res.data.forEach(item => {
            if (item.configKey === 'gps.news_radius_km') mapped.gpsNewsRadius = Number(item.configValue) || 15;
            if (item.configKey === 'video.max_duration_seconds') mapped.videoLengthLimit = Number(item.configValue) || 55;
            if (item.configKey === 'smtp.host') mapped.smtpHost = item.configValue || '';
            if (item.configKey === 'smtp.port') mapped.smtpPort = item.configValue || '587';
            if (item.configKey === 'smtp.username') mapped.smtpUsername = item.configValue || '';
            if (item.configKey === 'smtp.password') mapped.smtpPassword = item.configValue || '';
            if (item.configKey === 'sms.gateway_api_key') mapped.smsGatewayKey = item.configValue || '';
            if (item.configKey === 'firebase.config') mapped.firebaseProjectId = item.configValue || '';
            if (item.configKey === 'cdn.base_url') mapped.cdnBaseUrl = item.configValue || '';
            if (item.configKey === 'cdn.api_key') mapped.cdnApiKey = item.configValue || '';
            if (item.configKey === 'telegram.bot_token') mapped.telegramBotToken = item.configValue || '';
            if (item.configKey === 'telegram.chat_id') mapped.telegramChatId = item.configValue || '';
            if (item.configKey === 'telegram.enabled') mapped.telegramEnabled = item.configValue || 'false';
          });
          setConfig(prev => ({ ...prev, ...mapped }));
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveGroup = async (group) => {
    setSavingGroup(group);
    try {
      if (group === 'gps') {
        await api.put('/admin/config/gps', { radiusKm: String(config.gpsNewsRadius) });
      } else if (group === 'video') {
        await api.put('/admin/config/video-limit', { maxDurationSeconds: String(config.videoLengthLimit) });
      } else if (group === 'smtp') {
        await api.put('/admin/config/smtp', { 
          host: config.smtpHost, 
          port: config.smtpPort,
          username: config.smtpUsername,
          password: config.smtpPassword 
        });
      } else if (group === 'sms') {
        await api.put('/admin/config/sms', { apiKey: config.smsGatewayKey });
      } else if (group === 'firebase') {
        await api.put('/admin/config/firebase', { config: config.firebaseProjectId });
      } else if (group === 'cdn') {
        await api.put('/admin/config/cdn', { baseUrl: config.cdnBaseUrl, apiKey: config.cdnApiKey });
      } else if (group === 'telegram') {
        await api.put('/admin/config/telegram', { 
          botToken: config.telegramBotToken, 
          chatId: config.telegramChatId,
          enabled: String(config.telegramEnabled)
        });
      }
      alert(`${group.toUpperCase()} settings saved successfully.`);
    } catch (error) {
      console.error(error);
      alert(`Failed to save ${group} settings.`);
    }
    setSavingGroup('');
  };

  const handleSaveAll = async () => {
    setSavingGroup('all');
    try {
      await Promise.all([
        api.put('/admin/config/gps', { radiusKm: String(config.gpsNewsRadius) }),
        api.put('/admin/config/video-limit', { maxDurationSeconds: String(config.videoLengthLimit) }),
        api.put('/admin/config/smtp', { 
          host: config.smtpHost, 
          port: config.smtpPort,
          username: config.smtpUsername,
          password: config.smtpPassword 
        }),
        api.put('/admin/config/sms', { apiKey: config.smsGatewayKey }),
        api.put('/admin/config/firebase', { config: config.firebaseProjectId }),
        api.put('/admin/config/cdn', { baseUrl: config.cdnBaseUrl, apiKey: config.cdnApiKey }),
        api.put('/admin/config/telegram', { 
          botToken: config.telegramBotToken, 
          chatId: config.telegramChatId,
          enabled: String(config.telegramEnabled)
        })
      ]);
      alert('All settings saved successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to save some settings.');
    }
    setSavingGroup('');
  };

  if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading settings...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>System Configuration</h1>
          <p className="text-secondary" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Manage global parameters, asset CDN distribution, and third-party gateways.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveAll} disabled={savingGroup === 'all'}>
          <Save size={16} /> {savingGroup === 'all' ? 'Saving All...' : 'Save All Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* S3 Asset CDN Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '16px', fontWeight: 700 }}>
              <HardDrive size={20} color="var(--primary)" /> S3 Asset CDN Settings
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>CDN Base URL</label>
              <input 
                type="text" name="cdnBaseUrl" className="form-control" 
                value={config.cdnBaseUrl} onChange={handleChange} 
                placeholder="e.g. https://cdn.king24x7.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Overrides default S3 URL paths with a custom proxy CDN domain.
              </small>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>CDN API Key</label>
              <input 
                type="password" name="cdnApiKey" className="form-control" 
                value={config.cdnApiKey} onChange={handleChange} 
                placeholder="CDN Key/Secret (Encrypted at rest)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSaveGroup('cdn')} disabled={savingGroup !== ''}>
            {savingGroup === 'cdn' ? 'Saving CDN...' : 'Save CDN Settings'}
          </button>
        </div>

        {/* General Variables */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '16px', fontWeight: 700 }}>
              <Server size={20} color="var(--primary)" /> Portal Variables
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '13px' }}>
                <MapPin size={14} /> GPS News Radius (km)
              </label>
              <input 
                type="number" name="gpsNewsRadius" className="form-control" 
                value={config.gpsNewsRadius} onChange={handleChange} 
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '13px' }}>
                <Video size={14} /> Max Video Upload (sec)
              </label>
              <input 
                type="number" name="videoLengthLimit" className="form-control" 
                value={config.videoLengthLimit} onChange={handleChange} 
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => { handleSaveGroup('gps'); handleSaveGroup('video'); }} disabled={savingGroup !== ''}>
            {savingGroup === 'gps' || savingGroup === 'video' ? 'Saving...' : 'Save Variables'}
          </button>
        </div>

        {/* Email/SMTP */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '16px', fontWeight: 700 }}>
              <Mail size={20} color="var(--primary)" /> SMTP Mail Gateway
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>SMTP Host</label>
              <input 
                type="text" name="smtpHost" className="form-control" 
                value={config.smtpHost} onChange={handleChange} 
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>SMTP Port</label>
              <input 
                type="text" name="smtpPort" className="form-control" 
                value={config.smtpPort} onChange={handleChange} 
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSaveGroup('smtp')} disabled={savingGroup !== ''}>
            {savingGroup === 'smtp' ? 'Saving SMTP...' : 'Save SMTP Settings'}
          </button>
        </div>

        {/* SMS/OTP */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '16px', fontWeight: 700 }}>
              <Smartphone size={20} color="var(--primary)" /> SMS / OTP Gateway
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>API Key</label>
              <input 
                type="password" name="smsGatewayKey" className="form-control" 
                value={config.smsGatewayKey} onChange={handleChange} 
                placeholder="SMS Gateway API Key"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSaveGroup('sms')} disabled={savingGroup !== ''}>
            {savingGroup === 'sms' ? 'Saving SMS...' : 'Save SMS Settings'}
          </button>
        </div>

        {/* Telegram Bot Integration */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '16px', fontWeight: 700 }}>
              <Send size={20} color="var(--primary)" /> Telegram Bot Integration
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Telegram Bot Token</label>
              <input 
                type="password" name="telegramBotToken" className="form-control" 
                value={config.telegramBotToken} onChange={handleChange} 
                placeholder="Telegram API Token (Encrypted)"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>Channel / Chat Target ID</label>
              <input 
                type="text" name="telegramChatId" className="form-control" 
                value={config.telegramChatId} onChange={handleChange} 
                placeholder="e.g. @kingstv_alerts or -100xxxxxxxx"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--body-bg)', color: 'var(--text-dark)' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" name="telegramEnabled" id="telegramEnabled"
                checked={config.telegramEnabled === 'true' || config.telegramEnabled === true} 
                onChange={(e) => setConfig(prev => ({ ...prev, telegramEnabled: e.target.checked ? 'true' : 'false' }))}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="telegramEnabled" style={{ fontWeight: 600, fontSize: '13px', cursor: 'pointer', margin: 0 }}>
                Enable Automatic Pushes
              </label>
            </div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleSaveGroup('telegram')} disabled={savingGroup !== ''}>
            {savingGroup === 'telegram' ? 'Saving Telegram...' : 'Save Telegram Settings'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;
