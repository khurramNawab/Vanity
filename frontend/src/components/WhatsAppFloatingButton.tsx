'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Hide on admin routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    fetchApi('/settings/public')
      .then(res => {
        if (res.success && res.settings?.whatsapp_number) {
          setWhatsappNumber(res.settings.whatsapp_number);
        }
      })
      .catch(err => console.error('Error loading WhatsApp configuration:', err));
  }, [pathname]);

  // Show tooltip briefly on first load
  useEffect(() => {
    if (whatsappNumber) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        // Hide after 5 seconds
        setTimeout(() => setShowTooltip(false), 5000);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [whatsappNumber]);

  if (!whatsappNumber || pathname?.startsWith('/admin')) {
    return null;
  }

  const message = encodeURIComponent("Hello! I am visiting Vanity Jewels and have a query about your collection.");
  const waUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip */}
      <div 
        className={`bg-[#1A1A1A] text-[#FAF9F6] border border-[#9A7E44]/20 text-xs px-3 py-1.5 rounded mr-3 shadow-lg transition-all duration-300 transform font-medium ${
          showTooltip || 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        Chat with us
      </div>

      {/* Floating Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#1A1A1A] border-2 border-[#9A7E44] text-[#9A7E44] hover:bg-[#9A7E44] hover:text-[#1A1A1A] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-subtle"
        aria-label="Chat on WhatsApp"
      >
        <svg 
          className="w-7 h-7 fill-current" 
          viewBox="0 0 24 24"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.936 9.936 0 0 0 4.779 1.21h.005c5.505 0 9.987-4.479 9.988-9.986.002-2.67-1.037-5.178-2.927-7.07C17.186 2.89 14.682 2.001 12.012 2zm5.727 14.072c-.251.706-1.461 1.294-2.012 1.379-.496.077-1.144.137-3.327-.768-2.793-1.157-4.577-4.004-4.717-4.19-.139-.187-1.127-1.498-1.127-2.859 0-1.36.709-2.029.961-2.302.252-.273.551-.341.735-.341.184 0 .368.002.528.01.166.007.387-.027.604.492.222.531.758 1.849.824 1.983.067.135.111.291.02.474-.09.183-.135.292-.271.45l-.274.321c-.139.15-.285.31-.122.589.162.278.72 1.185 1.54 1.916.82.73 1.512.956 1.845 1.091.332.136.527.113.722-.113.195-.226.837-.974.106-1.157-.123-.031-.806-.341-1.503-.996-.135-.136-.211-.29-.211-.476a.654.654 0 0 1 .184-.442c.16-.166.39-.387.604-.492.215-.106.429-.053.644.053 2.147 1.066 3.565 2.13 3.565 2.13s.253.136.035.733z" />
        </svg>
      </a>
    </div>
  );
}
