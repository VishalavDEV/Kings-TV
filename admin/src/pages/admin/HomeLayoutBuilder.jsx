import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Save, GripVertical, CheckCircle, Plus, Trash2, Edit2, Eye, EyeOff, Layout } from 'lucide-react';

const HomeLayoutBuilder = () => {
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [editSection, setEditSection] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editConfigJson, setEditConfigJson] = useState('');

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/layout/web');
      let data = res.data;
      data.sort((a, b) => a.displayOrder - b.displayOrder);
      setLayout(data);
    } catch (error) {
      console.error("Failed to load layout", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLayout();
  }, []);

  const handleToggle = async (index) => {
    const newLayout = [...layout];
    newLayout[index].isVisible = !newLayout[index].isVisible;
    setLayout(newLayout);
    
    try {
      await api.put(`/admin/layout/${newLayout[index].id}`, {
        isVisible: newLayout[index].isVisible
      });
    } catch (err) {
      console.error("Failed to update section visibility", err);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newLabel || !newKey) return;
    
    setSaving(true);
    const key = newKey.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    const displayOrder = layout.length > 0 ? Math.max(...layout.map(o => o.displayOrder)) + 1 : 1;
    
    try {
      const res = await api.post('/admin/layout', {
        sectionKey: key,
        sectionLabel: newLabel,
        displayOrder,
        isVisible: true,
        layoutType: 'WEB',
        configJson: '{}'
      });
      setLayout([...layout, res.data]);
      setNewLabel('');
      setNewKey('');
    } catch (err) {
      console.error("Failed to add section", err);
      alert("Error: Key already exists or invalid data.");
    }
    setSaving(false);
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to remove this section?")) return;
    try {
      await api.delete(`/admin/layout/${id}`);
      setLayout(layout.filter(item => item.id !== id));
      if (editSection && editSection.id === id) setEditSection(null);
    } catch (err) {
      console.error("Failed to delete section", err);
    }
  };

  const openEditModal = (section) => {
    setEditSection(section);
    setEditLabel(section.sectionLabel);
    setEditConfigJson(section.configJson || '{}');
  };

  const handleSaveEdit = async () => {
    if (!editSection) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/layout/${editSection.id}`, {
        sectionLabel: editLabel,
        configJson: editConfigJson
      });
      setLayout(layout.map(item => item.id === editSection.id ? res.data : item));
      setEditSection(null);
    } catch (err) {
      console.error("Failed to save changes", err);
      alert("Invalid data or server error.");
    }
    setSaving(false);
  };

  const moveItem = async (index, direction) => {
    const nextLayout = [...layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextLayout.length) return;

    // Swap elements
    const temp = nextLayout[index];
    nextLayout[index] = nextLayout[targetIndex];
    nextLayout[targetIndex] = temp;

    // Re-assign display orders
    const updated = nextLayout.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));
    setLayout(updated);

    try {
      await api.put('/admin/layout/reorder', updated.map(item => ({
        id: item.id,
        displayOrder: item.displayOrder
      })));
    } catch (err) {
      console.error("Failed to save layout order", err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Home Page Layout Builder</h1>
            <p className="text-secondary">Drag, add, configure, or toggle home screen sections. Order matches display hierarchy.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
            <CheckCircle size={16} /> Auto-saving enabled
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Layout size={20} color="var(--primary)" /> Homepage Sections
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <div>Loading sections...</div>
            ) : layout.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No homepage sections defined. Add some on the right.</div>
            ) : layout.map((mod, index) => (
              <div key={mod.id} className="layout-builder-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button disabled={index === 0} onClick={() => moveItem(index, 'up')} className="btn-icon" style={{ padding: '2px', opacity: index === 0 ? 0.3 : 1 }}>▲</button>
                    <button disabled={index === layout.length - 1} onClick={() => moveItem(index, 'down')} className="btn-icon" style={{ padding: '2px', opacity: index === layout.length - 1 ? 0.3 : 1 }}>▼</button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: mod.isVisible ? 'var(--text-primary)' : 'var(--text-muted)' }}>{mod.sectionLabel}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key: <code>{mod.sectionKey}</code></div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => handleToggle(index)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: mod.isVisible ? 'var(--success)' : 'var(--text-muted)' }}
                    title={mod.isVisible ? "Hide Section" : "Show Section"}
                  >
                    {mod.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    {mod.isVisible ? 'Visible' : 'Hidden'}
                  </button>

                  <button 
                    onClick={() => openEditModal(mod)} 
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    title="Configure details & json upload"
                  >
                    <Edit2 size={16} /> Edit
                  </button>

                  <button 
                    onClick={() => handleDeleteSection(mod.id)} 
                    className="btn btn-danger"
                    style={{ padding: '0.5rem', display: 'inline-flex', alignItems: 'center' }}
                    title="Delete Section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Add section widget */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Add New Section</h3>
          <form onSubmit={handleAddSection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Section Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Breaking News Ticker"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unique Section Key</label>
              <input 
                type="text" 
                className="form-control" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. news_ticker"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              <Plus size={16} style={{ marginRight: '0.25rem' }} /> Add Section
            </button>
          </form>
        </div>

        {/* Configuration Edit modal/sidebar */}
        {editSection && (
          <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Configure Section</span>
              <button className="btn-icon" onClick={() => setEditSection(null)}>×</button>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Display Label</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                />
              </div>

              {/* Structured Config */}
              {(() => {
                let parsedConfig = {};
                try { parsedConfig = JSON.parse(editConfigJson); } catch(e){}
                
                const updateConfig = (key, value) => {
                   parsedConfig[key] = value;
                   setEditConfigJson(JSON.stringify(parsedConfig, null, 2));
                };

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Quick Configuration</h4>
                    <div className="form-group">
                      <label style={{ fontSize: '0.8rem' }}>Component Type / Style</label>
                      <select className="form-control" value={parsedConfig.type || ''} onChange={e => updateConfig('type', e.target.value)}>
                        <option value="">Default</option>
                        <option value="hero_slider">Hero Slider (Full Width)</option>
                        <option value="carousel">Standard Carousel</option>
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Layout</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Category ID (Data Source)</label>
                        <input type="text" className="form-control" value={parsedConfig.categoryId || ''} onChange={e => updateConfig('categoryId', e.target.value)} placeholder="Leave blank for Latest" />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Item Limit</label>
                        <input type="number" className="form-control" value={parsedConfig.limit || ''} onChange={e => updateConfig('limit', parseInt(e.target.value))} placeholder="e.g. 5" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Advanced Configuration (JSON format)</span>
                </label>
                <textarea 
                  className="form-control" 
                  style={{ height: '120px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  value={editConfigJson}
                  onChange={(e) => setEditConfigJson(e.target.value)}
                  placeholder="{}"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveEdit} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  <Save size={16} style={{ marginRight: '0.25rem' }} /> Save
                </button>
                <button onClick={() => setEditSection(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeLayoutBuilder;
