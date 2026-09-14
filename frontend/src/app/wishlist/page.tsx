'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';

export default function WishlistPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      if (token) {
        // Authenticated database-backed wishlist
        const res = await fetchApi('/wishlist');
        if (res.success) {
          setProducts(res.products || []);
        }
      } else {
        // Guest localStorage-backed wishlist
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('vanity_wishlist');
          const localIds: number[] = stored ? JSON.parse(stored) : [];
          
          if (localIds.length > 0) {
            // Load actual product details for these IDs
            const res = await fetchApi('/products');
            if (res.success) {
              const matched = res.products.filter((p: any) => localIds.includes(p.id));
              setProducts(matched);
            }
          } else {
            setProducts([]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading wishlist items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleRemove = async (productId: number) => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vanity_wishlist');
        const localIds: number[] = stored ? JSON.parse(stored) : [];
        const updated = localIds.filter(id => id !== productId);
        localStorage.setItem('vanity_wishlist', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('vanity_wishlist_updated', { detail: { ids: updated } }));
      }

      if (token) {
        await fetchApi('/wishlist', {
          method: 'POST',
          body: JSON.stringify({ product_id: productId })
        });
      }
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (product: any) => {
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
        qty: 1,
        img: imgUrl
      };
      const existingIdx = cart.findIndex((i: any) => i.id === item.id);
      if (existingIdx > -1) {
        cart[existingIdx].qty += 1;
      } else {
        cart.push(item);
      }
      localStorage.setItem('vanity_cart', JSON.stringify(cart));
      alert(`"${product.name}" added to cart successfully!`);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-8">
        <Breadcrumbs items={[{ label: 'My Wishlist' }]} className="mb-6" />
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">My Wishlist</h1>
        <p className="text-on-surface-variant text-sm mb-8">Your saved jewellery collection.</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-xs">Loading saved favourites...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4">favorite</span>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Your wishlist is empty</h2>
            <p className="text-on-surface-variant mb-8">Save your favourite pieces to review them here.</p>
            <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 hover:bg-inverse-surface transition-colors font-label-upper text-label-upper text-xs">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
              const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
              const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
              const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;

              return (
                <div key={product.id} className="group relative border border-outline-variant/15 p-3 rounded bg-white flex flex-col">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-5 right-5 z-10 bg-white/80 p-1.5 rounded-full hover:bg-red-50 text-red-700 transition-colors shadow-sm"
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>

                  <Link href={`/products/${product.id}`} className="block flex-grow">
                    <div className="w-full aspect-[3/4] bg-surface-container-low mb-3 relative overflow-hidden border border-outline-variant/10">
                      <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <h3 className="font-body-md text-sm font-medium text-on-surface group-hover:text-secondary transition-colors truncate">{product.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{material}</p>
                    <p className="text-sm text-primary font-semibold mt-1 mb-4">{priceText}</p>
                  </Link>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-2 bg-primary text-on-primary rounded text-xs font-label-upper hover:bg-inverse-surface transition-colors mt-auto uppercase tracking-wider font-semibold"
                  >
                    Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
