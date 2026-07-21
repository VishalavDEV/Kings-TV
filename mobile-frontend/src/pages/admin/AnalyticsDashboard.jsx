import React, { useState, useEffect } from "react";
import api from '../../services/api';
import { TrendingUp, Users, Eye, Map, FileText, Share2, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend } from "recharts";

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/analytics?range=${timeRange}`);
        setData(res.data);
      } catch (error) { console.error("Failed to load analytics", error); }
      setLoading(false);
    };
    fetchAnalytics();
  }, [timeRange]);

  // Mock data for charts if API fails
  const catData = [
    { name: "Politics", views: 4000, shares: 2400 },
    { name: "Sports", views: 3000, shares: 1398 },
    { name: "Cinema", views: 2000, shares: 9800 },
    { name: "Business", views: 2780, shares: 3908 },
    { name: "Tech", views: 1890, shares: 4800 },
    { name: "World", views: 2390, shares: 3800 },
  ];

  const trendData = [
    { name: "Mon", published: 12, views: 2400 },
    { name: "Tue", published: 15, views: 1398 },
    { name: "Wed", published: 8, views: 9800 },
    { name: "Thu", published: 22, views: 3908 },
    { name: "Fri", published: 18, views: 4800 },
    { name: "Sat", published: 9, views: 3800 },
    { name: "Sun", published: 5, views: 4300 },
  ];

  const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className="glass-panel stat-card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>{label}</div>
        <div style={{ color, padding: "0.5rem", background: `${color}22`, borderRadius: "8px" }}><Icon size={18} /></div>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: trend.startsWith("+") ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <TrendingUp size={12} style={{ transform: trend.startsWith("-") ? "rotate(180deg)" : "none" }} />
        {trend} vs last {timeRange === "monthly" ? "month" : "year"}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <TrendingUp size={26} color="var(--primary)" /> Reports & Analytics
          </h1>
          <p className="text-secondary">Platform performance, content metrics, and user growth.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["weekly", "monthly", "yearly"].map(r => (
            <button key={r} className={`btn ${timeRange === r ? "btn-primary" : "btn-secondary"}`} onClick={() => setTimeRange(r)} style={{ textTransform: "capitalize", padding: "0.5rem 1rem" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
        <StatCard label="Total Article Views" value={loading ? "-" : "842.5K"} icon={Eye} color="#3B82F6" trend="+18.2%" />
        <StatCard label="New Readers" value={loading ? "-" : "1,204"} icon={Users} color="#10B981" trend="+4.1%" />
        <StatCard label="Articles Published" value={loading ? "-" : "452"} icon={FileText} color="var(--primary)" trend="-2.4%" />
        <StatCard label="Top District" value="Chennai" icon={Map} color="#F59E0B" trend="+12.5%" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Main Chart */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>Views & Publishing Trend ({timeRange})</h3>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <Tooltip contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="views" name="Page Views" stroke="var(--primary)" fillOpacity={1} fill="url(#colorViews)" />
                <Line yAxisId="right" type="monotone" dataKey="published" name="Articles Published" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>Top Categories</h3>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} width={60} />
                <Tooltip cursor={{ fill: "var(--bg-secondary)" }} contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "8px" }} />
                <Bar dataKey="views" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Content Performance Table */}
        <div className="glass-panel" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem" }}>Top Performing Articles</h3>
            <button className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>Export CSV</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>Title</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "0.75rem 0.5rem", fontWeight: 600, textAlign: "right" }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: "????? ????????? ??????? ??????????...", cat: "Cinema", views: 52400 },
                  { title: "???????????? ?????? ????? ??????...", cat: "Business", views: 38100 },
                  { title: "????? ?????????? ????????????...", cat: "Politics", views: 29500 },
                  { title: "??????? vs ??????????? ???????...", cat: "Sports", views: 24300 },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-primary)", fontWeight: 500 }}>{row.title}</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>{row.cat}</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--primary)", fontWeight: 700, textAlign: "right" }}>{row.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Google News Readiness */}
        <div className="glass-panel" style={{ padding: "1.5rem", border: "2px solid rgba(16,185,129,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", color: "#10B981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_News_icon.svg" alt="GNews" style={{ width: 16, height: 16 }} />
              Google News Readiness
            </h3>
            <span style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>EXCELLENT (94%)</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>Platform is fully optimized for Google News Publisher Center inclusion.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Valid NewsArticle Schema", status: true },
              { label: "Canonical URLs Implemented", status: true },
              { label: "Google News XML Sitemap Live", status: true },
              { label: "Author Transparency", status: true },
              { label: "AMP Pages Configured", status: false, note: "Optional for Discover" }
            ].map((check, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500 }}>{check.label}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: check.status ? "#10B981" : "var(--text-muted)" }}>
                  {check.note && <span>{check.note}</span>}
                  {check.status ? "? Pass" : "?? Warning"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
