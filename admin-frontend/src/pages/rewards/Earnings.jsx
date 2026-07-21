import React, { useState, useEffect } from 'react';
import { DollarSign, Eye, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

export default function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/reward-system/earnings'),
      api.get('/api/admin/reward-system/settings')
    ]).then(([eRes, sRes]) => {
      setEarnings(Array.isArray(eRes.data) ? eRes.data : []);
      if (sRes.data?.currencySymbol) setCurrencySymbol(sRes.data.currencySymbol);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Author Earnings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Accrued earnings per author based on article pageviews</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : earnings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Award size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No author earnings recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold">Author Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold text-center">Total Pageviews</th>
                  <th className="px-4 py-3 font-semibold text-right">Accrued Earnings</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((item, idx) => {
                  const amt = typeof item.totalEarnings === 'number' ? item.totalEarnings : (parseFloat(item.totalEarnings) || 0);
                  return (
                    <tr key={item.authorId || idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{item.authorName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.email || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          <Eye size={12} /> {item.totalViews != null ? item.totalViews.toLocaleString() : 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {currencySymbol}{amt.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate('/payouts/add', { state: { authorId: item.authorId, authorName: item.authorName, amount: amt } })}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#B3732A] text-white hover:bg-[#9c6323] rounded-lg text-xs font-medium transition-colors"
                        >
                          Payout <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
