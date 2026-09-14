'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

export default function CareerPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12 text-center flex flex-col items-center justify-center">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-12 self-start">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Careers</li>
          </ol>
        </nav>

        <div className="max-w-md mx-auto py-12">
          <span className="material-symbols-outlined text-[64px] text-[#9A7E44] mb-6 block animate-pulse">work_outline</span>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Join Our Team</h1>
          <p className="text-on-surface-variant mb-8">
            At Vanity, we are passionate about reviving heritage craftsmanship with modern elegance. We are always looking for creative, driven individuals to join our design and production studio.
          </p>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-6 mb-8 border-dashed">
            <h3 className="font-semibold text-primary mb-2">No Active Openings</h3>
            <p className="text-on-surface-variant text-sm">
              We don&apos;t have any open positions at the moment, but we are always happy to connect with talented designers and craftspeople.
            </p>
          </div>

          <p className="text-xs text-on-surface-variant mb-8">
            You can send your portfolio and CV to <a href="mailto:careers@thevanityjewels.com" className="text-secondary hover:text-primary underline">careers@thevanityjewels.com</a> and we will reach out when a suitable role opens.
          </p>

          <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-opacity-90 inline-block">
            Continue Shopping
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
