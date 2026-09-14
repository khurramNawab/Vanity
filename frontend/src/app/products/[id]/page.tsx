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
        if (res.success) {
          setProduct(res.product);
          setRelatedProducts(res.related || []);
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

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
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
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-grow order-1 md:order-2 bg-surface-container-lowest border border-outline-variant/20 relative group">
              <img
                src={productThumbnails[selectedThumb]}
                alt={product.name}
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
                <p className="font-label-upper text-label-upper text-on-surface uppercase tracking-wider text-xs">BIS Hallmarked Excellence</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Authenticity Guaranteed. Certificate included.</p>
              </div>
            </div>

            {/* Spec table */}
            <div className="mb-5 border border-outline-variant/20">
              <div className="flex justify-between py-2 px-3 bg-surface-container-low text-sm"><span className="text-on-surface-variant">Weight</span><span className="font-medium">{product.silver_weight} g</span></div>
              <div className="flex justify-between py-2 px-3 text-sm"><span className="text-on-surface-variant">Purity</span><span className="font-medium">{product.silver_purity} Fine Silver</span></div>
              <div className="flex justify-between py-2 px-3 bg-surface-container-low text-sm"><span className="text-on-surface-variant">Making Charge</span><span className="font-medium">₹{Number(product.price_breakdown?.making_charge_snapshot || 300).toLocaleString('en-IN')} (Included)</span></div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex gap-4 h-12">
                {/* Qty stepper */}
                <div className="flex items-center justify-between border border-outline-variant w-32 bg-surface">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="font-body-md text-body-md">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                {/* Add to cart */}
                <button onClick={handleAddToCart} className="flex-grow bg-primary text-on-primary font-body-md font-medium hover:bg-inverse-surface transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  Add to Cart
                </button>
                {/* Wishlist */}
                <button
                  onClick={handleToggleWishlist}
                  className="w-12 h-12 flex items-center justify-center border border-outline-variant hover:border-[#9A7E44] transition-colors group"
                >
                  <span className={`material-symbols-outlined text-on-surface-variant group-hover:text-[#9A7E44] transition-colors ${wishlist ? 'text-[#9A7E44]' : ''}`} style={{ fontVariationSettings: wishlist ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                </button>
              </div>
              <button onClick={handleAddToCart} className="w-full h-12 border border-primary text-primary font-body-md font-medium hover:bg-surface-container-low transition-colors">
                Buy Now
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-outline-variant/30">
              {[
                { title: 'Product Details', content: product.description },
                { title: 'Care Instructions', content: 'Store in the provided anti-tarnish pouch when not in use. Avoid direct contact with perfumes, lotions, and harsh chemicals. Clean gently with a soft polishing cloth.' },
                { title: 'Shipping & Returns', content: 'Free fully insured shipping on all orders above ₹5,000. 15-day hassle-free return policy. Customized or engraved items are non-returnable.' },
              ].map(({ title, content }) => (
                <details key={title} className="group border-b border-outline-variant/30">
                  <summary className="flex justify-between items-center cursor-pointer list-none py-4 text-on-surface hover:text-primary transition-colors">
                    <span className="font-label-upper text-label-upper uppercase tracking-wider text-xs">{title}</span>
                    <span className="transition group-open:rotate-180">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </span>
                  </summary>
                  <div className="text-on-surface-variant text-sm mb-4 leading-relaxed pb-2">{content}</div>
                </details>
              ))}
            </div>

            {/* Trust icons */}
            <div className="flex items-center gap-4 mt-6 text-on-surface-variant opacity-70">
              <span className="material-symbols-outlined" title="Secure Checkout">lock</span>
              <span className="material-symbols-outlined" title="Insured Shipping">local_shipping</span>
              <span className="material-symbols-outlined" title="Lifetime Warranty">workspace_premium</span>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-20 pt-12 border-t border-outline-variant/20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-md text-headline-md text-primary">Curated For You</h2>
            <Link href="/shop" className="font-label-upper text-label-upper text-on-surface-variant hover:text-primary uppercase tracking-widest border-b border-outline-variant pb-1 transition-all text-xs">View All</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((item, i) => {
              const relImg = item.images?.find((img: any) => img.is_primary) || item.images?.[0];
              const relImgUrl = relImg ? relImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
              return (
                <Link key={i} href={`/products/${item.id}`} className="group block">
                  <div className="w-full aspect-[3/4] bg-surface-container-low mb-3 relative overflow-hidden border border-outline-variant/10">
                    <img src={relImgUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="font-body-md text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">₹{Number(item.calculated_price).toLocaleString('en-IN')}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
