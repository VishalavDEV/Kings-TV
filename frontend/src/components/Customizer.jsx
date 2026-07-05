import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Customizer = () => {
  const { t } = useContext(LanguageContext);
  const {
    primaryColor, setPrimaryColor,
    fontSize, setFontSize,
    widgetWidth, setWidgetWidth,
    slideSpeed, setSlideSpeed,
    sections, toggleSection,
    resetAll
  } = useContext(ThemeContext);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="customizer-toggle" 
        onClick={() => setIsOpen(true)}
        aria-label="Open design customizer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          transition: 'all 0.3s'
        }}
      >
        <i className="fas fa-cog fa-spin"></i>
      </button>

      <div 
        className={`customizer-panel ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-350px',
          width: '320px',
          height: '100vh',
          background: 'var(--card-bg)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          transition: 'right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-sliders-h" style={{ color: 'var(--primary)' }}></i>
            {t('வடிவமைப்பு மாற்றி')}
          </h3>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', fontSize: '18px', cursor: 'pointer' }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {t('வண்ணம்')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#0057FF', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(c => (
                <button 
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c,
                    border: primaryColor === c ? '3px solid white' : 'none',
                    boxShadow: '0 0 0 2px ' + (primaryColor === c ? 'var(--primary)' : 'transparent'),
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {t('எழுத்து அளவு')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['small', 'medium', 'large'].map(sz => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: fontSize === sz ? 'var(--primary)' : 'var(--card-bg)',
                    color: fontSize === sz ? 'white' : 'var(--text-dark)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {sz === 'small' ? t('சிறிய') : sz === 'medium' ? t('நடுத்தர') : t('பெரிய')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              {t('இடது பக்கப்பட்டி அகலம் (பிக்சல்)')}: {widgetWidth}px
            </label>
            <input 
              type="range" 
              min="200" 
              max="400" 
              value={widgetWidth}
              onChange={(e) => setWidgetWidth(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              {t('நகரும் வேகம் (வினாடி)')}: {slideSpeed}s
            </label>
            <input 
              type="range" 
              min="3" 
              max="15" 
              value={slideSpeed}
              onChange={(e) => setSlideSpeed(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {t('பகுதி தெரிவுநிலை')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.keys(sections).map(sec => (
                <label key={sec} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <span style={{ textTransform: 'capitalize' }}>{sec} Section</span>
                  <input 
                    type="checkbox" 
                    checked={sections[sec]} 
                    onChange={() => toggleSection(sec)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={resetAll}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            background: '#EF4444',
            color: 'white',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {t('அனைத்தையும் மீட்டமை')}
        </button>
      </div>
    </>
  );
};

export default Customizer;
