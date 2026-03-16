'use client';

import { useEffect, useState } from 'react';
import { sellerApi } from '@/lib/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  shipped:   'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState(null); // order id being updated
  const [filter, setFilter]     = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const res = await sellerApi.orders.list();
      setOrders(res.data.data || []);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await sellerApi.orders.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  const displayed = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} received
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? `All (${orders.length})` : s}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-7 w-7 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">No orders yet</p>
          <p className="text-gray-500 text-sm">Orders from buyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              updating={updating === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, updating }) {
  const [open, setOpen] = useState(false);
  const addr = order.address_snapshot || {};
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const shortId = order.id.slice(0, 8).toUpperCase();
  const sellerTotal = (order.items || []).reduce(
    (s, i) => s + parseFloat(i.unit_price) * i.quantity, 0
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-semibold text-gray-900 text-sm">#{shortId}</p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div>
            <p className="text-sm font-medium text-gray-700">{order.buyer_name}</p>
            <p className="text-xs text-gray-400">{order.buyer_email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              disabled={updating}
              className={`text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'} ${updating ? 'opacity-50' : ''}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-white text-gray-700 font-normal capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            {updating ? (
              <svg className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Items summary (always visible) */}
      <div className="px-6 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
          {' · '}
          <span className="text-gray-400">COD</span>
        </p>
        <p className="font-bold text-gray-900">
          ₹{sellerTotal.toFixed(2)}
          <span className="text-xs font-normal text-gray-400 ml-1">(your items)</span>
        </p>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-50 px-6 py-4 space-y-4">
          {/* Items table */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {item.product_brand}
                      {item.size  ? ` · ${item.size}`  : ''}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">₹{parseFloat(item.unit_price).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">× {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deliver to</p>
            <p className="text-sm text-gray-700 font-medium">{addr.fullName}</p>
            <p className="text-sm text-gray-500">
              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
            </p>
            <p className="text-sm text-gray-500">
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
            <p className="text-sm text-gray-400">{addr.phone}</p>
          </div>
        </div>
      )}
    </div>
  );
}
