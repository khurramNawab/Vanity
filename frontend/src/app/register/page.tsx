'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomerRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password, confirmPassword);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col justify-center items-center py-12 px-5">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Wordmark */}
        <Link href="/" className="font-display-lg text-display-lg text-primary mb-8 text-center tracking-tight font-bold hover:opacity-80 transition-opacity">
          Vanity
        </Link>

        {/* Register Card */}
        <div className="bg-surface-container-lowest w-full rounded border border-primary/10 shadow-sm p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-secondary/30"></div>
          
          <h2 className="font-headline-md text-headline-md text-primary mb-2 text-center font-medium">
            Create an Account
          </h2>
          <p className="font-body-md text-price-sm text-on-surface-variant text-center mb-6">
            Unlock exclusive updates, faster checkouts, and first-order offers.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-error-container/20 border border-error/20 text-error rounded text-price-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block font-body-md text-body-md text-on-surface-variant mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-body-md text-body-md text-on-surface-variant mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-body-md text-body-md text-on-surface-variant mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block font-body-md text-body-md text-on-surface-variant mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="w-full bg-surface-container-lowest border border-primary/20 rounded px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <button
              className="w-full bg-primary hover:bg-on-surface-variant text-white font-body-md text-body-md py-3 rounded border border-transparent transition-all duration-300 flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register'}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-4 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-price-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="text-brass-accent hover:text-secondary font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
