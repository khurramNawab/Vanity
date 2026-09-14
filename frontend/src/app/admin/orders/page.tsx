'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-[#fff8e1] text-[#b78103] border border-[#ffe082]',
  processing: 'bg-[#e3f2fd] text-[#0d47a1] border border-[#90caf9]',
  shipped: 'bg-[#f3e5f5] text-[#4a148c] border border-[#ce93d8]',
  delivered: 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]',
  cancelled: 'bg-[#ffe8e8] text-[#c62828] border border-[#ffcdd2]',
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetchApi('/admin/orders')
      .then(res => {
        if (res.success) {
          setOrders(res.orders || []);
        }
      })
      .catch(err => console.error('Error fetching admin orders list:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setError(null);
    setSuccess(null);
    setUpdatingId(orderId);

    try {
      const res = await fetchApi(`/admin/orders/${orderId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setSuccess(`Order status updated successfully to "${newStatus}".`);
        // Refresh local items
        setOrders((prev: any[]) => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => prev ? { ...prev, order_status: newStatus } : null);
        }
      } else {
        setError(res.message || 'Failed to update order status.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadInvoice = async (order: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/orders/${order.id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vanity_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice not found');
      
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

  return (
    <div className="bg-surface p-5 md:p-12">
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Orders Management</h2>
        <p className="text-on-surface-variant text-sm mt-1">Track orders, update shipping progress, verify Razorpay receipts, and inspect customer details.</p>
      </header>

      {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6 max-w-4xl">{error}</div>}
      {success && <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6 max-w-4xl">{success}</div>}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col max-w-6xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm">Loading orders list...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6 text-center">Payment Status</th>
                  <th className="py-4 px-6 text-right">Order Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant/20 text-primary">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="py-4 px-6 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-sm text-primary hover:underline">#{order.order_number}</span>
                          <span className="text-[10px] text-on-surface-variant mt-1">
                            {order.fulfillment_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{order.shipping_name || 'Guest User'}</span>
                          <span className="text-xs text-on-surface-variant mt-0.5">{order.shipping_address}, {order.shipping_city}</span>
                          <span className="text-[10px] text-on-surface-variant font-mono mt-0.5">Phone: {order.shipping_phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-on-surface-variant cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {order.coupon_code && (
                          <p className="text-[9px] text-[#137333] font-sans font-medium">Coupon: {order.coupon_code}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.pending
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {updatingId === order.id ? (
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
                        ) : (
                          <select
                            className={`p-1.5 rounded text-xs font-semibold uppercase ${
                              STATUS_STYLES[order.order_status] || STATUS_STYLES.pending
                            } focus:outline-none cursor-pointer`}
                            value={order.order_status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant text-sm">
                      No purchase orders recorded in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal Popup */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-outline-variant/30 rounded-lg max-w-2xl w-full shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
              <div>
                <h3 className="font-headline-md text-lg text-primary font-bold">Order Details — #{selectedOrder.order_number}</h3>
                <span className="inline-block px-2.5 py-0.5 mt-2 rounded text-[10px] uppercase font-bold bg-[#9A7E44]/10 text-[#9A7E44] border border-[#9A7E44]/20">
                  Fulfillment: {selectedOrder.fulfillment_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-on-surface-variant hover:text-primary focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
              <div>
                <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2 border-b border-outline-variant/10 pb-1">
                  Customer Shipping Snapshot
                </h4>
                <p className="leading-relaxed text-primary">
                  <strong>Name:</strong> {selectedOrder.shipping_name || 'Guest Customer'}<br />
                  <strong>Phone:</strong> {selectedOrder.shipping_phone}<br />
                  <strong>Email:</strong> {selectedOrder.shipping_email || 'n/a'}<br />
                  
                  {selectedOrder.fulfillment_method === 'pickup' ? (
                    <span className="text-xs text-[#9A7E44] font-semibold mt-1 block">
                      * Store Pickup Chosen.
                    </span>
                  ) : (
                    <>
                      <strong>Address:</strong> {selectedOrder.shipping_address}<br />
                      {selectedOrder.shipping_apartment && <><strong>Apartment:</strong> {selectedOrder.shipping_apartment}<br /></>}
                      <strong>City/State/Zip:</strong> {selectedOrder.shipping_city}, {selectedOrder.shipping_state} — {selectedOrder.shipping_zip}
                    </>
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider mb-2 border-b border-outline-variant/10 pb-1">
                  Payment Details
                </h4>
                <p className="leading-relaxed text-primary">
                  <strong>Gateway ID:</strong> {selectedOrder.razorpay_order_id || 'n/a'}<br />
                  <strong>Payment ID:</strong> {selectedOrder.razorpay_payment_id || 'n/a'}<br />
                  <strong>Status:</strong> {selectedOrder.payment_status.toUpperCase()}<br />
                  <strong>Order Status:</strong> {selectedOrder.order_status.toUpperCase()}<br />
                  <strong>Placed Date:</strong> {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-outline-variant/30 rounded-lg overflow-hidden mb-6">
              <h4 className="font-bold text-xs text-on-surface-variant uppercase tracking-wider p-3 bg-surface-container-low/50 border-b border-outline-variant/30">
                Itemized Order Lines
              </h4>
              <div className="divide-y divide-outline-variant/20 p-4 space-y-3">
                {selectedOrder.items && selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-primary">{item.product?.name || 'Jewel'}</strong>
                      <span className="block text-on-surface-variant text-[10px] mt-0.5">
                        Weight: {item.weight}g | Purity: {item.product?.silver_purity || 'Silver'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-on-surface-variant">Qty: {item.quantity}</span>
                      <strong className="block text-primary mt-0.5">₹{Number(item.line_total).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-surface-container-low/40 border-t border-outline-variant/30 text-xs space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (3%)</span>
                  <span>₹{Number(selectedOrder.gst_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Shipping</span>
                  <span>₹{Number(selectedOrder.shipping_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-primary font-bold pt-2 border-t border-outline-variant/20 mt-1">
                  <span>Total Paid</span>
                  <span>₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-outline-variant/20 pt-4">
              {selectedOrder.payment_status === 'paid' && (
                <button 
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="bg-primary text-on-primary hover:bg-opacity-95 font-semibold text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Invoice
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="border border-outline-variant hover:bg-surface-container-low font-semibold text-xs px-4 py-2 rounded transition-colors focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
