'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { fetchApi } from '@/lib/api';

import { useAuth } from '@/context/AuthContext';

const INITIAL_ITEMS = [
  { id: 7, name: 'Vintage Filigree Choker', sku: 'VN-NK-007', material: '92.5 Sterling Silver', price: 12499, qty: 1, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACi7nk_1h6A-QUWQx_bdyyBdf2U0A2OgqB36bjBCAAtSRTEc_zvQ3TgxHT2B-DMVYG3QF7_SQIFKXFowpT8denAv2jBdqkQBnNhT5aUm-2NKUVC0e-ryzVW1N2Qk18rMqtzWU3MehoHBjy4Jr0Go-H-BJF2V8-tKVbtY2gQ-i0_rqOIbTdLNovMR_PD7y70MsRbRR5wAZMUS9VNgi7G-3fd9JW0i3J2e5YKi6RfldgZh6qr58BInQ' },
];

export default function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanity_cart');
      const localCart = stored ? JSON.parse(stored) : [];
      
      const storedCoupon = localStorage.getItem('vanity_applied_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
      
      setLoading(true);
      fetchApi('/products')
        .then(res => {
          if (res.success) {
            const dbProductsMap = new Map(res.products.map((p: any) => [p.id, p]));
            
            const updatedItems = localCart.map((item: any) => {
              const dbProd: any = dbProductsMap.get(item.id);
              if (dbProd) {
                const primaryImg = dbProd.images?.find((img: any) => img.is_primary) || dbProd.images?.[0];
                const imgUrl = primaryImg ? primaryImg.image_path : item.img;
                const materialText = dbProd.silver_purity === '925' ? '925 Sterling Silver' : (dbProd.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                return {
                  ...item,
                  name: dbProd.name,
                  price: Number(dbProd.calculated_price),
                  img: imgUrl,
                  material: materialText,
                };
              }
              return item;
            });
            setItems(updatedItems);
            localStorage.setItem('vanity_cart', JSON.stringify(updatedItems));
          } else {
            setItems(localCart);
          }
        })
        .catch(err => {
          console.error('Error fetching live cart prices:', err);
          setItems(localCart);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const updateQty = (id: number, delta: number) => {
    setItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
      localStorage.setItem('vanity_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (id: number) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('vanity_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const res = await fetchApi('/coupons/apply', {
        method: 'POST',
        body: JSON.stringify({ code: coupon, amount: subtotal })
      });
      if (res.success) {
        const couponData = {
          code: res.code,
          discount: Number(res.discount),
          type: res.type,
          value: Number(res.value)
        };
        setAppliedCoupon(couponData);
        localStorage.setItem('vanity_applied_coupon', JSON.stringify(couponData));
        setCouponSuccess(`Coupon "${res.code}" applied successfully!`);
      } else {
        setCouponError(res.message || 'Failed to apply coupon.');
      }
    } catch (err) {
      console.error(err);
      setCouponError('Invalid coupon code or server error.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponSuccess(null);
    setCouponError(null);
    localStorage.removeItem('vanity_applied_coupon');
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const shipping = subtotal >= 5000 ? 0 : 199;
  const total = Math.max(0, subtotal - couponDiscount) + shipping;

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">Shopping Cart</li>
          </ol>
        </nav>

        {/* Admin Mode Alert Banner */}
        {user?.role === 'admin' && (
          <div className="mb-6 p-4 bg-[#1A1A1A] text-white border border-[#9A7E44]/40 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#9A7E44] text-2xl">admin_panel_settings</span>
              <div>
                <p className="font-semibold text-xs text-[#9A7E44] uppercase tracking-wider">Administrator Mode Active</p>
                <p className="text-xs text-white/80">You are viewing the customer storefront cart as Administrator ({user.email}).</p>
              </div>
            </div>
            <Link href="/admin" className="bg-[#9A7E44] text-white text-xs px-4 py-2 rounded font-bold hover:bg-white hover:text-black transition-colors whitespace-nowrap">
              Return to Admin Dashboard &rarr;
            </Link>
          </div>
        )}

        <h1 className="font-headline-lg text-headline-lg text-primary mb-8">
          Shopping Cart
          {!loading && items.length > 0 && <span className="text-on-surface-variant text-lg font-normal ml-3">({items.length} {items.length === 1 ? 'item' : 'items'})</span>}
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Updating dynamic cart values...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4">shopping_bag</span>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">Your cart is empty</h2>
            <p className="text-on-surface-variant mb-8">Looks like you haven't added any jewellery yet.</p>
            <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 hover:bg-inverse-surface transition-colors font-label-upper text-label-upper text-xs">
              Browse Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping progress */}
              {shipping > 0 && (
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4">
                  <p className="text-sm text-on-surface-variant mb-2">
                    Add <span className="font-semibold text-primary">₹{(5000 - subtotal).toLocaleString('en-IN')}</span> more for free shipping!
                  </p>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (subtotal / 5000) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {shipping === 0 && (
                <div className="bg-[#e8f5e9] border border-[#a5d6a7] rounded-lg p-4 flex items-center gap-2 text-[#137333] text-sm">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  You qualify for free shipping!
                </div>
              )}

              {items.map(item => (
                <div key={item.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-4 flex gap-4">
                  <div className="w-24 h-28 bg-surface-container-low border border-outline-variant/10 flex-shrink-0 overflow-hidden rounded">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-primary">{item.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">{item.material}</p>
                        <p className="text-xs text-on-surface-variant font-mono mt-0.5">SKU: {item.sku}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-error/60 hover:text-error transition-colors p-1">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-3">
                      {/* Qty stepper */}
                      <div className="flex items-center border border-outline-variant/30 bg-surface">
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                      <span className="font-price-display text-price-display text-primary">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue shopping */}
              <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary — 1 col */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-6 sticky top-6">
                <h2 className="font-headline-md text-headline-md text-primary mb-4">Order Summary</h2>

                {/* Coupon */}
                {!appliedCoupon ? (
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-outline-variant/30 px-3 py-2 text-sm focus:outline-none focus:border-primary rounded uppercase"
                        placeholder="Coupon code (e.g. VANITY10)"
                        value={coupon}
                        onChange={e => setCoupon(e.target.value)}
                      />
                      <button onClick={handleApplyCoupon} className="bg-surface-container-high border border-outline-variant/30 px-4 py-2 text-sm font-label-upper hover:bg-surface-container transition-colors rounded">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-xs mt-1 font-medium">{couponError}</p>}
                  </div>
                ) : (
                  <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-3 rounded mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#137333] font-semibold uppercase tracking-wider">Coupon Applied</p>
                      <p className="text-sm font-bold text-primary">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">Saved ₹{appliedCoupon.discount.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-red-700 hover:text-red-900 transition-colors text-xs font-semibold uppercase tracking-wider">
                      Remove
                    </button>
                  </div>
                )}
                {couponSuccess && !appliedCoupon && <p className="text-[#137333] text-xs mb-4 font-medium">{couponSuccess}</p>}

                <div className="space-y-3 py-4 border-t border-b border-outline-variant/20 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-[#137333]">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className={shipping === 0 ? 'text-[#137333] font-medium' : 'font-medium'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-primary">Total</span>
                  <span className="font-price-display text-price-display text-primary font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-primary text-on-primary py-3 hover:bg-inverse-surface transition-colors font-label-upper text-label-upper flex items-center justify-center gap-2 rounded text-xs"
                >
                  Proceed to Checkout
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>

                <div className="flex items-center justify-center gap-3 mt-4 text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span className="text-xs">Secure checkout — SSL encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
