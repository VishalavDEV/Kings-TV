import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Activity, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Dashboard Overview</h1>
        <p className="text-secondary">Summary of your KING24X7 portal metrics.</p>
      </div>

      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">Total Users</div>
            <div style={{ color: 'var(--primary)', padding: '0.5rem', background: 'var(--primary-glow)', borderRadius: 'var(--radius-sm)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-val">1,248</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+12% from last month</div>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">Pending Review</div>
            <div style={{ color: 'var(--warning)', padding: '0.5rem', background: 'var(--warning-glow)', borderRadius: 'var(--radius-sm)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="stat-val">42</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Articles await approval</div>
        </div>
        
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-lbl">Active Streams</div>
            <div style={{ color: 'var(--success)', padding: '0.5rem', background: 'var(--success-glow)', borderRadius: 'var(--radius-sm)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-val">3</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live broadcasts</div>
        </div>

        {user?.role === 'SUPER_ADMIN' || user?.role === 'CHIEF_EDITOR' ? (
          <div className="glass-panel stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-lbl">Profanity Alerts</div>
              <div style={{ color: 'var(--danger)', padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="stat-val">7</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Requires attention</div>
          </div>
        ) : null}
      </div>
      
      <div className="glass-panel p-4" style={{ padding: '2rem' }}>
        <h3>Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Activity feed goes here (integrated with audit logs).</p>
      </div>
    </div>
  );
};

export default Dashboard;
