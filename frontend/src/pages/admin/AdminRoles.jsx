import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../utils/api';
import './AdminRoles.css';

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  const allModules = [
    'Admin Panel',
    'Add Post',
    'Manage All Posts',
    'Navigation',
    'Pages',
    'RSS Feeds',
    'Categories',
    'Widgets',
    'Polls',
    'Gallery',
    'Comments',
    'Contact Messages',
    'Newsletter',
    'Reward System',
    'Ad Spaces',
    'Users',
    'Roles & Permissions',
    'SEO Tools',
    'Social Login',
    'Languages',
    'Settings'
  ];

  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/roles');
      if (res && Array.isArray(res.roles)) {
        setRoles(res.roles);
      } else if (Array.isArray(res)) {
        setRoles(res);
      }
    } catch (err) {
      console.error('Failed to load roles list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handlePermissionToggle = (modName) => {
    if (selectedPermissions.includes(modName)) {
      setSelectedPermissions(selectedPermissions.filter((m) => m !== modName));
    } else {
      setSelectedPermissions([...selectedPermissions, modName]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPermissions([...allModules]);
    } else {
      setSelectedPermissions([]);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setRoleName('');
    setDescription('');
    setSelectedPermissions([]);
    setErrorMsg('');
  };

  const handleEditRole = (role) => {
    setEditingId(role.id);
    setRoleName(role.name || '');
    setDescription(role.description || '');
    const currentPermNames = (role.permissions || []).map((p) => (typeof p === 'string' ? p : p.name));
    setSelectedPermissions(currentPermNames);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!roleName.trim()) {
      setErrorMsg('Role name is required');
      return;
    }

    try {
      const payload = {
        name: roleName.trim(),
        description: description.trim(),
        permissions: selectedPermissions
      };

      const endpoint = editingId ? `/admin/roles/${editingId}` : '/admin/roles';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetchApi(endpoint, {
        method,
        body: JSON.stringify(payload)
      });

      if (res && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(editingId ? 'Role updated successfully!' : 'Custom Role created successfully!');
        resetForm();
        loadRoles();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save role');
    }
  };

  return (
    <div className="admin-roles-container">
      <div className="pages-header">
        <h1>Roles & Access Permissions</h1>
        <p className="subtitle">Configure admin access roles and module permission checkboxes</p>
      </div>

      {errorMsg && <div className="alert-banner error">{errorMsg}</div>}
      {successMsg && <div className="alert-banner success">{successMsg}</div>}

      <div className="split-view-layout">
        {/* Left: Role Form with 21 module checkboxes */}
        <div className="form-panel">
          <h2>{editingId ? 'Edit Role Details' : 'Create Custom Role'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="roleName">Role Name *</label>
              <input
                type="text"
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Moderator"
                disabled={editingId && (roleName === 'SUPERADMIN' || roleName === 'SUPER_ADMIN')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role responsibility summary..."
              />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <label className="m-0 font-bold text-slate-800">Assign Module Permissions ({selectedPermissions.length}/21)</label>
                <label className="text-xs text-blue-600 font-semibold cursor-pointer flex items-center gap-1 m-0">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.length === allModules.length}
                    onChange={handleSelectAll}
                  />
                  Select All
                </label>
              </div>

              <div className="permissions-checkbox-grid">
                {allModules.map((mod) => {
                  const isChecked = selectedPermissions.includes(mod);
                  return (
                    <label key={mod} className={`permission-checkbox-card ${isChecked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handlePermissionToggle(mod)}
                      />
                      <span>{mod}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Role Changes' : 'Create Role'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: Roles List Table */}
        <div className="table-panel">
          <h2>System Roles ({roles.length})</h2>
          {loading ? (
            <div className="loading-state">Loading system roles...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Permissions</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        No system roles found.
                      </td>
                    </tr>
                  ) : (
                    roles.map((r) => {
                      const permsCount = (r.permissions || []).length;
                      return (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td>
                            <span className="font-bold text-slate-800">{r.name}</span>
                          </td>
                          <td>
                            <span className="text-xs text-slate-600">{r.description || 'No description'}</span>
                          </td>
                          <td>
                            <span className="badge badge-widget-type">{permsCount} Modules</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => handleEditRole(r)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i> Edit Role
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
