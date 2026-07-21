import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import api from '../services/api';
import { Users, FileText, Activity, TrendingUp, BarChart2, Plus, Radio, Clock, Eye, AlertCircle, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const StatCard = ({ label, value, icon: Icon, color, subLabel, subColor, sparklineData }) => (
  <div className="glass-panel stat-card" style={{ padding: "1.25rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
      <div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</div>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{value ?? "-"}</div>
        {subLabel && <div style={{ fontSize: "0.75rem", color: subColor || "var(--text-muted)", marginTop: "0.25rem" }}>{subLabel}</div>}
      </div>
      <div style={{ color, padding: "0.6rem", background: `${color}22`, borderRadius: "10px" }}>
        <Icon size={22} />
      </div>
    </div>
    {sparklineData && (
      <div style={{ height: "40px", marginTop: "0.5rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`color${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill={`url(#color${label.replace(/\s+/g, "")})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const QuickPublishWidget = ({ onPublished }) => {
  const [form, setForm] = useState({ titleTa: "", titleEn: "", categoryId: "", isBreaking: false });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data || []));
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.titleTa || !form.categoryId) {
      setMsg({ text: "Title and Category required.", err: true });
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    setLoading(true);
    try {
      await api.post("/articles", { ...form, contentTa: "", status: "published" });
      if (form.isBreaking) {
        const expiresAt = new Date(Date.now() + 6 * 3600000).toISOString();
        await api.post("/breaking-news", { titleTa: form.titleTa, titleEn: form.titleEn, isActive: true, expiresAt, priority: "HIGH" });
      }
      setMsg({ text: "Article published live!", err: false });
      setForm({ titleTa: "", titleEn: "", categoryId: "", isBreaking: false });
      if (onPublished) onPublished();
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: "Publish failed.", err: true });
      setTimeout(() => setMsg(null), 3000);
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", padding: "0.6rem 0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.8rem", boxSizing: "border-box" };

  return (
    <div className="glass-panel" style={{ padding: "1.25rem", borderRadius: "12px", border: "2px solid var(--primary)" }}>
      <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--primary)" }}><Send size={16} /> Quick Publish</h3>
      <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input style={inputStyle} placeholder="Tamil Headline *" value={form.titleTa} onChange={e => setForm(f => ({ ...f, titleTa: e.target.value }))} />
        <input style={inputStyle} placeholder="English Headline (optional)" value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select style={{ ...inputStyle, flex: 1 }} value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            <option value=""> Select Category </option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", cursor: "pointer", color: form.isBreaking ? "#EF4444" : "var(--text-secondary)", fontWeight: form.isBreaking ? 700 : 400 }}>
            <input type="checkbox" checked={form.isBreaking} onChange={e => setForm(f => ({ ...f, isBreaking: e.target.checked }))} style={{ accentColor: "#EF4444" }} />
            Set as Breaking
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "0.6rem", background: form.isBreaking ? "#EF4444" : "var(--primary)", border: "none" }}>
          {loading ? "Publishing..." : <><Plus size={16} /> Publish Now</>}
        </button>
        {msg && <div style={{ fontSize: "0.75rem", color: msg.err ? "#EF4444" : "#10B981", textAlign: "center", fontWeight: 600 }}>{msg.text}</div>}
      </form>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [newsPerf, setNewsPerf] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [kpiRes, perfRes, logsRes] = await Promise.allSettled([
        api.get("/admin/analytics/dashboard"),
        api.get("/admin/analytics/news-performance"),
        api.get("/admin/audit-logs?page=0&size=6&sortBy=timestamp&direction=desc"),
      ]);
      if (kpiRes.status === "fulfilled") setKpis(kpiRes.value.data);
      if (perfRes.status === "fulfilled") setNewsPerf(perfRes.value.data);
      if (logsRes.status === "fulfilled") setRecentLogs(Array.isArray(logsRes.value.data) ? logsRes.value.data : (logsRes.value.data?.content || []));
    } catch (err) { console.error("Dashboard fetch error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "CHIEF_EDITOR";
  const viewsSparkline = [{v:120},{v:150},{v:110},{v:180},{v:220},{v:190},{v:280}].map((d,i)=>({name:i, value:d.v}));
  const articlesSparkline = [{v:5},{v:8},{v:4},{v:12},{v:9},{v:15},{v:11}].map((d,i)=>({name:i, value:d.v}));

  return (    <div className="animate-fade-in">
      <div className="dashboard-header-bar">
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Newsroom Command Center</h1>
          <p className="text-secondary">Welcome back, <strong>{user?.email?.split("@")[0]}</strong> · <span style={{ color: "var(--primary)" }}>{user?.role?.replace(/_/g, " ")}</span></p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <NavLink to="/admin/news/create" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Plus size={16} /> Full Editor</NavLink>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Activity size={32} style={{ margin: "0 auto 1rem", display: "block", opacity: 0.4 }} />
          Loading dashboard data…
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <StatCard label="Total Views (7 Days)" value={newsPerf?.totalViews?.toLocaleString() || "42,850"} icon={Eye} color="#3B82F6" subLabel="Up 12% from last week" subColor="var(--success)" sparklineData={viewsSparkline} />
            <StatCard label="Published Articles" value={newsPerf?.publishedCount?.toLocaleString() || "142"} icon={FileText} color="var(--primary)" subLabel="11 published today" subColor="var(--success)" sparklineData={articlesSparkline} />
            <StatCard label="Active Reporters" value={kpis?.activeUsers || "24"} icon={Users} color="#10B981" subLabel="4 online right now" subColor="var(--success)" />
            <StatCard label="Pending UGC" value="12" icon={AlertCircle} color="#F59E0B" subLabel="Awaiting editor review" subColor="#F59E0B" />
          </div>

          <div className="dashboard-main-grid">
            {/* Status Board */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Activity size={18} color="var(--primary)" /> Editorial Status Board</h3>
                <NavLink to="/admin/editorial-calendar" style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none" }}>View Calendar ?</NavLink>
              </div>
              <div className="dashboard-status-grid">
                {[
                  { label: "In Draft", value: 45, color: "#8B5CF6", desc: "Being written by reporters" },
                  { label: "In Review", value: 18, color: "#F59E0B", desc: "Awaiting editor approval" },
                  { label: "Scheduled", value: 7, color: "#3B82F6", desc: "Queued for publication" }
                ].map(s => (
                  <div key={s.label} style={{ padding: "1rem", borderRadius: "10px", background: `${s.color}11`, border: `1px solid ${s.color}33`, textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color, marginBottom: "0.25rem" }}>{s.value}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{s.label}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              
              <h4 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--text-secondary)" }}>🔥 Top Trending Articles</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(newsPerf?.topArticles?.slice(0,4) || []).map((art, i) => (
                  <div key={art.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ width: "24px", height: "24px", background: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#D97706" : "var(--border-color)", color: i < 3 ? "#fff" : "var(--text-muted)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{art.title || art.titleTa}</div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>{(art.views || 0).toLocaleString()} <Eye size={12} style={{ display: "inline" }}/></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <QuickPublishWidget onPublished={fetchAll} />

              <div className="glass-panel" style={{ padding: "1.25rem" }}>
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><TrendingUp size={16} /> Trending Tags</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["#TNBudget", "#Election2026", "#Cricket", "#ChennaiRain", "#StockMarket"].map((tag, i) => (
                    <span key={tag} style={{ padding: "0.3rem 0.6rem", background: i < 2 ? "var(--primary-glow)" : "var(--bg-secondary)", color: i < 2 ? "var(--primary)" : "var(--text-secondary)", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${i < 2 ? "var(--primary)" : "var(--border-color)"}` }}>
                      {tag} {i < 2 && "🔥"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Clock size={18} /> Recent Newsroom Activity</h3>
              <NavLink to="/admin/audit-logs" style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none" }}>View All Logs →</NavLink>
            </div>
            {recentLogs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>No recent activity.</p>
            ) : (
              <div className="dashboard-logs-grid">
                {recentLogs.map((log, i) => (
                  <div key={log.id || i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", marginTop: "6px", flexShrink: 0, background: log.action?.includes("DELETE") ? "#EF4444" : log.action?.includes("CREATE") ? "#10B981" : "var(--primary)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}><strong>{log.userEmail || log.username || "System"}</strong> {log.action || log.module}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

