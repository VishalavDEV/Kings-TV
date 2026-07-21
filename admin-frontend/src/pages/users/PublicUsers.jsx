import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import DataTable from '../../components/DataTable';
import { useToast } from '../../context/ToastContext';

export default function PublicUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadData = () => {
    setLoading(true);
    api.get('/api/admin/users/public-users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => showError('Failed to load registered users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/admin/users/public-users/${item.id}`);
      showSuccess('Public user deleted');
      setUsers(prev => prev.filter(u => u.id !== item.id));
    } catch {
      showError('Failed to delete user');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/admin/users/public-users/${id}`)));
      showSuccess(`Deleted ${ids.length} public users`);
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    } catch {
      showError('Failed to delete selected users');
    }
  };

  const columns = [
    { key: 'id', label: 'Id', className: 'w-16' },
    {
      key: 'fullName',
      label: 'User',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.profileImage ? (
            <img src={row.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              {(val || 'U').charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800 text-xs">{val || 'Reader'}</div>
            <div className="text-[11px] text-gray-400">{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'username', label: 'Username', sortable: true },
    {
      key: 'createdAt',
      label: 'Registered Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—')
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Registered Public Users</h2>
        <p className="text-sm text-gray-500 mt-0.5">Read-mostly list of front-end site visitors who created an account</p>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        searchableKeys={['fullName', 'email', 'username']}
      />
    </div>
  );
}
