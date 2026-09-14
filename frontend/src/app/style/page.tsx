'use client';

import React from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';

const STYLES = [
  {
    name: 'Choker',
    desc: 'Close-fitting necklaces that sit high on the neck. Bold, statement-making, perfect for V-necks and off-shoulder looks.',
    products: 34,
    icon: 'radio_button_unchecked',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSmmoM7xBQHRSQEuKF3-JakT5oYaeo2D94tz1eq9IBy47xxhRT6-5DuaRvIhS-9eo5Ix252z9EaDM71kNJjiXoZLeJJDA_1BuPFVnv3tbTdes3rjSlFnRRxHyXf3bOP32f9wlQ8gI3yJCEzqTeXvTSkqkjLX1alZUPRRgkkdssT0C-kLk4urdUKTTGrBDQr2DSnX5zjWIzWoUwa_m9Dfl1yDKSAmIIyXmCKxhTm2DThdxfc_U1u4k',
  },
  {
    name: 'Pendant',
    desc: 'A single charm or motif hanging from a delicate chain. Understated, personal, versatile for everyday or special occasions.',
    products: 56,
    icon: 'join',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8iohGxSQgSp5f6dtI1lCyDp7xa6Mj3j9dJ8zLp3Cb07YTppESadDQ7DB0U7gXl2YUg-xsBh9d5BO3m1WoH5DJFT0jIYbgq-y-w6H_mfbn57jh25kN2Iij8IY4nwmMMb8XUC0PRyVPGPK2bO3A0IR1F9y0LoeJiO0Tka9Cjae97UurNBquHb1fGpU1W3fqLimm0LUVeCzcoV6b3KntaqM9l1hOMADu8fBlwjOYlh5wy7UUVwjNv-Y',
  },
  {
    name: 'Layered',
    desc: 'Multiple chains of varying lengths worn together. Creates a textured, curated look that is effortlessly stylish.',
    products: 28,
    icon: 'format_list_bulleted',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApJDo8W2RUnwy85TvYfH58HJzZnI8EMcL0TG-okOcdEnlqWpQJ0ZNyKsUpak8XzydlI93RG7tth8tq-h17oqMsbptYZ2OxGSbVIKDZXkzA06JvJ5tMwGZW38yVyMPw4VnjSXSdPVLGXAiYDEksLWT7tnv4uc5MYaijVXJlCAilszzk3mz5yLsKtkNHeNOExfZDg_DLrEd-Cc0B11VLPiMz2OsXU2TTg_i61ejIvslwv-udFI9yyR0',
  },
  {
    name: 'Mangalsutra',
    desc: 'A sacred necklace symbolising marriage. Available in traditional black bead patterns and modern CZ or minimal interpretations.',
    products: 19,
    icon: 'favorite',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZdRiyXbhzG_K2BVmLJTbMn8Y2EnbjkFYsuY3I0R7pxiJ5KxCQsA2Bo5dkaM95MZIS-3E1_G42-29eoB0TYtu-vX9XB5cGzvxnSXWMiv4yHkU3GT92EgPubtDDELP_Sy7WhUrlWw6PgfqGSnV5RBH1kMwvC5hGXz13aAjmDShvXk6Rs39DuDnAjmECkaAcbjxAziUeJPpIfjFPvUW_zbZn0JmYNzbAxNN3gB_306TEIhayHPBY60Y',
  },
  {
    name: 'Statement',
    desc: 'Bold, eye-catching pieces designed to be the centrepiece of your look. Maximum presence, artisan-crafted drama.',
    products: 22,
    icon: 'stars',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlgrPRtnYZJONF_jKQ0hcpagW9vTuGgcDgP5jLRgKhS2VFCUvxrOVuEAjgxHWaCdFHtJQx982jQzgMhkB7atZUcvIYdUVdE3ymJumEFZvKL-DDQExYH4xjVmsNZQifIdaHze5gBPCCQeNKJcl5dOozH70TqtGiB4QKJtZHVTtmoOTd7n4vwxkaW8jl-rsaGUHN7eMgWveKN-NjOXOj5ZZtU2PTzz6c8ix-RBoSZPfnH5Dnr_q-sdA',
  },
  {
    name: 'Minimalist',
    desc: 'Simple lines and geometric forms. Clean, modern, and timeless — pieces that pair with everything.',
    products: 41,
    icon: 'remove',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZi0_71LbL3kCwSEwDIpjvsiHqoZ3k7VZ4Ergxhywfdgl0Nz35tnXarZ4_ZJtPsDzA8gjHLfnV5qT4vN62TxzN6T7zfRMqc41lETxGCCgVAGXpoQxpXqNWXvcfcLw69ED6sJu2vPTWV2tZmAD7wZppSLSEHCCYEtrVTy93R_lnpkN4Gkz8FuUgFoWV8jZQLEslqXfjSgYNwHLIl3nDiIwxM0ApACHICVSoKEsbKZNL9lBHCoxOuzM',
  },
  {
    name: 'Temple',
    desc: 'Inspired by South Indian temple architecture. Intricate deity motifs, traditional gemstones, and antique-gold finishes.',
    products: 17,
    icon: 'temple_hindu',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz531df_KAgnYC5dtnxZMQnIfKSHFxlbDSFweDqGyiwOK85swjfwj_eKv1XvLAAt43McOkkZm4jAHd6JuUrcWAZpB-9D8Hp20Agnd0pgs81GBcjGR7ycvLBtC3Z-h_Y_7GSU7IflYUejoR3IR8m7ykGJE9yoR7sEG09syIIyi7FUcsEfzWdXmvuD94jVbQ8AkE7fe06Ja-KGWaLl3fsiSDQIS63bK2spi7TTzdBPVxlLUOSx6eAxA',
  },
  {
    name: 'Boho',
    desc: 'Free-spirited, earthy, festival-ready. Feathers, dreamcatchers, hammered textures and long tassels.',
    products: 29,
    icon: 'sunny',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXroiYYvMVYChO14oJ9W0AtC2kkCz5_DOPWWMyUsWi6Bu--fGMXO65pUuurwGiTIJKHPGjcU9AE_EyEK_pM8dceBqCYeJe4hppzxKkcI_qL6G7rYLZ3gONo4NGArm7LL7R5ggSz_4fRsUSwS0M60iLcBaRaPHclWKEoYmvJCvY47FKDiaysoCFZ7ks-U5t7a58JWaQ_xwgR7gdEdh1KWcxdzPVpFtRxdVKYZf1Wqx8m-5y4g224kc',
  },
];

