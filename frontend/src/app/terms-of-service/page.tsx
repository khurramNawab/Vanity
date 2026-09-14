'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useStoreSettings } from '@/lib/settings';

export default function TermsPage() {
  const { settings } = useStoreSettings();
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Terms of Service</li>
          </ol>
        </nav>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Terms of Service</h1>
        <p className="text-on-surface-variant mb-10">Last updated: January 1, 2024</p>

        <div className="space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              content: 'By accessing and using the Vanity website (vanity.com) and its services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services. We reserve the right to modify these terms at any time.',
            },
            {
              title: '2. Products and Pricing',
              content: 'All jewellery products listed on Vanity are subject to availability. Prices are dynamic and calculated based on live MCX silver rates at the time of purchase. Prices may vary and are inclusive of GST unless stated otherwise. We reserve the right to correct any pricing errors and will notify you before processing such orders.',
            },
            {
              title: '3. Orders and Payment',
              content: 'Placing an order on our website constitutes an offer to purchase the product at the listed price. We accept payment via major credit/debit cards, UPI, net banking, and select EMI options. All transactions are secured via SSL encryption. Order confirmation does not guarantee product availability; we will notify you of any cancellations.',
            },
            {
              title: '4. BIS Hallmarking and Authenticity',
              content: 'All Vanity silver products are BIS hallmarked as per Bureau of Indian Standards guidelines. An authenticity certificate is included with every purchase. Vanity does not guarantee BIS compliance for products purchased from unauthorised resellers.',
            },
            {
              title: '5. Intellectual Property',
              content: 'All content on this website — including product images, descriptions, logos, and design elements — is the property of Vanity and protected under Indian copyright law. You may not reproduce, distribute, or use any content without prior written consent from Vanity.',
            },
            {
              title: '6. Limitation of Liability',
              content: 'Vanity shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our liability is limited to the purchase price of the product in question. This limitation does not apply to our obligations under consumer protection laws.',
            },
            {
              title: '7. Governing Law',
              content: 'These Terms are governed by the laws of India. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Kolkata, West Bengal.',
            },
            {
              title: '8. Contact',
              content: `For questions regarding these Terms, please contact us at ${settings.contact_email} or write to: Vanity, ${settings.store_address}, West Bengal, India.`,
            },
          ].map(({ title, content }) => (
            <section key={title} className="border-b border-outline-variant/20 pb-8 last:border-0">
              <h2 className="font-headline-md text-headline-md text-primary mb-3">{title}</h2>
              <p className="text-on-surface-variant leading-relaxed">{content}</p>
            </section>
          ))}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
