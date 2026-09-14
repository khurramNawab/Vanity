'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ReturnsPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Returns Policy' }]} className="mb-6" />

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Returns Policy</h1>
        <p className="text-on-surface-variant mb-10">Effective from January 1, 2024</p>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { icon: 'calendar_today', title: '15-Day Returns', desc: 'Hassle-free returns within 15 days of delivery for unused, original-condition items.' },
            { icon: 'currency_rupee', title: 'Full Refund', desc: 'Refund processed to your original payment method within 5–7 business days.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-5 text-center">
              <span className="material-symbols-outlined text-secondary text-[32px] mb-3 block">{icon}</span>
              <h3 className="font-semibold text-primary mb-1">{title}</h3>
              <p className="text-on-surface-variant text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="prose max-w-none space-y-8">
          <section className="border-b border-outline-variant/20 pb-8">
            <h3 className="font-semibold text-primary mb-2 text-lg">Return Eligibility</h3>
            <p className="text-on-surface-variant mb-3">We accept returns within <strong>15 days of delivery</strong> provided:</p>
            <ul className="list-none space-y-2 mb-6">
              {[
                'Item is unused and in its original condition',
                'Original packaging and authenticity certificate are included',
                'Product has not been resized, engraved, or customised',
                'Item is not from our "Final Sale" or "Made to Order" category',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-primary mb-2 text-lg">Non-Returnable Items</h3>
            <ul className="list-none space-y-2 mb-6">
              {[
                'Customised or engraved jewellery',
                'Items damaged due to misuse or improper care',
                'Gift cards and vouchers',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5">cancel</span>
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-primary mb-2 text-lg">Refund Process</h3>
            <p className="text-on-surface-variant">Once your returned item is received and inspected by our warehouse, your refund will be processed within <strong>5–7 business days</strong> back to your original payment method. You will be notified via email at every step of the refund process.</p>
          </section>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
