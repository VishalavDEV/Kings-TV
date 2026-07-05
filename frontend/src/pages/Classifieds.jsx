import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Classifieds = () => {
  const { t } = useContext(LanguageContext);
  const [ads, setAds] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Chennai');
  const [contact, setContact] = useState('');
  const [desc, setDesc] = useState('');

  const loadData = () => {
    fetchApi('/classifieds')
      .then(data => setAds(data))
      .catch(() => setAds([
        { id: 1, title: 'iPhone 13 - Like New', category: 'Electronics', price_detail: '₹45,000', location: 'Chennai', contact_info: '9876543210', description: 'Very good condition' }
      ]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/classifieds', {
      method: 'POST',
      body: JSON.stringify({
        title, category, priceDetail: price, location, contactInfo: contact, description: desc
      })
    })
    .then(() => {
      setTitle('');
      setPrice('');
      setContact('');
      setDesc('');
      setShowForm(false);
      loadData();
    })
    .catch(err => {
      console.warn("API write failed, updating UI locally", err);
      setAds(prev => [
        ...prev,
        { id: Date.now(), title, category, price_detail: price, location, contact_info: contact, description: desc }
      ]);
      setTitle('');
      setPrice('');
      setContact('');
      setDesc('');
      setShowForm(false);
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>🏷️ {t('வகைப்பாடு மற்றும் சலுகைகள்')}</h2>
        <button onClick={() => setShowForm(prev => !prev)} className="btn" style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {t('புதிய பதிவு')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Ad Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Price Details *</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g. ₹5,000 / Free" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Services">Services</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Contact Phone/Email *</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Description *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}></textarea>
          </div>
          <button type="submit" style={{ padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            {t('சமர்ப்பி')}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {ads.map(ad => (
          <div key={ad.id} className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{ad.category}</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>{ad.price_detail}</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '12px', marginBottom: '8px' }}>{ad.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', lineHeight: 1.4 }}>{ad.description}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px' }}><i className="fas fa-map-marker-alt"></i> {ad.location}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}><i className="fas fa-phone"></i> {ad.contact_info}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classifieds;
