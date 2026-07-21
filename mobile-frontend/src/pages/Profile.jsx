import React from 'react';
import { User, Settings, Bell, Globe, LogOut } from 'lucide-react';

const Profile = () => {
  return (
    <div>
      <div className="mobile-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--primary-glow)', border: '2px solid var(--primary)',
          margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <User size={32} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>வணக்கம், வாசகர்</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reader@kingstv.com</p>
      </div>

      <div className="mobile-card" style={{ padding: '0.5rem 1rem' }}>
        <div style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem' }}>செய்தி அறிவிப்புகள் (Notifications)</span>
        </div>
        <div style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Globe size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem' }}>மொழி / Language (தமிழ்)</span>
        </div>
        <div style={{ padding: '0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
          <LogOut size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>வெளியேறு (Logout)</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
