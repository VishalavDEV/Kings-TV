import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Save, Server, Mail, Smartphone, MapPin, Video } from 'lucide-react';

const SystemSettings = () => {
  const [config, setConfig] = useState({
    gpsNewsRadius: 10,
    videoLengthLimit: 55,
    smtpHost: '',
    smtpPort: '',
    smsGatewayKey: '',
    firebaseProjectId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/admin/config');
        if (res.data) setConfig(prev => ({ ...prev, ...res.data }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/config', config);
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-fade-in">Loading settings...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>System Configuration</h1>
          <p className="text-secondary">Manage global parameters and third-party integrations.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* General Settings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Server size={20} color="var(--primary)" /> Portal Variables
          </h3>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} /> GPS News Radius (km)
            </label>
            <input 
              type="number" name="gpsNewsRadius" className="form-control" 
              value={config.gpsNewsRadius} onChange={handleChange} 
            />
            <small style={{ color: 'var(--text-muted)' }}>Public API will filter local news within this radius.</small>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={14} /> Max Video Upload Length (sec)
            </label>
            <input 
              type="number" name="videoLengthLimit" className="form-control" 
              value={config.videoLengthLimit} onChange={handleChange} 
            />
            <small style={{ color: 'var(--text-muted)' }}>Limits mobile journalist UGC uploads.</small>
          </div>
        </div>

        {/* Auth / Firebase */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Server size={20} color="var(--primary)" /> Firebase Auth (OAuth/OTP)
          </h3>
          <div className="form-group">
            <label className="form-label">Firebase Project ID</label>
            <input 
              type="text" name="firebaseProjectId" className="form-control" 
              value={config.firebaseProjectId} onChange={handleChange} 
            />
          </div>
        </div>

        {/* Email/SMTP */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Mail size={20} color="var(--primary)" /> SMTP Mail Gateway
          </h3>
          <div className="form-group">
            <label className="form-label">SMTP Host</label>
            <input 
              type="text" name="smtpHost" className="form-control" 
              value={config.smtpHost} onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">SMTP Port</label>
            <input 
              type="text" name="smtpPort" className="form-control" 
              value={config.smtpPort} onChange={handleChange} 
            />
          </div>
        </div>

        {/* SMS/OTP */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Smartphone size={20} color="var(--primary)" /> SMS / OTP Gateway
          </h3>
          <div className="form-group">
            <label className="form-label">API Key (Encrypted at rest)</label>
            <input 
              type="password" name="smsGatewayKey" className="form-control" 
              value={config.smsGatewayKey} onChange={handleChange} 
              placeholder="••••••••••••••••"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;
