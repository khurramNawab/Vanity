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
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Exchange', href: '/exchange' },
    { label: 'Career', href: '/career' },
    { label: 'Resources', href: '/resources' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
  ];

  return (
    <footer className="bg-[#005F59] text-white border-t border-[#004D48] mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-5 md:px-12 py-12 w-full max-w-[1280px] mx-auto">
        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-white font-bold mb-2 text-xs tracking-wider uppercase">Quick Links</h4>
          {footerLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-teal-100/90 hover:text-white hover:underline transition-all text-sm font-sans">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-white font-bold mb-2 text-xs tracking-wider uppercase">Stay Updated</h4>
          <p className="text-teal-100/90 font-body-md text-sm mb-2 font-sans">Subscribe for exclusive offers and new arrivals.</p>
          <div className="flex shadow-sm rounded overflow-hidden">
            <input 
              suppressHydrationWarning
              className="w-full bg-white text-[#0F172A] px-3 py-2 text-sm focus:outline-none placeholder:text-neutral-400 font-sans" 
              placeholder="Your email address" 
              type="email" 
            />
            <button 
              suppressHydrationWarning
              type="button"
              className="bg-black text-white px-5 font-bold hover:bg-neutral-900 transition-colors text-xs uppercase tracking-wider font-sans shrink-0"
            >
              JOIN
            </button>
          </div>
        </div>

        {/* Social Icons & Email */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-upper text-label-upper text-white font-bold mb-2 text-xs tracking-wider uppercase">Connect</h4>
          <div className="flex items-center flex-wrap gap-2.5 mt-1">
            {/* Instagram */}
            <a
              href={socialLinks.social_instagram || 'https://www.instagram.com/the_vanityjewels/'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-110 transition-all shadow-md"
              aria-label="Instagram"
              title="Follow us on Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={socialLinks.social_facebook || 'https://www.facebook.com/profile.php?id=61593736651649'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#1877F2] hover:scale-110 transition-all shadow-md"
              aria-label="Facebook"
              title="Follow us on Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={socialLinks.social_linkedin || 'https://www.linkedin.com/company/the-vanity-jewels'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#0A66C2] hover:scale-110 transition-all shadow-md"
              aria-label="LinkedIn"
              title="Connect with us on LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>

            {/* Pinterest */}
            <a
              href={socialLinks.social_pinterest || 'https://pin.it/Cnrv2arp6'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#E60023] hover:scale-110 transition-all shadow-md"
              aria-label="Pinterest"
              title="Follow us on Pinterest"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:info@thevanityjewels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-[#EA4335] hover:scale-110 transition-all shadow-md"
              aria-label="Email"
              title="Email us"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </a>
          </div>

          <a
            href="mailto:info@thevanityjewels.com"
            className="text-teal-100/90 hover:text-white transition-colors text-xs mt-2 inline-flex items-center gap-1.5 font-sans"
          >
            <span className="material-symbols-outlined text-[14px]">alternate_email</span>
            info@thevanityjewels.com
          </a>
        </div>
      </div>
      <div className="border-t border-[#004D48] py-5 text-center flex flex-col items-center gap-2 bg-[#004D48]">
        <p className="text-teal-100 text-xs md:text-sm font-sans">© {new Date().getFullYear()} Vanity. All rights reserved.</p>
      </div>
    </footer>
  );
}
