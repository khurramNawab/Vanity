'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toggleWishlistItem } from '@/lib/wishlist';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const productId = params?.id ? params.id : '1';

  useEffect(() => {
    setLoading(true);
    fetchApi(`/products/${productId}`)
      .then(res => {
        if (res.success && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.related || []);

          // Dynamic SEO Document Title & Meta Tag Injection
          const seoTitle = res.product.meta_title || `${res.product.name} | 925 Sterling Silver Jewellery | Vanity`;
          document.title = seoTitle;

          // Update meta description
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', res.product.meta_description || res.product.description || `Handcrafted ${res.product.name} in 925 sterling silver with BIS Hallmark.`);

          // Update meta keywords
          if (res.product.meta_keywords) {
            let metaKeys = document.querySelector('meta[name="keywords"]');
            if (!metaKeys) {
              metaKeys = document.createElement('meta');
              metaKeys.setAttribute('name', 'keywords');
              document.head.appendChild(metaKeys);
            }
            metaKeys.setAttribute('content', res.product.meta_keywords);
          }
        }
      })
      .catch(err => console.error('Error fetching product detail:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  // Check wishlist state on mount or token load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanity_wishlist');
      const localIds = stored ? JSON.parse(stored) : [];
      setWishlist(localIds.includes(Number(productId)));
    }
  }, [productId]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const isAdded = await toggleWishlistItem(product.id, token);
      setWishlist(isAdded);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanity_cart');
      const cart = stored ? JSON.parse(stored) : [];
      
      const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
      const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
      const materialText = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');

      const item = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        material: materialText,
        price: Number(product.calculated_price),
        qty: qty,
        img: imgUrl
      };
      const existingIdx = cart.findIndex((i: any) => i.id === item.id);
      if (existingIdx > -1) {
        cart[existingIdx].qty += qty;
      } else {
        cart.push(item);
      }
      localStorage.setItem('vanity_cart', JSON.stringify(cart));
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Fetching dynamic jewellery specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4">search_off</span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Ornament Not Found</h1>
        <p className="text-on-surface-variant mb-8 text-center max-w-sm">We couldn&apos;t load the specs for this item. It may have been disabled or deleted.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-opacity-90">
          Return to Shop
        </Link>
      </div>
    );
  }

  const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
  const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
  const effectiveAlt = primaryImg?.alt_text || product.name || 'Vanity 925 Sterling Silver Jewellery';
  const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
  const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;
  const basePriceText = `₹${(Number(product.calculated_price) * 1.25).toLocaleString('en-IN')}`;

  // Build image thumbnails array
  const productThumbnails = [
    imgUrl,
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  ];

  // Google Rich Snippets JSON-LD Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => img.image_path) || [imgUrl],
    description: product.meta_description || product.description || `Handcrafted 925 sterling silver ${product.name} by Vanity Jewels.`,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Vanity | Modern Heirlooms',
    },
    material: material,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : `https://thevanityjewels.com/products/${product.slug || product.id}`,
      priceCurrency: 'INR',
      price: product.calculated_price || product.base_price || 0,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock_quantity ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Vanity Jewels',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      {/* Inject Google JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <StorefrontNavbar activePath="/shop" />

      {/* Urgency strip */}
      <div className="bg-[#6B1111] text-white py-2 text-center">
        <span className="font-label-upper text-label-upper tracking-widest uppercase text-xs">Order within 4 hours for Next Day Delivery</span>
      </div>

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Shop', href: '/shop' },
              { label: product.category?.name || 'Jewellery', href: product.category?.name ? `/shop?category=${encodeURIComponent(product.category.name)}` : '/shop' },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Image Gallery — 7 cols */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Thumbnail strip */}
            <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {productThumbnails.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`w-20 h-24 flex-shrink-0 border transition-all bg-surface-container-low ${
                    selectedThumb === i ? 'border-primary' : 'border-outline-variant/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt={`${effectiveAlt} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-grow order-1 md:order-2 bg-surface-container-lowest border border-outline-variant/20 relative group">
              <img
                src={productThumbnails[selectedThumb]}
                alt={effectiveAlt}
                className="w-full aspect-[4/5] object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#6B1111] text-white font-label-upper text-[10px] px-2 py-1 uppercase tracking-wider">Sale</span>
                {product.is_new_arrival && (
                  <span className="bg-surface-container-high text-on-surface font-label-upper text-[10px] px-2 py-1 uppercase tracking-wider border border-outline-variant">New</span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info — 5 cols */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-5">
              <span className="font-label-upper text-label-upper text-on-surface-variant tracking-[0.1em] uppercase mb-2 block text-xs">{material}</span>
              <h1 className="font-headline-md text-headline-md mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-price-display text-price-display text-[#6B1111] font-semibold">{priceText}</span>
                <span className="text-sm text-on-surface-variant line-through">{basePriceText}</span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                MCX Silver Rate used for pricing (₹{Number(product.price_breakdown?.silver_rate_used || 120).toLocaleString('en-IN')}/g)
              </p>
            </div>

            <hr className="border-t border-outline-variant/20 mb-5" />

            {/* BIS Badge */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-surface-container-low border-l-2 border-[#9A7E44]">
              <span className="material-symbols-outlined text-[#9A7E44] text-2xl">verified</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">BIS Hallmark Certified</p>
                <p className="text-xs text-on-surface-variant">Guaranteed {product.silver_purity} Purity • Certificate of Authenticity Included</p>
              </div>
            </div>

            {/* Weight Breakdown */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 mb-5 space-y-2 text-xs">
              <p className="font-semibold text-primary uppercase tracking-wider text-[11px] mb-2">Purity &amp; Pricing Breakdown</p>
              <div className="flex justify-between text-on-surface-variant">
                <span>Silver Weight</span>
                <span className="font-medium text-primary">{product.silver_weight}g</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Silver Purity</span>
                <span className="font-medium text-primary">{product.silver_purity} (BIS Standard)</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Making Charges</span>
                <span className="font-medium text-primary">₹{Number(product.making_charge).toLocaleString('en-IN')}{product.making_charge_type === 'percent' ? '%' : ''}</span>
              </div>
              {product.price_breakdown?.gst_amount && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (3% Silver Standard)</span>
                  <span className="font-medium text-primary">₹{Number(product.price_breakdown.gst_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Add to Cart Actions */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-outline-variant/30 rounded">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-primary text-on-primary py-3 px-6 rounded font-label-upper text-label-upper text-xs tracking-wider uppercase hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Add to Bag
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3 border rounded transition-colors ${
                  wishlist ? 'border-[#6B1111] text-[#6B1111] bg-[#6B1111]/5' : 'border-outline-variant/30 text-on-surface-variant hover:text-primary'
                }`}
                title="Wishlist"
              >
                <span className="material-symbols-outlined text-lg">{wishlist ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 text-sm text-on-surface-variant leading-relaxed">
                <h3 className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Description</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-outline-variant/20">
            <h2 className="font-headline-md text-headline-md text-primary font-bold mb-6">Complete the Collection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rel: any) => {
                const relImg = rel.images?.find((img: any) => img.is_primary) || rel.images?.[0];
                const relImgUrl = relImg ? relImg.image_path : 'https://placehold.co/400x500/FAF9F6/1A1A1A?text=No+Image';
                return (
                  <Link key={rel.id} href={`/products/${rel.id}`} className="group block">
                    <div className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded mb-2 relative">
                      <img
                        src={relImgUrl}
                        alt={relImg?.alt_text || rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-semibold text-primary text-sm truncate">{rel.name}</p>
                    <p className="text-xs text-[#6B1111] font-semibold mt-0.5">₹{Number(rel.calculated_price || rel.base_price).toLocaleString('en-IN')}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
