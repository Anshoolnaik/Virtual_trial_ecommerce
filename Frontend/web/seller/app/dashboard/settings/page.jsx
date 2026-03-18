'use client';

import { useEffect, useState } from 'react';
import { sellerAuth, sellerSettings } from '@/lib/api';

const TABS = ['Store Profile', 'Security', 'Notifications', 'Payout', 'Policies'];

function Section({ title, description, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors';

const textareaCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none';

function SaveButton({ loading, label = 'Save changes' }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors"
    >
      {loading ? 'Saving…' : label}
    </button>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
      }`}
    >
      {message}
    </div>
  );
}

// ── Store Profile Tab ─────────────────────────────────────────────────────────
function ProfileTab({ seller, onUpdate, showToast }) {
  const [form, setForm] = useState({
    fullName: '',
    storeName: '',
    email: '',
    phone: '',
    storeDescription: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seller) {
      setForm({
        fullName:         seller.full_name         || '',
        storeName:        seller.store_name         || '',
        email:            seller.email              || '',
        phone:            seller.phone              || '',
        storeDescription: seller.store_description  || '',
      });
    }
  }, [seller]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sellerSettings.updateProfile(form);
      const updated = res.data?.data?.seller;
      onUpdate(updated);
      showToast('Profile saved successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Section title="Store Profile" description="Basic info about you and your store.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name">
            <input className={inputCls} name="fullName" value={form.fullName} onChange={handle} placeholder="Your name" />
          </Field>
          <Field label="Store Name">
            <input className={inputCls} name="storeName" value={form.storeName} onChange={handle} placeholder="Store display name" />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" name="email" value={form.email} onChange={handle} placeholder="you@example.com" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
          </Field>
        </div>
        <Field label="Store Description">
          <textarea
            className={textareaCls}
            rows={3}
            name="storeDescription"
            value={form.storeDescription}
            onChange={handle}
            placeholder="Tell buyers a bit about your store…"
          />
        </Field>
        <SaveButton loading={loading} />
      </Section>
    </form>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab({ showToast }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return showToast('New passwords do not match.', 'error');
    }
    setLoading(true);
    try {
      await sellerSettings.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Section title="Change Password" description="Use a strong password you don't use elsewhere.">
        <Field label="Current Password">
          <input
            className={inputCls}
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handle}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>
        <Field label="New Password">
          <input
            className={inputCls}
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handle}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm New Password">
          <input
            className={inputCls}
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handle}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        <SaveButton loading={loading} label="Change Password" />
      </Section>
    </form>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-gray-900' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function NotificationsTab({ seller, onUpdate, showToast }) {
  const [prefs, setPrefs] = useState({
    notifOrders:      true,
    notifLowStock:    true,
    notifFlashSales:  true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seller) {
      setPrefs({
        notifOrders:     seller.notif_orders     ?? true,
        notifLowStock:   seller.notif_low_stock   ?? true,
        notifFlashSales: seller.notif_flash_sales ?? true,
      });
    }
  }, [seller]);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sellerSettings.updateNotifications(prefs);
      onUpdate(res.data?.data?.seller);
      showToast('Notification preferences saved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save preferences.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: 'notifOrders',     label: 'New orders',         desc: 'Get notified when a buyer places an order.' },
    { key: 'notifLowStock',   label: 'Low stock alerts',   desc: 'Alert when a product stock falls below 5.' },
    { key: 'notifFlashSales', label: 'Flash sale events',  desc: 'Notify when a flash sale starts or ends.' },
  ];

  return (
    <form onSubmit={submit}>
      <Section title="Notification Preferences" description="Choose what updates you want to receive.">
        <div className="divide-y divide-gray-100">
          {items.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
        <SaveButton loading={loading} />
      </Section>
    </form>
  );
}

// ── Payout Tab ────────────────────────────────────────────────────────────────
function PayoutTab({ seller, onUpdate, showToast }) {
  const [form, setForm] = useState({ bankAccount: '', upiId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seller) {
      setForm({
        bankAccount: seller.bank_account || '',
        upiId:       seller.upi_id       || '',
      });
    }
  }, [seller]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sellerSettings.updatePayout(form);
      onUpdate(res.data?.data?.seller);
      showToast('Payout info saved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save payout info.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Section title="Payout Information" description="Where you want to receive your earnings.">
        <Field label="Bank Account Number">
          <input
            className={inputCls}
            name="bankAccount"
            value={form.bankAccount}
            onChange={handle}
            placeholder="e.g. 9876543210001234"
          />
        </Field>
        <Field label="UPI ID">
          <input
            className={inputCls}
            name="upiId"
            value={form.upiId}
            onChange={handle}
            placeholder="yourname@upi"
          />
        </Field>
        <p className="text-xs text-gray-400 mt-1">
          Provide at least one payout method. Payouts are processed weekly.
        </p>
        <SaveButton loading={loading} />
      </Section>
    </form>
  );
}

// ── Policies Tab ──────────────────────────────────────────────────────────────
function PoliciesTab({ seller, onUpdate, showToast }) {
  const [form, setForm] = useState({ returnPolicy: '', shippingInfo: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seller) {
      setForm({
        returnPolicy: seller.return_policy || '',
        shippingInfo: seller.shipping_info || '',
      });
    }
  }, [seller]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sellerSettings.updatePolicies(form);
      onUpdate(res.data?.data?.seller);
      showToast('Store policies saved.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save policies.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <Section title="Return & Refund Policy" description="Displayed on your product pages.">
        <Field label="Return Policy">
          <textarea
            className={textareaCls}
            rows={4}
            name="returnPolicy"
            value={form.returnPolicy}
            onChange={handle}
            placeholder="e.g. We accept returns within 7 days of delivery. Item must be unused and in original packaging."
          />
        </Field>
      </Section>
      <Section title="Shipping Information" description="Shown to buyers before they check out.">
        <Field label="Shipping Info">
          <textarea
            className={textareaCls}
            rows={4}
            name="shippingInfo"
            value={form.shippingInfo}
            onChange={handle}
            placeholder="e.g. Free shipping on orders above ₹499. Delivered within 5–7 business days."
          />
        </Field>
        <SaveButton loading={loading} />
      </Section>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [seller, setSeller] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    sellerAuth.me()
      .then((res) => setSeller(res.data?.data?.seller))
      .catch(() => {});
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleUpdate = (updated) => {
    if (!updated) return;
    setSeller(updated);
    // Sync name/store into localStorage so sidebar shows fresh data
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('seller_user') || '{}');
      localStorage.setItem(
        'seller_user',
        JSON.stringify({
          ...stored,
          full_name:  updated.full_name,
          store_name: updated.store_name,
          email:      updated.email,
        })
      );
    }
  };

  const tabContent = [
    <ProfileTab       key="profile"       seller={seller} onUpdate={handleUpdate} showToast={showToast} />,
    <SecurityTab      key="security"                                               showToast={showToast} />,
    <NotificationsTab key="notifications" seller={seller} onUpdate={handleUpdate} showToast={showToast} />,
    <PayoutTab        key="payout"        seller={seller} onUpdate={handleUpdate} showToast={showToast} />,
    <PoliciesTab      key="policies"      seller={seller} onUpdate={handleUpdate} showToast={showToast} />,
  ];

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store, account, and preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-7 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === i
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabContent[activeTab]}

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
