import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useContext(LanguageContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" style={{ marginTop: '40px', background: 'var(--card-bg)', borderTop: '4px solid var(--primary)', padding: '30px 20px 20px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        <div>
          <h3 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '20px', marginBottom: '15px' }}>KINGS 24x7</h3>
          <p style={{ color: 'var(--text-dark)', fontSize: '14px', lineHeight: '1.6' }}>
            உண்மை. பொறுப்பு. தமிழில்.
          </p>
        </div>
        <div>
          <h4 style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '16px', marginBottom: '15px' }}>Links</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a></li>
            <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a></li>
            <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: '14px' }}>Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', fontSize: '12px', color: 'var(--text-dark)' }}>
        &copy; {currentYear} KINGS 24x7 News Portal. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
