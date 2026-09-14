'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    tax_gst_percent: '3',
    shipping_fee: '150',
    free_shipping_threshold: '2999',
    signup_discount_percent: '10',
    silver_rate_refresh_minutes: '60',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi('/admin/settings')
      .then(res => {
        if (res.success) {
          setSettings(res.settings);
        }
      })
      .catch(err => console.error('Error fetching admin settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetchApi('/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ settings }),
      });
      if (res.success) {
        setSuccess('Configuration settings saved successfully.');
        setSettings(res.settings);
      } else {
        setError(res.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while saving settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface p-5 md:p-12 max-w-4xl">
      <header className="mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">System Settings</h2>
        <p className="text-on-surface-variant text-sm mt-1">Configure global store rules, taxes, shipping parameters, and campaign rules.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-on-surface-variant text-sm">Loading config parameters...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 md:p-8 rounded-lg">
          {error && (
            <div className="p-4 bg-error-container/20 border border-error/30 text-error text-sm rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded">
              {success}
            </div>
          )}

          {/* Section 1: Money & Tax */}
          <div>
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              1. Tax &amp; GST Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="tax_gst_percent">
                  Standard GST Rate (%) *
                </label>
                <input
                  id="tax_gst_percent"
                  type="number"
                  required
                  min="0"
                  max="100"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.tax_gst_percent || ''}
                  onChange={e => handleChange('tax_gst_percent', e.target.value)}
                />
                <p className="text-[10px] text-on-surface-variant mt-1">Standard GST for silver ornaments in India is 3%.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Shipping */}
          <div className="pt-4">
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              2. Shipping Charges &amp; Thresholds
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="shipping_fee">
                  Flat Shipping Fee (₹) *
                </label>
                <input
                  id="shipping_fee"
                  type="number"
                  required
                  min="0"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.shipping_fee || ''}
                  onChange={e => handleChange('shipping_fee', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="free_shipping_threshold">
                  Free Shipping Threshold (₹) *
                </label>
                <input
                  id="free_shipping_threshold"
                  type="number"
                  required
                  min="0"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.free_shipping_threshold || ''}
                  onChange={e => handleChange('free_shipping_threshold', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Promotions */}
          <div className="pt-4">
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              3. Campaigns &amp; Sign-Up Incentives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="signup_discount_percent">
                  Sign-Up Promo Discount (%) *
                </label>
                <input
                  id="signup_discount_percent"
                  type="number"
                  required
                  min="0"
                  max="100"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.signup_discount_percent || ''}
                  onChange={e => handleChange('signup_discount_percent', e.target.value)}
                />
                <p className="text-[10px] text-on-surface-variant mt-1">Discount percentage unlocked when customers subscribe to promotional popups.</p>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="silver_rate_refresh_minutes">
                  Spot Rate Sync Interval (Minutes) *
                </label>
                <input
                  id="silver_rate_refresh_minutes"
                  type="number"
                  required
                  min="5"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.silver_rate_refresh_minutes || ''}
                  onChange={e => handleChange('silver_rate_refresh_minutes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Links */}
          <div className="pt-4">
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              4. Store Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="social_instagram">
                  Instagram Link
                </label>
                <input
                  id="social_instagram"
                  type="url"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.social_instagram || ''}
                  onChange={e => handleChange('social_instagram', e.target.value)}
                  placeholder="https://instagram.com/your-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="social_facebook">
                  Facebook Link
                </label>
                <input
                  id="social_facebook"
                  type="url"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.social_facebook || ''}
                  onChange={e => handleChange('social_facebook', e.target.value)}
                  placeholder="https://facebook.com/your-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="social_email">
                  Contact Email / Link
                </label>
                <input
                  id="social_email"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.social_email || ''}
                  onChange={e => handleChange('social_email', e.target.value)}
                  placeholder="mailto:contact@yourbrand.com or /contact"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="social_linkedin">
                  LinkedIn Link
                </label>
                <input
                  id="social_linkedin"
                  type="url"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.social_linkedin || ''}
                  onChange={e => handleChange('social_linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/your-brand"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="whatsapp_number">
                  WhatsApp Contact Number (with country code, e.g. 919876543210)
                </label>
                <input
                  id="whatsapp_number"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.whatsapp_number || ''}
                  onChange={e => handleChange('whatsapp_number', e.target.value)}
                  placeholder="e.g. 919876543210"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Store Location & Address */}
          <div className="pt-4">
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              5. Store Address &amp; Studio Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="store_address">
                  Official Store / Studio Address
                </label>
                <textarea
                  id="store_address"
                  rows={2}
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm resize-none"
                  value={settings.store_address || ''}
                  onChange={e => handleChange('store_address', e.target.value)}
                  placeholder="Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact_email">
                  Support / Order Inquiries Email
                </label>
                <input
                  id="contact_email"
                  type="email"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.contact_email || ''}
                  onChange={e => handleChange('contact_email', e.target.value)}
                  placeholder="thevanityjewels@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="contact_phone">
                  Support / Studio Phone
                </label>
                <input
                  id="contact_phone"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm"
                  value={settings.contact_phone || ''}
                  onChange={e => handleChange('contact_phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Cloudinary Media CDN */}
          <div className="pt-4">
            <h3 className="font-headline-sm text-sm font-semibold text-primary mb-4 border-b border-outline-variant/30 pb-2 uppercase tracking-wider">
              6. Cloudinary CDN &amp; Media Uploads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="cloudinary_cloud_name">
                  Cloudinary Cloud Name
                </label>
                <input
                  id="cloudinary_cloud_name"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono"
                  value={settings.cloudinary_cloud_name || ''}
                  onChange={e => handleChange('cloudinary_cloud_name', e.target.value)}
                  placeholder="e.g. dsnjgc3g"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="cloudinary_api_key">
                  Cloudinary API Key
                </label>
                <input
                  id="cloudinary_api_key"
                  type="text"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono"
                  value={settings.cloudinary_api_key || ''}
                  onChange={e => handleChange('cloudinary_api_key', e.target.value)}
                  placeholder="e.g. 123456789012345"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-on-surface-variant mb-1 font-medium" htmlFor="cloudinary_api_secret">
                  Cloudinary API Secret
                </label>
                <input
                  id="cloudinary_api_secret"
                  type="password"
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm font-mono"
                  value={settings.cloudinary_api_secret || ''}
                  onChange={e => handleChange('cloudinary_api_secret', e.target.value)}
                  placeholder="••••••••••••••••••••••••••"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">Allows automatic signed uploads of product photos and banners to Cloudinary CDN.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/20 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary px-8 py-3 rounded font-label-upper text-label-upper uppercase tracking-wider hover:bg-inverse-surface transition-all text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving Configuration...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
