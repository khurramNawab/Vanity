'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useStoreSettings } from '@/lib/settings';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { settings: storeSettings } = useStoreSettings();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  // Checkout Form States
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect admin users away from customer checkout
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin/orders');
    }
  }, [user, router]);

  // Load cart and check for URL recovery session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cartSessionId = params.get('cart_session_id');

      if (cartSessionId) {
        fetchApi(`/checkout/cart-session?id=${cartSessionId}`)
          .then(res => {
            if (res.success && res.session) {
              const session = res.session;
              // Restore cart items
              localStorage.setItem('vanity_cart', JSON.stringify(session.cart_data));
              setCartItems(session.cart_data || []);
              
              // Restore form fields
              setEmail(session.email || '');
              setPhone(session.shipping_phone || '');
              if (session.shipping_name) {
                const parts = session.shipping_name.split(' ');
                setFirstName(parts[0] || '');
                setLastName(parts.slice(1).join(' ') || '');
              }
            }
          })
          .catch(err => console.error('Failed to restore abandoned cart session:', err));
      } else {
        const stored = localStorage.getItem('vanity_cart');
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      }

      const storedCoupon = localStorage.getItem('vanity_applied_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    }
  }, []);

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      
      const addr1 = (user as any).address_line1 || '';
      setAddress(addr1);
      setApartment((user as any).address_line2 || '');
      setCity((user as any).city || '');
      setState((user as any).state || '');
      setZip((user as any).pincode || '');

      const nameParts = (user.name || '').split(' ');
      if (nameParts.length > 0) {
        setFirstName(nameParts[0]);
        if (nameParts.length > 1) {
          setLastName(nameParts.slice(1).join(' '));
        }
      }
    }
  }, [user]);

  const subtotal = cartItems.reduce((s, i) => s + (Number(i.price) || 0) * (i.qty || 1), 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const shipping = fulfillmentMethod === 'pickup' ? 0 : (subtotal >= 5000 ? 0 : 199);
  const total = Math.max(0, subtotal - couponDiscount) + shipping;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Sync progress endpoint on input blur
  const syncCheckoutProgress = async () => {
    if (!email && !phone) return;
    try {
      await fetchApi('/checkout/progress', {
        method: 'POST',
        body: JSON.stringify({
          email,
          shipping_name: `${firstName} ${lastName}`.trim(),
          shipping_phone: phone,
          items: cartItems.map(item => ({
            id: item.id,
            product_id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty
          }))
        })
      });
    } catch (err) {
      console.error('Failed to sync progress:', err);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If delivery is chosen, shipping fields are required
    if (fulfillmentMethod === 'delivery') {
      if (!email || !firstName || !lastName || !address || !city || !state || !zip || !phone) {
        setError('Please fill in all the required shipping and contact details.');
        return;
      }
    } else {
      if (!email || !firstName || !lastName || !phone) {
        setError('Please fill in contact information.');
        return;
      }
    }

    setIsSubmitting(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError('Failed to load Razorpay SDK. Please check your internet connection.');
      setIsSubmitting(false);
      return;
    }

    try {
      const cartPayload = cartItems.map(item => ({
        product_id: item.id,
        qty: item.qty
      }));

      // Initiate order
      const initiateRes = await fetchApi('/checkout/initiate', {
        method: 'POST',
        body: JSON.stringify({
          items: cartPayload,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          shipping_name: `${firstName} ${lastName}`,
          shipping_address: fulfillmentMethod === 'pickup' ? `STORE PICKUP: ${storeSettings.store_address}` : address,
          shipping_apartment: fulfillmentMethod === 'pickup' ? '' : apartment,
          shipping_city: fulfillmentMethod === 'pickup' ? 'Kolkata' : city,
          shipping_state: fulfillmentMethod === 'pickup' ? 'West Bengal' : state,
          shipping_zip: fulfillmentMethod === 'pickup' ? '700027' : zip,
          shipping_phone: phone,
          shipping_email: email,
          fulfillment_method: fulfillmentMethod
        })
      });

      if (!initiateRes.success) {
        throw new Error(initiateRes.message || 'Failed to initiate order.');
      }

      const { razorpay_order_id, amount, currency, order_id } = initiateRes;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount,
        currency: currency,
        order_id: razorpay_order_id,
        name: 'Vanity Jewels',
        description: 'Premium Silver Jewellery Purchase',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80',
        handler: async function (response: any) {
          setIsSubmitting(true);
          try {
            const verifyRes = await fetchApi('/checkout/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.success) {
              throw new Error(verifyRes.message || 'Signature verification failed.');
            }

            localStorage.removeItem('vanity_cart');
            localStorage.removeItem('vanity_applied_coupon');

            const redirectQuery = new URLSearchParams();
            redirectQuery.set('order_id', String(verifyRes.order.id));
            if (verifyRes.order.order_number) redirectQuery.set('order_number', verifyRes.order.order_number);
            if (verifyRes.order.shipping_email) redirectQuery.set('email', verifyRes.order.shipping_email);

            router.push(`/order-confirmation?${redirectQuery.toString()}`);
          } catch (verifyErr: any) {
            setError(verifyErr.message || 'Payment signature verification failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#1A1A1A',
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong while initiating payment.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col">
      <div className="bg-[#6B1111] text-white py-2 text-center text-xs font-label-upper tracking-widest uppercase">
        COMPLIMENTARY SECURE SHIPPING ON ORDERS OVER ₹5,000
      </div>

      <header className="w-full max-w-[1280px] mx-auto px-5 md:px-12 py-6 flex justify-between items-center border-b border-outline-variant/30">
        <Link href="/" className="font-headline-md text-headline-md font-display-lg text-primary tracking-tight font-bold">
          Vanity
        </Link>
        <Link href="/cart" className="text-sm underline text-on-surface-variant hover:text-primary">
          Return to Cart
        </Link>
      </header>

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form details */}
          <form onSubmit={handlePayment} className="lg:col-span-7 space-y-6">
            <div className="flex items-center text-xs mb-6 space-x-2 font-label-upper text-on-surface-variant">
              <span className="font-semibold text-primary">Information</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Details</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Payment</span>
            </div>

            {error && (
              <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded text-sm">
                {error}
              </div>
            )}

            {/* Contact Info */}
            <section className="pb-6 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md mb-4">1. Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1" htmlFor="email">Email address *</label>
                  <input
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={syncCheckoutProgress}
                  />
                </div>
              </div>
            </section>

            {/* Fulfillment Selector */}
            <section className="pb-6 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md mb-4">2. Delivery Preference</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('delivery')}
                  className={`p-4 border rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    fulfillmentMethod === 'delivery'
                      ? 'border-[#9A7E44] bg-[#9A7E44]/5 text-[#9A7E44] font-semibold'
                      : 'border-outline-variant/30 hover:border-primary/50 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined mb-1">local_shipping</span>
                  <span className="text-sm">Home Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`p-4 border rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    fulfillmentMethod === 'pickup'
                      ? 'border-[#9A7E44] bg-[#9A7E44]/5 text-[#9A7E44] font-semibold'
                      : 'border-outline-variant/30 hover:border-primary/50 text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined mb-1">storefront</span>
                  <span className="text-sm">Store Pickup</span>
                </button>
              </div>
            </section>

            {/* Checkout Addresses */}
            <section className="pb-6 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-headline-md mb-4">
                {fulfillmentMethod === 'pickup' ? '3. Pickup Information' : '3. Shipping Address'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1" htmlFor="firstName">First name *</label>
                  <input
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onBlur={syncCheckoutProgress}
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1" htmlFor="lastName">Last name *</label>
                  <input
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    onBlur={syncCheckoutProgress}
                  />
                </div>

                {fulfillmentMethod === 'pickup' ? (
                  <div className="md:col-span-2 p-4 bg-surface-container-low border border-[#9A7E44]/20 rounded text-sm space-y-2">
                    <p className="font-semibold text-primary">Store Pickup Location:</p>
                    <p className="text-on-surface-variant leading-relaxed">
                      <strong>Vanity Jewels Flagship Studio</strong><br />
                      {storeSettings.store_address}<br />
                      Hours: Mon-Sat, 11:00 AM - 8:00 PM
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-on-surface-variant mb-1" htmlFor="address">Address *</label>
                      <input
                        className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                        id="address"
                        type="text"
                        required={fulfillmentMethod === 'delivery'}
                        placeholder="Street Address, Area, Landmark"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        onBlur={syncCheckoutProgress}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-on-surface-variant mb-1" htmlFor="apartment">Apartment, suite, unit, etc. (optional)</label>
                      <input
                        className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                        id="apartment"
                        type="text"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        value={apartment}
                        onChange={e => setApartment(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1" htmlFor="city">City *</label>
                      <input
                        className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                        id="city"
                        type="text"
                        required={fulfillmentMethod === 'delivery'}
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        onBlur={syncCheckoutProgress}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1" htmlFor="state">State / Province *</label>
                      <input
                        className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                        id="state"
                        type="text"
                        required={fulfillmentMethod === 'delivery'}
                        placeholder="e.g. West Bengal"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        onBlur={syncCheckoutProgress}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-on-surface-variant mb-1" htmlFor="zip">PIN Code *</label>
                      <input
                        className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                        id="zip"
                        type="text"
                        required={fulfillmentMethod === 'delivery'}
                        placeholder="6-digit PIN code"
                        value={zip}
                        onChange={e => setZip(e.target.value)}
                        onBlur={syncCheckoutProgress}
                      />
                    </div>
                  </>
                )}

                <div className={fulfillmentMethod === 'pickup' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs text-on-surface-variant mb-1" htmlFor="phone">Phone *</label>
                  <input
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                    id="phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onBlur={syncCheckoutProgress}
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary py-4 rounded font-label-upper text-label-upper uppercase tracking-wider hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-xs font-semibold"
            >
              {isSubmitting ? 'Loading Payment...' : 'Pay with Razorpay'}
              <span className="material-symbols-outlined text-[18px]">credit_card</span>
            </button>
          </form>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-lg">
              <h3 className="font-headline-md text-headline-md mb-6 border-b border-outline-variant/20 pb-4">
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-4 mb-6 border-b border-outline-variant/20 pb-6 max-h-[400px] overflow-y-auto pr-1">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-16 h-20 bg-surface-container-low mr-4 flex-shrink-0 relative border border-outline-variant/10 rounded overflow-hidden">
                      <img className="w-full h-full object-cover" src={item.img} alt={item.name} />
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        {item.qty || 1}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-sm text-primary">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.material}</p>
                    </div>
                    <div className="font-price-sm text-sm font-semibold text-primary ml-2">
                      ₹{(item.price * (item.qty || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-6 border-b border-outline-variant/20 pb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold text-primary">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[#137333]">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="font-semibold text-primary">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-base text-primary">Total</span>
                <span className="font-price-display text-xl text-primary font-bold">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-center p-3 bg-surface border border-[#9A7E44]/20 rounded">
                <span className="material-symbols-outlined text-[#9A7E44] mr-2">verified</span>
                <span className="text-[10px] font-semibold text-[#9A7E44] tracking-wider uppercase">
                  BIS HALLMARKED EXCELLENCE GUARANTEED
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/20 py-6 text-center text-xs text-on-surface-variant">
        © 2026 Vanity. All rights reserved.
      </footer>
    </div>
  );
}
