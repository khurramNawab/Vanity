'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function StorefrontFooter() {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApi('/settings/public')
      .then(res => {
        if (res.success) {
          setSocialLinks(res.settings);
        }
      })
      .catch(err => console.error('Error fetching social links:', err));
  }, []);

  const footerLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Blog & Heritage Guides', href: '/blog' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Exchange', href: '/exchange' },
    { label: 'Career', href: '/career' },
    { label: 'Resources', href: '/resources' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ];

  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-5 md:px-12 py-12 w-full max-w-[1280px] mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="font-headline-md text-headline-md text-primary font-bold">Vanity</Link>
          <p className="text-on-surface font-body-md text-body-md">Modern Heirlooms. BIS Hallmarked Excellence.</p>
          <div className="mt-2 inline-flex items-center gap-2 border border-[#9A7E44] px-3 py-2 bg-surface max-w-max">
            <span className="material-symbols-outlined text-[#9A7E44] text-[20px]">verified</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9A7E44]">BIS Hallmarked</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-primary font-semibold mb-2 text-xs">Quick Links</h4>
          {footerLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-on-surface-variant hover:text-primary hover:underline transition-all text-sm">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-primary font-semibold mb-2 text-xs">Stay Updated</h4>
          <p className="text-on-surface font-body-md text-sm mb-2">Subscribe for exclusive offers and new arrivals.</p>
          <div className="flex">
            <input 
              suppressHydrationWarning
              className="w-full bg-white border border-outline-variant px-3 py-2 text-sm focus:outline-none focus:border-primary placeholder:text-outline-variant" 
              placeholder="Your email address" 
              type="email" 
            />
            <button 
              suppressHydrationWarning
              type="button"
              className="bg-primary text-white px-4 font-label-upper text-label-upper hover:bg-secondary transition-colors text-xs"
            >
              JOIN
            </button>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-primary font-semibold mb-2 text-xs">Connect</h4>
          <div className="flex items-center flex-wrap gap-3 mt-1">
            {/* Instagram */}
            <a
              href={socialLinks.social_instagram || 'https://www.instagram.com/the_vanityjewels/'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:text-[#E4405F] hover:border-[#E4405F] hover:bg-[#E4405F]/5 transition-all shadow-sm"
              aria-label="Instagram"
              title="Follow us on Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={socialLinks.social_facebook || 'https://www.facebook.com/profile.php?id=61593736651649'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2]/5 transition-all shadow-sm"
              aria-label="Facebook"
              title="Follow us on Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={socialLinks.social_linkedin || 'https://www.linkedin.com/company/the-vanity-jewels'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:text-[#0A66C2] hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all shadow-sm"
              aria-label="LinkedIn"
              title="Connect with us on LinkedIn"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            {/* Email */}
            <a
              href={
                socialLinks.social_email
                  ? (socialLinks.social_email.startsWith('mailto:') ? socialLinks.social_email : `mailto:${socialLinks.social_email}`)
                  : 'mailto:thevanityjewels@gmail.com'
              }
              className="w-10 h-10 border border-outline-variant/30 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
              aria-label="Email"
              title="Email us"
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>

          <a
            href="mailto:thevanityjewels@gmail.com"
            className="text-on-surface-variant hover:text-primary transition-colors text-xs mt-2 inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">alternate_email</span>
            thevanityjewels@gmail.com
          </a>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 py-6 text-center flex flex-col items-center gap-2 bg-surface-container-high/25">
        <p className="text-on-surface-variant text-sm font-body-md">© {new Date().getFullYear()} Vanity. BIS Hallmarked Excellence.</p>
        
        {/* Developer credits */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant/80 font-medium">
          <span>Made with</span>
          <span className="material-symbols-outlined text-[16px] text-red-500 animate-pulse font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span>by</span>
          <a 
            href="https://www.linkedin.com/in/khurram-nawab30/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="relative group overflow-hidden bg-gradient-to-r from-[#9A7E44] to-[#c5a85c] text-white px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 shadow-sm hover:shadow-md transition-all hover:scale-105"
          >
            {/* Glossy overlay effect */}
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              Khurram
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
