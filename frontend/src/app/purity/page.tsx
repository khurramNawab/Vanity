'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

const PURITY_TYPES = [
  {
    purity: '92.5',
    name: '925 Sterling Silver',
    desc: 'The most popular choice for fine jewellery. 92.5% pure silver alloyed with copper for strength. BIS Hallmarked.',
    badge: 'Most Popular',
    products: 126,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSmmoM7xBQHRSQEuKF3-JakT5oYaeo2D94tz1eq9IBy47xxhRT6-5DuaRvIhS-9eo5Ix252z9EaDM71kNJjiXoZLeJJDA_1BuPFVnv3tbTdes3rjSlFnRRxHyXf3bOP32f9wlQ8gI3yJCEzqTeXvTSkqkjLX1alZUPRRgkkdssT0C-kLk4urdUKTTGrBDQr2DSnX5zjWIzWoUwa_m9Dfl1yDKSAmIIyXmCKxhTm2DThdxfc_U1u4k',
    color: 'bg-[#e8f5e9] text-[#137333]',
  },
  {
    purity: '999',
    name: '999 Fine Silver',
    desc: '99.9% pure silver. Exceptionally soft and bright. Ideal for investment pieces and collector editions.',
    badge: 'Premium',
    products: 18,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaieoMKalAeMzojNkICCl6s3A6o6mx1RnYeAjbbTUlt3WYQ0_b8-vtobsAEuxNiqwQ8k8GDYJwNFoKXRZhYd2p6x0dBdZ3VBflmt-Ko6Ist6gmzkHL1fRVq3cy0msCH5oVzdLj46-mBvPlay5m0E-jQ5qKM14KN08RrkMzvdCAZrDQAjDehYmZrK3a6h4s6GGj4ItxX-uOzXbRHDpoPkgECfPDJyN1zVWROC5NCIv7gwJdk4VVnVI',
    color: 'bg-[#fff8e1] text-[#9A7E44]',
  },
  {
    purity: 'Brass',
    name: 'Brass Alloy',
    desc: 'Gold-toned base metal with silver plating. Affordable everyday wear with the look of precious metal.',
    badge: 'Budget Friendly',
    products: 84,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJDo8W2RUnwy85TvYfH58HJzZnI8EMcL0TG-okOcdEnlqWpQJ0ZNyKsUpak8XzydlI93RG7tth8tq-h17oqMsbptYZ2OxGSbVIKDZXkzA06JvJ5tMwGZW38yVyMPw4VnjSXSdPVLGXAiYDEksLWT7tnv4uc5MYaijVXJlCAilszzk3mz5yLsKtkNHeNOExfZDg_DLrEd-Cc0B11VLPiMz2OsXU2TTg_i61ejIvslwv-udFI9yyR0',
    color: 'bg-surface-container text-on-surface-variant',
  },
  {
    purity: 'CZ',
    name: 'CZ Embellished',
    desc: 'Cubic Zirconia stones set in silver or brass. Maximum sparkle at an accessible price point.',
    badge: 'Statement',
    products: 62,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZdRiyXbhzG_K2BVmLJTbMn8Y2EnbjkFYsuY3I0R7pxiJ5KxCQsA2Bo5dkaM95MZIS-3E1_G42-29eoB0TYtu-vX9XB5cGzvxnSXWMiv4yHkU3GT92EgPubtDDELP_Sy7WhUrlWw6PgfqGSnV5RBH1kMwvC5hGXz13aAjmDShvXk6Rs39DuDnAjmECkaAcbjxAziUeJPpIfjFPvUW_zbZn0JmYNzbAxNN3gB_306TEIhayHPBY60Y',
    color: 'bg-[#e3f2fd] text-[#1565c0]',
  },
  {
    purity: 'Oxidized',
    name: 'Oxidized Silver',
    desc: 'Deliberately darkened to create an antique, ethnic look. Pairs beautifully with traditional Indian attire.',
    badge: 'Ethnic',
    products: 47,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlgrPRtnYZJONF_jKQ0hcpagW9vTuGgcDgP5jLRgKhS2VFCUvxrOVuEAjgxHWaCdFHtJQx982jQzgMhkB7atZUcvIYdUVdE3ymJumEFZvKL-DDQExYH4xjVmsNZQifIdaHze5gBPCCQeNKJcl5dOozH70TqtGiB4QKJtZHVTtmoOTd7n4vwxkaW8jl-rsaGUHN7eMgWveKN-NjOXOj5ZZtU2PTzz6c8ix-RBoSZPfnH5Dnr_q-sdA',
    color: 'bg-[#fbe9e7] text-[#bf360c]',
  },
  {
    purity: 'Stones',
    name: 'Semi-Precious Stones',
    desc: 'Silver settings with natural gemstones — turquoise, onyx, garnet, amethyst. Every piece is unique.',
    badge: 'Natural',
    products: 33,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8iohGxSQgSp5f6dtI1lCyDp7xa6Mj3j9dJ8zLp3Cb07YTppESadDQ7DB0U7gXl2YUg-xsBh9d5BO3m1WoH5DJFT0jIYbgq-y-w6H_mfbn57jh25kN2Iij8IY4nwmMMb8XUC0PRyVPGPK2bO3A0IR1F9y0LoeJiO0Tka9Cjae97UurNBquHb1fGpU1W3fqLimm0LUVeCzcoV6b3KntaqM9l1hOMADu8fBlwjOYlh5wy7UUVwjNv-Y',
    color: 'bg-[#f3e5f5] text-[#6a1b9a]',
  },
];

