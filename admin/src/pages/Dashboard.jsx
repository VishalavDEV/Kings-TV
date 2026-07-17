import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { NavLink } from 'react-router-dom';
import api from '../api';
import {
  Users, FileText, Activity, Bell, TrendingUp,
  BarChart2, Plus, Layout, Radio, Eye
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, subLabel, subColor }) => (
  <div className="glass-panel stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="stat-lbl">{label}</div>
      <div style={{ color, padding: '0.5rem', background: color + '22', borderRadius: 'var(--radius-sm)' }}>
        <Icon size={20} />
      </div>
    </div>
    <div className="stat-val">{value ?? '—'}</div>
    {subLabel && (
      <div style={{ fontSize: '0.75rem', color: subColor || 'var(--text-muted)' }}>{subLabel}</div>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [kpis, setKpis] = useState(null);
  const [newsPerf, setNewsPerf] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [kpiRes, perfRes, logsRes] = await Promise.allSettled([
          api.get('/admin/analytics/dashboard'),
          api.get('/admin/analytics/news-performance'),
          api.get('/admin/audit-logs?page=0&size=5&sortBy=timestamp&direction=desc'),
        ]);
        if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data);
        if (perfRes.status === 'fulfilled') setNewsPerf(perfRes.value.data);
        if (logsRes.status === 'fulfilled') {
          const d = logsRes.value.data;
          setRecentLogs(Array.isArray(d) ? d : (d?.content || []));
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'CHIEF_EDITOR';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.25rem' }}>{t('dashboardOverview')}</h1>
        <p className="text-secondary">
          Welcome back, <strong>{user?.email?.split('@')[0]}</strong> ·{' '}
          <span style={{ color: 'var(--primary)' }}>{user?.role?.replace(/_/g, ' ')}</span>
        </p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          Loading dashboard data…
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <StatCard label="Total Articles" value={kpis?.totalArticles?.toLocaleString()} icon={FileText}
              color="var(--primary)" subLabel={`${newsPerf?.publishedCount ?? 0} published`} subColor="var(--success)" />
            <StatCard label="Total Users" value={kpis?.totalUsers?.toLocaleString()} icon={Users}
              color="#06B6D4" subLabel={`${kpis?.activeUsers ?? 0} active`} subColor="var(--success)" />
            <StatCard label="Total Views" value={newsPerf?.totalViews?.toLocaleString()} icon={Eye}
              color="var(--warning)" subLabel={`avg ${newsPerf?.avgViewsPerArticle ?? 0} / article`} />
            <StatCard label="Categories" value={kpis?.totalCategories} icon={BarChart2}
              color="var(--success)" subLabel="Active taxonomy" />
            {isAdmin && (
              <StatCard label="Push Notifications" value={kpis?.totalNotifications} icon={Bell}
                color="#8B5CF6" subLabel="Total sent" />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Role Breakdown */}
            {isAdmin && kpis?.roleBreakdown && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} /> User Roles
                </h3>
                {Object.entries(kpis.roleBreakdown).map(([role, count]) => (
                  <div key={role} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {role.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span style={{
                      background: 'var(--primary-glow)', color: 'var(--primary)',
                      padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700
                    }}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top Articles */}
            {newsPerf?.topArticles?.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} /> Top Articles by Views
                </h3>
                {newsPerf.topArticles.slice(0, 6).map((art, i) => (
                  <div key={art.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <span style={{
                      width: '22px', height: '22px',
                      background: i < 3 ? 'var(--primary)' : 'var(--border)',
                      color: i < 3 ? 'white' : 'var(--text-muted)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                    }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {art.title || '(No English title)'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, flexShrink: 0 }}>
                      {(art.views ?? 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
            {/* Quick Actions */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <NavLink to="/admin/news/create" className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', textDecoration: 'none', fontSize: '0.85rem' }}>
                  <Plus size={15} /> New Article
                </NavLink>
                <NavLink to="/admin/breaking"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                    textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <Radio size={15} /> Breaking News
                </NavLink>
                <NavLink to="/admin/users"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                    textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <Users size={15} /> Manage Users
                </NavLink>
                <NavLink to="/admin/layout"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                    textDecoration: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <Layout size={15} /> Layout Builder
                </NavLink>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} /> Recent Activity
              </h3>
              {recentLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent activity to display.</p>
              ) : (
                recentLogs.map((log, i) => (
                  <div key={log.id || i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.6rem 0', borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
                      background: log.action?.includes('DELETE') ? 'var(--danger)' :
                        log.action?.includes('CREATE') ? 'var(--success)' : 'var(--primary)'
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        <strong>{log.userEmail || log.username || 'System'}</strong>
                        {' — '}{log.action || log.module || 'Activity'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                        {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {recentLogs.length > 0 && (
                <NavLink to="/admin/audit-logs"
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginTop: '0.75rem', textDecoration: 'none' }}>
                  View all audit logs →
                </NavLink>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;



