'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

export default function LoginPage() {
  const { login, sendRegistrationOtp, verifyRegistrationOtp, resendRegistrationOtp, user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // Register Form States
  const [regStep, setRegStep] = useState<'form' | 'otp'>('form');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  
  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);
  
  // General UI States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  // Resend Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (regStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [regStep, resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await sendRegistrationOtp(regName, regEmail, regPassword);
      setRegStep('otp');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(res.message || `Verification code sent to ${regEmail}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check details or email duplicates.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    // Handle paste event or single digit
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const user = await verifyRegistrationOtp(regEmail, fullOtp);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setError(null);
    setSuccessMsg(null);
    setResending(true);
    try {
      const res = await resendRegistrationOtp(regEmail);
      setResendTimer(60);
      setSuccessMsg(res.message || 'New verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
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
            <p className="text-on-surface-variant text-sm">
              {tab === 'login' ? 'Welcome back. Sign in to your account.' : 'Create an account to explore handcrafted modern heirlooms.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-outline-variant/30 mb-8">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError(null);
                  setSuccessMsg(null);
                  setRegStep('form');
                }}
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
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-sm">{successMsg}</div>
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
                <button
                  onClick={() => {
                    setTab('register');
                    setError(null);
                    setSuccessMsg(null);
                    setRegStep('form');
                  }}
                  className="text-secondary hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* Register Flow */}
          {tab === 'register' && (
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 shadow-sm">
              {error && (
                <div className="mb-4 p-3 bg-error-container/20 border border-error/20 text-error rounded text-sm">{error}</div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-sm">{successMsg}</div>
              )}

              {/* Step 1: User Details Form */}
              {regStep === 'form' && (
                <form className="space-y-4" onSubmit={handleSendOtp}>
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
                    <div className="relative">
                      <input
                        type={showRegPass ? 'text' : 'password'}
                        className="w-full border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-surface-container-lowest pr-10"
                        placeholder="Min. 8 characters"
                        minLength={8}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        disabled={submitting}
                      />
                      <button type="button" onClick={() => setShowRegPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none">
                        <span className="material-symbols-outlined text-[20px]">{showRegPass ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                  >
                    {submitting ? 'Sending Verification Code...' : 'Create Account'}
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification Screen */}
              {regStep === 'otp' && (
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary mx-auto flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                    </div>
                    <h3 className="font-headline-sm text-base font-semibold text-primary mb-1">Verify Your Email</h3>
                    <p className="text-xs text-on-surface-variant">
                      We sent a 6-digit verification code to <span className="font-semibold text-primary">{regEmail}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setRegStep('form');
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-secondary hover:underline mt-1 inline-block"
                    >
                      Change email address
                    </button>
                  </div>

                  {/* 6 Digit OTP Input Boxes */}
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        className="w-11 h-13 text-center text-xl font-bold border border-outline-variant/40 rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest transition-all"
                        disabled={submitting}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || otpDigits.join('').trim().length !== 6}
                    className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                  >
                    {submitting ? 'Verifying...' : 'Verify & Complete Registration'}
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </button>

                  {/* Resend OTP Section */}
                  <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <span>Didn&apos;t receive the code?</span>
                    {resendTimer > 0 ? (
                      <span className="text-on-surface-variant font-medium">
                        Resend in <span className="text-primary font-bold">{resendTimer}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        className="text-secondary hover:underline font-semibold disabled:opacity-50"
                      >
                        {resending ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </form>
              )}

              <p className="text-center text-xs text-on-surface-variant mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setTab('login');
                    setError(null);
                    setSuccessMsg(null);
                    setRegStep('form');
                  }}
                  className="text-secondary hover:underline font-medium"
                >
                  Sign in
                </button>
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
