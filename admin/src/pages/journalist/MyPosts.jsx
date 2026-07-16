import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Plus, Edit2, AlertTriangle, Eye, Video } from 'lucide-react';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/my-content');
      setPosts(res.data || []);
    } catch (error) {
      console.error("Failed to fetch my posts", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>My Workspace</h1>
          <p className="text-secondary">Manage your submitted articles and video content.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/journalist/create')}>
          <Plus size={16} /> Create New Post
        </button>
      </div>

      <div className="glass-panel table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Remaining Edits</th>
              <th>Published At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading your posts...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>You haven't submitted any posts yet.</td></tr>
            ) : (
              posts.map(item => {
                const article = item.article;
                const canEdit = item.remainingEdits > 0;
                
                return (
                  <tr key={article.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {article.titleEn || article.titleTa}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {article.categoryId ? 'Categorized News' : 'Uncategorized'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${article.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {article.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: canEdit ? 'var(--text-primary)' : 'var(--danger)' }}>
                        {!canEdit && <AlertTriangle size={14} />}
                        {item.remainingEdits} of 2
                      </div>
                    </td>
                    <td>{new Date(article.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="View">
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem', color: canEdit ? 'var(--primary)' : 'var(--text-muted)' }} 
                          title={canEdit ? "Edit Post" : "Max edits reached"}
                          disabled={!canEdit}
                          onClick={() => navigate(`/journalist/edit/${article.id}`)}
                        >
                          <Edit2 size={16} />
                        </button>
                        {/* Notice: No DELETE button is rendered here as per RBAC requirements */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPosts;
