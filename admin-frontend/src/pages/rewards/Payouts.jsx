import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/admin/reward-system/payouts'),
      api.get('/api/admin/reward-system/settings')
    ]).then(([pRes, sRes]) => {
      setPayouts(Array.isArray(pRes.data) ? pRes.data : []);
      if (sRes.data?.currencySymbol) setCurrencySymbol(sRes.data.currencySymbol);
    }).catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    try {
      await api.put(`/api/admin/reward-system/payouts/${id}/status`, { status: nextStatus });
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Payouts History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Record and track payout history to authors</p>
        </div>
        <button
          onClick={() => navigate('/payouts/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Payout
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#B3732A]/30 border-t-[#B3732A] rounded-full animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No payouts recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 font-semibold w-14">ID</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Requested Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const isPaid = p.status === 'PAID';
                  const amt = typeof p.amount === 'number' ? p.amount : (parseFloat(p.amount) || 0);
                  return (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{p.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.authorName || `Author #${p.authorId}`}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{currencySymbol}{amt.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isPaid
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          Mark as {isPaid ? 'PENDING' : 'PAID'}
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