export default function PurityPage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/shop?filter=purity" />

      {/* Hero */}
      <section className="relative w-full bg-[#1a1a1a] py-20 border-b border-outline-variant/30 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSmmoM7xBQHRSQEuKF3-JakT5oYaeo2D94tz1eq9IBy47xxhRT6-5DuaRvIhS-9eo5Ix252z9EaDM71kNJjiXoZLeJJDA_1BuPFVnv3tbTdes3rjSlFnRRxHyXf3bOP32f9wlQ8gI3yJCEzqTeXvTSkqkjLX1alZUPRRgkkdssT0C-kLk4urdUKTTGrBDQr2DSnX5zjWIzWoUwa_m9Dfl1yDKSAmIIyXmCKxhTm2DThdxfc_U1u4k')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-12 text-center">
          <span className="inline-flex items-center gap-2 mb-4 justify-center">
            <span className="w-8 h-px bg-[#9A7E44]" />
            <span className="font-label-upper text-label-upper text-[#9A7E44] text-xs uppercase tracking-[0.2em]">Shop by Purity</span>
            <span className="w-8 h-px bg-[#9A7E44]" />
          </span>
          <h1 className="font-headline-lg text-[40px] md:text-[52px] text-white font-bold mb-4 leading-tight">Choose Your Purity</h1>
          <p className="text-white/70 max-w-xl mx-auto text-base">Every metal has a story. From pure 999 fine silver to embellished CZ settings — find the purity that matches your occasion and lifestyle.</p>
        </div>
      </section>

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-12">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-8">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Purity</li>
          </ol>
        </nav>

        {/* Purity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PURITY_TYPES.map((item) => (
            <Link key={item.purity} href={`/shop?purity=${encodeURIComponent(item.purity)}`} className="group bg-surface-container-lowest border border-outline-variant/20 rounded-lg overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-container-low">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`${item.color} text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm`}>{item.badge}</span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-label-upper text-label-upper text-[#9A7E44] text-[10px] mb-1">{item.purity} PURITY</p>
                    <h2 className="font-headline-md text-headline-md text-primary">{item.name}</h2>
                  </div>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">{item.products} pieces</span>
                </div>
                <p className="text-on-surface-variant text-sm flex-1 mb-4">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-label-upper text-label-upper text-secondary text-xs group-hover:text-primary transition-colors">Shop Now →</span>
                  <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* MCX Banner */}
        <div className="bg-[#1a1a1a] rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#9A7E44] text-[40px]">verified</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-white">All silver is BIS Hallmarked</h3>
              <p className="text-white/60 text-sm mt-1">Pricing is based on live MCX silver rates. No hidden markups.</p>
            </div>
          </div>
          <Link href="/mcx-rates" className="border border-[#9A7E44] text-[#9A7E44] hover:bg-[#9A7E44] hover:text-white font-label-upper text-label-upper px-6 py-2 transition-colors text-xs whitespace-nowrap">
            View MCX Rates
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
