'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getLocalWishlist, toggleWishlistItem } from '@/lib/wishlist';

interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  silver_purity?: string;
  calculated_price?: number;
  base_price?: number;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  occasion?: string;
  category?: { name: string; slug: string };
  images?: { image_path: string; is_primary?: boolean }[];
}

const FALLBACK_JODHPUR_PRODUCTS: Product[] = [
  {
    id: 901,
    name: 'Jodhpur Royal Kundan & Ruby Silver Necklace',
    slug: 'jodhpur-royal-kundan-ruby-necklace',
    description: 'Master artisan crafted 925 sterling silver royal heritage necklace adorned with vibrant ruby cabochons, fine filigree wirework, and antique matte gold polish inspired by Mehrangarh Palace heirlooms.',
    silver_purity: '925',
    calculated_price: 12499,
    base_price: 14500,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    occasion: 'jodhpur',
    category: { name: 'Necklaces', slug: 'necklaces' },
    images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
  },
  {
    id: 902,
    name: 'Marwar Heritage Antique Silver Jhumkas',
    slug: 'marwar-heritage-antique-silver-jhumkas',
    description: 'Traditional Jodhpur double-dome silver jhumkas with hanging micro-pearl droplets and hand-engraved floral motifs. 100% 925 Sterling Silver.',
    silver_purity: '925',
    calculated_price: 5999,
    base_price: 7200,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'jodhpur',
    category: { name: 'Earrings', slug: 'earrings' },
    images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
  },
  {
    id: 903,
    name: 'Rajputana Regal Carved Silver Kada (Bangle)',
    slug: 'rajputana-regal-carved-silver-kada',
    description: 'Stately lion-head terminal silver kada crafted in solid 925 sterling silver with oxidized antique engravings and precision hinge closure.',
    silver_purity: '925',
    calculated_price: 8899,
    base_price: 10500,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: true,
    occasion: 'jodhpur',
    category: { name: 'Bangles', slug: 'bangles' },
    images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
  },
  {
    id: 904,
    name: 'Mehrangarh Crimson Gemstone Silver Bracelet',
    slug: 'mehrangarh-crimson-gemstone-bracelet',
    description: 'Exquisite flexible link tennis bracelet showcasing artisan-cut crimson gemstones set in solid 925 sterling silver bezels with safety clasp.',
    silver_purity: '925',
    calculated_price: 6499,
    base_price: 7999,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    occasion: 'jodhpur',
    category: { name: 'Bracelets', slug: 'bracelets' },
    images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
  },
  {
    id: 905,
    name: 'Jodhpuri Royal Hasli Silver Collar Choker',
    slug: 'jodhpuri-royal-hasli-silver-choker',
    description: 'Rigid torque style silver choker handcrafted with repousse peacock carvings and ruby-accented center floral medallion. 925 Sterling Silver.',
    silver_purity: '925',
    calculated_price: 14999,
    base_price: 17500,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'jodhpur',
    category: { name: 'Necklaces', slug: 'necklaces' },
    images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
  },
  {
    id: 906,
    name: 'Blue City Filigree Silver Chandbali Earrings',
    slug: 'blue-city-filigree-silver-chandbalis',
    description: 'Crescent moon earrings featuring intricate Jodhpur wire filigree, handset CZ diamonds, and genuine freshwater pearls.',
    silver_purity: '925',
    calculated_price: 6899,
    base_price: 8100,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    occasion: 'jodhpur',
    category: { name: 'Earrings', slug: 'earrings' },
    images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
  }
];

