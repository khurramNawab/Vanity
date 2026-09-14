'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

const COLLECTIONS = [
  {
    name: 'The Diwali Heirloom Edit',
    tagline: 'Festive brilliance in every piece',
    tag: 'Limited Edition',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxd_hdCHH6l2mh71CyiAZ_GiggT2T1pN9HdidKpoIx7MFCG6eVN8zmpjSQfCLxCBneCTOACRtgnbDjcSpKT_zNY3LoK3QzsfelR7x6DQfHbe3lX9PUI5wIpJBypGFW9-QBI1mS8o2d1Qs0078zruSD1wFz8EwtEOPDJi6Py_I7A-MVNroN4iA6abpEx2ixM-t2UdXskd3alAudPJplDhU1GmnY6mpbYvihbfCQC7m0uMsd7UZ_qBA',
  },
  {
    name: 'The Bridal Silver Edit',
    tagline: 'Complete bridal sets for the modern bride',
    tag: 'Bridal',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlgrPRtnYZJONF_jKQ0hcpagW9vTuGgcDgP5jLRgKhS2VFCUvxrOVuEAjgxHWaCdFHtJQx982jQzgMhkB7atZUcvIYdUVdE3ymJumEFZvKL-DDQExYH4xjVmsNZQifIdaHze5gBPCCQeNKJcl5dOozH70TqtGiB4QKJtZHVTtmoOTd7n4vwxkaW8jl-rsaGUHN7eMgWveKN-NjOXOj5ZZtU2PTzz6c8ix-RBoSZPfnH5Dnr_q-sdA',
  },
  {
    name: 'Everyday Essentials',
    tagline: 'Understated elegance for daily wear',
    tag: 'Everyday',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVcJko0RBPwMyU8OjF80xvyBYseQiPtxy7cKC2slIDHfmvg_ZQAeAemOkCSRUyapT1xDOn2XcdZSHLahw1TzcstCuT2IiiGC-rEPubh-lBqkRFlPDvVktCMIYGMDFXINQFlrEMNYSh-iMZky1BBa0el4TYVXCUeGOxKZYw9_kvWtGCz3aAbB7RD-ES37YfH0Y6c9nzsD0tyPonfwLdJ4b_r9CjHo6vlh27F6_1rEjVLwZ4t9XsT24',
  },
  {
    name: 'The Stone Setting Edit',
    tagline: 'Semi-precious stones in artisan settings',
    tag: 'Stones',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7FxrFSr5IO_lssCtMokJe6UV4hmuiP5tuBU64H4FTjv4fVA6Nx7Vc45gql4SsS6ljucKqf-uYE2SLxYMMTjthQSWZmv0Kp4-TSiGe5Maq8KjwmtptLOiDPE0ohkz5a7yyVnishttoWsGsM_SUfe8AypqMLHMZpO2yeoXyG32pVqFKVXi6jsQWaeFwVISE2mVv-Y5Kyz3jlLQNIOCbyA-fRo42Oy80yKH38hIPUmG03G0iRUY9O0k',
  },
];

export default function CollectionsPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/collections" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Collections</li>
          </ol>
        </nav>

        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-3">Our Collections</h1>
          <p className="text-on-surface-variant max-w-2xl">Curated edits of premium silver jewellery, crafted around occasions, moods, and styles. Each collection tells a story.</p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {COLLECTIONS.map((col) => (
            <Link key={col.name} href="/shop" className="group relative overflow-hidden aspect-[4/3] bg-surface-container-low border border-outline-variant/20 block">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${col.img}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="bg-secondary text-white text-[10px] font-label-upper uppercase tracking-wider px-2 py-1 mb-3 inline-block">{col.tag}</span>
                <h2 className="font-headline-md text-headline-md text-white mb-1">{col.name}</h2>
                <p className="text-white/80 text-sm">{col.tagline}</p>
                <div className="flex items-center gap-1 mt-3 text-white font-label-upper text-xs group-hover:gap-2 transition-all">
                  Shop Collection <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* MCX Banner */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-label-upper text-label-upper text-on-surface-variant text-xs mb-2">MCX SILVER RATE TODAY</p>
            <div className="font-price-display text-price-display text-primary flex items-baseline gap-2">
              ₹84,500 <span className="text-sm text-on-surface-variant font-normal">/kg</span>
            </div>
          </div>
          <Link href="/mcx-rates" className="border border-primary text-primary hover:bg-primary hover:text-white font-label-upper text-label-upper px-6 py-2 transition-colors text-xs">
            View Full Rate History
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
