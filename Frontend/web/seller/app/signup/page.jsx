'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sellerAuth } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError]   = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    setServerSuccess('');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await sellerAuth.register(payload);
      localStorage.setItem('seller_token', res.data.data.token);
      localStorage.setItem('seller_user', JSON.stringify(res.data.data.seller));
      setServerSuccess('Account created! Redirecting to dashboard…');
      setTimeout(() => router.push('/dashboard'), 1200);
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
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 80%, #c97f1e 0%, transparent 60%),
                              radial-gradient(circle at 20% 20%, #c97f1e 0%, transparent 40%)`,
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
            Start selling<br />
            <span className="text-brand-400">in minutes.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Set up your store, list products, and let buyers try them on virtually —
            all from one dashboard.
          </p>

          {/* Steps */}
          <div className="space-y-4 pt-4">
            {[
              { step: '01', text: 'Create your seller account' },
              { step: '02', text: 'List your products with photos' },
              { step: '03', text: 'Start receiving orders' },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-4">
                <span className="text-brand-500 text-xs font-bold font-display">{s.step}</span>
                <span className="text-gray-400 text-sm">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-600 text-sm italic">
            "The virtual try-on feature cut our return rate by 40%."
          </p>
          <p className="text-gray-500 text-xs mt-2">— Aditya Kumar, StyleBox</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
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
              Create your store
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Free to join. Start selling in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {serverError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in">
                {serverError}
              </div>
            )}
            {serverSuccess && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm animate-fade-in">
                {serverSuccess}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Riya Sharma"
                className={`input-field ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('fullName', {
                  required: 'Full name is required.',
                  minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                })}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs">{errors.fullName.message}</p>
              )}
            </div>

            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Store Name
              </label>
              <input
                type="text"
                placeholder="FableThread"
                className={`input-field ${errors.storeName ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('storeName', {
                  required: 'Store name is required.',
                  minLength: { value: 2, message: 'Store name must be at least 2 characters.' },
                })}
              />
              {errors.storeName && (
                <p className="text-red-500 text-xs">{errors.storeName.message}</p>
              )}
            </div>

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
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                className={`input-field ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('password', {
                  required: 'Password is required.',
                  minLength: { value: 6, message: 'Password must be at least 6 characters.' },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                className={`input-field ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (val) => val === password || 'Passwords do not match.',
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                {...register('terms', { required: 'You must accept the terms.' })}
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                I agree to Vogue's{' '}
                <Link href="/terms" className="text-gray-900 font-medium underline underline-offset-2">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gray-900 font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs -mt-3">{errors.terms.message}</p>
            )}

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
