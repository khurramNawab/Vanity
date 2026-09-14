'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

export default function LoginPage() {
  const { login, register, user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        await logout();
        setError('Access denied. Administrators must log in via the admin portal.');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register(regName, regEmail, regPassword, regPassword);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check details or email duplicates.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="font-headline-md text-headline-md text-primary font-bold text-[28px] block mb-2">Vanity</Link>
            <p className="text-on-surface-variant text-sm">Welcome back. Sign in to your account.</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/30 mb-8">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={`flex-1 pb-3 text-sm font-label-upper font-semibold transition-all ${
                  tab === t
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
              {error && (
                <div className="mb-4 p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1" htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm text-on-surface-variant" htmlFor="login-password">Password</label>
                    <a href="#" className="text-xs text-secondary hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none">
                      <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                >
                  {submitting ? 'Signing In...' : 'Sign In'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
              <p className="text-center text-xs text-on-surface-variant mt-6">
                Don&apos;t have an account?{' '}
                <button onClick={() => setTab('register')} className="text-secondary hover:underline font-medium">Create one</button>
              </p>
            </div>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest"
                    placeholder="Aanya Sharma"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest"
                    placeholder="Min. 8 characters"
                    minLength={8}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                {error && (
                  <div className="p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
              <p className="text-center text-xs text-on-surface-variant mt-6">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-secondary hover:underline font-medium">Sign in</button>
              </p>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: 'local_shipping', label: 'Free shipping on ₹5k+' },
              { icon: 'history', label: 'Track all orders' },
              { icon: 'favorite', label: 'Save wishlists' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">{icon}</span>
                <span className="text-xs text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
