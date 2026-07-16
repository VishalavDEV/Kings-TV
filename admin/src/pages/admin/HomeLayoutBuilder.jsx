import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Save, GripVertical, CheckCircle } from 'lucide-react';

const defaultSections = [
  { sectionKey: 'hero', sectionLabel: 'Hero / Featured News', displayOrder: 1, isVisible: true },
  { sectionKey: 'video', sectionLabel: 'Video News', displayOrder: 2, isVisible: true },
  { sectionKey: 'stories', sectionLabel: 'Web Stories', displayOrder: 3, isVisible: true },
  { sectionKey: 'agri', sectionLabel: 'Agriculture News', displayOrder: 4, isVisible: true },
  { sectionKey: 'election', sectionLabel: 'Election Coverage', displayOrder: 5, isVisible: true },
  { sectionKey: 'livetv', sectionLabel: 'Live TV Widget', displayOrder: 6, isVisible: true },
  { sectionKey: 'poll', sectionLabel: 'Survey / Poll', displayOrder: 7, isVisible: true },
  { sectionKey: 'digest', sectionLabel: 'Weekly Digest', displayOrder: 8, isVisible: true },
  { sectionKey: 'newsletter', sectionLabel: 'Newsletter Subscription', displayOrder: 9, isVisible: true },
  { sectionKey: 'district', sectionLabel: 'District News', displayOrder: 10, isVisible: true },
  { sectionKey: 'business', sectionLabel: 'Business & Tech', displayOrder: 11, isVisible: true }
];

const HomeLayoutBuilder = () => {
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/layout/web');
      let data = res.data;
      if (!data || data.length === 0) {
        // Seed default sections
        for (const sec of defaultSections) {
          await api.post('/admin/layout', sec);
        }
        const seeded = await api.get('/admin/layout/web');
        data = seeded.data;
      }
      // Sort by order just in case
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
    
    // Auto-save the toggle
    try {
      await api.put(`/admin/layout/${newLayout[index].id}`, {
        isVisible: newLayout[index].isVisible
      });
    } catch (err) {
      console.error("Failed to update section visibility", err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Home Page Builder</h1>
          <p className="text-secondary">Toggle the display of sections on the public homepage. Changes are instantly live.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
          <CheckCircle size={16} /> Auto-saving enabled
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Homepage Sections</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {loading ? <div>Loading sections...</div> : layout.map((mod, index) => (
            <div key={mod.id} className="layout-builder-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <GripVertical size={20} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{mod.sectionLabel}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key: {mod.sectionKey}</div>
                </div>
              </div>
              <div className="layout-builder-actions">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: mod.isVisible ? 'var(--success)' : 'var(--text-muted)' }}>
                  <input 
                    type="checkbox" 
                    checked={mod.isVisible} 
                    onChange={() => handleToggle(index)} 
                    style={{ width: '1.2rem', height: '1.2rem' }}
                  />
                  {mod.isVisible ? 'Visible' : 'Hidden'}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeLayoutBuilder;
