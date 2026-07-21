import { useI18n } from '../../context/I18nContext';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RewardSystem = () => {
  const { t } = useI18n();
  const [config, setConfig] = useState({ costPerView: '0.01' });
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const configRes = await axios.get('/api/v1/admin/rewards/config', { headers: { Authorization: `Bearer ${token}` } });
      setConfig(configRes.data);
      
      const ledgerRes = await axios.get('/api/v1/admin/rewards/ledgers', { headers: { Authorization: `Bearer ${token}` } });
      setLedgers(ledgerRes.data);
    } catch (error) {
      console.error('Error fetching reward data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/admin/rewards/config', config, { headers: { Authorization: `Bearer ${token}` } });
      alert('Config updated successfully');
    } catch (error) {
      console.error('Error updating config', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reward System / Pageview Earnings</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Earning Configuration</h2>
        <form onSubmit={handleConfigUpdate} className="flex items-end space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost Per Unique View ($)</label>
            <input 
              type="number" 
              step="0.001" 
              value={config.costPerView} 
              onChange={e => setConfig({ costPerView: e.target.value })} 
              className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Save Config
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Recent Earnings Ledger</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount ($)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ledgers.slice(0, 100).map(ledger => (
              <tr key={ledger.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ledger.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{ledger.authorId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{ledger.articleId || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{ledger.transactionType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">+${ledger.amount}</td>
              </tr>
            ))}
            {ledgers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No earnings recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RewardSystem;
