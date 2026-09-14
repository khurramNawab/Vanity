'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

const FESTIVALS = [
  { id: 'diwali', name: 'Diwali', desc: 'Sparkle animation & clay lamps theme' },
  { id: 'christmas', name: 'Christmas', desc: 'Gentle falling snow theme' },
  { id: 'eid', name: 'Eid', desc: 'Crescent moon & glowing stars theme' },
  { id: 'durga_puja', name: 'Durga Puja', desc: 'Divine golden lights theme' },
  { id: 'ganesh_puja', name: 'Ganesh Puja', desc: 'Marigold garland gold glow theme' },
  { id: 'republic_day', name: 'Republic Day', desc: 'Saffron-white-green tricolor theme' },
  { id: 'independence_day', name: 'Independence Day', desc: 'Patriotic tricolor glow theme' },
  { id: 'womens_day', name: 'Women\'s Day', desc: 'Elegant floating floral theme' },
  { id: 'valentines_day', name: 'Valentine\'s Day', desc: 'Floating red hearts theme' },
  { id: 'raksha_bandhan', name: 'Raksha Bandhan', desc: 'Traditional thread and gold theme' },
  { id: 'new_year', name: 'New Year', desc: 'Colorful confetti pop theme' },
  { id: 'holi', name: 'Holi', desc: 'Vibrant paint color splatters theme' },
];

