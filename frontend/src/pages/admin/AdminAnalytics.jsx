import React, { useState, useEffect, useRef } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [subReport, setSubReport] = useState('realtime'); // 'realtime', 'ga4', 'news', 'user', 'push', 'category', 'author'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [newsGrouping, setNewsGrouping] = useState('monthly');

  // Report Data states
  const [realtimeData, setRealtimeData] = useState({ activeReadersNow: 0, publishedLastHour: 0, trendingPost: null });
  const [ga4Data, setGa4Data] = useState({ totalSessions: 0, totalPageviews: 0, bounceRate: '0%', avgSessionDuration: '0s', topPages: [], trend: [] });
  const [newsData, setNewsData] = useState({ totalArticles: 0, totalViews: 0, publishedCount: 0, avgViewsPerArticle: 0, trend: [], topArticles: [] });
  const [userData, setUserData] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, retentionGrid: [], trend: [] });
  const [pushData, setPushData] = useState({ totalNotifications: 0, sentCount: 0, totalSent: 0, totalDelivered: 0, totalOpened: 0, clickThroughRate: '0%', notificationLogs: [] });
  const [categoryData, setCategoryData] = useState([]);
  const [authorData, setAuthorData] = useState([]);

  const realtimeTimer = useRef(null);

  // Load Categories & Districts on Mount
  const loadFilters = async () => {
    try {
      const [cats, dists] = await Promise.all([
        fetchApi('/admin/categories'),
        fetchApi('/admin/districts') // assume district list or fallback standard
      ]);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(dists)) setDistricts(dists);
    } catch (e) {
      console.error('Failed to load filter dropdowns', e);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  // Fetch Report based on selected subReport and filters
  const fetchReport = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (subReport === 'realtime') {
        const res = await fetchApi('/admin/analytics/realtime');
        if (res) setRealtimeData(res);
      } else if (subReport === 'ga4') {
        const res = await fetchApi(`/admin/analytics/ga4-summary?startDate=${startDate}&endDate=${endDate}`);
        if (res) setGa4Data(res);
      } else if (subReport === 'news') {
        let url = `/admin/analytics/news-performance?grouping=${newsGrouping}`;
        if (filterCategory) url += `&categoryId=${filterCategory}`;
        if (filterDistrict) url += `&districtId=${filterDistrict}`;
        const res = await fetchApi(url);
        if (res) setNewsData(res);
      } else if (subReport === 'user') {
        const res = await fetchApi('/admin/analytics/user-growth');
        if (res) setUserData(res);
      } else if (subReport === 'push') {
        const res = await fetchApi('/admin/analytics/push-analytics');
        if (res) setPushData(res);
      } else if (subReport === 'category') {
        const res = await fetchApi('/admin/analytics/content-by-category');
        if (res) setCategoryData(res);
      } else if (subReport === 'author') {
        const res = await fetchApi('/admin/analytics/author-performance');
        if (res) setAuthorData(res);
      }
    } catch (err) {
      setErrorMsg('Failed to load reports data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();

    // Setup live polling for realtime tab
    if (subReport === 'realtime') {
      realtimeTimer.current = setInterval(() => {
        fetchApi('/admin/analytics/realtime')
          .then(res => { if (res) setRealtimeData(res); })
          .catch(e => console.error(e));
      }, 15000); // refresh every 15 seconds
    } else {
      if (realtimeTimer.current) {
        clearInterval(realtimeTimer.current);
      }
    }

    return () => {
      if (realtimeTimer.current) clearInterval(realtimeTimer.current);
    };
  }, [subReport, startDate, endDate, filterCategory, filterDistrict, newsGrouping]);

  // Max value resolver for simple chart scaling
  const getMaxValue = (arr, key) => {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(item => item[key] || 0), 1);
  };

  return (
    <div className="admin-analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Analytics & Reports Dashboard</h1>
          <p className="subtitle">Operational statistics, GA4 performance reporting, and engagement metrics</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchReport} disabled={loading}>
          <i className="fa-solid fa-arrows-rotate"></i> Refresh Report
        </button>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}

      {/* Tabs list */}
      <div className="analytics-tabs-wrapper">
        <button className={`nav-tab-btn ${subReport === 'realtime' ? 'active' : ''}`} onClick={() => setSubReport('realtime')}>
          <i className="fa-solid fa-tower-broadcast"></i> Real-Time Live
        </button>
        <button className={`nav-tab-btn ${subReport === 'ga4' ? 'active' : ''}`} onClick={() => setSubReport('ga4')}>
          <i className="fa-solid fa-chart-line"></i> GA4 Google summary
        </button>
        <button className={`nav-tab-btn ${subReport === 'news' ? 'active' : ''}`} onClick={() => setSubReport('news')}>
          <i className="fa-solid fa-newspaper"></i> News Performance
        </button>
        <button className={`nav-tab-btn ${subReport === 'user' ? 'active' : ''}`} onClick={() => setSubReport('user')}>
          <i className="fa-solid fa-users"></i> Users Growth
        </button>
        <button className={`nav-tab-btn ${subReport === 'push' ? 'active' : ''}`} onClick={() => setSubReport('push')}>
          <i className="fa-solid fa-bell"></i> Push Bulletins
        </button>
        <button className={`nav-tab-btn ${subReport === 'category' ? 'active' : ''}`} onClick={() => setSubReport('category')}>
          <i className="fa-solid fa-tags"></i> Categories Data
        </button>
        <button className={`nav-tab-btn ${subReport === 'author' ? 'active' : ''}`} onClick={() => setSubReport('author')}>
          <i className="fa-solid fa-user-tie"></i> Authors Ranking
        </button>
      </div>

      {/* Filters bar */}
      {(subReport === 'ga4' || subReport === 'news') && (
        <div className="analytics-filter-row">
          {subReport === 'ga4' && (
            <>
              <div className="form-item">
                <label>From Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-item">
                <label>To Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          {subReport === 'news' && (
            <>
              <div className="form-item">
                <label>Category</label>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-item">
                <label>District</label>
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
                  <option value="">Global / All Districts</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-item">
                <label>Grouping</label>
                <select value={newsGrouping} onChange={(e) => setNewsGrouping(e.target.value)}>
                  <option value="monthly">Monthly Aggregate</option>
                  <option value="yearly">Yearly Aggregate</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {loading && <div className="loading-spinner-wrapper">Compiling analytics report...</div>}

      {/* SUB-PAGES RENDERING */}
      {!loading && (
        <div className="report-content-panel">
          
          {/* TAB 1: REALTIME */}
          {subReport === 'realtime' && (
            <div className="analytics-card-grid">
              <div className="stat-card live">
                <h3>Active Readers Right Now</h3>
                <div className="big-number blinking">{realtimeData.activeReadersNow}</div>
                <p className="card-note">Updating live every 15s</p>
              </div>
              <div className="stat-card">
                <h3>Published Last Hour</h3>
                <div className="big-number">{realtimeData.publishedLastHour}</div>
                <p className="card-note">Breaking bulletins published</p>
              </div>

              {realtimeData.trendingPost && (
                <div className="stat-card span-2">
                  <h3>Top Trending Article Today</h3>
                  <div className="trending-title">{realtimeData.trendingPost.title}</div>
                  <div className="trending-meta">
                    <span><i className="fa-solid fa-eye"></i> {realtimeData.trendingPost.views} views</span>
                    <span><i className="fa-solid fa-pen-nib"></i> By {realtimeData.trendingPost.author}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GA4 SUMMARY */}
          {subReport === 'ga4' && (
            <div>
              <div className="analytics-card-grid">
                <div className="stat-card">
                  <h3>GA4 Total Sessions</h3>
                  <div className="big-number">{ga4Data.totalSessions}</div>
                </div>
                <div className="stat-card">
                  <h3>GA4 Total Pageviews</h3>
                  <div className="big-number">{ga4Data.totalPageviews}</div>
                </div>
                <div className="stat-card">
                  <h3>Bounce Rate</h3>
                  <div className="big-number">{ga4Data.bounceRate}</div>
                </div>
                <div className="stat-card">
                  <h3>Avg Duration</h3>
                  <div className="big-number">{ga4Data.avgSessionDuration}</div>
                </div>
              </div>

              {/* Chart */}
              <div className="report-chart-section">
                <h3>Daily Sessions Trend</h3>
                <div className="chart-bar-container">
                  {ga4Data.trend && ga4Data.trend.map((t, idx) => {
                    const maxVal = getMaxValue(ga4Data.trend, 'sessions');
                    const heightPercent = ((t.sessions || 0) / maxVal) * 100;
                    return (
                      <div className="chart-bar-wrapper" key={idx}>
                        <div className="chart-bar-fill" style={{ height: `${heightPercent}%` }}>
                          <span className="tooltip-value">{t.sessions}</span>
                        </div>
                        <span className="chart-label">{t.date.substring(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="report-table-section">
                <h3>Top Viewed Page Paths</h3>
                <table className="analytics-data-table">
                  <thead>
                    <tr>
                      <th>Page URL Path</th>
                      <th>Article Name / Screen Title</th>
                      <th>Pageviews</th>
                      <th>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ga4Data.topPages && ga4Data.topPages.map((p, idx) => (
                      <tr key={idx}>
                        <td><code>{p.path}</code></td>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.views}</td>
                        <td>{p.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NEWS PERFORMANCE */}
          {subReport === 'news' && (
            <div>
              <div className="analytics-card-grid">
                <div className="stat-card">
                  <h3>Articles Managed</h3>
                  <div className="big-number">{newsData.totalArticles}</div>
                </div>
                <div className="stat-card">
                  <h3>Accumulated Views</h3>
                  <div className="big-number">{newsData.totalViews}</div>
                </div>
                <div className="stat-card">
                  <h3>Average Views/Post</h3>
                  <div className="big-number">{newsData.avgViewsPerArticle}</div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="report-chart-section">
                <h3>Views Distribution ({newsGrouping})</h3>
                <div className="chart-bar-container">
                  {newsData.trend && newsData.trend.map((t, idx) => {
                    const maxVal = getMaxValue(newsData.trend, 'value');
                    const heightPercent = ((t.value || 0) / maxVal) * 100;
                    return (
                      <div className="chart-bar-wrapper" key={idx}>
                        <div className="chart-bar-fill" style={{ height: `${heightPercent}%`, background: 'linear-gradient(180deg, #10b981, #059669)' }}>
                          <span className="tooltip-value">{t.value}</span>
                        </div>
                        <span className="chart-label">{t.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="report-table-section">
                <h3>Top Performing Articles</h3>
                <table className="analytics-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Article Title</th>
                      <th>Views Count</th>
                      <th>Status</th>
                      <th>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsData.topArticles && newsData.topArticles.map((a) => (
                      <tr key={a.id}>
                        <td>#{a.id}</td>
                        <td><strong>{a.title}</strong></td>
                        <td>{a.views}</td>
                        <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                        <td>{a.language === 'ta' ? 'Tamil' : 'English'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS GROWTH */}
          {subReport === 'user' && (
            <div>
              <div className="analytics-card-grid">
                <div className="stat-card">
                  <h3>Total User Registrations</h3>
                  <div className="big-number">{userData.totalUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>Active Accounts</h3>
                  <div className="big-number">{userData.activeUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>Suspended Accounts</h3>
                  <div className="big-number">{userData.inactiveUsers}</div>
                </div>
              </div>

              {/* Retention cohort grid */}
              <div className="report-table-section">
                <h3>Cohort User Retention Rate</h3>
                <table className="analytics-data-table">
                  <thead>
                    <tr>
                      <th>Cohort Month</th>
                      <th>Sample size</th>
                      <th>Month 1</th>
                      <th>Month 2</th>
                      <th>Month 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.retentionGrid && userData.retentionGrid.map((r, idx) => (
                      <tr key={idx}>
                        <td><strong>{r.cohort}</strong></td>
                        <td>{r.size} users</td>
                        <td style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 'bold' }}>{r.month1}</td>
                        <td style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 'bold' }}>{r.month2}</td>
                        <td style={{ background: '#f8fafc' }}>{r.month3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PUSH PERFORMANCE */}
          {subReport === 'push' && (
            <div>
              <div className="analytics-card-grid">
                <div className="stat-card">
                  <h3>Total Push Broadcasts</h3>
                  <div className="big-number">{pushData.totalNotifications}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Delivered</h3>
                  <div className="big-number">{pushData.totalDelivered}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Opened</h3>
                  <div className="big-number">{pushData.totalOpened}</div>
                </div>
                <div className="stat-card">
                  <h3>Click-Through Rate (CTR)</h3>
                  <div className="big-number" style={{ color: '#d97706' }}>{pushData.clickThroughRate}</div>
                </div>
              </div>

              <div className="report-table-section">
                <h3>Push Notification Logs</h3>
                <table className="analytics-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Notification Title</th>
                      <th>Status</th>
                      <th>Sent Size</th>
                      <th>Opens Count</th>
                      <th>Sent Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pushData.notificationLogs && pushData.notificationLogs.map(l => (
                      <tr key={l.id}>
                        <td>#{l.id}</td>
                        <td><strong>{l.title}</strong></td>
                        <td><span className={`status-badge ${l.status.toLowerCase()}`}>{l.status}</span></td>
                        <td>{l.sentCount}</td>
                        <td>{l.openedCount}</td>
                        <td>{l.sentAt ? l.sentAt.substring(0, 16).replace('T', ' ') : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CATEGORIES DATA */}
          {subReport === 'category' && (
            <div className="report-table-section">
              <h3>Engagement Metrics grouped by Categories</h3>
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Category Title</th>
                    <th>Articles Count</th>
                    <th>Total Views</th>
                    <th>Average Views</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map(c => (
                    <tr key={c.categoryId}>
                      <td>#{c.categoryId}</td>
                      <td><strong>{c.categoryName}</strong></td>
                      <td>{c.articleCount}</td>
                      <td>{c.totalViews}</td>
                      <td>{c.avgViews} views</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 7: AUTHOR RANKINGS */}
          {subReport === 'author' && (
            <div className="report-table-section">
              <h3>Monthly Author Engagement Ranking</h3>
              <table className="analytics-data-table">
                <thead>
                  <tr>
                    <th width="80">Ranking</th>
                    <th>Author Name</th>
                    <th>Total Articles</th>
                    <th>Published Articles</th>
                    <th>Total Views</th>
                    <th>Avg Views per Article</th>
                  </tr>
                </thead>
                <tbody>
                  {authorData.map((a, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
                      </td>
                      <td><strong>{a.author}</strong></td>
                      <td>{a.articleCount}</td>
                      <td>{a.publishedCount}</td>
                      <td><span className="views-emphasis">{a.totalViews}</span></td>
                      <td>{a.avgViews} views</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
