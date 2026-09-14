'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

export default function AccountPage() {
  const { user, logout, loading, checkUserSession } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, loading, router]);

  // Load profile values on user mount
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone((user as any).phone || '');
      
      // Combine address lines or show primary
      const addr = [
        (user as any).address_line1,
        (user as any).address_line2,
        (user as any).city,
        (user as any).state,
        (user as any).pincode
      ].filter(Boolean).join(', ');

      setProfileAddress(addr || '');
    }
  }, [user]);

  // Fetch real order history list
  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      fetchApi('/user/orders')
        .then(res => {
          if (res.success) {
            setOrders(res.orders || []);
          }
        })
        .catch(err => console.error('Error fetching user orders:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);

    // Split address into address_line1 (first part before comma) and city/state/pincode
    const parts = profileAddress.split(',').map(s => s.trim());
    const address_line1 = parts[0] || '';
    const address_line2 = parts[1] || '';
    const city = parts[2] || '';
    const state = parts[3] || '';
    const pincode = parts[4] || '';

    try {
      const res = await fetchApi('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: profileName,
          email: user?.email,
          phone: profilePhone,
          address_line1,
          address_line2,
          city,
          state,
          pincode
        })
      });

      if (res.success) {
        setIsEditing(false);
        // Refresh auth session context to sync new values
        await checkUserSession();
      } else {
        setProfileError(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Network error.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDownloadInvoice = async (orderId: number, orderNumber: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vanity_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice not found');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download invoice. Please try again.');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />

      <div className="flex flex-1 max-w-[1280px] mx-auto w-full">
        {/* SideNavBar for Desktop */}
        <nav className="hidden lg:flex flex-col py-6 bg-surface-container-lowest border-r border-outline-variant/30 w-64 pt-12 shrink-0">
          <div className="px-6 mb-8">
            <h2 className="font-headline-md text-xl text-primary font-bold">Vanity Jewels</h2>
            <p className="text-on-surface-variant text-xs">Modern Heirlooms</p>
          </div>
          <div className="flex-1 space-y-2 px-2">
            <Link className="flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/shop">
              <span className="material-symbols-outlined mr-3">diamond</span>
              <span className="font-label-upper text-xs uppercase font-semibold">Shop by Type</span>
            </Link>
            <Link className="flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/purity">
              <span className="material-symbols-outlined mr-3">verified</span>
              <span className="font-label-upper text-xs uppercase font-semibold">Purity Grid</span>
            </Link>
            <Link className="flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/style">
              <span className="material-symbols-outlined mr-3">new_releases</span>
              <span className="font-label-upper text-xs uppercase font-semibold">Style Grid</span>
            </Link>
            <Link className="flex items-center px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/mcx-rates">
              <span className="material-symbols-outlined mr-3">trending_up</span>
              <span className="font-label-upper text-xs uppercase font-semibold">MCX Silver Rates</span>
            </Link>
            <Link className="flex items-center px-4 py-3 bg-primary text-white rounded mx-1 transition-transform" href="/account">
              <span className="material-symbols-outlined mr-3">account_circle</span>
              <span className="font-label-upper text-xs uppercase font-semibold">My Account</span>
            </Link>
          </div>
          <div className="mt-auto border-t border-outline-variant/20 pt-4 px-2 pb-4 space-y-2">
            <Link className="flex items-center px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/about">
              <span className="material-symbols-outlined mr-3 text-[20px]">support_agent</span>
              <span className="font-label-upper text-[10px] uppercase font-bold">Contact Us</span>
            </Link>
            <Link className="flex items-center px-4 py-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-all" href="/shipping">
              <span className="material-symbols-outlined mr-3 text-[20px]">local_shipping</span>
              <span className="font-label-upper text-[10px] uppercase font-bold">Shipping Policy</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full px-5 md:px-12 py-10 min-h-screen">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">My Account</h1>
            <p className="text-on-surface-variant text-sm">Manage your details, view orders, and track your heirlooms.</p>
          </div>

          {/* Bento Grid Layout for Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="md:col-span-2 bg-white border border-outline-variant/20 rounded p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container opacity-10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
              
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="relative z-10 space-y-4">
                  <h3 className="font-headline-md text-lg text-primary font-bold border-b border-outline-variant/20 pb-3">Edit Profile Details</h3>
                  
                  {profileError && (
                    <div className="p-3 bg-error-container/20 border border-error/30 text-error text-xs rounded">
                      {profileError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label-upper text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full border border-outline-variant/30 rounded px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label-upper text-on-surface-variant uppercase tracking-wider mb-1">Phone Number</label>
                      <input
                        type="text"
                        className="w-full border border-outline-variant/30 rounded px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary"
                        placeholder="e.g. +91 98765 43210"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-label-upper text-on-surface-variant uppercase tracking-wider mb-1">Primary Address (Format: Street, Area, City, State, Pincode)</label>
                    <textarea
                      rows={2}
                      className="w-full border border-outline-variant/30 rounded px-3 py-2 text-sm bg-surface focus:outline-none focus:border-primary resize-none"
                      placeholder="e.g. Padmini Apartment 44/19 Durgapur Lane, Chetla, Kolkata, West Bengal, 700027"
                      value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-outline-variant/20">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-primary text-white py-2 px-4 rounded text-xs font-semibold hover:bg-inverse-surface transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="border border-outline-variant py-2 px-4 rounded text-xs font-semibold hover:bg-surface-container-low transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-start justify-between relative z-10 mb-6 border-b border-outline-variant/20 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/20 overflow-hidden">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-xl text-primary font-bold">{user.name}</h3>
                        <p className="text-on-surface-variant text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary font-label-upper text-xs uppercase hover:underline border border-primary/30 px-3 py-1.5 rounded hover:bg-surface-container-low transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="text-secondary font-label-upper text-xs uppercase hover:underline border border-secondary/30 px-3 py-1.5 rounded hover:bg-secondary-container transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <p className="font-label-upper text-xs text-on-surface-variant mb-1 uppercase font-semibold">Primary Address</p>
                      <p className="text-sm text-on-surface whitespace-pre-line">
                        {profileAddress || 'No primary address configured yet.'}
                      </p>
                      {profilePhone && (
                        <div className="text-xs text-on-surface-variant mt-2">
                          <span className="font-semibold uppercase text-[10px] tracking-wider block text-on-surface-variant">Phone</span>
                          {profilePhone}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-label-upper text-xs text-on-surface-variant mb-1 uppercase font-semibold">Member Status</p>
                      <p className="text-sm text-on-surface">Active Customer</p>
                      <div className="mt-4 flex items-center gap-2 text-[#9A7E44] bg-[#fedb98]/10 px-3 py-1.5 w-fit rounded border border-[#9A7E44]/20">
                        <span className="material-symbols-outlined text-sm">workspace_premium</span>
                        <span className="font-label-upper text-[10px] font-bold tracking-wider">Silver Tier</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Total Orders Stats */}
            <div className="bg-[#1A1A1A] text-white rounded p-6 flex flex-col justify-between border border-outline-variant/20 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
              <div>
                <h3 className="font-headline-md text-xl mb-2 text-white font-bold">Order History</h3>
                <p className="text-xs text-surface-dim mb-6 opacity-80">Track current orders or review past purchases.</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-4">
                <div>
                  <span className="block text-3xl font-bold mb-1">{orders.length}</span>
                  <span className="font-label-upper text-[10px] uppercase tracking-widest text-surface-dim">Total Orders</span>
                </div>
                <Link href="/shop" className="w-10 h-10 rounded-full bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#fedb98] hover:text-[#1A1A1A] transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Dynamic Recent Orders Card */}
            <div className="md:col-span-3 mt-4">
              <h3 className="font-headline-md text-lg text-primary mb-4 border-b border-outline-variant/20 pb-2">Recent Orders</h3>
              <div className="bg-white border border-outline-variant/20 rounded divide-y divide-outline-variant/20">
                {ordersLoading ? (
                  <div className="p-12 text-center text-on-surface-variant text-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading your orders...
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((ord: any) => (
                    <div key={ord.id} className="flex flex-col sm:flex-row items-center justify-between p-4 hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                        <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant">package_2</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">Order #{ord.order_number}</p>
                          <p className="font-label-upper text-[10px] text-on-surface-variant font-bold tracking-wider">
                            {ord.fulfillment_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'} — <span className="text-[#9A7E44]">{ord.order_status.toUpperCase()}</span>
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="font-semibold text-sm text-on-surface mr-4">₹{Number(ord.total_amount).toLocaleString('en-IN')}</span>
                        <div className="flex items-center gap-4">
                          <Link 
                            href={`/order-confirmation?order_id=${ord.id}`} 
                            className="text-primary hover:underline text-xs font-semibold uppercase tracking-wider"
                          >
                            Track / View
                          </Link>
                          {ord.payment_status === 'paid' && (
                            <button 
                              onClick={() => handleDownloadInvoice(ord.id, ord.order_number)}
                              className="text-secondary hover:underline text-xs font-semibold uppercase tracking-wider flex items-center gap-1 focus:outline-none"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-on-surface-variant text-sm">
                    No orders placed yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <StorefrontFooter />
    </div>
  );
}
