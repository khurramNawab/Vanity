'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      
      if (user.role !== 'admin') {
        // Log out immediately if not an admin to clear credentials
        await logout();
        setError('Access denied. This portal is for administrators only.');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center items-center py-12 px-5">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Wordmark */}
        <h1 className="font-display-lg text-display-lg text-primary mb-8 text-center tracking-tight font-bold">
          Vanity
        </h1>

        {/* Login Card */}
        <div className="bg-surface-container-lowest w-full rounded border border-primary/10 shadow-sm p-6 md:p-8 relative overflow-hidden">
          {/* Subtle top border accent */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-secondary/30"></div>
          
          <h2 className="font-headline-md text-headline-md text-primary mb-6 text-center">
            Admin Portal Access
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error/20 text-error rounded text-price-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block font-body-md text-body-md text-on-surface-variant mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                id="email"
                type="email"
                placeholder="admin@vanity.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-body-md text-body-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <a className="font-body-md text-price-sm text-brass-accent hover:text-secondary transition-colors" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                />
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Submit */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="w-4 h-4 border border-primary/20 rounded bg-surface-container-lowest peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                </div>
                <span className="ml-2 font-body-md text-price-sm text-on-surface-variant group-hover:text-primary transition-colors">
                  Remember me
                </span>
              </label>
            </div>

            <button
              className="w-full bg-primary hover:bg-on-surface-variant text-white font-body-md text-body-md py-3 rounded border border-transparent transition-all duration-300 flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Logging In...' : 'Log In'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Contextual Note */}
          <div className="mt-8 pt-4 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-price-sm text-on-surface-variant">
              Authorized personnel only. <br /> Subject to security compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
