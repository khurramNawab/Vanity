'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getLocalWishlist, toggleWishlistItem } from '@/lib/wishlist';

interface OfferProduct {
  id: number;
  name: string;
  slug: string;
  silver_purity: string;
  calculated_price: number;
  base_price: number;
  discount_percent?: number;
  badge: string;
  image: string;
  description: string;
}

const OFFER_PRODUCTS: OfferProduct[] = [
  {
    id: 201,
    name: 'Imperial Ruby & Pearl Drop Tops',
    slug: 'imperial-ruby-pearl-drop-tops',
    silver_purity: '925',
    calculated_price: 5999,
    base_price: 7499,
    discount_percent: 20,
    badge: 'Festival Special',
    image: '/images/showcase/ruby-pearl-earrings.jpg',
    description: 'Festive handcrafted 925 sterling silver drop tops with natural ruby stones and luminous freshwater pearls.'
  },
  {
    id: 202,
    name: 'Royal Floral Heritage CZ Bangle',
    slug: 'royal-floral-heritage-cz-bangle',
    silver_purity: '925',
    calculated_price: 7899,
    base_price: 9999,
    discount_percent: 21,
    badge: 'Bestseller Offer',
    image: '/images/showcase/floral-bridal-bangle.jpg',
    description: 'Bridal floral silver bangle crafted in solid 925 hallmarked silver with sparkling pave-set stones.'
  },
  {
    id: 203,
    name: 'Rose Cushion Solitaire Pendant',
    slug: 'rose-cushion-solitaire-pendant',
    silver_purity: '925',
    calculated_price: 4499,
    base_price: 5999,
    discount_percent: 25,
    badge: "Mother's Day Pick",
    image: '/images/showcase/pink-pendant-necklace.jpg',
    description: 'Blush pink solitaire gemstone in sterling silver halo setting with fine Italian silver chain.'
  },
  {
    id: 204,
    name: 'Crimson Heart Eternity Bracelet',
    slug: 'crimson-heart-eternity-bracelet',
    silver_purity: '925',
    calculated_price: 6299,
    base_price: 7999,
    discount_percent: 21,
    badge: 'Limited Edition',
    image: '/images/showcase/heart-gem-bracelet.jpg',
    description: 'Heart cut ruby stones linked in pure 925 sterling silver eternity tennis band.'
  }
];

export default function OffersPage() {
  const { token } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    setWishlistIds(getLocalWishlist());
    const handleUpdate = () => setWishlistIds(getLocalWishlist());
    window.addEventListener('vanity_wishlist_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('vanity_wishlist_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      {/* Hero Header */}
      <section className="relative w-full bg-[#005F59] text-white overflow-hidden py-12 md:py-16 border-b border-[#004D48]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#003834] via-[#005F59] to-[#004D48] opacity-95" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-5 md:px-12 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-amber-200 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-xs">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Exclusive Festive & Seasonal Offers
          </span>

          <h1 className="font-serif text-3xl md:text-5xl font-normal text-white tracking-tight mb-3">
            Handcrafted Silver Jewellery Offers
          </h1>

          <p className="text-teal-100 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Enjoy exclusive festive savings on authentic 925 Sterling Silver heirlooms. Instant coupon codes and complimentary insured delivery across India.
          </p>

          {/* Active Promo Coupon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 font-sans">Festive Discount</span>
              <p className="text-lg font-serif font-bold text-white my-1">Flat 15% OFF</p>
              <button
                type="button"
                onClick={() => handleCopy('PUJA15')}
                className="mt-2 px-3 py-1 bg-white text-[#005F59] font-bold text-xs rounded font-sans flex items-center gap-1 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>{copiedCode === 'PUJA15' ? 'COPIED!' : 'CODE: PUJA15'}</span>
                <span className="material-symbols-outlined text-[13px]">content_copy</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 font-sans">New Customer Special</span>
              <p className="text-lg font-serif font-bold text-white my-1">Flat 10% OFF</p>
              <button
                type="button"
                onClick={() => handleCopy('VANITY10')}
                className="mt-2 px-3 py-1 bg-white text-[#005F59] font-bold text-xs rounded font-sans flex items-center gap-1 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                <span>{copiedCode === 'VANITY10' ? 'COPIED!' : 'CODE: VANITY10'}</span>
                <span className="material-symbols-outlined text-[13px]">content_copy</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 font-sans">Silver Gift Box</span>
              <p className="text-lg font-serif font-bold text-white my-1">Free Gift & Pouch</p>
              <span className="mt-2 px-3 py-1 bg-amber-400 text-[#0F172A] font-bold text-xs rounded font-sans">
                ON ORDERS &gt; ₹5,000
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase Grid */}
      <main className="w-full max-w-[1280px] mx-auto px-5 md:px-12 py-10 flex-grow">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="font-serif text-2xl text-[#0F172A]">Featured Offer Collection</h2>
            <p className="text-xs text-[#64748B] font-sans">Direct discounts applied on authentic 925 BIS Hallmarked pieces.</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-[#008080] hover:underline font-sans flex items-center gap-1"
          >
            Browse All Products <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {OFFER_PRODUCTS.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group cursor-pointer flex flex-col h-full bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:shadow-xl hover:border-[#008080] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[4/3.8] bg-[#F8F8F7] mb-3 overflow-hidden rounded-lg">
                  {/* Top Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-xs">
                      {product.badge}
                    </span>
                  </div>

                  {/* Discount pill */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 font-bold rounded font-sans shadow-xs">
                      {product.discount_percent}% OFF
                    </span>
                  </div>

                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${product.image}')` }}
                  />

                  <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out bg-gradient-to-t from-[#0F172A]/75 to-transparent flex justify-center">
                    <span className="bg-white text-[#008080] w-full py-1.5 tracking-wider hover:bg-[#008080] hover:text-white transition-colors text-[11px] text-center font-bold rounded font-sans shadow-sm">
                      QUICK VIEW
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col px-0.5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm md:text-base font-medium text-[#0F172A] truncate pr-2 group-hover:text-[#008080] transition-colors font-serif">
                      {product.name}
                    </h3>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await toggleWishlistItem(product.id, token);
                      }}
                      className={`shrink-0 p-0.5 transition-colors ${
                        isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-slate-300 hover:text-[#008080]'
                      }`}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isWishlisted ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#64748B] font-sans mb-2">925 Sterling Silver • BIS Hallmarked</p>

                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-base md:text-lg font-serif font-bold text-[#0F172A]">
                        ₹{product.calculated_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 line-through ml-1.5 font-sans">
                        ₹{product.base_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#008080] group-hover:underline font-sans flex items-center gap-0.5">
                      Buy Now <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
