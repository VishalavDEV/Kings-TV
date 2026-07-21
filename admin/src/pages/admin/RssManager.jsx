import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RssManager = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    feedUrl: '',
    categoryId: '',
    language: 'ta',
    autoImageDownload: false,
    autoPublish: false
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/admin/rss-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfigs(response.data);
    } catch (error) {
      console.error('Error fetching RSS configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/v1/admin/rss-config/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/admin/rss-config', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ name: '', feedUrl: '', categoryId: '', language: 'ta', autoImageDownload: false, autoPublish: false });
      setEditingId(null);
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleEdit = (config) => {
    setFormData(config);
    setEditingId(config.id);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this source?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/v1/admin/rss-config/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchConfigs();
      } catch (error) {
        console.error('Error deleting config:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">RSS Feed Manager</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Add'} RSS Source</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Source Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Feed URL</label>
              <input type="url" name="feedUrl" value={formData.feedUrl} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Category ID</label>
              <input type="number" name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language Mapping</label>
              <select name="language" value={formData.language} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option value="ta">Tamil</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <input type="checkbox" name="autoImageDownload" checked={formData.autoImageDownload} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Auto Download Images</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="autoPublish" checked={formData.autoPublish} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Auto Publish (Instead of Draft)</label>
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            {editingId ? 'Update' : 'Add'} Source
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({name: '', feedUrl: '', categoryId: '', language: 'ta', autoImageDownload: false, autoPublish: false}) }} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image / Publish</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map(config => (
              <tr key={config.id}>
                <td className="px-6 py-4 whitespace-nowrap">{config.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 truncate max-w-xs">{config.feedUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap uppercase">{config.language}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {config.autoImageDownload ? '✅' : '❌'} / {config.autoPublish ? '✅' : '❌'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(config)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(config.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RssManager;
