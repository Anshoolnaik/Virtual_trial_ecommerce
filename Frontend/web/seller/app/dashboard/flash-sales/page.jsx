'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const isLive = (sale) => {
  const now = Date.now();
  return sale.isActive && new Date(sale.startsAt) <= now && new Date(sale.endsAt) > now;
};

const isExpired = (sale) => new Date(sale.endsAt) <= Date.now();

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [error,      setError]       = useState('');
  const [showForm,   setShowForm]    = useState(false);
  const [saving,     setSaving]      = useState(false);
  const [form, setForm] = useState({
    productId: '',
    salePrice: '',
    startsAt:  '',
    endsAt:    '',
  });

  const load = async () => {
    try {
      const [salesRes, prodsRes] = await Promise.all([
        sellerApi.flashSales.list(),
        sellerApi.products.list(),
      ]);
      setFlashSales(salesRes.data.data.flashSales);
      setProducts(prodsRes.data.data.products);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sellerApi.flashSales.create({
        productId: form.productId,
        salePrice: parseFloat(form.salePrice),
        startsAt:  form.startsAt  || undefined,
        endsAt:    form.endsAt,
      });
      setShowForm(false);
      setForm({ productId: '', salePrice: '', startsAt: '', endsAt: '' });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this flash sale?')) return;
    try {
      await sellerApi.flashSales.delete(id);
      setFlashSales((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const handleToggle = async (sale) => {
    try {
      await sellerApi.flashSales.update(sale.id, { isActive: !sale.isActive });
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
          <p className="text-gray-500 text-sm mt-1">Create limited-time deals shown on the buyer app homepage.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Flash Sale
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">New Flash Sale</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
              <select
                required
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.brand} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sale Price (₹)</label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 999"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ends At</label>
              <input
                required
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Starts At (optional)</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Creating…' : 'Create Flash Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : flashSales.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">⚡</p>
          <p className="font-medium text-gray-600">No flash sales yet</p>
          <p className="text-sm mt-1">Create one to feature your products on the buyer app.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Sale Price</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Ends At</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flashSales.map((sale) => {
                const live    = isLive(sale);
                const expired = isExpired(sale);
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {sale.product?.imageUrl ? (
                          <img src={sale.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{sale.product?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{sale.product?.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900">₹{sale.salePrice}</div>
                      {sale.product?.originalPrice && (
                        <div className="text-xs text-gray-400 line-through">₹{sale.product.originalPrice}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatDate(sale.endsAt)}</td>
                    <td className="px-5 py-3.5">
                      {expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Expired</span>
                      ) : live ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Live</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Scheduled</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {!expired && (
                          <button
                            onClick={() => handleToggle(sale)}
                            className="text-xs text-gray-500 hover:text-gray-900 underline"
                          >
                            {sale.isActive ? 'Pause' : 'Activate'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
