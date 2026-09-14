'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FestivalCampaignBanner from './FestivalCampaignBanner';

export default function StorefrontNavbar({ activePath = '' }: { activePath?: string }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCurrentCategory(params.get('category'));
    }
  }, [pathname]);

  const getIsActive = (href: string) => {
    if (href.startsWith('/')) {
      try {
        const url = new URL(href, 'http://localhost');
        const hrefPath = url.pathname;
        const hrefCategory = url.searchParams.get('category');
        
        if (pathname === hrefPath) {
          if (hrefCategory) {
            return currentCategory === hrefCategory;
          }
          if (currentCategory && hrefPath === '/shop') {
            return false;
          }
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return activePath === href;
  };

  const isAboutActive = 
    pathname === '/shipping' || 
    pathname === '/returns' || 
    pathname === '/exchange' || 
    pathname === '/contact' || 
    activePath === '/about';

  // Read cart and wishlist count from localStorage and listen for changes
  useEffect(() => {
    const updateCounts = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedCart = localStorage.getItem('vanity_cart');
          const cart = storedCart ? JSON.parse(storedCart) : [];
          const count = cart.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
          setCartCount(count);

          const storedWishlist = localStorage.getItem('vanity_wishlist');
          const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
          setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        } catch (e) {
          console.error(e);
        }
      }
    };

    updateCounts();

    // Listen for storage events (cross-tab) and custom events (same-tab)
    window.addEventListener('storage', updateCounts);
    window.addEventListener('vanity_cart_updated', updateCounts);
    window.addEventListener('vanity_wishlist_updated', updateCounts);

    // Poll every 2 seconds as a fallback
    const interval = setInterval(updateCounts, 2000);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('vanity_cart_updated', updateCounts);
      window.removeEventListener('vanity_wishlist_updated', updateCounts);
      clearInterval(interval);
    };
  }, []);

  // Close about dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Silver', href: '/shop?category=Silver' },
    { label: 'Brass', href: '/shop?category=Brass' },
    { label: 'Stones', href: '/shop?category=Stones' },
    { label: 'CZ Diamonds', href: '/shop?category=CZ Embellished' },
    { label: 'Blog', href: '/blog' },
  ];

  const aboutDropdownLinks = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Exchange', href: '/exchange' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleAboutEnter = () => {
    if (aboutTimeout.current) clearTimeout(aboutTimeout.current);
    setAboutOpen(true);
  };

  const handleAboutLeave = () => {
    aboutTimeout.current = setTimeout(() => setAboutOpen(false), 200);
  };

  const profilePath = user ? (user.role === 'admin' ? '/admin' : '/account') : '/login';

  return (
    <>
      {/* Admin Mode Top Banner */}
      {user?.role === 'admin' && (
        <div className="bg-[#1A1A1A] text-white w-full py-1.5 px-5 text-center text-xs font-semibold flex flex-wrap items-center justify-center gap-2 border-b border-[#9A7E44]/40 z-50 relative">
          <span className="material-symbols-outlined text-[16px] text-[#9A7E44]">admin_panel_settings</span>
          <span>ADMINISTRATOR MODE ACTIVE — Logged in as {user.email}</span>
          <Link href="/admin" className="ml-2 bg-[#9A7E44] text-white px-3 py-0.5 rounded text-[11px] font-bold hover:bg-white hover:text-black transition-colors uppercase tracking-wider">
            Go to Admin Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Urgency Banner */}
      <div className="bg-[#6B1111] text-white w-full py-2 px-5 md:px-12 text-center z-50 relative">
        <p className="font-label-upper text-label-upper tracking-[0.1em] text-xs">
          FREE EXPRESS SHIPPING ON ALL ORDERS OVER ₹5,000 | USE CODE: VANITY10
        </p>
      </div>

      {/* Festival Campaign Offer Banner (All Storefront Pages) */}
      <FestivalCampaignBanner />

      {/* Top Nav */}
      <nav className="bg-surface top-0 z-40 sticky border-b border-outline-variant transition-all duration-300">
        <div className="flex w-full max-w-[1280px] mx-auto px-5 md:px-12 items-center justify-between py-3">
          {/* Left — Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Vanity"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </Link>

          {/* Center — Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(link => {
              const active = getIsActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-body-md text-body-md transition-all duration-200 pb-1 ${
                    active
                      ? 'text-secondary border-b-2 border-secondary font-semibold'
                      : 'text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-outline-variant/30'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* About with dropdown */}
            <div
              ref={aboutRef}
              className="relative"
              onMouseEnter={handleAboutEnter}
              onMouseLeave={handleAboutLeave}
            >
              <button
                className={`font-body-md text-body-md transition-all duration-200 pb-1 flex items-center gap-1 ${
                  isAboutActive
                    ? 'text-secondary border-b-2 border-secondary font-semibold'
                    : 'text-on-surface-variant hover:text-primary hover:border-b-2 hover:border-outline-variant/30'
                }`}
                onClick={() => setAboutOpen(!aboutOpen)}
              >
                About
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown Panel */}
              <div
                className={`absolute top-full right-0 mt-2 w-48 bg-white border border-outline-variant/30 shadow-lg rounded-lg overflow-hidden transition-all duration-200 origin-top ${
                  aboutOpen
                    ? 'opacity-100 scale-y-100 translate-y-0'
                    : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {aboutDropdownLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-5 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors"
                    onClick={() => setAboutOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Action Icons */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            {user?.role === 'admin' && (
              <Link href="/admin" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold bg-[#1A1A1A] text-[#9A7E44] px-2.5 py-1 rounded border border-[#9A7E44]/40 hover:bg-[#9A7E44] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                ADMIN PORTAL
              </Link>
            )}

            <Link href="/search" className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none hidden md:block">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </Link>
            <Link href={profilePath} className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none hidden md:block" title={user?.role === 'admin' ? 'Admin Dashboard' : 'Account'}>
              <span className="material-symbols-outlined text-[24px]">person</span>
            </Link>
            {/* Wishlist */}
            <Link href="/wishlist" className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none relative" title="Wishlist">
              <span className="material-symbols-outlined text-[24px]">favorite_border</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none relative" title="Cart">
              <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-semibold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 pb-4 space-y-1 border-t border-outline-variant/20">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2.5 text-on-surface-variant hover:text-primary transition-colors font-body-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile About with sub-links */}
            <div className="border-t border-outline-variant/10 pt-2">
              <button
                className="w-full flex items-center justify-between py-2.5 text-on-surface-variant hover:text-primary transition-colors font-body-md"
                onClick={() => setAboutOpen(!aboutOpen)}
              >
                About
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${aboutOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                {aboutDropdownLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 pl-4 text-sm text-on-surface-variant hover:text-primary transition-colors"
                    onClick={() => { setMobileMenuOpen(false); setAboutOpen(false); }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile-only links */}
            <div className="border-t border-outline-variant/10 pt-2 flex items-center gap-4">
              <Link href="/search" className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-[22px]">search</span>
              </Link>
              <Link href={user ? '/account' : '/login'} className="text-on-surface-variant hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-[22px]">person</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
