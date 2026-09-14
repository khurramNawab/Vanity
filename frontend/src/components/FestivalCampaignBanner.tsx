'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function FestivalCampaignBanner() {
  const [activeFestival, setActiveFestival] = useState<string | null>(null);
  const [bannerText, setBannerText] = useState('');
  const [code, setCode] = useState('');
  const [productImg, setProductImg] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApi('/settings/public')
      .then(res => {
        if (res?.success && res.settings?.campaign_active_festival && res.settings.campaign_active_festival !== 'none') {
          setActiveFestival(res.settings.campaign_active_festival);
          setBannerText(res.settings.campaign_active_text || '');
          setCode(res.settings.campaign_active_code || '');
          setProductImg(res.campaign_product_image || null);
          setProductSlug(res.campaign_product_slug || null);
        } else {
          setActiveFestival(null);
        }
      })
      .catch(err => {
        console.error('Error fetching campaign settings:', err);
        setActiveFestival(null);
      });
  }, []);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeFestival) {
    return null;
  }

  // Define style tokens and icons based on selected festival
  let bgClass = 'bg-[#1A1A1A] text-[#FAF9F6]';
  let title = 'FESTIVE OFFER';
  let animationStyle = '';
  let elements: React.ReactNode = null;

  switch (activeFestival) {
    case 'diwali':
      bgClass = 'bg-gradient-to-r from-[#1A1A1A] via-[#821E12] to-[#1A1A1A] text-white border-y border-[#9A7E44]/30';
      title = '🪔 HAPPY DIWALI 🪔';
      animationStyle = `
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        .sparkle-elem { animation: sparkle 2s infinite ease-in-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
          <span className="absolute left-12 top-4 sparkle-elem text-yellow-300 text-lg">✨</span>
          <span className="absolute right-16 top-3 sparkle-elem text-[#fedb98] text-sm" style={{ animationDelay: '0.7s' }}>✦</span>
          <span className="absolute left-1/3 bottom-2 sparkle-elem text-yellow-200 text-base" style={{ animationDelay: '1.2s' }}>✨</span>
        </div>
      );
      break;
    case 'christmas':
      bgClass = 'bg-gradient-to-r from-[#0C2315] via-[#4A0D0D] to-[#0C2315] text-[#FAF9F6] border-y border-red-800/40';
      title = '❄️ MERRY CHRISTMAS ❄️';
      animationStyle = `
        @keyframes snow {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        .snowflake { animation: snow 4s infinite linear; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <span className="absolute left-[8%] top-1 text-sm snowflake">❄️</span>
          <span className="absolute left-[30%] top-2 text-xs snowflake" style={{ animationDelay: '1.5s', animationDuration: '5s' }}>❄️</span>
          <span className="absolute right-[15%] top-1 text-sm snowflake" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }}>❄️</span>
          <span className="absolute right-[35%] top-2 text-xs snowflake" style={{ animationDelay: '2.2s', animationDuration: '4.5s' }}>❄️</span>
        </div>
      );
      break;
    case 'eid':
      bgClass = 'bg-gradient-to-r from-[#0D1B2A] via-[#1B4332] to-[#0D1B2A] text-[#FAF9F6] border-y border-emerald-500/20';
      title = '🌙 EID MUBARAK 🌙';
      animationStyle = `
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 2px #fff); opacity: 0.4; }
          50% { filter: drop-shadow(0 0 8px #ffd700); opacity: 1; }
        }
        .star-glow { animation: glow 3s infinite ease-in-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <span className="material-symbols-outlined absolute left-[15%] top-4 star-glow text-yellow-200 text-sm">star</span>
          <span className="material-symbols-outlined absolute right-[20%] top-3 star-glow text-white text-xs" style={{ animationDelay: '1.2s' }}>star</span>
        </div>
      );
      break;
    case 'durga_puja':
      bgClass = 'bg-gradient-to-r from-[#620000] via-[#A8201A] to-[#620000] text-white border-y border-[#FFC300]/30';
      title = '🌸 SHUBHO SHARODIYA 🌸';
      animationStyle = `
        @keyframes float-bell {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-4px) rotate(5deg); }
        }
        .puja-bell { animation: float-bell 2.5s infinite ease-in-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 flex items-center justify-between px-16">
          <span className="material-symbols-outlined puja-bell text-yellow-300">notifications</span>
          <span className="material-symbols-outlined puja-bell text-yellow-300" style={{ animationDelay: '1s' }}>notifications</span>
        </div>
      );
      break;
    case 'ganesh_puja':
      bgClass = 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] text-primary border-y border-amber-300/40';
      title = '🌺 HAPPY GANESH CHATURTHI 🌺';
      animationStyle = `
        @keyframes garland {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .garland-anim { animation: garland 3s infinite ease-in-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 flex items-center justify-between px-12">
          <span className="text-xl garland-anim">🌼</span>
          <span className="text-xl garland-anim" style={{ animationDelay: '1.5s' }}>🌼</span>
        </div>
      );
      break;
    case 'republic_day':
    case 'independence_day':
      bgClass = 'bg-gradient-to-r from-[#FF9933] via-white to-[#128807] text-[#000080] border-y border-blue-900/20';
      title = activeFestival === 'republic_day' ? '✨ HAPPY REPUBLIC DAY ✨' : '✨ HAPPY INDEPENDENCE DAY ✨';
      animationStyle = `
        @keyframes patriotic {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(10deg); }
        }
        .patriotic-glow { animation: patriotic 5s infinite linear; }
      `;
      break;
    case 'womens_day':
      bgClass = 'bg-gradient-to-r from-[#4A154B] via-[#E01E5A] to-[#4A154B] text-white border-y border-pink-400/20';
      title = '🌸 HAPPY WOMEN\'S DAY 🌸';
      animationStyle = `
        @keyframes petal {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          50% { opacity: 0.7; }
          100% { transform: translateY(80px) rotate(180deg); opacity: 0; }
        }
        .rose-petal { animation: petal 5s infinite linear; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <span className="absolute left-[12%] top-1 text-sm rose-petal">🌸</span>
          <span className="absolute right-[22%] top-2 text-xs rose-petal" style={{ animationDelay: '2.5s' }}>🌸</span>
        </div>
      );
      break;
    case 'valentines_day':
      bgClass = 'bg-gradient-to-r from-[#590d22] via-[#a21caf] to-[#590d22] text-white border-y border-red-500/20';
      title = '❤️ VALENTINE\'S EDIT ❤️';
      animationStyle = `
        @keyframes heart {
          0% { transform: translateY(40px) scale(0.8); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
        .floating-heart { animation: heart 3.5s infinite ease-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <span className="absolute left-[10%] bottom-0 text-red-400 floating-heart">❤️</span>
          <span className="absolute right-[18%] bottom-0 text-pink-400 floating-heart" style={{ animationDelay: '1.8s' }}>❤️</span>
        </div>
      );
      break;
    case 'raksha_bandhan':
      bgClass = 'bg-gradient-to-r from-[#7B0D1C] via-[#9B2226] to-[#7B0D1C] text-white border-y border-[#EE9B00]/40';
      title = '✨ HAPPY RAKSHA BANDHAN ✨';
      break;
    case 'new_year':
      bgClass = 'bg-gradient-to-r from-[#1A1A1A] via-[#0D1B2A] to-[#1A1A1A] text-white border-y border-yellow-500/35';
      title = '🎆 HAPPY NEW YEAR 🎆';
      animationStyle = `
        @keyframes confetti {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 5px #ffd700); }
        }
        .confetti-glow { animation: confetti 1.5s infinite ease-in-out; }
      `;
      elements = (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 flex items-center justify-around">
          <span className="text-lg confetti-glow">🎉</span>
          <span className="text-lg confetti-glow" style={{ animationDelay: '0.7s' }}>✨</span>
          <span className="text-lg confetti-glow" style={{ animationDelay: '1.2s' }}>🎉</span>
        </div>
      );
      break;
    case 'holi':
      bgClass = 'bg-gradient-to-r from-[#D81B60] via-[#8E24AA] to-[#00ACC1] text-white border-y border-white/20';
      title = '🎨 HAPPY HOLI 🎨';
      animationStyle = `
        @keyframes splash {
          0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
          50% { transform: scale(1.08); filter: hue-rotate(45deg); }
        }
        .color-splash { animation: splash 4s infinite ease-in-out; }
      `;
      break;
  }

  return (
    <div className={`relative w-full ${bgClass} py-3.5 px-5 flex flex-col md:flex-row items-center justify-between gap-4 z-30 transition-all duration-500 overflow-hidden shadow-md`}>
      <style dangerouslySetInnerHTML={{ __html: animationStyle }} />
      {elements}

      {/* Campaign Details */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 relative z-10 text-center md:text-left max-w-4xl">
        <span className="font-headline-md font-bold uppercase tracking-wider text-xs md:text-sm bg-white/10 px-2.5 py-1 rounded border border-white/15 whitespace-nowrap">
          {title}
        </span>
        <p className="font-body-md text-xs md:text-sm font-medium tracking-wide leading-relaxed opacity-95">
          {bannerText}
        </p>
      </div>

      {/* Right Product Spotlight & Promo code */}
      <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
        {code && (
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-primary border border-outline-variant/30 rounded px-2.5 py-1 text-[11px] font-bold font-mono tracking-wider uppercase transition-all shadow-sm active:scale-95 focus:outline-none"
            title="Click to copy coupon code"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'COPIED!' : code}
          </button>
        )}

        {productImg && productSlug && (
          <Link
            href={`/products/${productSlug}`}
            className="group flex items-center gap-2 bg-white/95 hover:bg-white border border-outline-variant/30 rounded p-1 pr-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 rounded bg-surface-container-low overflow-hidden border border-outline-variant/15 flex-shrink-0">
              <img
                src={productImg}
                alt="Featured Product"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Spotlight</span>
              <span className="text-[10px] font-bold text-primary tracking-wide mt-0.5 flex items-center gap-0.5">
                Shop Now
                <span className="material-symbols-outlined text-[10px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
