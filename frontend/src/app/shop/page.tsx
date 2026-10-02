'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getLocalWishlist, toggleWishlistItem } from '@/lib/wishlist';

const CATEGORIES = ['All', 'Necklaces', 'Earrings', 'Bracelets', 'Bangles', 'Pendants', 'Tops', 'Mala', 'Rings'];
const STYLES = ['Choker', 'Pendant', 'Layered', 'Mangalsutra', 'Statement'];

const INITIAL_FALLBACK_PRODUCTS = [
  {
    id: 1,
    sku: 'VNT-RNG-001',
    name: 'Classic Solitaire Ring',
    slug: 'classic-solitaire-ring',
    description: 'A timeless 925 sterling silver solitaire ring featuring a brilliant CZ diamond center stone.',
    silver_purity: '925',
    calculated_price: 1350,
    base_price: 1500,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    occasion: 'everyday',
    category: { name: 'Rings', slug: 'rings' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  },
  {
    id: 2,
    sku: 'VNT-NEC-002',
    name: 'Royal Heritage Necklace',
    slug: 'royal-heritage-necklace',
    description: 'An editorial royal heritage necklace featuring intricate traditional carvings for festive occasions and Durga Puja celebrations.',
    silver_purity: '925',
    calculated_price: 5100,
    base_price: 6000,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'festive',
    category: { name: 'Necklaces', slug: 'necklaces' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  },
  {
    id: 3,
    sku: 'VNT-BRC-003',
    name: 'Infinity Silver Bracelet',
    slug: 'infinity-silver-bracelet',
    description: 'A clean and sleek infinity-themed silver cuff bracelet ideal for work, college, and everyday wear.',
    silver_purity: '925',
    calculated_price: 3500,
    base_price: 3500,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'everyday',
    category: { name: 'Bracelets', slug: 'bracelets' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  },
  {
    id: 4,
    sku: 'VNT-EAR-004',
    name: 'Elegant Pearl Drop Earrings',
    slug: 'elegant-pearl-drop-earrings',
    description: 'Graceful drop earrings utilizing AAA grade fresh water pearls in 925 silver, an unforgettable gift for birthdays and anniversaries.',
    silver_purity: '925',
    calculated_price: 2475,
    base_price: 2750,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    occasion: 'gifting',
    category: { name: 'Earrings', slug: 'earrings' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  },
  {
    id: 5,
    sku: 'VNT-CHK-005',
    name: 'Vintage Filigree Choker',
    slug: 'vintage-filigree-choker',
    description: 'A breathtaking vintage choker adorned with intricate Bengali silver filigree work, tailor-made for bridal silverware and wedding receptions.',
    silver_purity: '925',
    calculated_price: 8900,
    base_price: 8900,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'wedding',
    category: { name: 'Necklaces', slug: 'necklaces' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  },
  {
    id: 6,
    sku: 'VNT-TOP-006',
    name: 'Imperial Ruby & Pearl Drop Tops',
    slug: 'imperial-ruby-pearl-drop-tops',
    description: 'Everyday understated luxury CZ tops embedded with hand-cut pavé stones and certified 925 silver purity.',
    silver_purity: '925',
    calculated_price: 5999,
    base_price: 5999,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    occasion: 'everyday',
    category: { name: 'Tops', slug: 'tops' },
    images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
  },
  {
    id: 7,
    sku: 'VNT-BNG-007',
    name: 'Royal Floral Heritage CZ Bangle',
    slug: 'royal-floral-heritage-cz-bangle',
    description: 'Heavy traditional silver kada cuff with embossed tribal motifs, honoring the silver artisan roots of Bowbazar Kolkata.',
    silver_purity: '925',
    calculated_price: 7899,
    base_price: 7899,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'festive',
    category: { name: 'Bangles', slug: 'bangles' },
    images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
  },
  {
    id: 8,
    sku: 'VNT-PND-008',
    name: 'Rose Cushion Solitaire Pendant',
    slug: 'rose-cushion-solitaire-pendant',
    description: 'A glowing solitaire pendant with blush rose gold highlights and shimmering 925 sterling silver chain.',
    silver_purity: '925',
    calculated_price: 4499,
    base_price: 4499,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'gifting',
    category: { name: 'Pendants', slug: 'pendants' },
    images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
  },
  {
    id: 9,
    sku: 'VNT-MAL-009',
    name: 'Artisan Silver Bead Mala',
    slug: 'artisan-silver-bead-mala',
    description: 'A 54-bead handcrafted silver mala chain with intricate filigree details and hallmarked purity.',
    silver_purity: '925',
    calculated_price: 6800,
    base_price: 6800,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: false,
    occasion: 'festive',
    category: { name: 'Mala', slug: 'mala' },
    images: [{ image_path: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', is_primary: true }]
  }
];

function ShopPageContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>(INITIAL_FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    fetchApi('/products')
      .then(res => {
        if (res.success && res.products && res.products.length > 0) {
          setDbProducts(res.products);
        } else {
          setDbProducts(INITIAL_FALLBACK_PRODUCTS);
        }
      })
      .catch(err => {
        console.error('Error loading storefront products:', err);
        setDbProducts(INITIAL_FALLBACK_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cat = searchParams ? searchParams.get('category') : null;
    let occ = searchParams ? searchParams.get('occasion') : null;
    let style = searchParams ? searchParams.get('style') : null;
    let purity = searchParams ? searchParams.get('purity') : null;

    if (typeof window !== 'undefined' && (!cat && !occ && !style && !purity)) {
      const urlParams = new URLSearchParams(window.location.search);
      cat = urlParams.get('category') || cat;
      occ = urlParams.get('occasion') || occ;
      style = urlParams.get('style') || style;
      purity = urlParams.get('purity') || purity;
    }

    if (cat) {
      // Find matching standard category name case-insensitively
      const matched = CATEGORIES.find(c => c.toLowerCase() === cat!.toLowerCase() || c.toLowerCase().replace(/s$/, '') === cat!.toLowerCase().replace(/s$/, ''));
      setSelectedCat(matched || cat);
    } else {
      setSelectedCat('All');
    }

    if (occ) {
      setSelectedOccasion(occ);
    } else {
      setSelectedOccasion('All');
    }

    if (style) {
      setSelectedStyles([style]);
    } else {
      setSelectedStyles([]);
    }

    if (purity) {
      if (purity.toLowerCase().includes('925') || purity.toLowerCase().includes('silver')) {
        setSelectedCat('Silver');
      } else if (purity.toLowerCase().includes('brass')) {
        setSelectedCat('Brass');
      } else if (purity.toLowerCase().includes('cz')) {
        setSelectedCat('CZ Embellished');
      } else if (purity.toLowerCase().includes('stone')) {
        setSelectedCat('Stones');
      }
    }
  }, [searchParams]);

  const toggleStyle = (s: string) => {
    setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const filteredProducts = dbProducts.filter(product => {
    // Category match
    if (selectedCat !== 'All') {
      const catLower = selectedCat.toLowerCase();
      const catSingular = catLower.replace(/s$/, '');
      const productCatSlug = (product.category?.slug || '').toLowerCase();
      const productCatName = (product.category?.name || '').toLowerCase();
      const productName = (product.name || '').toLowerCase();
      const productDesc = (product.description || '').toLowerCase();

      const matchesCat = 
        productCatSlug === catLower ||
        productCatSlug === catSingular ||
        productCatSlug.includes(catLower) || 
        productCatSlug.includes(catSingular) || 
        productCatName.includes(catLower) || 
        productCatName.includes(catSingular) || 
        productName.includes(catLower) ||
        productName.includes(catSingular) ||
        productDesc.includes(catLower) ||
        productDesc.includes(catSingular);

      if (!matchesCat) return false;
    }

    // Occasion match
    if (selectedOccasion !== 'All') {
      const occLower = selectedOccasion.toLowerCase();
      const productOccasion = (product.occasion || '').toLowerCase();
      const productName = (product.name || '').toLowerCase();
      const productDesc = (product.description || '').toLowerCase();

      const matchesOccasion = 
        productOccasion === occLower || 
        productOccasion.includes(occLower) || 
        productName.includes(occLower) || 
        productDesc.includes(occLower);

      if (!matchesOccasion) return false;
    }

    // Style match
    if (selectedStyles.length > 0) {
      const matchStyle = selectedStyles.some(style =>
        product.name.toLowerCase().includes(style.toLowerCase())
      );
      if (!matchStyle) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.calculated_price) - Number(b.calculated_price);
    }
    if (sortBy === 'price-high') {
      return Number(b.calculated_price) - Number(a.calculated_price);
    }
    if (sortBy === 'newest') {
      return b.is_new_arrival ? 1 : -1;
    }
    return b.is_featured ? 1 : -1;
  });

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/shop" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-6 flex flex-col">

        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <Breadcrumbs
            items={
              selectedCat && selectedCat !== 'All'
                ? [{ label: 'Shop', href: '/shop' }, { label: selectedCat }]
                : [{ label: 'Shop' }]
            }
            className="mb-4"
          />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
            <h1 className="font-headline-lg text-headline-lg text-primary">All Jewellery</h1>
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 text-xs font-label-upper border border-outline-variant/30 px-4 py-2 hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters
              </button>
              <div className="flex items-center gap-2">
                <label className="text-xs font-label-upper text-on-surface-variant hidden md:block">Sort By:</label>
                <select
                  className="bg-surface border border-outline-variant/30 text-sm py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 12-col grid */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-4 flex-grow">

          {/* Sidebar Filters */}
          <aside className={`${showMobileFilters ? 'flex fixed inset-0 z-50 bg-surface p-6 overflow-y-auto w-full' : 'hidden'} md:flex md:static md:bg-transparent md:p-0 md:w-auto md:h-auto col-span-3 border-r border-outline-variant/30 pr-4 sticky top-32 h-min flex-col`}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center md:hidden mb-6">
              <h3 className="font-bold text-lg text-primary">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* Category */}
            <div className="py-5 border-b border-outline-variant/30">
              <h3 className="font-label-upper text-label-upper text-primary mb-3 text-xs">Category</h3>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCat === cat}
                      onChange={() => setSelectedCat(cat)}
                      className="w-4 h-4 border border-primary/20 rounded-sm accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="py-5 border-b border-outline-variant/30">
              <h3 className="font-label-upper text-label-upper text-primary mb-3 text-xs">Price Range</h3>
              <div className="px-1">
                <div className="relative h-1 bg-surface-container-high rounded-full w-full mb-5 mt-3">
                  <div className="absolute h-full bg-primary left-1/4 right-1/4 rounded-full" />
                  <div className="absolute w-4 h-4 bg-surface border-2 border-primary rounded-full -top-1.5 left-1/4 -ml-2 cursor-pointer" />
                  <div className="absolute w-4 h-4 bg-surface border-2 border-primary rounded-full -top-1.5 right-1/4 -mr-2 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="border border-outline-variant/30 px-2 py-1 w-full text-center text-sm text-on-surface-variant">₹ 2,500</div>
                  <span className="text-outline-variant">—</span>
                  <div className="border border-outline-variant/30 px-2 py-1 w-full text-center text-sm text-on-surface-variant">₹ 25,000</div>
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="py-5 border-b border-outline-variant/30">
              <h3 className="font-label-upper text-label-upper text-primary mb-3 text-xs">Style</h3>
              <div className="flex flex-wrap gap-2">
                {STYLES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStyle(s)}
                    className={`px-3 py-1 border text-xs font-label-upper transition-colors ${
                      selectedStyles.includes(s)
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowMobileFilters(false)} className="mt-6 w-full py-3 bg-primary text-on-primary font-label-upper text-label-upper uppercase tracking-widest hover:bg-inverse-surface transition-colors rounded text-xs">
              Apply Filters
            </button>
          </aside>

          {/* Product Grid */}
          <div className="col-span-12 md:col-span-9 flex flex-col">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col bg-surface border border-outline-variant/10 p-2 rounded animate-pulse">
                    <div className="relative w-full aspect-[3/4] bg-surface-container-low mb-3 rounded" />
                    <div className="h-4 bg-surface-container-high w-3/4 rounded mb-2" />
                    <div className="h-3 bg-surface-container-high w-1/2 rounded mb-3" />
                    <div className="flex justify-between items-center mt-auto">
                      <div className="h-5 bg-surface-container-high w-1/3 rounded" />
                      <div className="h-5 bg-surface-container-high w-5 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">search_off</span>
                <p className="text-on-surface-variant text-base font-semibold">No ornaments match your selection.</p>
                <p className="text-xs text-on-surface-variant mt-1">Try clearing some filter parameters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {sortedProducts.map(product => {
                  const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
                  const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                  const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;
                  
                  // Compute badge
                  let badge = null;
                  let badgeColor = '';
                  if (product.is_new_arrival) {
                    badge = 'New';
                    badgeColor = 'bg-primary text-white';
                  } else if (product.is_bestseller) {
                    badge = 'Best Seller';
                    badgeColor = 'bg-secondary text-white';
                  } else if (Number(product.discount_percent) > 0) {
                    badge = `${Math.round(Number(product.discount_percent))}% Off`;
                    badgeColor = 'bg-error text-white';
                  }

                  return (
                    <Link key={product.id} href={`/products/${product.slug || product.id}`} className="group relative flex flex-col bg-surface hover:shadow-[0px_4px_20px_rgba(0,0,0,0.04)] transition-shadow duration-300 border border-transparent hover:border-outline-variant/10">
                      {badge && (
                        <div className="absolute top-0 left-0 z-10">
                          <span className={`${badgeColor} text-[10px] font-semibold uppercase tracking-wider px-2 py-1`}>{badge}</span>
                        </div>
                      )}
                      <div className="relative w-full aspect-[3/4] bg-surface-container-low overflow-hidden mb-3">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          src={imgUrl}
                          alt={product.name}
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100">
                          <button className="w-full bg-surface text-primary border border-primary py-2 text-xs font-label-upper hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">visibility</span> Quick View
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col flex-grow justify-between px-1 pb-2">
                        <div>
                          <h3 className="font-body-md text-sm text-primary mb-1 line-clamp-2">{product.name}</h3>
                          <p className="text-[12px] text-on-surface-variant mb-2">{material}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-price-display text-sm text-primary font-semibold">{priceText}</span>
                          <button 
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await toggleWishlistItem(product.id, token);
                            }}
                            className={`p-1 transition-colors ${
                              wishlistIds.includes(product.id)
                                ? 'text-red-600 hover:text-red-700'
                                : 'text-outline hover:text-secondary'
                            }`}
                            title={wishlistIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {wishlistIds.includes(product.id) ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}</div>

            {/* Pagination */}
            <div className="mt-auto flex justify-center items-center gap-2 pt-8 border-t border-outline-variant/30">
              <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-colors rounded disabled:opacity-50" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary text-xs font-label-upper rounded">1</button>
              <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary text-xs font-label-upper transition-colors rounded">2</button>
              <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary text-xs font-label-upper transition-colors rounded">3</button>
              <button className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-colors rounded">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
