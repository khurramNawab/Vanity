'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { useStoreSettings } from '@/lib/settings';

export default function OrderConfirmationPage() {
  const { settings: storeSettings } = useStoreSettings();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('order_id');
      const orderNumber = params.get('order_number');
      const email = params.get('email');

      if (id) {
        setLoading(true);
        const q = new URLSearchParams();
        if (orderNumber) q.set('order_number', orderNumber);
        if (email) q.set('email', email);
        const queryString = q.toString() ? `?${q.toString()}` : '';

        fetchApi(`/orders/${id}${queryString}`)
          .then(res => {
            if (res.success) {
              setOrder(res.order);
            }
          })
          .catch(err => console.error('Error fetching order receipt:', err))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  const getEstimatedDeliveryDate = () => {
    if (!order) return '';
    const today = new Date(order.created_at);
    
    if (order.fulfillment_method === 'pickup') {
      today.setDate(today.getDate() + 2);
      return `Ready for pickup by ${today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;
    } else {
      today.setDate(today.getDate() + 4);
      return today.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    try {
      const q = new URLSearchParams();
      if (order.order_number) q.set('order_number', order.order_number);
      if (order.shipping_email) q.set('email', order.shipping_email);
      const queryString = q.toString() ? `?${q.toString()}` : '';

      const token = typeof window !== 'undefined' ? localStorage.getItem('vanity_token') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/${order.id}/invoice${queryString}`, {
        headers
      });
      if (!response.ok) throw new Error('Invoice not found or unauthorized');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order.order_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download invoice. Please try again.');
    }
  };

  // Helper for checking active stepper stages
  const getStepStatus = (stepName: string) => {
    if (!order) return 'inactive';
    
    const status = order.order_status;
    const isPickup = order.fulfillment_method === 'pickup';

    const stages = isPickup 
      ? ['pending', 'processing', 'shipped', 'delivered'] // maps to Placed -> Confirmed -> Ready -> Picked Up
      : ['pending', 'processing', 'shipped', 'delivered']; // maps to Placed -> Confirmed -> Shipped -> Delivered

    const currentIdx = stages.indexOf(status);
    const stepIdx = {
      'placed': 0,
      'confirmed': 1,
      'shipped': 2,
      'delivered': 3
    }[stepName] ?? 0;

    if (status === 'cancelled') {
      return 'cancelled';
    }

    if (currentIdx >= stepIdx) {
      return 'completed';
    } else if (currentIdx + 1 === stepIdx) {
      return 'active';
    }
    return 'inactive';
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Fetching order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4">shopping_bag</span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">No Order Found</h1>
        <p className="text-on-surface-variant mb-8 text-center max-w-sm">We couldn&apos;t find this order receipt. Please check your account dashboard.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-opacity-90">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isPickup = order.fulfillment_method === 'pickup';

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center py-12 px-5 md:px-12">
        <div className="max-w-2xl w-full mx-auto bg-white shadow-lg border border-outline-variant/30 rounded-lg overflow-hidden">
          
          {/* Success Header */}
          <div className="text-center py-8 px-6 border-b border-outline-variant/30 bg-surface-container-low/30">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#e8f5e9] text-[#137333] mb-6">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h1 className="font-headline-lg text-[28px] md:text-headline-lg text-primary mb-2 font-bold">
              Order Confirmed
            </h1>
            <p className="text-on-surface-variant text-sm">
              Thank you for your purchase from Vanity.
            </p>
            <div className="mt-5 inline-block bg-surface-container-low border border-outline-variant/50 px-5 py-3 rounded">
              <p className="font-label-upper text-label-upper text-on-surface-variant text-[10px] uppercase tracking-wider mb-1">Order Number</p>
              <p className="font-price-display text-lg text-primary font-bold">{order.order_number}</p>
            </div>
          </div>

          {/* Stepper Status Tracking */}
          <div className="px-8 py-6 border-b border-outline-variant/20 bg-surface">
            <h3 className="font-label-upper text-xs text-on-surface-variant uppercase tracking-wider mb-6 text-center font-bold">
              Order Progress Status
            </h3>
            
            {order.order_status === 'cancelled' ? (
              <div className="p-4 bg-error-container/20 border border-error/30 text-error rounded text-sm text-center font-semibold uppercase tracking-wider">
                This order has been Cancelled
              </div>
            ) : (
              <div className="flex items-center justify-between relative">
                {/* Stepper Line */}
                <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-outline-variant/40 -translate-y-1/2 z-0"></div>

                {/* Step 1: Placed */}
                <div className="flex flex-col items-center z-10 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                    getStepStatus('placed') === 'completed'
                      ? 'bg-[#9A7E44] border-[#9A7E44] text-white'
                      : 'bg-white border-[#9A7E44] text-[#9A7E44]'
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-2 text-center">Placed</span>
                </div>

                {/* Step 2: Confirmed */}
                <div className="flex flex-col items-center z-10 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                    getStepStatus('confirmed') === 'completed'
                      ? 'bg-[#9A7E44] border-[#9A7E44] text-white'
                      : getStepStatus('confirmed') === 'active'
                      ? 'bg-white border-[#9A7E44] text-[#9A7E44] animate-pulse'
                      : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-2 text-center">Confirmed</span>
                </div>

                {/* Step 3: Shipped / Ready for Pickup */}
                <div className="flex flex-col items-center z-10 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                    getStepStatus('shipped') === 'completed'
                      ? 'bg-[#9A7E44] border-[#9A7E44] text-white'
                      : getStepStatus('shipped') === 'active'
                      ? 'bg-white border-[#9A7E44] text-[#9A7E44] animate-pulse'
                      : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-2 text-center">
                    {isPickup ? 'Ready' : 'Shipped'}
                  </span>
                </div>

                {/* Step 4: Delivered / Picked Up */}
                <div className="flex flex-col items-center z-10 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                    getStepStatus('delivered') === 'completed'
                      ? 'bg-[#9A7E44] border-[#9A7E44] text-white'
                      : getStepStatus('delivered') === 'active'
                      ? 'bg-white border-[#9A7E44] text-[#9A7E44] animate-pulse'
                      : 'bg-white border-outline-variant text-on-surface-variant'
                  }`}>
                    4
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary mt-2 text-center">
                    {isPickup ? 'Collected' : 'Delivered'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-label-upper text-label-upper text-on-surface-variant text-xs mb-2 border-b border-outline-variant/20 pb-1">
                  {isPickup ? 'Collection Date' : 'Estimated Delivery'}
                </h3>
                <p className="text-primary font-semibold text-sm">{getEstimatedDeliveryDate()}</p>
              </div>
              <div>
                <h3 className="font-label-upper text-label-upper text-on-surface-variant text-xs mb-2 border-b border-outline-variant/20 pb-1">
                  {isPickup ? 'Pickup Location' : 'Shipping Address'}
                </h3>
                {isPickup ? (
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    <strong>Vanity Jewels Flagship Studio</strong><br />
                    {storeSettings.store_address}<br />
                    Mon-Sat, 11:00 AM - 8:00 PM
                  </p>
                ) : (
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    <strong>{order.shipping_name}</strong><br />
                    {order.shipping_address}<br />
                    {order.shipping_apartment && <>{order.shipping_apartment}<br /></>}
                    {order.shipping_city}, {order.shipping_state} — {order.shipping_zip}<br />
                    Phone: {order.shipping_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Table */}
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden">
              <h3 className="font-label-upper text-label-upper text-on-surface-variant text-xs p-4 bg-surface-container-low/50 border-b border-outline-variant/30">
                Purchased Items
              </h3>
              <div className="divide-y divide-outline-variant/20 p-4 space-y-4">
                {order.items && order.items.map((item: any, idx: number) => {
                  const product = item.product || {};
                  return (
                    <div key={idx} className="flex items-center space-x-4 pt-4 first:pt-0">
                      <div className="w-16 h-20 bg-surface-container-low rounded border border-outline-variant/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img 
                          className="w-full h-full object-cover" 
                          src={product.primary_image?.image_path || 'https://placehold.co/100x125/FAF9F6/1A1A1A?text=Jewellery'} 
                          alt={product.name || 'Product'} 
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-semibold text-primary">{product.name || 'Vanity Jewel'}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Purity: {item.silver_rate_snapshot ? '925 Sterling Silver' : 'Silver'}</p>
                        <p className="text-xs text-on-surface-variant">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        ₹{Number(item.line_total).toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Receipt calculations */}
              <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/30 space-y-2 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (3%)</span>
                  <span>₹{Number(order.gst_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span>{Number(order.shipping_amount) === 0 ? 'FREE' : `₹${Number(order.shipping_amount)}`}</span>
                </div>
                <div className="flex justify-between text-primary font-semibold pt-2 border-t border-outline-variant/20 mt-2">
                  <span>Total Paid</span>
                  <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-6 bg-surface-container-low/20 border-t border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-primary text-on-primary font-label-upper text-label-upper text-xs py-3 px-8 rounded flex items-center justify-center hover:bg-opacity-90 transition-opacity font-semibold"
            >
              Continue Shopping
            </Link>
            {order.payment_status === 'paid' && (
              <button
                onClick={handleDownloadInvoice}
                className="bg-transparent border border-primary text-primary font-label-upper text-label-upper text-xs py-3 px-8 rounded flex items-center justify-center hover:bg-surface-container-low transition-colors font-semibold focus:outline-none"
              >
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
