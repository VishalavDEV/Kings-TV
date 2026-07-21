import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import DataTable from '../components/DataTable';
import { useToast } from '../context/ToastContext';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadMessages = () => {
    setLoading(true);
    api.get('/api/admin/contact-messages')
      .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => showError('Failed to load contact messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (item) => {
    try {
      await api.delete(`/api/admin/contact-messages/${item.id}`);
      showSuccess('Contact message deleted');
      setMessages(prev => prev.filter(m => m.id !== item.id));
    } catch {
      showError('Failed to delete contact message');
    }
  };

  const handleBulkDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/api/admin/contact-messages/${id}`)));
      showSuccess(`Deleted ${ids.length} contact messages`);
      setMessages(prev => prev.filter(m => !ids.includes(m.id)));
    } catch {
      showError('Failed to delete selected contact messages');
    }
  };

  const columns = [
    { key: 'id', label: 'Id', className: 'w-16' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'message',
      label: 'Message',
      sortable: false,
      render: (val) => <span className="line-clamp-2 max-w-sm">{val}</span>
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleDateString() : '—')
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
        <p className="text-sm text-gray-500 mt-0.5">Read-only inbox for messages sent via site contact form</p>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        loading={loading}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        searchableKeys={['name', 'email', 'message']}
      />
    </div>
  );
}
