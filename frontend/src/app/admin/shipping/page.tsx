'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminShippingPage() {
  const [flatFee, setFlatFee] = useState(150);
  const [freeThreshold, setFreeThreshold] = useState(2999);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApi('/admin/settings')
      .then(res => {
        if (res.success) {
          const s = res.settings || {};
          setFlatFee(Number(s.shipping_flat_rate || s.shipping_fee) || 150);
          setFreeThreshold(Number(s.shipping_free_threshold || s.free_shipping_threshold) || 2999);
        }
      })
      .catch(err => console.error('Error fetching shipping settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetchApi('/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          settings: {
            shipping_flat_rate: flatFee,
            shipping_fee: flatFee,
            shipping_free_threshold: freeThreshold,
            free_shipping_threshold: freeThreshold
          }
        })
      });

      if (res.success) {
        setSuccess('Shipping settings successfully updated.');
      } else {
        setError(res.message || 'Failed to update shipping settings.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm">Loading shipping configuration...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-5 md:p-12 max-w-2xl">
      <header className="mb-8 border-b border-outline-variant/30 pb-6">
        <h2 className="font-headline-md text-headline-md text-primary">Shipping Policy Manager</h2>
        <p className="text-on-surface-variant text-sm mt-1">Configure shipping rates and free shipping discount eligibility thresholds.</p>
      </header>

      {success && <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6">{success}</div>}
      {error && <div className="p-4 bg-error-container/20 border border-error/30 text-error text-sm rounded mb-6">{error}</div>}

      <form onSubmit={handleSave} className="bg-white border border-outline-variant/20 p-6 rounded shadow-sm space-y-6">
        <div>
          <label className="block text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Flat Shipping Fee (₹) *</label>
          <input
            type="number"
            required
            className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary font-mono"
            value={flatFee}
            onChange={e => setFlatFee(Number(e.target.value))}
          />
          <p className="text-[10px] text-on-surface-variant mt-1.5">
            Default rate applied to orders falling below the free delivery threshold.
          </p>
        </div>

        <div>
          <label className="block text-xs text-on-surface-variant mb-1 font-semibold uppercase tracking-wider">Free Shipping Threshold (₹) *</label>
          <input
            type="number"
            required
            className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary font-mono"
            value={freeThreshold}
            onChange={e => setFreeThreshold(Number(e.target.value))}
          />
          <p className="text-[10px] text-on-surface-variant mt-1.5">
            Minimum order subtotal qualifying a customer for free delivery (₹0 shipping fee).
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-white hover:bg-zinc-800 py-3 rounded font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
