'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import FestivalCampaignBanner from '@/components/FestivalCampaignBanner';
import { fetchApi } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { useAuth } from '@/context/AuthContext';
import { getLocalWishlist, toggleWishlistItem } from '@/lib/wishlist';
import { useStoreSettings } from '@/lib/settings';

export default function HomePage() {
  const { token } = useAuth();
  const { settings: storeSettings } = useStoreSettings();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoEmail, setPromoEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [mcxRate, setMcxRate] = useState(84500);
  const [signupCode, setSignupCode] = useState('VANITY10');
  const [signupPercent, setSignupPercent] = useState(10);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [showVideoCard, setShowVideoCard] = useState(false);
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;
    }
    return '';
  };

  const defaultSlides = [
    {
      id: 0,
      image_path: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1920&q=85',
      headline: 'Online jewellery shopping in Kolkata',
      subtext: 'Silver, brass, precious & semi-precious stone jewellery with CZ diamonds — delivered across Kolkata and West Bengal.',
      cta_text: 'Shop now',
      cta_link: '/shop',
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    // Parallel data loading for maximum performance
    Promise.allSettled([
      fetchApi('/products?bestseller=1&limit=4'),
      fetchApi('/products?limit=8'),
      fetchApi('/hero-slides'),
      fetchApi('/silver-rate'),
      fetchApi('/settings/public'),
    ]).then(([bestsellerRes, productsRes, slidesRes, rateRes, settingsRes]) => {
      if (bestsellerRes.status === 'fulfilled' && bestsellerRes.value.success) {
        setBestsellers(bestsellerRes.value.products.slice(0, 4));
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.success) {
        setProducts(productsRes.value.products.slice(0, 8));
      }
      if (slidesRes.status === 'fulfilled' && slidesRes.value.success && slidesRes.value.slides?.length > 0) {
        setSlides(slidesRes.value.slides);
      }
      if (rateRes.status === 'fulfilled' && rateRes.value.success) {
        setMcxRate(Number(rateRes.value.rate) * 1000);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
        const s = settingsRes.value.settings || {};
        const isVideoCardEnabled = s.campaign_show_video_card === '1' || s.campaign_show_video_card === true;
        const videoUrl = s.campaign_active_video_url || '';
        setShowVideoCard(Boolean(isVideoCardEnabled && videoUrl.trim().length > 0));
        setHeroVideoUrl(videoUrl);
      }
    });
  }, []);

  // Autoplay carousel logic
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const forcePromo = urlParams.get('promo') === 'true' || isLocalhost;
      
      const subscribed = localStorage.getItem('vanity_subscribed');
      const closedAtStr = localStorage.getItem('vanity_promo_closed_at');
      
      if (subscribed === 'true' && !forcePromo) return;
      
      if (closedAtStr && !forcePromo) {
        const closedAt = parseInt(closedAtStr, 10);
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days frequency cap
        if (now - closedAt < sevenDays) {
          return;
        }
      }
      
      const timer = setTimeout(() => {
        setShowPromoModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    setShowPromoModal(false);
    localStorage.setItem('vanity_promo_closed_at', Date.now().toString());
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoEmail.trim()) return;
    try {
      const res = await fetchApi('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: promoEmail })
      });
      if (res.success) {
        setSignupCode(res.coupon_code);
        setSignupPercent(res.discount_percent);
        setIsSubscribed(true);
        localStorage.setItem('vanity_subscribed', 'true');
      } else {
        alert(res.message || 'Newsletter signup failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while signing up.');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden">

      <StorefrontNavbar />

      {/* Main Content */}
      <main className="w-full">

        {/* Hero Section */}
        <section className="relative w-full h-[716px] md:h-[870px] bg-[#ecdcc0] overflow-hidden border-b border-outline-variant/30">
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-start justify-center pt-16 md:pt-24 ${
                  isActive ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-full pointer-events-none'
                }`}
              >
                <div
                  className="absolute inset-0 opacity-90 w-full h-full bg-no-repeat bg-cover"
                  style={{
                    backgroundImage: `url('${slide.image_path}')`,
                    backgroundPosition: 'center 15%',
                    backgroundColor: '#ecdcc0'
                  }}
                />
                <div className="relative z-10 text-center px-5 flex flex-col items-center max-w-4xl">
                  <span className="font-label-upper text-label-upper tracking-widest text-primary uppercase mb-4 block bg-white/80 px-4 py-1 backdrop-blur-sm border border-outline-variant/20 text-xs">
                    The Festive Edit
                  </span>
                  {slide.headline && (
                    <h1 className="font-display-lg text-display-lg text-primary mb-6 max-w-3xl drop-shadow-sm">
                      {slide.headline}
                    </h1>
                  )}
                  {slide.subtext && (
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl bg-white/60 px-6 py-2 backdrop-blur-sm rounded-sm">
                      {slide.subtext}
                    </p>
                  )}
                  {slide.cta_text && (
                    <a className="bg-primary text-on-primary font-body-md text-body-md px-8 py-3 rounded hover:bg-on-surface-variant transition-colors inline-block w-fit" href={slide.cta_link || '/shop'}>
                      {slide.cta_text}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Carousel Controls */}
          {activeSlides.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 hover:bg-white/70 text-primary flex items-center justify-center transition-all focus:outline-none shadow-sm"
                aria-label="Previous slide"
              >
                <span className="material-symbols-outlined text-[28px]">chevron_left</span>
              </button>
              {/* Next Button */}
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % activeSlides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/40 hover:bg-white/70 text-primary flex items-center justify-center transition-all focus:outline-none shadow-sm"
                aria-label="Next slide"
              >
                <span className="material-symbols-outlined text-[28px]">chevron_right</span>
              </button>
              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Floating Video Card Overlapping Carousel */}
          {showVideoCard && heroVideoUrl && (
            <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 w-[90%] md:w-[350px] bg-white border border-[#9A7E44]/30 rounded-lg shadow-2xl p-4 z-20 flex flex-col hidden md:flex transition-all hover:scale-105 duration-300">
              <div className="text-[10px] font-bold text-[#9A7E44] uppercase tracking-widest border-b border-outline-variant/20 pb-2 mb-3 flex items-center justify-between">
                <span>Excellence Showcase</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9A7E44] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9A7E44]"></span>
                </span>
              </div>
              
              <div className="aspect-[4/3] w-full rounded bg-surface-container overflow-hidden border border-outline-variant/15 relative">
                {getYouTubeEmbedUrl(heroVideoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(heroVideoUrl)}
                    className="w-full h-full object-cover pointer-events-none"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                    title="Craftsmanship Showcase Video"
                  />
                ) : (
                  <video 
                    src={heroVideoUrl} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wide">Artisan Heritage Video</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                  Experience the craftsmanship of raw sterling silver transitioning into modern heirlooms.
                </p>
                <Link 
                  href="/shop" 
                  className="mt-3 block text-center bg-primary text-on-primary py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  Shop the Collection
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* All Products / Shop All Grid */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-12 py-16 border-b border-outline-variant/30">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="font-headline-lg text-[28px] md:text-headline-lg text-primary">Shop All</h2>
              <p className="text-on-surface-variant text-sm mt-1">Exquisite handcrafted silver ornaments for everyday luxury.</p>
            </div>
            <Link href="/shop" className="font-label-upper text-label-upper text-secondary hover:text-primary transition-colors flex items-center gap-1 border-b border-secondary hover:border-primary pb-0.5 text-xs">
              VIEW ALL <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex flex-col h-full animate-pulse">
                  {/* Image Skeleton */}
                  <div className="aspect-[4/5] bg-surface-container-high border border-outline-variant/15 mb-4 rounded-sm" />
                  {/* Title Skeleton */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-surface-container-high w-3/4 rounded" />
                    <div className="h-5 bg-surface-container-high w-5 rounded-full" />
                  </div>
                  {/* Material description Skeleton */}
                  <div className="h-3 bg-surface-container-high w-1/2 rounded mb-3" />
                  {/* Price Skeleton */}
                  <div className="h-5 bg-surface-container-high w-1/3 rounded mt-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low border border-outline-variant/20 rounded">
              <p className="text-on-surface-variant text-sm">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => {
                const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
                const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;

                let tag = null;
                let tagColor = '';
                if (product.is_new_arrival) {
                  tag = 'New';
                  tagColor = 'bg-primary text-white';
                } else if (product.is_bestseller) {
                  tag = 'Best Seller';
                  tagColor = 'bg-secondary text-on-secondary';
                }

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer flex flex-col h-full">
                    <div className="relative aspect-[4/5] bg-surface-container-low mb-4 border border-outline-variant/20 overflow-hidden">
                      {tag && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`${tagColor} font-label-upper text-[10px] px-2 py-1 tracking-wider uppercase`}>{tag}</span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${imgUrl}')` }}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/50 to-transparent flex justify-center">
                        <span className="bg-white text-primary w-full py-2 font-label-upper text-label-upper hover:bg-primary hover:text-white transition-colors border border-primary text-xs text-center">
                          QUICK VIEW
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-body-md text-body-md font-semibold text-primary truncate pr-2">{product.name}</h3>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await toggleWishlistItem(product.id, token);
                          }}
                          className={`shrink-0 p-1 transition-colors ${
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
                      <p className="font-price-sm text-price-sm text-on-surface-variant mb-2">{material}</p>
                      <p className="font-price-display text-price-display text-primary mt-auto">{priceText}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <section className="bg-surface-container-low border-b border-outline-variant/30 py-8">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12 flex justify-center items-center">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-secondary">local_shipping</span>
                <div>
                  <p className="font-label-upper text-label-upper text-primary text-xs">Free Shipping</p>
                  <p className="text-sm text-on-surface-variant">Pan India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-secondary">percent</span>
                <div>
                  <p className="font-label-upper text-label-upper text-primary text-xs">15% Off Making</p>
                  <p className="text-sm text-on-surface-variant">First Order</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-secondary">verified</span>
                <div>
                  <p className="font-label-upper text-label-upper text-primary text-xs">BIS Hallmarked</p>
                  <p className="text-sm text-on-surface-variant">Authentic 92.5</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[28px] text-secondary">assignment_return</span>
                <div>
                  <p className="font-label-upper text-label-upper text-primary text-xs">7-Day Returns</p>
                  <p className="text-sm text-on-surface-variant">Hassle Free</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bestsellers Section */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-12 py-12 border-b border-outline-variant/30">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-lg text-[28px] md:text-headline-lg text-primary">Bestsellers</h2>
            <Link href="/shop" className="font-label-upper text-label-upper text-secondary hover:text-primary transition-colors flex items-center gap-1 border-b border-secondary hover:border-primary pb-0.5 text-xs">
              VIEW ALL <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          {/* Horizontal Scroll */}
          {loading ? (
            <div className="flex justify-center items-center py-20 w-full">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {bestsellers.map((product) => {
                const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
                const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;

                let tag = null;
                let tagColor = '';
                if (product.is_new_arrival) {
                  tag = 'New';
                  tagColor = 'bg-primary text-white';
                } else if (product.is_bestseller) {
                  tag = 'Best Seller';
                  tagColor = 'bg-secondary text-on-secondary';
                }

                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="min-w-[260px] max-w-[260px] md:min-w-[300px] md:max-w-[300px] snap-start group cursor-pointer flex flex-col">
                    <div className="relative aspect-[4/5] bg-surface-container-low mb-4 border border-outline-variant/20 overflow-hidden">
                      {tag && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`${tagColor} font-label-upper text-[10px] px-2 py-1 tracking-wider uppercase`}>{tag}</span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url('${imgUrl}')` }}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/50 to-transparent flex justify-center">
                        <span className="bg-white text-primary w-full py-2 font-label-upper text-label-upper hover:bg-primary hover:text-white transition-colors border border-primary text-xs text-center">
                          QUICK VIEW
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-body-md text-body-md font-semibold text-primary truncate pr-2">{product.name}</h3>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await toggleWishlistItem(product.id, token);
                          }}
                          className={`shrink-0 p-1 transition-colors ${
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
                      <p className="font-price-sm text-price-sm text-on-surface-variant mb-2">{material}</p>
                      <p className="font-price-display text-price-display text-primary mt-auto">{priceText}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Store Locator Section */}
        <section className="bg-surface-bright py-12 border-b border-outline-variant/30">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="w-full h-[300px] md:h-[400px] bg-surface-container border border-outline-variant/30 overflow-hidden relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDq8kFfiMGksTl9Rkm7Q7nbmXT4SCa6gDwPRdMx_XgzBRrRlq50HgXQoD1nEmOhwtH3hPsargkGkhFJtvdA7G6b867zjHS_uUTRWsF82hmQmsYA9Svi9a8oqUjqp9y6BJk_pT0ThFn7M_i9M91lzXFwoNNI1vTGFtubNo-clG72p_U5M06YSaO3MKqYxOa6RbGRr5_OFF2eOxmofUOeAWYj-zw0UwZasdV_busU1LvOAFqHvs_rjKM')`
                }}
              />
            </div>
            <div>
              <h2 className="font-headline-lg text-[28px] md:text-headline-lg text-primary mb-4">Visit Our Flagship Store</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                Experience our modern heirlooms in person. Our studio offers personalized consultations and exclusive collections not available online.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-1">location_on</span>
                  <div>
                    <p className="font-semibold text-primary">Vanity Atelier</p>
                    <p className="text-on-surface-variant">{storeSettings.store_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">schedule</span>
                  <p className="text-on-surface-variant">Mon - Sat: 11:00 AM - 8:00 PM</p>
                </div>
              </div>
              <a 
                className="border border-primary text-primary hover:bg-primary hover:text-white font-label-upper text-label-upper px-8 py-3 transition-colors inline-block text-center w-full md:w-auto text-xs font-semibold uppercase tracking-wider" 
                href={`https://maps.google.com/?q=${encodeURIComponent(storeSettings.store_address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GET DIRECTIONS
              </a>
            </div>
          </div>
        </section>

      </main>

      <StorefrontFooter />

      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white p-8 shadow-xl border border-outline-variant/30 flex flex-col items-center text-center rounded-lg">
            {/* Close Button */}
            <button 
              onClick={handleClosePromo}
              aria-label="Close modal" 
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {isSubscribed ? (
              <div className="flex flex-col items-center w-full py-4">
                <div className="mb-6 w-16 h-16 bg-[#fedb98]/20 rounded-full flex items-center justify-center border border-[#9A7E44]/20 animate-bounce">
                  <span className="material-symbols-outlined text-[#9A7E44] text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="font-headline-lg text-2xl text-primary mb-2 font-bold uppercase tracking-wide">YOU&apos;RE UNLOCKED!</h2>
                <p className="font-body-md text-sm text-on-surface-variant mb-6">Enjoy {signupPercent}% off your modern heirlooms.</p>
                
                <div className="bg-surface-container-low border border-outline-variant/30 px-6 py-4 rounded mb-6 font-mono font-bold text-xl tracking-widest text-[#9A7E44] select-all flex flex-col items-center gap-1 w-full bg-slate-50 border-dashed">
                  <span className="text-[10px] text-on-surface-variant font-sans font-medium uppercase tracking-widest">COUPON CODE</span>
                  <span>{signupCode}</span>
                </div>

                <button
                  onClick={handleClosePromo}
                  className="w-full bg-primary text-on-primary py-3 px-6 font-label-upper text-label-upper tracking-wider hover:bg-[#1A1A1A] transition-colors uppercase text-xs rounded"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Content */}
                <div className="mb-6 w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                </div>
                <h2 className="font-headline-lg text-2xl text-primary mb-2">UNLOCK {signupPercent}% OFF</h2>
                <p className="font-body-md text-sm text-on-surface-variant mb-8">Sign up now and save on your first order.</p>
                {/* Form */}
                <form onSubmit={handlePromoSubmit} className="w-full flex flex-col gap-4">
                  <div className="relative w-full">
                    <input 
                      className="w-full px-4 py-3 bg-white border border-outline-variant/50 placeholder-on-surface-variant/70 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-sm rounded" 
                      id="promo-email" 
                      placeholder="Email address" 
                      required 
                      type="email"
                      value={promoEmail}
                      onChange={e => setPromoEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    className="w-full bg-primary text-on-primary py-3 px-6 font-label-upper text-label-upper tracking-wider hover:bg-primary/90 transition-colors focus:outline-none uppercase text-xs rounded" 
                    type="submit"
                  >
                    Sign Up
                  </button>
                </form>
                <p className="mt-6 text-xs text-on-surface-variant/70 font-body-md">By signing up, you agree to our Terms &amp; Privacy Policy.</p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
