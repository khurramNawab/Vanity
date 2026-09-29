'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (pathname === '/admin/login') {
        setChecking(false);
      } else if (!token || !user || user.role !== 'admin') {
        router.push('/admin/login');
      } else {
        setChecking(false);
      }
    }
  }, [user, token, loading, pathname, router]);

  useEffect(() => {
    // Prevent mouse wheel from incrementing/decrementing number inputs accidentally
    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement && (document.activeElement as HTMLInputElement).type === 'number') {
        (document.activeElement as HTMLElement).blur();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-body-md">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { name: 'Categories', path: '/admin/categories', icon: 'category' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping_cart' },
    { name: 'Customers', path: '/admin/customers', icon: 'group' },
    { name: 'Coupons', path: '/admin/coupons', icon: 'local_offer' },
    { name: 'Hero Slides', path: '/admin/hero-slides', icon: 'view_carousel' },
    { name: 'Silver Rate', path: '/admin/silver-rate', icon: 'trending_up' },
    { name: 'Campaigns', path: '/admin/campaigns', icon: 'campaign' },
    { name: 'Appointments', path: '/admin/appointments', icon: 'calendar_month' },
    { name: 'Abandoned Carts', path: '/admin/abandoned-carts', icon: 'shopping_cart_checkout' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex">

      {/* Sidebar */}
      <nav className="bg-surface-container-highest h-screen max-h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/30 hidden lg:flex flex-col z-40 overflow-y-auto overflow-x-hidden shadow-sm select-none">
        {/* Brand */}
        <div className="p-6 shrink-0 border-b border-outline-variant/15">
          <Link href="/admin">
            <h1 className="font-headline-md text-headline-md text-primary tracking-tight font-bold">Vanity</h1>
          </Link>
          <p className="font-body-md text-xs text-on-surface-variant uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        {/* Nav items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined mr-3 text-[22px]"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}
                >
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom links */}
        <div className="p-4 border-t border-outline-variant/20 shrink-0 bg-surface-container-highest/80 space-y-1">
          <Link className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${pathname === '/admin/support' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`} href="/admin/support">
            <span className="material-symbols-outlined mr-3 text-lg" style={{ fontVariationSettings: `'FILL' 0` }}>support_agent</span>
            Support
          </Link>
          <Link className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${pathname === '/admin/shipping' ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'}`} href="/admin/shipping">
            <span className="material-symbols-outlined mr-3 text-lg" style={{ fontVariationSettings: `'FILL' 0` }}>local_shipping</span>
            Shipping Policy
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-error hover:bg-error-container/20 rounded-lg transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined mr-3 text-lg">logout</span>
            Log Out
          </button>
        </div>
      </nav>

      {/* Main area */}
      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}