export default function StylePage() {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/shop?filter=style" />

      {/* Hero */}
      <section className="relative w-full bg-[#0f0f0f] py-20 border-b border-outline-variant/30 overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaieoMKalAeMzojNkICCl6s3A6o6mx1RnYeAjbbTUlt3WYQ0_b8-vtobsAEuxNiqwQ8k8GDYJwNFoKXRZhYd2p6x0dBdZ3VBflmt-Ko6Ist6gmzkHL1fRVq3cy0msCH5oVzdLj46-mBvPlay5m0E-jQ5qKM14KN08RrkMzvdCAZrDQAjDehYmZrK3a6h4s6GGj4ItxX-uOzXbRHDpoPkgECfPDJyN1zVWROC5NCIv7gwJdk4VVnVI')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-12 text-center">
          <span className="inline-flex items-center gap-2 mb-4 justify-center">
            <span className="w-8 h-px bg-secondary" />
            <span className="font-label-upper text-label-upper text-secondary text-xs uppercase tracking-[0.2em]">Shop by Style</span>
            <span className="w-8 h-px bg-secondary" />
          </span>
          <h1 className="font-headline-lg text-[40px] md:text-[52px] text-white font-bold mb-4 leading-tight">Find Your Style</h1>
          <p className="text-white/70 max-w-xl mx-auto text-base">From temple-inspired heritage pieces to contemporary minimalist forms — discover the style that speaks your language.</p>
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
            <li className="text-primary font-semibold">Style</li>
          </ol>
        </nav>

        {/* Style Grid — 4 col */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STYLES.map((style) => (
            <Link key={style.name} href={`/shop?style=${encodeURIComponent(style.name)}`} className="group bg-surface-container-lowest border border-outline-variant/20 rounded-lg overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="relative w-full aspect-square overflow-hidden bg-surface-container-low">
                <img src={style.img} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h2 className="font-headline-md text-white text-[20px] font-bold">{style.name}</h2>
                  <p className="text-white/70 text-xs mt-0.5">{style.products} pieces</p>
                </div>
              </div>
              {/* Hover reveal */}
              <div className="p-4 hidden md:block">
                <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">{style.desc}</p>
                <span className="font-label-upper text-label-upper text-secondary text-xs mt-3 block group-hover:text-primary transition-colors">Shop {style.name} →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Browse All CTA */}
        <div className="border border-outline-variant/30 rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-low">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">Not sure which style is for you?</h3>
            <p className="text-on-surface-variant text-sm">Browse our full collection and use the filter panel to narrow down by style, purity, and price.</p>
          </div>
          <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 hover:bg-inverse-surface transition-colors font-label-upper text-label-upper text-xs whitespace-nowrap">
            Browse All Jewellery
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
