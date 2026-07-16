import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { Save, Sparkles, AlertCircle } from 'lucide-react';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    titleEn: '',
    titleTa: '',
    contentEn: '',
    contentTa: '',
    categoryId: '',
    videoDurationSeconds: '',
    latitude: '',
    longitude: '',
    visibilityRadiusKm: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAiRewrite = async () => {
    if (!formData.contentEn.trim()) {
      alert("Please enter some English content to rewrite.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post('/admin/my-content/ai-rewrite', { text: formData.contentEn, style: 'professional' });
      setFormData(prev => ({ ...prev, contentEn: res.data.rewritten }));
    } catch (e) {
      alert("AI Rewrite failed. Please try again.");
    }
    setAiLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...formData };
      if (payload.categoryId) payload.categoryId = parseInt(payload.categoryId, 10);
      if (payload.videoDurationSeconds) payload.videoDurationSeconds = parseInt(payload.videoDurationSeconds, 10);
      if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
      if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
      if (payload.visibilityRadiusKm) payload.visibilityRadiusKm = parseFloat(payload.visibilityRadiusKm);

      if (isEditing) {
        await api.put(`/admin/my-content/${id}`, payload);
      } else {
        await api.post('/admin/my-content', payload);
      }
      navigate('/journalist/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post.');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
        <p className="text-secondary">Fill in the details for your submission. Content will be reviewed by the Chief Editor.</p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-glow)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Title (English)</label>
          <input 
            type="text" name="titleEn" className="form-control" 
            value={formData.titleEn} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content Body (English)</label>
          <div style={{ position: 'relative' }}>
            <textarea 
              name="contentEn" className="form-control" rows="6"
              value={formData.contentEn} onChange={handleChange} required
              style={{ paddingBottom: '3rem' }}
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }}
              onClick={handleAiRewrite}
              disabled={aiLoading}
            >
              <Sparkles size={14} color="var(--primary)" /> 
              {aiLoading ? 'Rewriting...' : 'AI Rewrite'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category ID (Assigned only)</label>
          <input 
            type="number" name="categoryId" className="form-control" 
            value={formData.categoryId} onChange={handleChange} 
            placeholder="e.g. 1"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Video Duration (Seconds)</label>
          <input 
            type="number" name="videoDurationSeconds" className="form-control" 
            value={formData.videoDurationSeconds} onChange={handleChange} 
            placeholder="e.g. 45"
          />
          <small style={{ color: 'var(--text-muted)' }}>Required if attaching a video. Maximum length is strictly enforced.</small>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--primary)" /> GPS Location Visibility (Geo-Fencing)
          </h4>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Optional. Only users within this radius of the GPS coordinates will see this article. Leave blank to make the article visible globally.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input 
                type="number" step="any" name="latitude" className="form-control" 
                value={formData.latitude} onChange={handleChange} 
                placeholder="e.g. 40.7128"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input 
                type="number" step="any" name="longitude" className="form-control" 
                value={formData.longitude} onChange={handleChange} 
                placeholder="e.g. -74.0060"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Visibility Radius (km)</label>
              <input 
                type="number" step="any" name="visibilityRadiusKm" className="form-control" 
                value={formData.visibilityRadiusKm} onChange={handleChange} 
                placeholder="e.g. 10"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Submit to Review Queue'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
