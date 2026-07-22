import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
  Building2, Wifi, Tag, FileQuestion, Briefcase,
  Heart, Gift, ShoppingBag, Plus, Search, Edit2, Trash2,
  ChevronDown, ExternalLink, Eye, ToggleLeft, ToggleRight, X
} from 'lucide-react';

const MODULE_TABS = [
  { key: 'directory',   label: 'Business Directory', icon: Building2,    endpoint: '/business-directory',   color: '#3B82F6' },
  { key: 'jobs',        label: 'Jobs',               icon: Briefcase,    endpoint: '/jobs',                 color: '#10B981' },
  { key: 'classifieds', label: 'Classifieds',        icon: ShoppingBag,  endpoint: '/classifieds',          color: '#F59E0B' },
  { key: 'obituaries',  label: 'Obituaries',         icon: Heart,        endpoint: '/obituaries',           color: '#8B5CF6' },
  { key: 'wishes',      label: 'Wishes',             icon: Gift,         endpoint: '/wishes',               color: '#EC4899' },
  { key: 'deals',       label: 'Deals',              icon: Tag,          endpoint: '/deals',                color: '#EF4444' },
  { key: 'rfq',         label: 'RFQ',                icon: FileQuestion, endpoint: '/rfq',                  color: '#06B6D4' },
  { key: 'nfc',         label: 'NFC Cards',          icon: Wifi,         endpoint: '/nfc',                  color: '#14B8A6' },
];

const formatDate = (val) => {
  if (!val) return '—';
  if (Array.isArray(val)) {
    const [y, m, d] = val;
    return new Date(y, m - 1, d).toLocaleDateString();
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const ModuleTable = ({ mod }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, size: 15 });
      if (search) params.append('search', search);
      const res = await api.get(`${mod.endpoint}?${params}`);
      const data = res.data;
      if (data && data.content) {
        setItems(data.content);
        setTotal(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems([]);
      }
    } catch (err) {
      // Try alternate endpoint format
      try {
        const res2 = await api.get(`${mod.endpoint}/getAll?page=${page}&size=15`);
        const d2 = res2.data;
        setItems(d2.content || d2 || []);
        setTotal(d2.totalElements || (d2.content || d2 || []).length);
      } catch {
        setError(`No data available for ${mod.label}. The ${mod.label} module may not have entries yet.`);
        setItems([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [page, mod.key]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await api.delete(`${mod.endpoint}/${id}`);
      fetchItems();
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await api.patch(`${mod.endpoint}/${id}/toggle`, { active: !current });
      fetchItems();
    } catch {
      try {
        await api.put(`${mod.endpoint}/${id}`, { isActive: !current });
        fetchItems();
      } catch {
        alert('Failed to toggle status');
      }
    }
  };

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="animate-pulse" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⟳</div>
      Loading {mod.label}...
    </div>
  );

  if (error) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <mod.icon size={48} style={{ margin: '0 auto 1rem', display: 'block', color: mod.color, opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{error}</p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Public entries for this module will appear here once created.</p>
    </div>
  );

  // Auto-detect which columns to show from first item keys
  const sampleItem = items[0] || {};
  const titleKey = ['title', 'name', 'businessName', 'jobTitle', 'wishTitle', 'heading'].find(k => sampleItem[k]);
  const statusKey = ['status', 'isActive', 'active'].find(k => k in sampleItem);
  const dateKey = ['createdAt', 'publishedAt', 'postedAt', 'date'].find(k => sampleItem[k]);

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.2rem' }}
            placeholder={`Search ${mod.label}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-secondary">Search</button>
      </form>

      {items.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <mod.icon size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
          No {mod.label} entries found.
        </div>
      ) : (
        <div className="glass-panel table-container" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                {titleKey && <th>{titleKey === 'businessName' ? 'Business Name' : 'Title / Name'}</th>}
                {statusKey && <th>Status</th>}
                {dateKey && <th>Date</th>}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const id = item.id || item.subscriberId;
                const title = titleKey ? item[titleKey] : `#${id}`;
                const status = statusKey ? item[statusKey] : null;
                const date = dateKey ? item[dateKey] : null;
                const isActive = status === true || status === 'active' || status === 'approved' || status === 'published';

                return (
                  <tr key={id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{id}</td>
                    {titleKey && (
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title || '—'}</div>
                        {item.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.email}</div>}
                        {item.location && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</div>}
                      </td>
                    )}
                    {statusKey && (
                      <td>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`}>
                          {typeof status === 'boolean' ? (isActive ? 'Active' : 'Inactive') : String(status)}
                        </span>
                      </td>
                    )}
                    {dateKey && (
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatDate(date)}</td>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {statusKey && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem' }}
                            title={isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggle(id, isActive)}
                          >
                            {isActive ? <ToggleRight size={16} color="#10B981" /> : <ToggleLeft size={16} color="var(--text-muted)" />}
                          </button>
                        )}
                        <button
                          className="btn"
                          style={{ padding: '0.35rem', background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                          title="Delete"
                          onClick={() => handleDelete(id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Pagination */}
          {total > 15 && (
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Showing {page * 15 + 1}–{Math.min((page + 1) * 15, total)} of {total}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(p => p - 1)}>←</button>
                <button className="btn btn-secondary" disabled={(page + 1) * 15 >= total} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommunityModules = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const activeMod = MODULE_TABS.find(m => m.key === activeTab);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1>Community Modules</h1>
        <p className="text-secondary">Manage Business Directory, Jobs, Classifieds, Obituaries, Wishes, Deals, RFQ, and NFC Cards.</p>
      </div>

      {/* Module tab pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {MODULE_TABS.map(mod => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.key;
          return (
            <button
              key={mod.key}
              onClick={() => setActiveTab(mod.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                border: `1px solid ${isActive ? mod.color : 'var(--border-color)'}`,
                background: isActive ? `${mod.color}22` : 'var(--bg-secondary)',
                color: isActive ? mod.color : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={14} />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Active module panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: activeMod?.color }}>
            {activeMod && <activeMod.icon size={22} />}
            {activeMod?.label}
          </h2>
          <a
            href={`https://king-tv.test-technoprint.online/${activeMod?.key === 'directory' ? 'directory' : activeMod?.key}.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <ExternalLink size={14} /> View Public Page
          </a>
        </div>
        {activeMod && <ModuleTable key={activeMod.key} mod={activeMod} />}
      </div>
    </div>
  );
};

export default CommunityModules;
