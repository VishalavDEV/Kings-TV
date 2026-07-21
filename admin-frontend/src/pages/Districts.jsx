import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import { MapPin, Plus, Edit2, Trash2, ChevronDown, ChevronRight, X, Save, Loader2 } from 'lucide-react';

const API = '/api/v1/admin';

export default function Districts() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [constituencies, setConstituencies] = useState({});

  const [districtModal, setDistrictModal] = useState(null); // null | 'create' | district object
  const [constModal, setConstModal] = useState(null);       // null | { districtId } | constituency
  const [saving, setSaving] = useState(false);

  const [distForm, setDistForm] = useState({ nameEn: '', nameTa: '', state: 'Tamil Nadu', centerLatitude: '', centerLongitude: '', radiusKm: '15' });
  const [constForm, setConstForm] = useState({ nameEn: '', nameTa: '', latitude: '', longitude: '', radiusKm: '10' });

  const loadDistricts = useCallback(async () => {
    try {
      const res = await api.get(`${API}/districts`);
      setDistricts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDistricts(); }, [loadDistricts]);

  const toggleExpand = async (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    if (!constituencies[id]) {
      try {
        const res = await api.get(`${API}/districts/${id}/constituencies`);
        setConstituencies(prev => ({ ...prev, [id]: res.data }));
      } catch (e) { /* ignore */ }
    }
  };

  const openCreateDistrict = () => {
    setDistForm({ nameEn: '', nameTa: '', state: 'Tamil Nadu', centerLatitude: '', centerLongitude: '', radiusKm: '15' });
    setDistrictModal('create');
  };

  const openEditDistrict = (d) => {
    setDistForm({ nameEn: d.nameEn || '', nameTa: d.nameTa || '', state: d.state || 'Tamil Nadu', centerLatitude: d.centerLatitude ?? '', centerLongitude: d.centerLongitude ?? '', radiusKm: d.radiusKm ?? '15' });
    setDistrictModal(d);
  };

  const saveDistrict = async () => {
    setSaving(true);
    try {
      const payload = {
        nameEn: distForm.nameEn,
        nameTa: distForm.nameTa,
        state: distForm.state,
        centerLatitude: distForm.centerLatitude ? parseFloat(distForm.centerLatitude) : null,
        centerLongitude: distForm.centerLongitude ? parseFloat(distForm.centerLongitude) : null,
        radiusKm: distForm.radiusKm ? parseFloat(distForm.radiusKm) : 15.0,
      };
      if (districtModal === 'create') {
        await api.post(`${API}/districts`, payload);
      } else {
        await api.put(`${API}/districts/${districtModal.id}`, payload);
      }
      setDistrictModal(null);
      loadDistricts();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const deleteDistrict = async (id) => {
    if (!confirm('Delete this district and all its constituencies?')) return;
    await api.delete(`${API}/districts/${id}`);
    loadDistricts();
  };

  const openCreateConst = (districtId) => {
    setConstForm({ nameEn: '', nameTa: '', latitude: '', longitude: '', radiusKm: '10' });
    setConstModal({ districtId });
  };

  const openEditConst = (c) => {
    setConstForm({ nameEn: c.nameEn || '', nameTa: c.nameTa || '', latitude: c.latitude ?? '', longitude: c.longitude ?? '', radiusKm: c.radiusKm ?? '10' });
    setConstModal(c);
  };

  const saveConst = async () => {
    setSaving(true);
    try {
      const payload = {
        nameEn: constForm.nameEn,
        nameTa: constForm.nameTa,
        latitude: constForm.latitude ? parseFloat(constForm.latitude) : null,
        longitude: constForm.longitude ? parseFloat(constForm.longitude) : null,
        radiusKm: constForm.radiusKm ? parseFloat(constForm.radiusKm) : 10.0,
      };
      if (constModal?.districtId && !constModal.id) {
        await api.post(`${API}/districts/${constModal.districtId}/constituencies`, payload);
        setConstituencies(prev => ({ ...prev, [constModal.districtId]: undefined }));
      } else {
        await api.put(`${API}/constituencies/${constModal.id}`, payload);
        setConstituencies(prev => ({ ...prev, [constModal.districtId]: undefined }));
      }
      setConstModal(null);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const deleteConst = async (c) => {
    if (!confirm('Delete this constituency?')) return;
    await api.delete(`${API}/constituencies/${c.id}`);
    setConstituencies(prev => ({ ...prev, [c.districtId]: undefined }));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapPin size={22} style={{ color: '#B3732A' }} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>Districts & Constituencies</h1>
        </div>
        <button onClick={openCreateDistrict} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#B3732A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={16} /> Add District
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['', 'Name (EN)', 'Name (TA)', 'State', 'Center Lat/Lng', 'Radius (km)', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {districts.map(d => (
                <React.Fragment key={d.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <td style={{ padding: '0.75rem 1rem', width: 32 }}>
                      <button onClick={() => toggleExpand(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        {expanded[d.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>{d.nameEn}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{d.nameTa}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{d.state || 'Tamil Nadu'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569', fontSize: '0.85rem' }}>
                      {d.centerLatitude && d.centerLongitude ? `${d.centerLatitude.toFixed(4)}, ${d.centerLongitude.toFixed(4)}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{d.radiusKm ?? 15} km</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditDistrict(d)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', color: '#475569' }}><Edit2 size={14} /></button>
                        <button onClick={() => deleteDistrict(d.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                        <button onClick={() => { toggleExpand(d.id); openCreateConst(d.id); }} style={{ background: '#f0fdf4', border: 'none', borderRadius: '6px', padding: '0.35rem 0.65rem', cursor: 'pointer', color: '#16a34a', fontSize: '0.75rem', fontWeight: 600 }}>+ Constituency</button>
                      </div>
                    </td>
                  </tr>
                  {expanded[d.id] && (
                    <tr>
                      <td colSpan={7} style={{ background: '#f8fafc', padding: '0 0 0 2.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Constituency (EN)', 'Constituency (TA)', 'Lat/Lng', 'Radius (km)', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(constituencies[d.id] || []).map(c => (
                              <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.5rem 0.75rem', color: '#334155' }}>{c.nameEn}</td>
                                <td style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>{c.nameTa}</td>
                                <td style={{ padding: '0.5rem 0.75rem', color: '#475569', fontSize: '0.8rem' }}>
                                  {c.latitude && c.longitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : '—'}
                                </td>
                                <td style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>{c.radiusKm ?? 10} km</td>
                                <td style={{ padding: '0.5rem 0.75rem' }}>
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button onClick={() => openEditConst({ ...c, districtId: d.id })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '5px', padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#475569' }}><Edit2 size={12} /></button>
                                    <button onClick={() => deleteConst({ ...c, districtId: d.id })} style={{ background: '#fef2f2', border: 'none', borderRadius: '5px', padding: '0.25rem 0.5rem', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {(constituencies[d.id] || []).length === 0 && (
                              <tr><td colSpan={5} style={{ padding: '0.75rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No constituencies yet</td></tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {districts.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No districts found. Add one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* District Modal */}
      {districtModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{districtModal === 'create' ? 'Add District' : 'Edit District'}</h2>
              <button onClick={() => setDistrictModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Name (English)', key: 'nameEn' },
                { label: 'Name (Tamil)', key: 'nameTa' },
                { label: 'State / Region', key: 'state' },
                { label: 'Radius (km)', key: 'radiusKm', type: 'number' },
                { label: 'Center Latitude', key: 'centerLatitude', type: 'number' },
                { label: 'Center Longitude', key: 'centerLongitude', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={distForm[f.key]}
                    onChange={e => setDistForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setDistrictModal(null)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '7px', padding: '0.5rem 1.25rem', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={saveDistrict} disabled={saving} style={{ background: '#B3732A', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Constituency Modal */}
      {constModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{constModal.id ? 'Edit Constituency' : 'Add Constituency'}</h2>
              <button onClick={() => setConstModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Name (English)', key: 'nameEn' },
                { label: 'Name (Tamil)', key: 'nameTa' },
                { label: 'Latitude', key: 'latitude', type: 'number' },
                { label: 'Longitude', key: 'longitude', type: 'number' },
                { label: 'Radius (km)', key: 'radiusKm', type: 'number' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'radiusKm' ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={constForm[f.key]}
                    onChange={e => setConstForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setConstModal(null)} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '7px', padding: '0.5rem 1.25rem', cursor: 'pointer', color: '#64748b' }}>Cancel</button>
              <button onClick={saveConst} disabled={saving} style={{ background: '#B3732A', color: '#fff', border: 'none', borderRadius: '7px', padding: '0.5rem 1.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
