'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useStoreSettings } from '@/lib/settings';

export default function AboutPage() {
  const { settings } = useStoreSettings();
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/about" />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative w-full h-[420px] md:h-[520px] overflow-hidden border-b border-outline-variant/30 bg-[#1a1a1a]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSmmoM7xBQHRSQEuKF3-JakT5oYaeo2D94tz1eq9IBy47xxhRT6-5DuaRvIhS-9eo5Ix252z9EaDM71kNJjiXoZLeJJDA_1BuPFVnv3tbTdes3rjSlFnRRxHyXf3bOP32f9wlQ8gI3yJCEzqTeXvTSkqkjLX1alZUPRRgkkdssT0C-kLk4urdUKTTGrBDQr2DSnX5zjWIzWoUwa_m9Dfl1yDKSAmIIyXmCKxhTm2DThdxfc_U1u4k')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="relative z-10 h-full flex flex-col justify-center px-5 md:px-12 max-w-[1280px] mx-auto w-full">
            <span className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-[#9A7E44]" />
              <span className="font-label-upper text-label-upper text-[#9A7E44] text-xs uppercase tracking-[0.2em]">Our Story</span>
            </span>
            <h1 className="font-headline-lg text-[36px] md:text-[52px] leading-tight text-white max-w-2xl mb-4 font-bold">
              Crafting Modern<br />Heirlooms Since 2010
            </h1>
            <p className="text-white/75 max-w-lg text-base leading-relaxed">Vanity brings the finest BIS hallmarked silver jewellery to Kolkata and beyond — where tradition meets contemporary design.</p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 border border-[#9A7E44] px-3 py-2">
                <span className="material-symbols-outlined text-[#9A7E44] text-[18px]">verified</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A7E44]">BIS Hallmarked</span>
              </div>
              <span className="text-white/50 text-sm">Est. 2010 · Kolkata</span>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-b border-outline-variant/30">
          <div>
            <span className="font-label-upper text-label-upper text-secondary text-xs mb-3 block">Our Mission</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Transparent Pricing. Authentic Silver.</h2>
            <p className="text-on-surface-variant mb-4">We believe jewellery should be priced fairly. That's why every Vanity piece is priced using live MCX silver rates — no hidden markups, no guesswork.</p>
            <p className="text-on-surface-variant mb-6">Every piece is BIS hallmarked and comes with an authenticity certificate. Because trust is the most precious metal of all.</p>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: 'verified', label: 'BIS Hallmarked', sub: 'Every piece certified' },
                { icon: 'trending_up', label: 'MCX Pricing', sub: 'Live market rates' },
                { icon: 'local_shipping', label: 'Pan India', sub: 'Free shipping ₹5k+' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[28px]">{icon}</span>
                  <div>
                    <p className="font-semibold text-primary text-sm">{label}</p>
                    <p className="text-xs text-on-surface-variant">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full h-[400px] bg-surface-container-low border border-outline-variant/20 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD1B0Lhgn6RU-kue3QKLo2CqoHppZhqoJiRBu82f8RyZFQpUceqBs0WLqz3UQORLQiSdHdTs-ju-1I1iAF7U9xJ2bjthQTjaUjEqzW9D9ka47oQM-k1j4jNnqHJMm8AF_FEfcQaswERKtUZEi4XjgHIFXM24npXBtUUk0SkEs31GrZRalT3eiKDiYn7DMWRxk1OZDHeWmN4FhHzQ-0ZM3CZ9e3z-1ekLU2vBrQgDnUzUvHVGv0AAY"
              alt="Vanity workshop"
            />
          </div>
        </section>

        {/* Values */}
        <section className="bg-surface-container-low py-16 border-b border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-10 text-center">What Sets Us Apart</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: 'workspace_premium', title: 'Artisan Craftsmanship', desc: 'Each piece is handcrafted by skilled silversmiths with decades of experience, ensuring every detail is perfect.' },
                { icon: 'recycling', title: 'Sustainable Sourcing', desc: 'We source silver responsibly, working with verified suppliers who share our commitment to ethical practices.' },
                { icon: 'support_agent', title: 'Lifetime Support', desc: 'Our relationship with you doesn\'t end at purchase. We offer lifetime cleaning, repair, and re-polishing services.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-secondary text-[32px]">{icon}</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-2">{title}</h3>
                  <p className="text-on-surface-variant text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Store */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-label-upper text-label-upper text-secondary text-xs mb-3 block">Visit Us</span>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Our Flagship Studio</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">location_on</span>
                  <div>
                    <p className="font-semibold text-primary">Vanity</p>
                    <p className="text-on-surface-variant">{settings.store_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <p className="text-on-surface-variant">Mon – Sat: 11:00 AM – 8:00 PM</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">phone</span>
                  <p className="text-on-surface-variant">{settings.contact_phone}</p>
                </div>
              </div>
              <Link href="/shop" className="bg-primary text-on-primary font-label-upper text-label-upper px-8 py-3 hover:bg-inverse-surface transition-colors inline-block text-xs">
                Shop Online
              </Link>
            </div>
            <div className="w-full h-[350px] bg-surface-container-low border border-outline-variant/20 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq8kFfiMGksTl9Rkm7Q7nbmXT4SCa6gDwPRdMx_XgzBRrRlq50HgXQoD1nEmOhwtH3hPsargkGkhFJtvdA7G6b867zjHS_uUTRWsF82hmQmsYA9Svi9a8oqUjqp9y6BJk_pT0ThFn7M_i9M91lzXFwoNNI1vTGFtubNo-clG72p_U5M06YSaO3MKqYxOa6RbGRr5_OFF2eOxmofUOeAWYj-zw0UwZasdV_busU1LvOAFqHvs_rjKM"
                alt="Vanity store"
              />
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
