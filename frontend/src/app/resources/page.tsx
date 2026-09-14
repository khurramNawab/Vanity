'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

export default function ResourcesPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      <main className="flex-grow w-full max-w-[860px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Store Resources</li>
          </ol>
        </nav>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Store Resources</h1>
        <p className="text-on-surface-variant mb-10">Guides, links, and documents to assist you with your purchases.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Jewellery Care Guide',
              desc: 'Learn how to clean, store, and maintain your 925 sterling silver and stone ornaments to ensure they last for generations.',
              icon: 'clean_hands',
              link: '/style',
            },
            {
              title: 'Silver Purity Certification',
              desc: 'Understand what BIS Hallmarking stands for, and how to verify the authenticity of your silver ornaments.',
              icon: 'verified',
              link: '/purity',
            },
            {
              title: 'Size Charts & Guides',
              desc: 'Detailed measurements and guides to help you find the perfect size for rings, bangles, and necklaces.',
              icon: 'straighten',
              link: '/shop',
            },
            {
              title: 'Seasonal Catalogs',
              desc: 'Download our latest collection catalogs in high-resolution PDF format to browse offline.',
              icon: 'download_for_offline',
              link: '/collections',
            },
          ].map((res) => (
            <div key={res.title} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-6 flex gap-4">
              <span className="material-symbols-outlined text-secondary text-[32px] shrink-0 mt-1">{res.icon}</span>
              <div>
                <h3 className="font-semibold text-primary mb-1 text-base">{res.title}</h3>
                <p className="text-on-surface-variant text-sm mb-4">{res.desc}</p>
                <Link href={res.link} className="text-secondary hover:text-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  LEARN MORE <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