export default function CampaignManagerPage() {
  const [activeFestival, setActiveFestival] = useState('none');
  const [campaignText, setCampaignText] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCard, setShowVideoCard] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/admin/settings'),
      fetchApi('/products')
    ])
      .then(([settingsRes, productsRes]) => {
        if (settingsRes.success) {
          const s = settingsRes.settings || {};
          setActiveFestival(s.campaign_active_festival || 'none');
          setCampaignText(s.campaign_active_text || '');
          setDiscountCode(s.campaign_active_code || '');
          setSelectedProductId(s.campaign_active_product_id || '');
          setHeroVideoUrl(s.campaign_active_video_url || '');
          setShowVideoCard(s.campaign_show_video_card !== '0');
        }
        if (productsRes.success) {
          setProducts(productsRes.products || []);
        }
      })
      .catch(err => setError('Failed to load campaigns data: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (status: 'active' | 'inactive') => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    const festivalVal = status === 'active' ? activeFestival : 'none';

    try {
      const res = await fetchApi('/admin/settings', {
        method: 'POST',
        body: JSON.stringify({
          settings: {
            campaign_active_festival: festivalVal,
            campaign_active_text: campaignText,
            campaign_active_code: discountCode,
            campaign_active_product_id: selectedProductId,
            campaign_active_video_url: heroVideoUrl,
            campaign_show_video_card: showVideoCard ? '1' : '0'
          }
        })
      });

      if (res.success) {
        setSuccess(status === 'active' 
          ? `Festival campaign "${activeFestival.toUpperCase()}" successfully activated!`
          : 'Campaign successfully deactivated.'
        );
        if (status === 'inactive') {
          setActiveFestival('none');
        }
      } else {
        setError(res.message || 'Failed to save campaign settings.');
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
        <p className="text-on-surface-variant text-sm">Loading campaigns manager...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-5 md:p-12 max-w-5xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Festival Campaigns Manager</h2>
          <p className="text-on-surface-variant text-sm mt-1 font-body-md">
            Activate festive banners and promo notifications. Link matching spotlight products and hero background videos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('inactive')}
            disabled={saving}
            className="px-5 py-2.5 border-2 border-red-600 text-red-700 bg-white hover:bg-red-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 rounded shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            Deactivate
          </button>
          <button
            type="button"
            onClick={() => handleSave('active')}
            disabled={saving || activeFestival === 'none'}
            className="px-6 py-2.5 bg-primary text-white hover:bg-zinc-800 font-bold text-xs uppercase tracking-wider transition-all duration-200 rounded shadow-md disabled:opacity-50 focus:outline-none cursor-pointer"
          >
            {saving ? 'Activating...' : 'Activate Campaign'}
          </button>
        </div>
      </header>

      {success && <div className="p-4 bg-[#e8f5e9] border border-[#a5d6a7] text-[#137333] text-sm rounded mb-6 font-medium">{success}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded mb-6 font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white border border-outline-variant/20 p-6 rounded-lg shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-outline-variant/10 pb-2 flex items-center justify-between">
              <span>1. Select Festival Template</span>
              <span className="text-[10px] text-secondary font-semibold">Click to select</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FESTIVALS.map((fest) => {
                const isSelected = activeFestival === fest.id;
                return (
                  <button
                    key={fest.id}
                    type="button"
                    onClick={() => setActiveFestival(fest.id)}
                    className={`p-3.5 border rounded-lg text-left transition-all duration-200 relative cursor-pointer ${
                      isSelected
                        ? 'border-[#9A7E44] bg-[#9A7E44]/10 shadow-sm ring-1 ring-[#9A7E44]'
                        : 'border-outline-variant/40 bg-white hover:border-[#9A7E44]/70 hover:bg-surface-container-low/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {fest.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[18px] text-[#9A7E44]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                      {fest.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-outline-variant/10 pb-2">
              2. Campaign Banner Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium">Promo Message Text *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Radiance Sale! Claim 15% off across all silver heirlooms."
                  className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
                  value={campaignText}
                  onChange={e => setCampaignText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">Coupon Code (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. DIWALI15"
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary font-mono"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">Featured Showcase Product (optional)</label>
                  <select
                    className="w-full p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- No Product linked --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4 border-b border-outline-variant/10 pb-2">
              3. Homepage Hero Video Card
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-surface-container rounded transition-colors mb-3">
                <input
                  type="checkbox"
                  className="accent-primary w-4 h-4 cursor-pointer"
                  checked={showVideoCard}
                  onChange={e => setShowVideoCard(e.target.checked)}
                />
                <span className="text-xs font-semibold text-primary">Show Video Card on Homepage</span>
              </label>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-medium">Craftsmanship / Promo Video URL (MP4 or YouTube link)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="e.g. https://assets.mixkit.co/videos/preview/mixkit-jewelry-craftsman-polishing-a-ring-41662-large.mp4"
                  className="flex-grow p-3 border border-outline-variant/30 focus:border-primary focus:outline-none bg-white rounded text-sm text-primary font-mono"
                  value={heroVideoUrl}
                  onChange={e => setHeroVideoUrl(e.target.value)}
                />
                <label className="bg-[#1A1A1A] hover:bg-[#9A7E44] text-[#9A7E44] hover:text-[#1A1A1A] border border-[#9A7E44]/40 font-semibold rounded px-4 py-3 text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Upload MP4
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const formData = new FormData();
                      formData.append('video', file);
                      
                      try {
                        setSaving(true);
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/settings/upload-video`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('vanity_token')}`
                          },
                          body: formData
                        });
                        
                        const data = await response.json();
                        if (data.success && data.url) {
                          setHeroVideoUrl(data.url);
                          alert('Video uploaded successfully!');
                        } else {
                          alert(data.message || 'Video upload failed.');
                        }
                      } catch (err) {
                        alert('Error uploading video.');
                      } finally {
                        setSaving(false);
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1.5">
                Providing a direct MP4 link displays an autoplaying, looping video card over the right side of the homepage hero section.
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1A1A1A] text-white p-6 rounded shadow-lg border border-outline-variant/20">
            <h3 className="font-headline-md text-base font-bold text-white mb-2">Campaign Activation Rules</h3>
            <p className="text-xs text-surface-dim opacity-85 leading-relaxed space-y-2">
              <span>When a campaign is marked as active:</span><br />
              <span className="block mt-2">• Banners render directly below the primary navigation header with custom CSS micro-animations customized for the specific festival.</span>
              <span className="block mt-2">• Saffron/white/green glows reflect for Independence/Republic day, falling snowflakes for Christmas, crescent moons for Eid, and sparkles for Diwali.</span>
              <span className="block mt-2">• Linking a product showcases its primary image card directly inside the banner for faster conversion.</span>
            </p>
          </div>

          {activeFestival !== 'none' && (
            <div className="bg-[#9A7E44]/5 border border-[#9A7E44]/30 rounded p-6">
              <h4 className="font-bold text-[#9A7E44] text-xs uppercase tracking-widest mb-2">Currently Selected:</h4>
              <p className="text-sm font-semibold text-primary">{activeFestival.toUpperCase()}</p>
              <p className="text-xs text-on-surface-variant mt-1">Ready to be dispatched onto the storefront.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
