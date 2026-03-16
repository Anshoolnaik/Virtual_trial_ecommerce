'use client';

import Link from 'next/link';

const STATS = [
  { label: 'Total Products', value: '—', sub: 'Listed in your store', color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Listings', value: '—', sub: 'Currently live',       color: 'bg-green-50 text-green-600' },
  { label: 'Total Orders',   value: '—', sub: 'All time',              color: 'bg-purple-50 text-purple-600' },
  { label: 'Revenue',        value: '—', sub: 'This month',            color: 'bg-brand-50 text-brand-600' },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to your seller dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${s.color}`}>
              <span className="text-xl font-bold">#</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
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
        </div>
      </div>
    </div>
  );
}