export default function JodhpurJewelleryPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPurity, setSelectedPurity] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchApi('/products?limit=50')
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.products && res.products.length > 0) {
          // Filter for products matching jodhpur/heritage/jaipur or mix with our curated fallback
          const matched = res.products.filter((p: Product) => 
            (p.occasion && (p.occasion.toLowerCase().includes('jodhpur') || p.occasion.toLowerCase().includes('festive') || p.occasion.toLowerCase().includes('wedding'))) ||
            (p.name && (p.name.toLowerCase().includes('jodhpur') || p.name.toLowerCase().includes('heritage') || p.name.toLowerCase().includes('royal')))
          );

          if (matched.length >= 4) {
            setProducts(matched);
          } else {
            // Combine API products with curated Jodhpur items
            const existingIds = new Set(matched.map((p: Product) => p.id));
            const uniqueFallbacks = FALLBACK_JODHPUR_PRODUCTS.filter(f => !existingIds.has(f.id));
            setProducts([...matched, ...uniqueFallbacks]);
          }
        } else {
          setProducts(FALLBACK_JODHPUR_PRODUCTS);
        }
      })
      .catch(() => {
        if (isMounted) setProducts(FALLBACK_JODHPUR_PRODUCTS);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category?.name !== selectedCategory) {
          return false;
        }
        if (selectedPurity !== 'All' && p.silver_purity !== selectedPurity) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.calculated_price || a.base_price || 0;
        const priceB = b.calculated_price || b.base_price || 0;
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'newest') return (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0);
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedPurity, sortBy]);

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar />

      {/* Hero Banner: Jodhpur Royal Heritage */}
      <section className="relative w-full bg-[#005F59] text-white overflow-hidden py-12 md:py-16 border-b border-[#004D48]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#003834] via-[#005F59] to-[#004D48] opacity-95" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#008080]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1280px] mx-auto px-5 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-left">
            {/* Breadcrumb */}
            <nav className="text-xs text-teal-200/80 mb-3 font-sans flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/collections" className="hover:text-white transition-colors">Collections</Link>
              <span>/</span>
              <span className="text-amber-300 font-bold">Jodhpur Jewellery</span>
            </nav>

            <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-amber-200 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Royal Marwar Heritage Edition
            </span>

            <h1 className="font-serif text-3xl md:text-5xl font-normal text-white tracking-tight leading-tight mb-3">
              Jodhpur Heritage Silver Jewellery
            </h1>

            <p className="text-teal-100 text-sm md:text-base leading-relaxed font-sans max-w-xl">
              Immerse in timeless Rajasthani royalty with handcrafted 925 sterling silver heirlooms, intricate filigree wirework, and antique temple carvings inspired by Mehrangarh.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-teal-100 font-sans">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-[16px] text-amber-300">verified</span>
                <span>100% Certified 925 Silver</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-[16px] text-amber-300">local_shipping</span>
                <span>Express Insured Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                <span className="material-symbols-outlined text-[16px] text-amber-300">workspace_premium</span>
                <span>Direct Artisan Crafted</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-72 h-72 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl relative shrink-0">
            <div
              className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url('/images/showcase/pink-pendant-necklace.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider font-sans">
                Handcrafted in Jodhpur & Kolkata
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full max-w-[1280px] mx-auto px-5 md:px-12 py-8 md:py-12 flex-grow">
        {/* Controls Bar: Categories & Sort */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E5E7EB]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all font-sans cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#008080] text-white shadow-sm'
                    : 'bg-white border border-[#E5E7EB] text-[#475569] hover:border-[#008080] hover:text-[#008080]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter & Sort Selectors */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedPurity}
              onChange={(e) => setSelectedPurity(e.target.value)}
              className="bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-sans rounded-lg px-3 py-2 focus:outline-none focus:border-[#008080] cursor-pointer"
            >
              <option value="All">All Purity</option>
              <option value="925">925 Sterling Silver</option>
              <option value="999">999 Fine Silver</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-sans rounded-lg px-3 py-2 focus:outline-none focus:border-[#008080] cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-white p-4 rounded-xl border border-[#E5E7EB]">
                <div className="aspect-[4/3.8] bg-slate-100 rounded-lg mb-3" />
                <div className="h-4 bg-slate-100 w-3/4 rounded mb-2" />
                <div className="h-3 bg-slate-100 w-1/2 rounded mb-2" />
                <div className="h-5 bg-slate-100 w-1/3 rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] p-8">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3">inventory_2</span>
            <h3 className="font-serif text-lg font-medium text-[#0F172A] mb-1">No Jodhpur Jewellery Found</h3>
            <p className="text-xs text-[#64748B] font-sans mb-4">Try changing the category or filter criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPurity('All');
              }}
              className="px-5 py-2 bg-[#008080] text-white text-xs font-bold uppercase tracking-wider rounded-lg font-sans"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const primaryImg = product.images?.find((img) => img.is_primary) || product.images?.[0];
              const imgUrl = primaryImg ? primaryImg.image_path : '/images/showcase/floral-bridal-bangle.jpg';
              const material = product.silver_purity === '925' ? '925 Sterling Silver' : 'Fine Silver';
              const price = product.calculated_price || product.base_price || 4999;
              const originalPrice = product.base_price && product.base_price > price ? product.base_price : null;
              const isWishlisted = wishlistIds.includes(product.id);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="group cursor-pointer flex flex-col h-full bg-white p-3.5 md:p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:shadow-xl hover:border-[#008080] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3.8] bg-[#F8F8F7] mb-3 overflow-hidden rounded-lg">
                    {/* Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      {product.is_bestseller ? (
                        <span className="bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-xs">
                          Bestseller
                        </span>
                      ) : product.is_new_arrival ? (
                        <span className="bg-[#008080] text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-xs">
                          New In
                        </span>
                      ) : (
                        <span className="bg-[#0F172A]/80 text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-xs">
                          Heritage
                        </span>
                      )}
                    </div>

                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${imgUrl}')` }}
                    />

                    {/* Quick View Button */}
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

                    <p className="text-[11px] text-[#64748B] font-sans mb-2">{material}</p>

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-base md:text-lg font-serif font-bold text-[#0F172A]">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {originalPrice && (
                          <span className="text-xs text-slate-400 line-through ml-1.5 font-sans">
                            ₹{originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#008080] group-hover:underline font-sans flex items-center gap-0.5">
                        Details <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Heritage Story Section */}
        <section className="mt-16 bg-gradient-to-br from-[#FAFAFA] via-white to-[#F0F9F8] rounded-2xl border border-[#E5E7EB] p-6 md:p-10 shadow-sm">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#008080] font-sans">
              Royal Heritage Craftsmanship
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#0F172A] font-normal tracking-tight mt-1 mb-3">
              The Legend of Jodhpur Silver Artistry
            </h2>
            <p className="text-xs md:text-sm text-[#64748B] leading-relaxed font-sans mb-6">
              Jodhpur, the Sun City of Rajasthan, is celebrated globally for its centuries-old traditions of royal metalsmithing. Each silver ornament in our Jodhpur Collection is crafted using authentic Marwari silversmith techniques — featuring intricate hand-carved motifs, antique oxidizing patinas, and certified 925 Sterling Silver purity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="material-symbols-outlined text-[#008080] text-[24px] mb-2">handyman</span>
                <h4 className="font-serif text-sm font-medium text-[#0F172A] mb-1">Artisanal Filigree</h4>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">Hand-twisted fine silver wires meticulously woven into regal floral and peacock patterns.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="material-symbols-outlined text-[#008080] text-[24px] mb-2">verified_user</span>
                <h4 className="font-serif text-sm font-medium text-[#0F172A] mb-1">925 Certified</h4>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">Every individual piece undergoes quality checking for certified 925 purity before shipping.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="material-symbols-outlined text-[#008080] text-[24px] mb-2">local_shipping</span>
                <h4 className="font-serif text-sm font-medium text-[#0F172A] mb-1">Insured Pan-India</h4>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">Tamper-proof insured express delivery right to your doorstep in Kolkata and across India.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
