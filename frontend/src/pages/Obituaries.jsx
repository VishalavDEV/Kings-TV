import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Obituaries = () => {
  const { t } = useContext(LanguageContext);
  const [obits, setObits] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [demiseDate, setDemiseDate] = useState('');
  const [funeral, setFuneral] = useState('');
  const [desc, setDesc] = useState('');

  const loadData = () => {
    fetchApi('/obituaries')
      .then(data => setObits(data))
      .catch(() => setObits([
        { id: 1, deceased_name: 'Muthu', age: 76, location: 'Madurai', demise_date: '2026-07-04', funeral_details: 'Tomorrow 10 AM', short_description: 'Demise due to natural causes' }
      ]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/obituaries', {
      method: 'POST',
      body: JSON.stringify({
        deceasedName: name, age: parseInt(age), location, demiseDate, funeralDetails: funeral, shortDescription: desc
      })
    })
    .then(() => {
      setName('');
      setAge('');
      setLocation('');
      setDemiseDate('');
      setFuneral('');
      setDesc('');
      setShowForm(false);
      loadData();
    })
    .catch(err => {
      console.warn("API write failed, updating UI locally", err);
      setObits(prev => [
        ...prev,
        { id: Date.now(), deceased_name: name, age: parseInt(age), location, demise_date: demiseDate, funeral_details: funeral, short_description: desc }
      ]);
      setName('');
      setAge('');
      setLocation('');
      setDemiseDate('');
      setFuneral('');
      setDesc('');
      setShowForm(false);
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>🕯️ {t('மரண அறிவிப்புகள்')}</h2>
        <button onClick={() => setShowForm(prev => !prev)} className="btn" style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {t('புதிய மரண அறிவிப்பு சேர்க்க')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Name (பெயர்) *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Age (வயது) *</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Location (ஊர்) *</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Date of Demise (இறந்த தேதி) *</label>
              <input type="date" value={demiseDate} onChange={e => setDemiseDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Funeral Details (இறுதிச் சடங்கு) *</label>
              <input type="text" value={funeral} onChange={e => setFuneral(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Short Description (சுருக்கமான குறிப்பு) *</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}></textarea>
          </div>
          <button type="submit" style={{ padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            {t('சமர்ப்பி')}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {obits.map(o => (
          <div key={o.id} className="card obituary-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)' }}>{o.deceased_name}</span>
              <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-light)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{o.age} Yrs</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: 600 }}><i className="fas fa-map-marker-alt"></i> {o.location}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-light)' }}><i className="fas fa-calendar-alt"></i> Demise: {o.demise_date}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.4, background: 'var(--primary-light)', padding: '10px', borderRadius: '6px', fontStyle: 'italic' }}>{o.short_description}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}><strong>Funeral:</strong> {o.funeral_details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Obituaries;
