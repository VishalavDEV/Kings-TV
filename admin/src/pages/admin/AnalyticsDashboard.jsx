import React, { useState, useEffect } from 'react';
import api from '../../api';
import { BarChart3, TrendingUp, Users, Eye, Map } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/analytics?range=${timeRange}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to load analytics", error);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [timeRange]);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-secondary">Platform performance and user growth metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${timeRange === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`btn ${timeRange === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTimeRange('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">Total Article Views</div>
            <div style={{ color: 'var(--primary)', padding: '0.5rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)' }}>
              <Eye size={20} />
            </div>
          </div>
          <div className="stat-val">{loading ? '-' : (data?.totalViews || '842K')}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={12} /> +18.2% from last {timeRange === 'monthly' ? 'month' : 'year'}
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">New Signups (OTP/OAuth)</div>
            <div style={{ color: 'var(--success)', padding: '0.5rem', background: 'var(--success-glow)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-val">{loading ? '-' : (data?.newSignups || '1,204')}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={12} /> +4.1% conversion rate
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">Top District</div>
            <div style={{ color: 'var(--warning)', padding: '0.5rem', background: 'var(--warning-glow)', borderRadius: 'var(--radius-sm)' }}>
              <Map size={20} />
            </div>
          </div>
          <div className="stat-val" style={{ fontSize: '1.5rem' }}>Chennai</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Highest engagement region</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--primary)" /> Content Performance by Category
          </h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>[ Chart.js / Recharts UI Placeholder ]</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--warning)" /> Google Analytics 4 (GA4) Integration
          </h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>[ Google Looker Studio Embed Placeholder ]</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
