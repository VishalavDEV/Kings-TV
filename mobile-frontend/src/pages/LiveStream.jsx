import React from 'react';
import { Tv, Play } from 'lucide-react';

const LiveStream = () => {
  return (
    <div>
      <div className="mobile-card" style={{ padding: '0.75rem' }}>
        <div style={{
          width: '100%',
          height: '220px',
          background: '#000000',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <span className="live-badge" style={{ position: 'absolute', top: '12px', left: '12px' }}>
            <Tv size={12} /> LIVE 24x7
          </span>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(179, 115, 42, 0.5)'
          }}>
            <Play size={24} color="#FFF" style={{ marginLeft: '4px' }} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Kings TV நேரலை ஒளிபரப்பு
          </p>
        </div>
      </div>

      <div className="mobile-card" style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          📺 24x7 நேரலை தொலைக்காட்சி
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          நாமக்கல் மற்றும் தமிழ்நாடு செய்திகளை உடனுக்குடன் நேரலையில் காணுங்கள்.
        </p>
      </div>
    </div>
  );
};

export default LiveStream;
