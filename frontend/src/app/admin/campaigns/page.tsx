'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

const FESTIVALS = [
  { id: 'mothers_day', name: 'Mother\'s Day', desc: 'Heartfelt appreciation & pink floral blossom theme' },
  { id: 'womens_day', name: 'Women\'s Day', desc: 'Elegant floating floral & lavender theme' },
  { id: 'diwali', name: 'Diwali', desc: 'Sparkle animation & clay lamps gold theme' },
  { id: 'durga_puja', name: 'Durga Puja', desc: 'Divine golden lights & festive crimson theme' },
  { id: 'valentines_day', name: 'Valentine\'s Day', desc: 'Floating ruby hearts & romantic glow theme' },
  { id: 'raksha_bandhan', name: 'Raksha Bandhan', desc: 'Traditional thread and auspicious gold theme' },
  { id: 'eid', name: 'Eid', desc: 'Crescent moon & glowing emerald stars theme' },
  { id: 'christmas', name: 'Christmas', desc: 'Gentle falling snow & emerald-ruby theme' },
  { id: 'new_year', name: 'New Year', desc: 'Colorful confetti pop & midnight gold theme' },
  { id: 'ganesh_puja', name: 'Ganesh Puja', desc: 'Marigold garland & auspicious gold glow theme' },
  { id: 'republic_day', name: 'Republic Day', desc: 'Saffron-white-green tricolor theme' },
  { id: 'independence_day', name: 'Independence Day', desc: 'Patriotic tricolor glow theme' },
  { id: 'holi', name: 'Holi', desc: 'Vibrant color splatters & festive joy theme' },
];

