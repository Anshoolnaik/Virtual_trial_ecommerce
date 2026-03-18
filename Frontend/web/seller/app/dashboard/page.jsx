'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sellerApi } from '@/lib/api';

function StatCard({ label, value, sub, color, icon, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${color}`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

const ICONS = {
  products: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
    </svg>
  ),
  active: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  revenue: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function formatRevenue(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    totalOrders: 0,
    revenueThisMonth: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          sellerApi.products.list(),
          sellerApi.orders.list(),
        ]);

        const products = productsRes.data?.data?.products ?? [];
        const orders = ordersRes.data?.data ?? [];

        const now = new Date();
        const revenueThisMonth = orders
          .filter((o) => {
            const d = new Date(o.created_at);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
          })
          .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        setStats({
          totalProducts: products.length,
          activeListings: products.filter((p) => p.isActive).length,
          totalOrders: orders.length,
          revenueThisMonth,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const STAT_CARDS = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      sub: 'Listed in your store',
      color: 'bg-blue-50 text-blue-600',
      icon: ICONS.products,
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      sub: 'Currently live',
      color: 'bg-green-50 text-green-600',
      icon: ICONS.active,
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      sub: 'All time',
      color: 'bg-purple-50 text-purple-600',
      icon: ICONS.orders,
    },
    {
      label: 'Revenue',
      value: formatRevenue(stats.revenueThisMonth),
      sub: 'This month',
      color: 'bg-amber-50 text-amber-600',
      icon: ICONS.revenue,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to your seller dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {STAT_CARDS.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/products/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            View All Products
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
