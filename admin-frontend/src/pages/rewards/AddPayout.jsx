import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../utils/axios';

export default function AddPayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state || {};

  const [authors, setAuthors] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    authorId: prefill.authorId || '',
    authorName: prefill.authorName || '',
    amount: prefill.amount || '',
    method: 'PayPal',
    paymentDetails: '',
    status: 'PAID',
    notes: ''
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/reward-system/earnings'),
      api.get('/api/admin/reward-system/payout-methods'),
      api.get('/api/admin/reward-system/settings')
    ]).then(([eRes, mRes, sRes]) => {
      setAuthors(Array.isArray(eRes.data) ? eRes.data : []);
      const enabledMethods = (Array.isArray(mRes.data) ? mRes.data : []).filter(m => m.enabled);
      setPayoutMethods(enabledMethods);
      if (enabledMethods.length > 0) {
        setForm(f => ({ ...f, method: enabledMethods[0].methodName }));
      }
      if (sRes.data?.currencySymbol) setCurrencySymbol(sRes.data.currencySymbol);
    }).catch(() => {});
  }, []);

  const handleAuthorChange = (e) => {
    const val = e.target.value;
    const selected = authors.find(a => String(a.authorId) === String(val));
    setForm(f => ({
      ...f,
      authorId: val,
      authorName: selected ? selected.authorName : '',
      amount: selected && selected.totalEarnings ? selected.totalEarnings : f.amount
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      alert('Please enter a valid payout amount');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/admin/reward-system/payouts', {
        ...form,
        authorId: form.authorId ? parseInt(form.authorId) : null,
        amount: parseFloat(form.amount)
      });
      navigate('/payouts');
    } catch {
      alert('Failed to record payout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/payouts')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Record New Payout</h2>
          <p className="text-sm text-gray-500 mt-0.5">Record a payment made to an author</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Select Author *</label>
            <select
              required
              value={form.authorId}
              onChange={handleAuthorChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            >
              <option value="">-- Select Author --</option>
              {authors.map(a => (
                <option key={a.authorId} value={a.authorId}>
                  {a.authorName} ({currencySymbol}{typeof a.totalEarnings === 'number' ? a.totalEarnings.toFixed(2) : a.totalEarnings})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Payout Amount ({currencySymbol}) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Payout Method *</label>
              <select
                value={form.method}
                onChange={(e) => setForm(f => ({ ...f, method: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              >
                {payoutMethods.length === 0 ? (
                  <>
                    <option value="PayPal">PayPal</option>
                    <option value="IBAN">IBAN</option>
                    <option value="SWIFT">SWIFT</option>
                  </>
                ) : (
                  payoutMethods.map(m => (
                    <option key={m.id} value={m.methodName}>{m.methodName}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Details (Account / Email / Ref)</label>
            <input
              type="text"
              value={form.paymentDetails}
              onChange={(e) => setForm(f => ({ ...f, paymentDetails: e.target.value }))}
              placeholder="e.g. paypal@author.com or IBAN DE89370400440532013000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Internal transaction notes or reference number…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B3732A]/20 focus:border-[#B3732A]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/payouts')}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#B3732A] text-white rounded-xl text-sm font-medium hover:bg-[#9c6323] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {submitting ? 'Saving…' : 'Record Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
