'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ExchangePage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Exchange Policy' }]} className="mb-6" />

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Exchange Policy</h1>
        <p className="text-on-surface-variant mb-10">Effective from January 1, 2024</p>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: 'swap_horiz', title: '15-Day Window', desc: 'Exchange requests accepted within 15 days of delivery for eligible items.' },
            { icon: 'diamond', title: 'Equal or Higher Value', desc: 'Exchange your ornament for another piece of equal or higher value.' },
            { icon: 'local_shipping', title: 'Free Pickup', desc: 'We arrange free pickup for exchange items from your doorstep.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-5 text-center">
              <span className="material-symbols-outlined text-secondary text-[32px] mb-3 block">{icon}</span>
              <h3 className="font-semibold text-primary mb-1">{title}</h3>
              <p className="text-on-surface-variant text-xs">{desc}</p>
            </div>
          ))}
        </div>

        <div className="prose max-w-none space-y-8">
          <section className="border-b border-outline-variant/20 pb-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Exchange Eligibility</h2>
            <p className="text-on-surface-variant mb-3">You may exchange a purchased item within <strong>15 days of delivery</strong> subject to the following conditions:</p>
            <ul className="list-none space-y-2 mb-4">
              {[
                'Item must be unused, unworn, and in its original condition',
                'Original packaging, authenticity certificate, and invoice must be included',
                'Item must not have been resized, engraved, or customised',
                'Exchange is available for items of equal or higher value only',
                'Any price difference must be paid at the time of exchange',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="border-b border-outline-variant/20 pb-8">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Items Not Eligible for Exchange</h2>
            <ul className="list-none space-y-2">
              {[
                'Customised or personalised jewellery (engraving, special sizing)',
                'Items from the "Final Sale" or clearance category',
                'Gift cards and vouchers',
                'Items showing signs of wear, damage, or tampering',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">cancel</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-headline-md text-headline-md text-primary mb-4">How to Request an Exchange</h2>
            <ol className="space-y-4">
              {[
                { step: '01', title: 'Contact Us', desc: 'Email us at exchange@vanity.com or WhatsApp +91 98765 43210 within 15 days of delivery.' },
                { step: '02', title: 'Provide Details', desc: 'Share your order number, reason for exchange, and photos of the item.' },
                { step: '03', title: 'Select Your New Piece', desc: 'Browse our collection and choose a replacement piece of equal or higher value.' },
                { step: '04', title: 'Ship & Receive', desc: 'We arrange free pickup of the original item and ship your new piece within 3–5 business days.' },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex gap-4">
                  <span className="text-[#9A7E44] font-bold text-xl font-mono shrink-0">{step}</span>
                  <div>
                    <p className="font-semibold text-primary">{title}</p>
                    <p className="text-on-surface-variant text-sm">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
