'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [code, setCode] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState(500);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [status, setStatus] = useState('active');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCoupons = () => {
    setLoading(true);
    fetchApi('/admin/coupons')
      .then(res => {
        if (res.success) {
          setCoupons(res.coupons || []);
        }
      })
      .catch(err => console.error('Error fetching coupons:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setCode('');
    setType('percent');
    setValue(10);
    setMinOrderValue(500);
    setMaxDiscount('');
    setExpiryDate('');
    setUsageLimit('');
    setStatus('active');
  };

  const handleEditClick = (coupon: any) => {
    setIsEditing(true);
    setEditingId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(Number(coupon.value));
    setMinOrderValue(Number(coupon.min_order_value));
    setMaxDiscount(coupon.max_discount ? Number(coupon.max_discount) : '');
    setExpiryDate(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
    setUsageLimit(coupon.usage_limit ? Number(coupon.usage_limit) : '');
    setStatus(coupon.status);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      code,
      type,
      value,
      min_order_value: minOrderValue,
      max_discount: maxDiscount === '' ? null : maxDiscount,
      expiry_date: expiryDate === '' ? null : expiryDate,
      usage_limit: usageLimit === '' ? null : usageLimit,
      status,
    };

    try {
      let res;
      if (isEditing && editingId) {
        res = await fetchApi(`/admin/coupons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetchApi('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        setSuccess(isEditing ? 'Coupon updated successfully.' : 'New coupon added successfully.');
        resetForm();
        fetchCoupons();
      } else {
        setError(res.message || 'Validation error. Please verify coupon fields.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving coupon.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    setError(null);
    setSuccess(null);

    try {
      const res = await fetchApi(`/admin/coupons/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSuccess('Coupon code deleted successfully.');
        fetchCoupons();
      } else {
        setError(res.message || 'Failed to delete coupon.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while deleting coupon.');
    }
  };

  return (
    <div className="bg-surface p-5 md:p-12">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Discounts &amp; Coupons</h2>
          <p className="text-on-surface-variant text-sm mt-1">Manage promotional discount campaigns and track coupon validation codes.</p>
        </div>
        {isEditing && (
          <button onClick={resetForm} className="border border-primary text-primary px-4 py-2 rounded text-xs font-label-upper tracking-wider hover:bg-surface-container-low uppercase">
            Cancel Edit
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 bg-surface-container-lowest border border-outline-variant p-6 rounded-lg self-start">
          <h3 className="font-headline-sm text-sm font-semibold text-primary uppercase tracking-wider mb-6">
            {isEditing ? 'Edit Coupon Code' : 'Create Coupon Code'}
          </h3>

          {error && <div className="p-3 bg-error-container/20 border border-error/30 text-error text-xs rounded mb-4">{error}</div>}
          {success && <div className="p-3 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-xs rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="coupon-code">
                Coupon Code *
              </label>
              <input
                id="coupon-code"
                type="text"
                required
                className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold uppercase"
                placeholder="e.g. FESTIVE20"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="discount-type">
                  Discount Type *
                </label>
                <select
                  id="discount-type"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="discount-value">
                  Value *
                </label>
                <input
                  id="discount-value"
                  type="number"
                  required
                  min="0"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold"
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="min-order">
                  Min Order (₹)
                </label>
                <input
                  id="min-order"
                  type="number"
                  min="0"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold"
                  value={minOrderValue}
                  onChange={e => setMinOrderValue(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="max-disc">
                  Max Discount (₹)
                </label>
                <input
                  id="max-disc"
                  type="number"
                  min="0"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold"
                  placeholder="No Limit"
                  value={maxDiscount}
                  onChange={e => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="usage-lim">
                  Usage Limit
                </label>
                <input
                  id="usage-lim"
                  type="number"
                  min="1"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold"
                  placeholder="Unlimited"
                  value={usageLimit}
                  onChange={e => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="status">
                  Status *
                </label>
                <select
                  id="status"
                  className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="expiry-date">
                Expiry Date
              </label>
              <input
                id="expiry-date"
                type="date"
                className="w-full p-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono font-semibold"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-3 rounded font-label-upper text-label-upper uppercase tracking-wider hover:bg-inverse-surface transition-all text-xs font-semibold mt-4"
            >
              {isEditing ? 'Save Changes' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-on-surface-variant text-xs">Loading coupons collection...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/20 text-xs font-label-upper text-on-surface-variant">
                    <th className="py-3 px-4">Coupon</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Min Spend</th>
                    <th className="py-3 px-4">Expiry</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-outline-variant/20 text-primary">
                  {coupons.length > 0 ? (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-sm tracking-wide">{coupon.code}</span>
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded w-fit mt-1 border ${
                              coupon.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {coupon.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {coupon.type === 'percent' ? `${Number(coupon.value).toFixed(0)}%` : `₹${Number(coupon.value).toLocaleString('en-IN')}`}
                          {coupon.max_discount && <p className="text-[10px] text-on-surface-variant font-normal">Max ₹{Number(coupon.max_discount).toLocaleString('en-IN')}</p>}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-on-surface-variant">
                          {coupon.usage_count} / {coupon.usage_limit || '∞'}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-xs">
                          ₹{Number(coupon.min_order_value).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-xs text-on-surface-variant">
                          {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditClick(coupon)}
                              className="text-primary hover:text-secondary text-xs font-semibold uppercase tracking-wider px-2 py-1 hover:bg-surface-container-high transition-all rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="text-red-700 hover:text-red-900 text-xs font-semibold uppercase tracking-wider px-2 py-1 hover:bg-red-50 transition-all rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-on-surface-variant text-sm">
                        No promotional coupons created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
