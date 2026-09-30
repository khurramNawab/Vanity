'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

const FESTIVALS = [
  { id: 'durga_puja', name: 'Durga Puja', desc: 'Divine golden lights & festive crimson theme' },
  { id: 'mothers_day', name: 'Mother\'s Day', desc: 'Heartfelt appreciation & pink floral blossom theme' },
  { id: 'womens_day', name: 'Women\'s Day', desc: 'Elegant floating floral & lavender theme' },
  { id: 'diwali', name: 'Diwali', desc: 'Sparkle animation & clay lamps gold theme' },
  { id: 'valentines_day', name: 'Valentine\'s Day', desc: 'Floating ruby hearts & romantic glow theme' },
  { id: 'raksha_bandhan', name: 'Raksha Bandhan', desc: 'Traditional thread and auspicious gold theme' },
  { id: 'eid', name: 'Eid', desc: 'Crescent moon & glowing emerald stars theme' },
  { id: 'christmas', name: 'Christmas', desc: 'Gentle falling snow & emerald-ruby theme' },
  { id: 'new_year', name: 'New Year', desc: 'Colorful confetti pop & midnight gold theme' },
  { id: 'ganesh_puja', name: 'Ganesh Puja', desc: 'Marigold garland & auspicious gold glow theme' },
  { id: 'republic_day', name: 'Republic Day', desc: 'Saffron-white-green tricolor theme' },
  { id: 'independence_day', name: 'Independence Day', desc: 'Patriotic tricolor glow theme' },
  { id: 'holi', name: 'Holi', desc: 'Vibrant color splatters & festive joy theme' },
  { id: 'custom', name: 'Custom Offer / Special Sale', desc: 'Custom occasion with tailor-made title and media' },
];

