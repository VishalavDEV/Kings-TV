import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Trash2, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SubscribersManagement = () => {
  const { user: currentUser } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/newsletter/getAll?page=${page}&size=20${statusFilter ? `&status=${statusFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`);
      setSubscribers(res.data.content || []);
    } catch (err) {
      console.error("Failed to fetch subscribers", err);
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, statusFilter, searchTerm]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if(window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      try {
        await api.patch(`/newsletter/changeStatus`, { id, status: newStatus });
        fetchSubscribers();
      } catch (e) {
        alert("Failed to update status");
      }
    }
  };

  const deleteSubscriber = async (id) => {
    if(window.confirm("CRITICAL: Delete this subscription permanently?")) {
      try {
        await api.delete(`/newsletter/${id}`);
        fetchSubscribers();
      } catch (e) {
        alert("Failed to delete subscriber");
      }
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-2xl font-bold">Subscribers Management</h1>
          <p className="text-gray-500">Manage newsletter and push notification subscribers.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search email or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-red-500">{error}</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No subscribers found.</td></tr>
            ) : (
              subscribers.map(sub => (
                <tr key={sub.subscriberId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.name || 'Anonymous'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{sub.email}</div>
                    <div className="text-gray-500 text-xs">{sub.mobile}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="text-gray-500 hover:text-gray-700" 
                        title={sub.status === 'active' ? "Suspend" : "Activate"}
                        onClick={() => toggleStatus(sub.subscriberId, sub.status)}
                      >
                        {sub.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900" 
                        title="Delete"
                        onClick={() => deleteSubscriber(sub.subscriberId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscribersManagement;
