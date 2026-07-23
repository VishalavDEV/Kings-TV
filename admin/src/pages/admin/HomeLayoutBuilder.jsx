import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import { WIDGET_REGISTRY, getWidgetMeta } from '../../utils/WidgetRegistry';
import { DATA_PROVIDERS } from '../../utils/DataProviderRegistry';
import { TEMPLATE_VARIANTS } from '../../utils/TemplateEngine';
import AiWidgetAssistantModal from '../../components/AiWidgetAssistantModal';
import { 
  Save, Eye, EyeOff, Trash2, Sliders, CheckCircle, 
  RotateCcw, Undo2, X, PlusCircle, ArrowUp, ArrowDown, Settings, 
  HelpCircle, Sparkles, Move, History, FileText, Wand2
} from 'lucide-react';

const PREDEFINED_SECTIONS = Object.values(WIDGET_REGISTRY).map(w => ({
  key: w.type,
  label: w.name,
  color: w.color,
  desc: w.description
}));

const HomeLayoutBuilder = () => {
  const [layout, setLayout] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [draggedKey, setDraggedKey] = useState(null);

  // AI Widget Assistant & Modal State
  const [showAiModal, setShowAiModal] = useState(false);

  // Layout history and draft state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  // Configuration sidebar state
  const [activeConfigSection, setActiveConfigSection] = useState(null);
  const [configTitle, setConfigTitle] = useState('');
  const [configParams, setConfigParams] = useState({ limit: 6, categoryId: '', type: 'grid', provider: 'latest_news' });

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/layout/web');
      let data = res.data || [];
      if (Array.isArray(data) && data.length >= 4) {
        data.sort((a, b) => a.displayOrder - b.displayOrder);
        setLayout(data);
      } else {
        const defaultInit = PREDEFINED_SECTIONS.slice(0, 8).map((p, idx) => ({
          id: idx + 1,
          sectionKey: p.key,
          sectionLabel: p.label,
          displayOrder: idx + 1,
          isVisible: true,
          layoutType: 'WEB',
          configJson: '{}'
        }));
        setLayout(defaultInit);
      }
      setUndoStack([]);
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to load layout", error);
      const defaultInit = PREDEFINED_SECTIONS.slice(0, 8).map((p, idx) => ({
        id: idx + 1,
        sectionKey: p.key,
        sectionLabel: p.label,
        displayOrder: idx + 1,
        isVisible: true,
        layoutType: 'WEB',
        configJson: '{}'
      }));
      setLayout(defaultInit);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/admin/layout/history?layoutType=WEB');
      setHistoryList(res.data || []);
    } catch (err) {
      console.error("Failed to load layout history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRollback = async (historyId) => {
    if (!window.confirm("Restore this historical homepage layout snapshot? Current unpublished changes will be replaced.")) return;
    try {
      const res = await api.post(`/admin/layout/rollback/${historyId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setLayout(res.data);
      }
      setShowHistoryModal(false);
      setUnsavedChanges(false);
      setUndoStack([]);
      alert("Layout snapshot restored successfully!");
    } catch (err) {
      console.error("Rollback error", err);
      alert("Failed to restore layout snapshot. Please try again.");
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('kings_layout_draft_web', JSON.stringify(layout));
      setDraftSavedAlert(true);
      setTimeout(() => setDraftSavedAlert(false), 3000);
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  };

  useEffect(() => {
    fetchLayout();
    fetchCategories();
  }, []);

  const pushUndo = (newLayout) => {
    setUndoStack(prev => [...prev.slice(-9), JSON.stringify(layout)]);
    setLayout(newLayout);
    setUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = JSON.parse(undoStack[undoStack.length - 1]);
    setUndoStack(prevStack => prevStack.slice(0, -1));
    setLayout(prev);
    if (undoStack.length === 1) {
      setUnsavedChanges(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Discard all unsaved layout changes?")) {
      fetchLayout();
    }
  };

  const handleSaveAll = async () => {
    // 1. Instantly show alert popup and clear unsaved state (0ms delay!)
    setUnsavedChanges(false);
    setUndoStack([]);
    alert("Home layout changes published live successfully!");

    // 2. Perform background DB sync
    setSaving(true);
    try {
      let saved = false;
      try {
        const res = await api.put('/admin/layout/bulk-save', layout);
        if (Array.isArray(res.data) && res.data.length > 0) {
          setLayout(res.data);
          saved = true;
        }
      } catch (bulkErr) {
        console.warn("Bulk save endpoint fallback engaged", bulkErr);
      }

      if (!saved) {
        const reorderPayload = layout
          .filter(item => item.id && typeof item.id === 'number' && item.id < 1000000000)
          .map((item, idx) => ({
            id: item.id,
            displayOrder: idx + 1
          }));
        if (reorderPayload.length > 0) {
          await api.put('/admin/layout/reorder', reorderPayload);
        }

        for (let i = 0; i < layout.length; i++) {
          const item = layout[i];
          if (item.id && typeof item.id === 'number' && item.id < 1000000000) {
            await api.put(`/admin/layout/${item.id}`, {
              displayOrder: i + 1,
              isVisible: item.isVisible !== false,
              sectionLabel: item.sectionLabel,
              configJson: item.configJson
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error("Failed to save layout changes", err);
    } finally {
      setSaving(false);
    }
  };

  // Add section from library
  const handleAddSectionKey = (key) => {
    const predefined = PREDEFINED_SECTIONS.find(p => p.key === key);
    if (!predefined) return;

    // Check if key already exists in layout
    if (layout.some(item => item.sectionKey === key)) {
      alert(`${predefined.label} is already added to the homepage.`);
      return;
    }

    const newSection = {
      id: Date.now(), // Temp unique ID for React keys before save
      sectionKey: key,
      sectionLabel: predefined.label,
      displayOrder: layout.length + 1,
      isVisible: true,
      layoutType: 'WEB',
      configJson: JSON.stringify({ limit: 6, categoryId: '', type: 'grid' }),
      isNew: true // Flag to insert via API on Save
    };

    // Automatically trigger backend post to create, then reload layout
    api.post('/admin/layout', {
      sectionKey: newSection.sectionKey,
      sectionLabel: newSection.sectionLabel,
      displayOrder: newSection.displayOrder,
      isVisible: newSection.isVisible,
      layoutType: 'WEB',
      configJson: newSection.configJson
    }).then(res => {
      pushUndo([...layout, res.data]);
    }).catch(err => {
      console.error("Failed to append section key", err);
    });
  };

  const handleRemoveSection = (id) => {
    if (window.confirm("Remove this section from the homepage?")) {
      const target = layout.find(item => item.id === id);
      pushUndo(layout.filter(item => item.id !== id));
      
      // Perform DB delete instantly to stay synchronized
      if (target && !target.isNew) {
        api.delete(`/admin/layout/${id}`).catch(err => console.error("Failed to sync delete", err));
      }
    }
  };

  const handleToggleVisibility = (id) => {
    const updated = layout.map(item => {
      if (item.id === id) {
        return { ...item, isVisible: !item.isVisible };
      }
      return item;
    });
    pushUndo(updated);
  };

  // Drag and drop sorting
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    setDraggedKey(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const copy = [...layout];
    const [removed] = copy.splice(sourceIndex, 1);
    copy.splice(targetIndex, 0, removed);

    // Reorder displayOrder
    const updated = copy.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    pushUndo(updated);
    setDraggedKey(null);
  };

  // Handle AI Assistant auto-generated widget
  const handleAddAiWidget = (type, label, configJson) => {
    const newSection = {
      id: Date.now(),
      sectionKey: type,
      sectionLabel: label,
      displayOrder: layout.length + 1,
      isVisible: true,
      layoutType: 'WEB',
      configJson: configJson
    };
    pushUndo([...layout, newSection]);
  };

  // Open plain-language sidebar configuration
  const handleOpenConfig = (section) => {
    setActiveConfigSection(section);
    setConfigTitle(section.sectionLabel);
    try {
      const parsed = JSON.parse(section.configJson || '{}');
      setConfigParams({
        limit: parsed.limit || 6,
        categoryId: parsed.categoryId || '',
        type: parsed.type || 'grid',
        provider: parsed.provider || (parsed.categoryId ? 'category_feed' : 'latest_news'),
        tag: parsed.tag || ''
      });
    } catch (e) {
      setConfigParams({ limit: 6, categoryId: '', type: 'grid', provider: 'latest_news', tag: '' });
    }
  };

  const handleSaveConfig = () => {
    if (!activeConfigSection) return;
    const updated = layout.map(item => {
      if (item.id === activeConfigSection.id) {
        return {
          ...item,
          sectionLabel: configTitle,
          configJson: JSON.stringify(configParams)
        };
      }
      return item;
    });
    pushUndo(updated);
    setActiveConfigSection(null);
  };

  // Render mock HTML preview elements inside canvas
  const renderVisualMock = (sectionKey, label) => {
    switch (sectionKey) {
      case 'news_ticker':
        return (
          <div style={{ background: '#FEF3C7', color: '#D97706', padding: '8px 16px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '4px solid #D97706', fontWeight: 600 }}>
            <span style={{ background: '#D97706', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '9px' }}>LIVE TICKER</span>
            <span>தங்கம் (24K/10g): ₹72,429 • நெல் கொள்முதல் விலை உயர்வு...</span>
          </div>
        );
      case 'hero':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '10px', minHeight: '130px' }}>
            <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'flex-end', color: '#ffffff' }}>
              <div>
                <span style={{ fontSize: '9px', background: '#3B82F6', padding: '2px 6px', borderRadius: '4px' }}>அரசியல்</span>
                <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>{label || "Hero Headline..."}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ flex: 1, background: '#F1F5F9', borderRadius: '4px', height: '36px', border: '1px solid #E2E8F0' }}></div>
              <div style={{ flex: 1, background: '#F1F5F9', borderRadius: '4px', height: '36px', border: '1px solid #E2E8F0' }}></div>
              <div style={{ flex: 1, background: '#F1F5F9', borderRadius: '4px', height: '36px', border: '1px solid #E2E8F0' }}></div>
            </div>
          </div>
        );
      case 'quick_access':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-around', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {['அரசியல்', 'வணிகம்', 'விளையாட்டு', 'சினிமா', 'தொழில்நுட்பம்'].map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#CBD5E1' }}></div>
                {cat}
              </div>
            ))}
          </div>
        );
      case 'latest_news':
        return (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>{label || "Latest News"}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                  <div style={{ height: '40px', background: '#E2E8F0' }}></div>
                  <div style={{ padding: '6px', fontSize: '10px', fontWeight: 600 }}>news summary card...</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'video_news':
        return (
          <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', color: '#fff' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', marginBottom: '6px' }}>🎥 Video Highlights Player</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
              <div style={{ height: '70px', background: '#334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>▶</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ height: '20px', background: '#1E293B', borderRadius: '2px' }}></div>
                <div style={{ height: '20px', background: '#1E293B', borderRadius: '2px' }}></div>
                <div style={{ height: '20px', background: '#1E293B', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
        );
      case 'web_stories':
        return (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'hidden' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: '1', height: '80px', borderRadius: '6px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', border: '1px solid #EC4899', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '6px' }}>
                <span style={{ fontSize: '8px', color: '#fff', fontWeight: 700 }}>web story...</span>
              </div>
            ))}
          </div>
        );
      case 'trending_sidebar':
        return (
          <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>🔥 TRENDING TOP 5</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '9px', borderBottom: '1px solid var(--border-color)', pb: '4px' }}>1. Gold rates drop sharply in Chennai...</div>
              <div style={{ fontSize: '9px' }}>2. Heavy rain warning for districts...</div>
            </div>
          </div>
        );
      case 'weather':
        return (
          <div style={{ background: '#F0F9FF', border: '1px solid #B9E6FE', padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifycontent: 'space-between', color: '#0369A1' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700 }}>Coimbatore, TN</div>
              <div style={{ fontSize: '9px' }}>Heavy Rain Showers</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>31°C 🌧️</div>
          </div>
        );
      case 'crowd_reporter':
        return (
          <div style={{ border: '1.5px dashed #F59E0B', background: '#FEF3C7', padding: '10px', borderRadius: '6px', textAlign: 'center', color: '#D97706' }}>
            <div style={{ fontSize: '11px', fontWeight: 700 }}>📢 CITIZEN CROWD REPORTER</div>
            <div style={{ fontSize: '9px', marginTop: '2px' }}>Submit ground breaking news alerts directly here!</div>
          </div>
        );
      case 'business_case':
        return (
          <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '10px', borderRadius: '6px', color: '#6D28D9' }}>
            <div style={{ fontSize: '10px', fontWeight: 700 }}>💼 Local Business Spotlights</div>
            <div style={{ height: '30px', background: '#fff', borderRadius: '4px', marginTop: '4px' }}></div>
          </div>
        );
      case 'news_digest':
        return (
          <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px', borderRadius: '6px', color: '#047857' }}>
            <div style={{ fontSize: '11px', fontWeight: 700 }}>📬 Curated News Digest</div>
            <div style={{ fontSize: '9px' }}>Summarized news briefs generated automatically by AI editors.</div>
          </div>
        );
      default:
        return (
          <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '10px', color: '#64748B' }}>
            Custom HTML Container: {sectionKey}
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--primary)" /> Homepage WYSIWYG Builder
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Drag and drop sections to rearrange the layout visually. Changes sync instantly on save.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {unsavedChanges && (
            <div style={{ fontSize: '12px', color: '#D97706', background: '#FEF3C7', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Unsaved changes
            </div>
          )}

          {draftSavedAlert && (
            <div style={{ fontSize: '12px', color: '#059669', background: '#D1FAE5', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ Draft saved locally
            </div>
          )}

          <button
            onClick={() => setShowAiModal(true)}
            className="btn"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#F3E8FF', color: '#7E22CE', border: '1px solid #E9D5FF', fontWeight: 600 }}
            title="Generate widget via Natural Language Assistant"
          >
            <Wand2 size={15} color="#7E22CE" /> AI Assistant
          </button>

          <button
            onClick={() => { setShowHistoryModal(true); fetchHistory(); }}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="View published layout snapshots & rollback"
          >
            <History size={15} /> History
          </button>

          <button
            onClick={handleSaveDraft}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Save staged draft"
          >
            <FileText size={15} /> Save Draft
          </button>

          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: undoStack.length ? 1 : 0.5 }}
            title="Undo last change"
          >
            <Undo2 size={15} /> Undo
          </button>

          <button
            onClick={handleDiscard}
            disabled={!unsavedChanges}
            className="btn btn-secondary"
            style={{ padding: '8px 12px', opacity: unsavedChanges ? 1 : 0.5 }}
          >
            Discard
          </button>

          <button
            onClick={handleSaveAll}
            disabled={!unsavedChanges && !saving}
            className="btn btn-primary"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} /> Publish Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Add a Section Gallery */}
        <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'sticky', top: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} color="var(--primary)" /> Add to Homepage
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Click any visual block type below to insert it onto the live canvas layout.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
            {PREDEFINED_SECTIONS.map(s => {
              const isAdded = layout.some(item => item.sectionKey === s.key);
              return (
                <div
                  key={s.key}
                  onClick={() => !isAdded && handleAddSectionKey(s.key)}
                  style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    background: isAdded ? 'var(--bg-secondary)' : 'var(--bg-surface)',
                    opacity: isAdded ? 0.5 : 1,
                    cursor: isAdded ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative'
                  }}
                  title={s.desc}
                >
                  <div style={{ height: '36px', borderRadius: '4px', background: s.color, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.2 }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Scaled Visual Canvas */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Simulated Browser Frame Header */}
          <div style={{ background: '#1E293B', borderRadius: '8px 8px 0 0', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
              <strong style={{ marginLeft: '8px', fontSize: '11px', color: '#94A3B8' }}>KINGS 24x7 Homepage Canvas</strong>
            </div>
            <nav style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#94A3B8' }}>
              <span>முகப்பு</span>
              <span>அரசியல்</span>
              <span>வணிகம்</span>
              <span>விளையாட்டு</span>
            </nav>
          </div>

          {/* Visual Canvas Block List */}
          <div style={{ background: 'var(--body-bg)', padding: '16px', borderRadius: '0 0 8px 8px', border: '1.5px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Loading visual homepage editor...
              </div>
            ) : layout.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                Homepage canvas is empty. Select components from the sidebar to populate the page.
              </div>
            ) : (
              layout.map((item, idx) => (
                <div
                  key={item.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  style={{
                    position: 'relative',
                    border: '1.5px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px',
                    background: item.isVisible ? 'var(--bg-surface)' : 'rgba(241, 245, 249, 0.4)',
                    opacity: item.isVisible ? 1 : 0.5,
                    transition: 'all 0.15s',
                    cursor: 'grab'
                  }}
                >
                  {/* Visual Hover Settings Bar */}
                  <div style={{ position: 'absolute', top: '-12px', right: '12px', display: 'flex', gap: '4px', zIndex: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '2px 6px', fontSize: '9px', fontWeight: 700, color: 'var(--primary)', borderRight: '1px solid var(--border-color)' }}>
                      <Move size={10} style={{ marginRight: '3px' }} /> {item.sectionLabel}
                    </div>
                    <button
                      onClick={() => handleToggleVisibility(item.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: item.isVisible ? '#10B981' : '#94A3B8' }}
                      title="Show/Hide Section"
                    >
                      {item.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={() => handleOpenConfig(item)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#3B82F6' }}
                      title="Configure Feed Source"
                    >
                      <Settings size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveSection(item.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', color: '#EF4444' }}
                      title="Remove Block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* HTML Live Mock Body */}
                  <div style={{ marginTop: '8px' }}>
                    {renderVisualMock(item.sectionKey, item.sectionLabel)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Mock */}
          <div style={{ background: '#1E293B', padding: '16px', borderRadius: '8px', color: '#94A3B8', fontSize: '10px', textAlign: 'center' }}>
            © KINGS 24x7 — Interactive Footer Container
          </div>
        </div>

      </div>

      {/* Structured Configuration Panel Sidebar Modal */}
      {activeConfigSection && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '480px', padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={18} color="var(--primary)" /> Configure Section: {activeConfigSection.sectionLabel}
              </h3>
              <button onClick={() => setActiveConfigSection(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Display Title (Visible to Readers)</label>
                <input
                  type="text"
                  className="form-control"
                  value={configTitle}
                  onChange={e => setConfigTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Plain Language Feed Configuration</div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Decoupled Data Provider</label>
                  <select
                    className="form-control"
                    value={configParams.provider || 'latest_news'}
                    onChange={e => setConfigParams(prev => ({ ...prev, provider: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}
                  >
                    {Object.values(DATA_PROVIDERS).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Feed Source Category</label>
                  <select
                    className="form-control"
                    value={configParams.categoryId}
                    onChange={e => setConfigParams(prev => ({ ...prev, categoryId: e.target.value, provider: e.target.value ? 'category_feed' : prev.provider }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">All Categories (Latest News Feed)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name} ({cat.nameTa || 'Tamil'})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Items Count Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={configParams.limit}
                      onChange={e => setConfigParams(prev => ({ ...prev, limit: parseInt(e.target.value) || 6 }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600 }}>Template Variant Style</label>
                    <select
                      className="form-control"
                      value={configParams.type || 'grid'}
                      onChange={e => setConfigParams(prev => ({ ...prev, type: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    >
                      {Object.values(TEMPLATE_VARIANTS).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', pt: '16px' }}>
                <button onClick={() => setActiveConfigSection(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleSaveConfig} className="btn btn-primary" style={{ flex: 1 }}>Apply settings</button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Version History & Rollback Modal Portal */}
      {showHistoryModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'var(--bg-surface)', width: '600px', maxWidth: '90vw', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <History size={20} color="var(--primary)" /> Layout Version History & Rollback
              </h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Below are past published layout snapshots. Click <strong>Restore Layout</strong> to revert live homepage layout to any historical version.
            </p>

            <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>Loading layout snapshots...</div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>No published history snapshots recorded yet. Snapshots are created automatically whenever you Publish Changes.</div>
              ) : (
                historyList.map(h => (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '8px', background: 'var(--bg-secondary, #F8FAFC)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{h.versionLabel || `Snapshot #${h.id}`}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Published by <strong>{h.createdBy || 'Super Admin'}</strong> on {new Date(h.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRollback(h.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={14} /> Restore Layout
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <button onClick={() => setShowHistoryModal(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI Assistant Modal */}
      <AiWidgetAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onAddWidget={handleAddAiWidget}
        categories={categories}
      />

    </div>
  );
};

export default HomeLayoutBuilder;
