import React, { useState, useEffect } from "react";
import api from "../../api";
import { Radio, Plus, Trash2, Eye, EyeOff, Clock, AlertCircle } from "lucide-react";

const inputStyle = {
  width: "100%", padding: "0.75rem 1rem", borderRadius: "8px",
  border: "1px solid var(--border-color)", background: "var(--bg-secondary)",
  color: "var(--text-primary)", fontSize: "0.875rem", boxSizing: "border-box",
};
const labelStyle = { fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" };

const BreakingNewsCard = ({ item, onToggle, onDelete }) => (
  <div className="glass-panel" style={{
    padding: "1rem 1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "1rem",
    borderLeft: `4px solid ${item.isActive ? "#EF4444" : "var(--border-color)"}`,
    opacity: item.isActive ? 1 : 0.65,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
        {item.isActive && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />}
        <span style={{ fontWeight: 700 }}>{item.titleTa || item.title}</span>
        {item.priority === "HIGH" && <span style={{ fontSize: "0.7rem", background: "rgba(239,68,68,0.2)", color: "#EF4444", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>HIGH</span>}
      </div>
      {item.titleEn && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.titleEn}</div>}
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
        {item.createdAt && new Date(item.createdAt).toLocaleString()}
        {item.expiresAt && ` · Expires: ${new Date(item.expiresAt).toLocaleString()}`}
      </div>
    </div>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={() => onToggle(item)} style={{
        padding: "0.4rem 0.8rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
        background: item.isActive ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
        color: item.isActive ? "#EF4444" : "#10B981"
      }}>
        {item.isActive ? "Deactivate" : "Activate"}
      </button>
      <button onClick={() => onDelete(item.id)} style={{
        padding: "0.4rem", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.3)",
        background: "rgba(239,68,68,0.05)", color: "#EF4444", cursor: "pointer"
      }}>
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

const BreakingNewsDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleTa: "", titleEn: "", expiresInHours: 6, priority: "HIGH", linkUrl: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, isError = false) => { setMsg({ text, isError }); setTimeout(() => setMsg(null), 4000); };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/breaking-news?page=0&size=30");
      const data = res.data;
      setItems(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const toggle = async (item) => {
    try {
      await api.put(`/breaking-news/${item.id}`, { ...item, isActive: !item.isActive });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
      showMsg(`Alert ${!item.isActive ? "activated" : "deactivated"}.`);
    } catch { showMsg("Failed to toggle.", true); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this breaking news alert?")) return;
    try { await api.delete(`/breaking-news/${id}`); setItems(prev => prev.filter(i => i.id !== id)); showMsg("Deleted."); }
    catch { showMsg("Failed to delete.", true); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.titleTa) { showMsg("Tamil title is required.", true); return; }
    setSaving(true);
    try {
      const expiresAt = new Date(Date.now() + form.expiresInHours * 3600000).toISOString();
      await api.post("/breaking-news", { ...form, isActive: true, expiresAt });
      showMsg("Breaking news published!");
      setForm({ titleTa: "", titleEn: "", expiresInHours: 6, priority: "HIGH", linkUrl: "" });
      setShowForm(false);
      fetchItems();
    } catch (err) { showMsg(err.response?.data?.message || "Failed.", true); }
    setSaving(false);
  };

  const activeItems = items.filter(i => i.isActive);
  const inactiveItems = items.filter(i => !i.isActive);

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <Radio size={26} color="#EF4444" /> Breaking News Control
          </h1>
          <p className="text-secondary">Manage live breaking news alerts on the site ticker.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> {showForm ? "Cancel" : "New Alert"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Live Alerts", value: activeItems.length, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
          { label: "Total Alerts", value: items.length, color: "var(--primary)", bg: "var(--primary-glow)" },
          { label: "Inactive", value: inactiveItems.length, color: "var(--text-muted)", bg: "var(--bg-secondary)" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="glass-panel" style={{ padding: "1.25rem" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{label}</div>
          </div>
        ))}
      </div>

      {msg && (
        <div style={{ padding: "0.75rem 1rem", marginBottom: "1rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem",
          background: msg.isError ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          color: msg.isError ? "#EF4444" : "#10B981",
          border: `1px solid ${msg.isError ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}` }}>
          {msg.text}
        </div>
      )}

      {showForm && (
        <div className="glass-panel" style={{ padding: "1.75rem", borderRadius: "14px", border: "2px solid rgba(239,68,68,0.4)", marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1.25rem", color: "#EF4444" }}>?? Publish Breaking News Alert</h3>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Tamil Headline *</label>
                <input style={inputStyle} value={form.titleTa} onChange={e => setForm(f => ({ ...f, titleTa: e.target.value }))} placeholder="??????? ??????..." />
              </div>
              <div>
                <label style={labelStyle}>English Headline</label>
                <input style={inputStyle} value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} placeholder="Breaking news headline..." />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Priority</label>
                <select style={inputStyle} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="HIGH">?? High</option>
                  <option value="MEDIUM">?? Medium</option>
                  <option value="LOW">?? Low</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Auto-expire After</label>
                <select style={inputStyle} value={form.expiresInHours} onChange={e => setForm(f => ({ ...f, expiresInHours: parseInt(e.target.value) }))}>
                  {[1,3,6,12,24,48].map(h => <option key={h} value={h}>{h} hour{h > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Link URL (optional)</label>
                <input style={inputStyle} value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            {form.titleTa && (
              <div style={{ background: "#EF4444", padding: "0.6rem 1.2rem", borderRadius: "6px", color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>
                ?? LIVE PREVIEW: {form.titleTa}
              </div>
            )}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ background: "#EF4444", border: "none" }}>
                {saving ? "Publishing..." : "?? Publish Now"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem", color: "#EF4444" }}>?? Live Alerts ({activeItems.length})</h3>
        {loading ? <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
          : activeItems.length === 0 ? <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>No active alerts.</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{activeItems.map(item => <BreakingNewsCard key={item.id} item={item} onToggle={toggle} onDelete={deleteItem} />)}</div>}
      </div>

      {inactiveItems.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>Inactive / Expired ({inactiveItems.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {inactiveItems.map(item => <BreakingNewsCard key={item.id} item={item} onToggle={toggle} onDelete={deleteItem} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakingNewsDashboard;
