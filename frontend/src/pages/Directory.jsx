import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Directory = () => {
  const { t } = useContext(LanguageContext);
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hospital');
  const [locality, setLocality] = useState('Chennai');
  const [street, setStreet] = useState('');
  const [phone, setPhone] = useState('');

  const loadData = () => {
    fetchApi('/directory')
      .then(data => setListings(data))
      .catch(() => setListings([
        { id: 1, business_name: 'Kauvery Hospital', category: 'Hospital', address_locality: 'Chennai', address_street: 'Alwarpet', phone_number: '044-4000 6000' }
      ]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/directory', {
      method: 'POST',
      body: JSON.stringify({
        businessName: name, category, addressLocality: locality, addressStreet: street, phoneNumber: phone
      })
    })
    .then(() => {
      setName('');
      setStreet('');
      setPhone('');
      setShowForm(false);
      loadData();
    })
    .catch(err => {
      console.warn("API write failed, updating UI locally", err);
      setListings(prev => [
        ...prev,
        { id: Date.now(), business_name: name, category: category, address_locality: locality, address_street: street, phone_number: phone }
      ]);
      setName('');
      setStreet('');
      setPhone('');
      setShowForm(false);
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>📍 {t('வணிக அடைவு')}</h2>
        <button onClick={() => setShowForm(prev => !prev)} className="btn" style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {t('புதிய பதிவு')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Business Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Phone Number *</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}>
                <option value="Hospital">Hospital</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Education">Education</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>City/Locality</label>
              <select value={locality} onChange={e => setLocality(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}>
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Street *</label>
              <input type="text" value={street} onChange={e => setStreet(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <button type="submit" style={{ padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            {t('சமர்ப்பி')}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {listings.map(lst => (
          <div key={lst.id} className="card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{lst.category}</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', marginTop: '12px', marginBottom: '8px' }}>{lst.business_name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}><i className="fas fa-map-marker-alt"></i> {lst.address_street}, {lst.address_locality}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}><i className="fas fa-phone"></i> {lst.phone_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Directory;
