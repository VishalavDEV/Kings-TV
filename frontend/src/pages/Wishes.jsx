import React, { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { fetchApi } from '../utils/api';

const Wishes = () => {
  const { t } = useContext(LanguageContext);
  const [wishes, setWishes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [toName, setToName] = useState('');
  const [category, setCategory] = useState('Birthday');
  const [msg, setMsg] = useState('');
  const [fromName, setFromName] = useState('');

  const loadData = () => {
    fetchApi('/wishes')
      .then(data => setWishes(data))
      .catch(() => setWishes([
        { id: 1, recipient_name: 'Anbu', category: 'Birthday', message: 'Happy Birthday! Have a great year ahead!', sender_name: 'Kavin' }
      ]));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchApi('/wishes', {
      method: 'POST',
      body: JSON.stringify({
        recipientName: toName, category, message: msg, senderName: fromName
      })
    })
    .then(() => {
      setToName('');
      setMsg('');
      setFromName('');
      setShowForm(false);
      loadData();
    })
    .catch(err => {
      console.warn("API write failed, updating UI locally", err);
      setWishes(prev => [
        ...prev,
        { id: Date.now(), recipient_name: toName, category: category, message: msg, sender_name: fromName }
      ]);
      setToName('');
      setMsg('');
      setFromName('');
      setShowForm(false);
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>🎉 {t('வாழ்த்துகள்')}</h2>
        <button onClick={() => setShowForm(prev => !prev)} className="btn" style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          {t('வாழ்த்து அட்டை உருவாக்கம்')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Recipient Name (பெறுநர்) *</label>
              <input type="text" value={toName} onChange={e => setToName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Sender Name (அனுப்பியவர்) *</label>
              <input type="text" value={fromName} onChange={e => setFromName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}>
              <option value="Birthday">Birthday / பிறந்தநாள்</option>
              <option value="Wedding">Wedding / திருமணம்</option>
              <option value="Festival">Festival / பண்டிகை</option>
              <option value="Achievement">Achievement / சாதனை</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Message *</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'black' }}></textarea>
          </div>
          <button type="submit" style={{ padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
            {t('சமர்ப்பி')}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {wishes.map(w => (
          <div key={w.id} className="card wish-card" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--primary-light) 100%)' }}>
            <span style={{ fontSize: '10px', alignSelf: 'flex-start', background: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>{w.category}</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)' }}>To: {w.recipient_name}</div>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.5, flex: 1 }}>"{w.message}"</p>
            <div style={{ fontSize: '12px', textAlign: 'right', color: 'var(--text-light)', fontWeight: 700 }}>From: {w.sender_name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishes;
