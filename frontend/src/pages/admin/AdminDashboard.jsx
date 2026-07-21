import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    drafts: 0,
    scheduledPosts: 0
  });
  const [comments, setComments] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, commentsRes, messagesRes, usersRes] = await Promise.allSettled([
          fetchApi('/admin/dashboard/stats'),
          fetchApi('/admin/dashboard/recent-comments'),
          fetchApi('/admin/dashboard/recent-contact-messages'),
          fetchApi('/admin/dashboard/recent-users')
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value);
        }
        if (commentsRes.status === 'fulfilled' && Array.isArray(commentsRes.value)) {
          setComments(commentsRes.value);
        }
        if (messagesRes.status === 'fulfilled' && Array.isArray(messagesRes.value)) {
          setContactMessages(messagesRes.value);
        }
        if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
          setRecentUsers(usersRes.value);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-container loading-state">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Overview of system stats, pending actions, and recent activity</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card total-posts">
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-newspaper"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Posts</span>
            <span className="stat-value">{stats.totalPosts || 0}</span>
          </div>
        </div>

        <div className="stat-card pending-posts">
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-clock"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Posts</span>
            <span className="stat-value">{stats.pendingPosts || 0}</span>
          </div>
        </div>

        <div className="stat-card drafts">
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-file-pen"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Drafts</span>
            <span className="stat-value">{stats.drafts || 0}</span>
          </div>
        </div>

        <div className="stat-card scheduled-posts">
          <div className="stat-icon-wrapper">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Scheduled Posts</span>
            <span className="stat-value">{stats.scheduledPosts || 0}</span>
          </div>
        </div>
      </div>

      {/* 3 Activity Panels */}
      <div className="dashboard-panels-grid">
        {/* Pending Comments Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-comments"></i> Pending Comments</h3>
            <Link to="/comments" className="view-all-link">View All &rarr;</Link>
          </div>
          <div className="panel-body">
            {comments.length === 0 ? (
              <div className="empty-state">No pending comments</div>
            ) : (
              <ul className="activity-list">
                {comments.map((comment) => (
                  <li key={comment.id} className="activity-item">
                    <div className="item-header">
                      <strong className="item-name">{comment.commentorName || 'Anonymous'}</strong>
                      <span className="item-badge pending">{comment.status || 'pending'}</span>
                    </div>
                    <p className="item-text">{comment.commentText}</p>
                    <span className="item-date">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Contact Messages Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-envelope"></i> Latest Contact Messages</h3>
            <Link to="/contact-messages" className="view-all-link">View All &rarr;</Link>
          </div>
          <div className="panel-body">
            {contactMessages.length === 0 ? (
              <div className="empty-state">No contact messages</div>
            ) : (
              <ul className="activity-list">
                {contactMessages.map((msg) => (
                  <li key={msg.id} className="activity-item">
                    <div className="item-header">
                      <strong className="item-name">{msg.name}</strong>
                      <span className="item-subtext">{msg.email}</span>
                    </div>
                    {msg.subject && <div className="item-subject">{msg.subject}</div>}
                    <p className="item-text">{msg.message}</p>
                    <span className="item-date">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Latest Registered Users Panel */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><i className="fa-solid fa-users"></i> Latest Users</h3>
            <Link to="/users" className="view-all-link">View All &rarr;</Link>
          </div>
          <div className="panel-body">
            {recentUsers.length === 0 ? (
              <div className="empty-state">No registered users</div>
            ) : (
              <ul className="activity-list">
                {recentUsers.map((user) => (
                  <li key={user.id} className="activity-item user-item">
                    <div className="user-avatar-initial font-bold">
                      {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <strong className="item-name">{user.fullName || 'User'}</strong>
                      <span className="item-subtext">{user.email}</span>
                    </div>
                    <span className="user-role-badge">{user.role || 'READER'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