export default function CampaignManagerPage() {
  // 1. Festive Offer Card States
  const [activeFestival, setActiveFestival] = useState('durga_puja');
  const [campaignBadgeText, setCampaignBadgeText] = useState("MOTHER'S DAY & FESTIVE OFFER");
  const [campaignTagText, setCampaignTagText] = useState("Exclusive Festive Edit");
  const [campaignTitle, setCampaignTitle] = useState("Durga Puja Offer");
  const [campaignSubtitle, setCampaignSubtitle] = useState("Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
  const [discountCode, setDiscountCode] = useState('Puja15');
  const [ctaText, setCtaText] = useState('Explore Offer Collection');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [offerVideoUrl, setOfferVideoUrl] = useState('');
  const [offerImageUrl, setOfferImageUrl] = useState('/images/kolkata-howrah-jewellery-banner.jpg');
  const [showOfferSection, setShowOfferSection] = useState(true);

  // 2. VIP Consultation Card States
  const [vipBadgeText, setVipBadgeText] = useState('VIP BESPOKE CONSULTATION');
  const [vipTitle, setVipTitle] = useState('Sterling Silver Personalized Jewelry');
  const [vipSubtitle, setVipSubtitle] = useState('Connect with our master jewellery atelier for custom initials, bridal silverware, or private video consultation.');
  const [vipFreeTag, setVipFreeTag] = useState('✨ 100% Free');
  const [vipButtonText, setVipButtonText] = useState('Confirm VIP Appointment');
  const [vipFormEnabled, setVipFormEnabled] = useState(true);

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
          setActiveFestival(s.campaign_active_festival || 'durga_puja');
          setCampaignBadgeText(s.campaign_badge_text || "MOTHER'S DAY & FESTIVE OFFER");
          setCampaignTagText(s.campaign_tag_text || "Exclusive Festive Edit");
          setCampaignTitle(s.campaign_active_text || "Durga Puja Offer");
          setCampaignSubtitle(s.campaign_subtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
          setDiscountCode(s.campaign_active_code || 'Puja15');
          setCtaText(s.campaign_cta_text || 'Explore Offer Collection');
          setCtaLink(s.campaign_cta_link || '/shop');
          setSelectedProductId(s.campaign_active_product_id || '');
          setOfferVideoUrl(s.campaign_active_video_url || '');
          setOfferImageUrl(s.campaign_active_image_url || '/images/kolkata-howrah-jewellery-banner.jpg');
          setShowOfferSection(s.campaign_show_offer_section !== '0');

          // VIP Consultation Settings
          setVipBadgeText(s.vip_badge_text || 'VIP BESPOKE CONSULTATION');
          setVipTitle(s.vip_title || 'Sterling Silver Personalized Jewelry');
          setVipSubtitle(s.vip_subtitle || 'Connect with our master jewellery atelier for custom initials, bridal silverware, or private video consultation.');
          setVipFreeTag(s.vip_free_tag || '✨ 100% Free');
          setVipButtonText(s.vip_button_text || 'Confirm VIP Appointment');
          setVipFormEnabled(s.vip_form_enabled !== '0');
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
            campaign_badge_text: campaignBadgeText,
            campaign_tag_text: campaignTagText,
            campaign_active_text: campaignTitle,
            campaign_subtitle: campaignSubtitle,
            campaign_active_code: discountCode,
            campaign_cta_text: ctaText,
            campaign_cta_link: ctaLink,
            campaign_active_product_id: selectedProductId,
            campaign_active_video_url: offerVideoUrl,
            campaign_active_image_url: offerImageUrl,
            campaign_show_offer_section: status === 'active' && showOfferSection ? '1' : '0',
            vip_badge_text: vipBadgeText,
            vip_title: vipTitle,
            vip_subtitle: vipSubtitle,
            vip_free_tag: vipFreeTag,
            vip_button_text: vipButtonText,
            vip_form_enabled: vipFormEnabled ? '1' : '0'
          }
        })
      });

      if (res.success) {
        setSuccess(status === 'active' 
          ? `Campaign & VIP Consultation settings ("${activeFestival.replace('_', ' ').toUpperCase()}") saved & active on storefront!`
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
    <div className="bg-surface p-5 md:p-12 max-w-6xl font-sans">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C3A35]">Festive Offers &amp; VIP Consultation Manager</h2>
          <p className="text-stone-600 text-sm mt-1 font-sans">
            100% Dynamic Control for Mother&apos;s Day, Durga Puja, Diwali &amp; all Special Festive Offers + VIP Consultation Form.
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
            {saving ? 'Saving...' : 'Save & Publish Live'}
          </button>
        </div>
      </header>

      {success && <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-lg mb-6 font-medium font-sans flex items-center gap-2"><span className="material-symbols-outlined text-emerald-600">check_circle</span>{success}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-6 font-medium font-sans flex items-center gap-2"><span className="material-symbols-outlined text-red-600">error</span>{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION A: FESTIVE OFFER CARD MANAGER */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm space-y-5">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-teal-900 flex items-center gap-2 font-sans">
                <span className="material-symbols-outlined text-[18px] text-teal-700">campaign</span>
                A. Festive &amp; Occasion Offer Card
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-teal-700 w-4 h-4 cursor-pointer"
                  checked={showOfferSection}
                  onChange={e => setShowOfferSection(e.target.checked)}
                />
                <span className="text-xs font-semibold text-stone-700">Card Visible on Storefront</span>
              </label>
            </div>

            {/* Festival Theme Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 font-sans">
                1. Select Festival / Occasion
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {FESTIVALS.map((fest) => {
                  const isSelected = activeFestival === fest.id;
                  return (
                    <button
                      key={fest.id}
                      type="button"
                      onClick={() => {
                        setActiveFestival(fest.id);
                        if (fest.id === 'durga_puja') {
                          setCampaignTitle('Durga Puja Offer');
                          setCampaignBadgeText('DURGA PUJA & FESTIVE OFFER');
                          setDiscountCode('Puja15');
                        } else if (fest.id === 'mothers_day') {
                          setCampaignTitle("Mother's Day & Special Festive Offer");
                          setCampaignBadgeText("MOTHER'S DAY & FESTIVE OFFER");
                          setDiscountCode('MOM20');
                        }
                      }}
                      className={`p-2.5 border rounded-lg text-left transition-all duration-200 relative cursor-pointer ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50 shadow-sm ring-1 ring-teal-700'
                          : 'border-stone-200 bg-white hover:border-teal-600/70 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${isSelected ? 'text-teal-900' : 'text-stone-800'}`}>
                          {fest.name}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-teal-700">check_circle</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offer Texts */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Top Badge Pill Text</label>
                  <input
                    type="text"
                    placeholder="e.g. MOTHER'S DAY & FESTIVE OFFER"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 uppercase font-bold"
                    value={campaignBadgeText}
                    onChange={e => setCampaignBadgeText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Mini Sub-Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Exclusive Festive Edit"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900"
                    value={campaignTagText}
                    onChange={e => setCampaignTagText(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Main Offer Title / Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Durga Puja Offer / Mother's Day Offer"
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-sm text-stone-900 font-serif"
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Offer Subtext / Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount."
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-800"
                  value={campaignSubtitle}
                  onChange={e => setCampaignSubtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Coupon Discount Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Puja15 or VANITY10"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono uppercase"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    placeholder="e.g. /shop"
                    className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono"
                    value={ctaLink}
                    onChange={e => setCtaLink(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Offer Video (Upload MP4 or YouTube link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="e.g. https://youtu.be/... or direct MP4 link"
                    className="flex-grow p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 font-mono"
                    value={offerVideoUrl}
                    onChange={e => setOfferVideoUrl(e.target.value)}
                  />
                  <label className="bg-teal-900 hover:bg-teal-800 text-white font-semibold rounded-lg px-3.5 py-2 text-xs cursor-pointer transition-colors flex items-center justify-center gap-1 shrink-0">
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
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('vanity_token')}` },
                            body: formData
                          });
                          const data = await response.json();
                          if (data.success && data.url) {
                            setOfferVideoUrl(data.url);
                            alert('Video uploaded successfully!');
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
              </div>
            </div>
          </div>

          {/* SECTION B: VIP CONSULTATION MANAGER */}
          <div className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-teal-900 flex items-center gap-2 font-sans">
                <span className="material-symbols-outlined text-[18px] text-teal-700">diamond</span>
                B. VIP Consultation Card Controls
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-teal-700 w-4 h-4 cursor-pointer"
                  checked={vipFormEnabled}
                  onChange={e => setVipFormEnabled(e.target.checked)}
                />
                <span className="text-xs font-semibold text-stone-700">Form Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">VIP Badge Text</label>
                <input
                  type="text"
                  placeholder="e.g. VIP BESPOKE CONSULTATION"
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900 uppercase font-bold"
                  value={vipBadgeText}
                  onChange={e => setVipBadgeText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Free Tag Pill</label>
                <input
                  type="text"
                  placeholder="e.g. ✨ 100% Free"
                  className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900"
                  value={vipFreeTag}
                  onChange={e => setVipFreeTag(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Consultation Title Heading *</label>
              <input
                type="text"
                placeholder="e.g. Sterling Silver Personalized Jewelry"
                className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-sm text-stone-900 font-serif"
                value={vipTitle}
                onChange={e => setVipTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Consultation Subtext / Description</label>
              <textarea
                rows={2}
                placeholder="e.g. Connect with our master jewellery atelier for custom initials, bridal silverware, or private video consultation."
                className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-800"
                value={vipSubtitle}
                onChange={e => setVipSubtitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Submit Button Label</label>
              <input
                type="text"
                placeholder="e.g. Confirm VIP Appointment"
                className="w-full p-2.5 border border-stone-300 focus:border-teal-700 focus:outline-none bg-white rounded-lg text-xs text-stone-900"
                value={vipButtonText}
                onChange={e => setVipButtonText(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* Right Preview Side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1A1A1A] text-white p-6 rounded-xl shadow-xl border border-amber-400/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">preview</span> Live Storefront Card Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-block bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded">
                {campaignBadgeText || "MOTHER'S DAY & FESTIVE OFFER"}
              </div>
              <h4 className="font-serif text-lg font-normal text-white">
                {campaignTitle || "Durga Puja Offer"}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {campaignSubtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount."}
              </p>
              
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-amber-400/40 px-3 py-1.5 rounded text-xs font-mono text-amber-300 font-bold">
                  <span className="material-symbols-outlined text-[14px]">sell</span>
                  USE CODE: {discountCode || 'Puja15'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-white to-[#F4F9F8] p-5 rounded-xl border-2 border-teal-700/30 shadow-md">
            <div className="text-[10px] font-bold text-teal-800 uppercase tracking-widest mb-3 border-b border-stone-200 pb-2 flex items-center justify-between">
              <span>VIP Card Live Preview</span>
              <span className="text-amber-700 font-bold">{vipFreeTag}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-[#FEF3C7] border border-[#D4AF37] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#92400E] uppercase mb-2">
              <span className="material-symbols-outlined text-[12px]">diamond</span>
              {vipBadgeText}
            </div>
            <h5 className="font-serif text-base font-medium text-stone-900 mb-1">
              {vipTitle}
            </h5>
            <p className="text-xs text-stone-600 leading-relaxed">
              {vipSubtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
