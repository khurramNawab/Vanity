'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useStoreSettings } from '@/lib/settings';

export default function PrivacyPage() {
  const { settings } = useStoreSettings();
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Privacy Policy</li>
          </ol>
        </nav>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Privacy Policy</h1>
        <p className="text-on-surface-variant mb-10">Last updated: January 1, 2024</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: 'lock', title: 'Data Security', desc: 'All personal data is encrypted and stored securely. We never sell your data.' },
            { icon: 'visibility_off', title: 'No Tracking', desc: 'We do not use third-party advertising trackers or sell data to brokers.' },
            { icon: 'manage_accounts', title: 'Your Control', desc: 'You can request, update, or delete your data at any time by contacting us.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-5 text-center">
              <span className="material-symbols-outlined text-secondary text-[32px] mb-3 block">{icon}</span>
              <h3 className="font-semibold text-primary mb-1">{title}</h3>
              <p className="text-on-surface-variant text-xs">{desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {[
            {
              title: '1. Information We Collect',
              content: 'We collect information you provide directly to us: name, email address, phone number, shipping address, and payment details (processed securely via our payment gateway). We also collect browsing data (pages visited, time spent) to improve our services. We do not store full card numbers.',
            },
            {
              title: '2. How We Use Your Information',
              content: 'We use your information to: (a) process and fulfil your orders; (b) send order confirmations, tracking updates, and delivery notifications; (c) respond to customer support queries; (d) send promotional emails if you have opted in (you can unsubscribe at any time); (e) improve our website and services.',
            },
            {
              title: '3. Information Sharing',
              content: 'We do not sell, trade, or rent your personal information to third parties. We share data only with: (a) logistics partners for order fulfilment; (b) payment processors for secure transaction handling; (c) government authorities when legally required. All partners are bound by confidentiality agreements.',
            },
            {
              title: '4. Cookies',
              content: 'We use essential cookies to maintain your session and shopping cart. We may use analytics cookies (e.g. Google Analytics) to understand website usage. You can disable cookies in your browser settings, but this may affect website functionality.',
            },
            {
              title: '5. Data Retention',
              content: 'We retain your personal data for as long as your account is active or as needed to provide services, resolve disputes, and comply with legal obligations. Order records are retained for 7 years as required by Indian accounting laws.',
            },
            {
              title: '6. Your Rights',
              content: 'You have the right to: access the personal data we hold about you; request correction of inaccurate data; request deletion of your account and data; object to processing; withdraw consent for marketing communications. To exercise these rights, email us at privacy@vanity.com.',
            },
            {
              title: '7. Security',
              content: 'We implement industry-standard security measures including SSL/TLS encryption, secure payment processing (PCI-DSS compliant), and restricted internal data access. However, no method of transmission over the internet is 100% secure.',
            },
            {
              title: '8. Contact Us',
              content: `For any privacy-related questions or to exercise your rights, contact: Vanity Privacy Team | ${settings.contact_email} | ${settings.store_address}.`,
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
