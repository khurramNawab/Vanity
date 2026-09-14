'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ShippingPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <Breadcrumbs items={[{ label: 'Shipping Policy' }]} className="mb-6" />

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Shipping Policy</h1>
        <p className="text-on-surface-variant mb-10">Effective from January 1, 2024</p>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { icon: 'local_shipping', title: 'Free Shipping', desc: 'On all orders above ₹5,000 across India. Orders below are charged ₹199.' },
            { icon: 'verified', title: 'Insured Delivery', desc: 'Every shipment is fully insured against loss and damage during transit.' },
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
            <h3 className="font-semibold text-primary mb-2 text-lg">Processing Time</h3>
            <p className="text-on-surface-variant mb-4">All orders are processed within <strong>1–2 business days</strong> (Monday–Saturday, excluding public holidays). Custom or engraved orders may take 3–5 business days.</p>

            <h3 className="font-semibold text-primary mb-2 text-lg">Delivery Timelines</h3>
            <div className="bg-surface-container-low rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container">
                    <th className="text-left py-2 px-4 font-label-upper text-xs text-on-surface-variant">Zone</th>
                    <th className="text-left py-2 px-4 font-label-upper text-xs text-on-surface-variant">Timeline</th>
                    <th className="text-left py-2 px-4 font-label-upper text-xs text-on-surface-variant">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  <tr>
                    <td className="py-3 px-4">Metro Cities</td>
                    <td className="py-3 px-4">2–3 business days</td>
                    <td className="py-3 px-4 text-[#137333] font-medium">FREE above ₹5,000</td>
                  </tr>
                  <tr className="bg-surface-container-low/30">
                    <td className="py-3 px-4">Tier 2 / Tier 3</td>
                    <td className="py-3 px-4">3–5 business days</td>
                    <td className="py-3 px-4 text-[#137333] font-medium">FREE above ₹5,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Remote Areas</td>
                    <td className="py-3 px-4">5–7 business days</td>
                    <td className="py-3 px-4">₹199 flat</td>
                  </tr>
                  <tr className="bg-surface-container-low/30">
                    <td className="py-3 px-4">International</td>
                    <td className="py-3 px-4">10–15 business days</td>
                    <td className="py-3 px-4">Calculated at checkout</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-primary mb-2 text-lg">Tracking Your Shipment</h3>
            <p className="text-on-surface-variant">Once your order is shipped, you will receive a tracking number via SMS and email. You can track your order at any time from your account dashboard or the courier&apos;s website.</p>
          </section>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
