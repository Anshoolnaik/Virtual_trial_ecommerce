'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sellerAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await sellerAuth.login(data);
      localStorage.setItem('seller_token', res.data.data.token);
      localStorage.setItem('seller_user', JSON.stringify(res.data.data.seller));
      router.push('/dashboard');
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #c97f1e 0%, transparent 60%),
                              radial-gradient(circle at 80% 20%, #c97f1e 0%, transparent 40%)`,
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-white font-display text-xl font-semibold tracking-wide">
              Vogue
            </span>
          </div>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-5xl font-semibold text-white leading-tight">
            Sell fashion.<br />
            <span className="text-brand-400">Reach millions.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Join thousands of fashion sellers growing their brand on Vogue's
            virtual try-on platform.
          </p>

          {/* Stats */}
          <div className="flex gap-10 pt-4">
            {[
              { label: 'Active Sellers', value: '12K+' },
              { label: 'Orders Daily',   value: '50K+' },
              { label: 'Avg. Growth',    value: '3.4×' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-brand-400 text-2xl font-bold">{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-gray-600 text-sm italic">
            "Our sales doubled in 3 months after joining Vogue."
          </p>
          <p className="text-gray-500 text-xs mt-2">— Riya Sharma, FableThread</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="font-display text-xl font-semibold">Vogue</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to your seller account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* Server error */}
            {serverError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in">
                {serverError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@yourstore.com"
                className={`input-field ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`input-field ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('password', { required: 'Password is required.' })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            New to Vogue Seller?{' '}
            <Link href="/signup" className="text-gray-900 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