export default function CampaignManagerPage() {
  const [activeFestival, setActiveFestival] = useState('mothers_day');
  const [campaignTitle, setCampaignTitle] = useState("Mother's Day & Special Festive Offer");
  const [campaignSubtitle, setCampaignSubtitle] = useState("Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
  const [discountCode, setDiscountCode] = useState('VANITY10');
  const [ctaText, setCtaText] = useState('Explore Offer Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [offerVideoUrl, setOfferVideoUrl] = useState('');
  const [offerImageUrl, setOfferImageUrl] = useState('/images/kolkata-howrah-jewellery-banner.jpg');
  const [showOfferSection, setShowOfferSection] = useState(true);
  const [showVideoCard, setShowVideoCard] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/admin/settings'),
      fetchApi('/products')
    ])
      .then(([settingsRes, productsRes]) => {
        if (settingsRes.success) {
          const s = settingsRes.settings || {};
          setActiveFestival(s.campaign_active_festival || 'mothers_day');
          setCampaignTitle(s.campaign_active_text || "Mother's Day & Special Festive Offer");
          setCampaignSubtitle(s.campaign_subtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
          setDiscountCode(s.campaign_active_code || 'VANITY10');
          setCtaText(s.campaign_cta_text || 'Explore Offer Collection');
          setCtaLink(s.campaign_cta_link || '/shop');
          setSelectedProductId(s.campaign_active_product_id || '');
          setOfferVideoUrl(s.campaign_active_video_url || '');
          setOfferImageUrl(s.campaign_active_image_url || '/images/kolkata-howrah-jewellery-banner.jpg');
          setShowOfferSection(s.campaign_show_offer_section !== '0');
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
            campaign_active_text: campaignTitle,
            campaign_subtitle: campaignSubtitle,
            campaign_active_code: discountCode,
            campaign_cta_text: ctaText,
            campaign_cta_link: ctaLink,
            campaign_active_product_id: selectedProductId,
            campaign_active_video_url: offerVideoUrl,
            campaign_active_image_url: offerImageUrl,
            campaign_show_offer_section: status === 'active' && showOfferSection ? '1' : '0',
            campaign_show_video_card: showVideoCard ? '1' : '0'
          }
        })
      });

      if (res.success) {
        setSuccess(status === 'active' 
          ? `Campaign & Festive Offer Section ("${activeFestival.replace('_', ' ').toUpperCase()}") saved & active on storefront!`
          : 'Campaign deactivated successfully.'
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
        <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant text-sm font-sans">Loading campaigns manager...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface p-5 md:p-12 max-w-6xl">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C3A35]">Festive & Occasion Offers Manager</h2>
          <p className="text-stone-600 text-sm mt-1 font-sans">
            Full admin control for Mother&apos;s Day, Women&apos;s Day, Diwali &amp; Special Festive Offer showcase positioned below &ldquo;Jewellery for Every Occasion&rdquo;.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('inactive')}
            disabled={saving}
            className="px-5 py-2.5 border-2 border-red-600 text-red-700 bg-white hover:bg-red-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 rounded-lg shadow-sm focus:outline-none disabled:opacity-50 cursor-pointer"
          >
            Deactivate
          </button>
          <button
            type="button"
            onClick={() => handleSave('active')}
            disabled={saving || activeFestival === 'none'}
            className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 rounded-lg shadow-md disabled:opacity-50 focus:outline-none cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">publish</span>
            {saving ? 'Saving...' : 'Save & Publish to Storefront'}
          </button>
        </div>
      </header>

      {success && <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-lg mb-6 font-medium font-sans flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600">check_circle</span>{success}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-6 font-medium font-sans flex items-center gap-2"><span className="material-symbols-outlined text-red-600">error</span>{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-6 rounded-xl shadow-sm space-y-6">
          
          {/* 1. Festival Template Selection */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3 border-b border-stone-100 pb-2 flex items-center justify-between font-sans">
              <span>1. Select Festival / Occasion Theme</span>
              <span className="text-[11px] text-teal-700 font-semibold">Active: {activeFestival.replace('_', ' ').toUpperCase()}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {FESTIVALS.map((fest) => {
                const isSelected = activeFestival === fest.id;
                return (
                  <button
                    key={fest.id}
                    type="button"
                    onClick={() => setActiveFestival(fest.id)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 relative cursor-pointer ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50 shadow-sm ring-1 ring-teal-700'
                        : 'border-stone-200 bg-white hover:border-teal-600/70 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${isSelected ? 'text-teal-900' : 'text-stone-800'} font-sans`}>
                        {fest.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-teal-700">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 leading-snug font-sans">
                      {fest.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Offer Section Headline & Subtitle */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3 border-b border-stone-100 pb-2 font-sans">
              2. Offer Showcase Content &amp; Headlines
            </h3>
            <div className="space-y-4 font-sans">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Offer Title / Main Heading *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mother's Day & Special Festive Offer"
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none bg-white rounded-lg text-sm text-stone-900 font-serif"
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Offer Subtext / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount."
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-800"
                  value={campaignSubtitle}
                  onChange={e => setCampaignSubtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Discount Code</label>
                  <input
                    type="text"
                    placeholder="e.g. VANITY10"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono uppercase"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Featured Offer Product</label>
                  <select
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 cursor-pointer"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- All Discounted Products --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Offer Collection"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900"
                    value={ctaText}
                    onChange={e => setCtaText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">CTA Destination Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /shop or /collections"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Offer Video & Image Media Controls */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3 border-b border-stone-100 pb-2 font-sans">
              3. Offer Video &amp; Media Uploads
            </h3>
            <div className="space-y-4 font-sans">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-teal-700 w-4 h-4 cursor-pointer"
                    checked={showOfferSection}
                    onChange={e => setShowOfferSection(e.target.checked)}
                  />
                  <span className="text-xs font-semibold text-stone-800">
                    Display Festive Offer Section below &ldquo;Jewellery for Every Occasion&rdquo;
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Offer Video (MP4 file upload or YouTube Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="e.g. https://youtu.be/... or MP4 link"
                    className="flex-grow p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono"
                    value={offerVideoUrl}
                    onChange={e => setOfferVideoUrl(e.target.value)}
                  />
                  <label className="bg-teal-900 hover:bg-teal-800 text-white font-semibold rounded-lg px-4 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0 shadow-sm">
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
                            setOfferVideoUrl(data.url);
                            alert('Offer video uploaded successfully!');
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
                <p className="text-[11px] text-stone-500 mt-1">
                  Upload an MP4 video (e.g. Mother&apos;s Day craftsmanship or jewellery collection promo) to auto-play seamlessly in the showcase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fallback Poster / Banner Image URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /images/kolkata-howrah-jewellery-banner.jpg"
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono"
                  value={offerImageUrl}
                  onChange={e => setOfferImageUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1C3A35] text-white p-6 rounded-xl shadow-lg border border-teal-800/40 font-sans">
            <div className="flex items-center justify-between border-b border-teal-700/60 pb-3 mb-3">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">preview</span>
                Storefront Live Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                {activeFestival.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="font-serif text-lg font-normal text-white">
                {campaignTitle || "Mother's Day & Special Festive Offer"}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {campaignSubtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount."}
              </p>
              
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-amber-400/40 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 font-bold">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  USE CODE: {discountCode || 'VANITY10'}
                </div>
              </div>

              <div className="pt-2">
                <div className="w-full py-2 bg-teal-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 shadow-sm">
                  <span>{ctaText || "Explore Offer Collection"}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-xs text-stone-600 font-sans space-y-2">
            <h5 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-teal-700">info</span>
              Section Placement Rules
            </h5>
            <p className="leading-relaxed">
              • Positioned directly underneath <strong>&ldquo;Jewellery for Every Occasion&rdquo;</strong> and above <strong>&ldquo;Shop by Category&rdquo;</strong>.
            </p>
            <p className="leading-relaxed">
              • Dynamic festival animations &amp; badges update automatically based on selected festival (e.g. Mother&apos;s Day, Women&apos;s Day, Diwali, Eid, etc.).
            </p>
            <p className="leading-relaxed">
              • 100% manageable here in the admin panel anytime without changing codebase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
