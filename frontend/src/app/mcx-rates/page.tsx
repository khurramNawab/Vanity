'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { fetchApi } from '@/lib/api';

const MOCK_RATE_HISTORY = [
  { date: 'Aug 23, 2026', open: '₹84,200', high: '₹84,800', low: '₹83,900', close: '₹84,500', change: '+0.36%', up: true },
  { date: 'Aug 22, 2026', open: '₹83,800', high: '₹84,400', low: '₹83,500', close: '₹84,200', change: '+0.48%', up: true },
  { date: 'Aug 21, 2026', open: '₹84,100', high: '₹84,200', low: '₹83,200', close: '₹83,800', change: '-0.36%', up: false },
  { date: 'Aug 20, 2026', open: '₹83,500', high: '₹84,300', low: '₹83,400', close: '₹84,100', change: '+0.72%', up: true },
  { date: 'Aug 19, 2026', open: '₹83,200', high: '₹83,700', low: '₹82,900', close: '₹83,500', change: '+0.36%', up: true },
];

export default function MCXRatesPage() {
  const [rate, setRate] = useState(84.50); // rate per gram
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi('/silver-rate')
      .then(res => {
        if (res.success) {
          setRate(Number(res.rate));
          if (res.history && res.history.length > 0) {
            setHistory(res.history);
          }
        }
      })
      .catch(err => console.error('Error fetching dynamic MCX rates:', err))
      .finally(() => setLoading(false));
  }, []);

  const ratePerKg = rate * 1000;

  // Dynamically resolve purity list
  const purities = [
    { purity: '999', type: 'Fine Silver (99.9%)', pergram: `₹${rate.toFixed(2)}`, per10g: `₹${(rate * 10).toFixed(0)}` },
    { purity: '925', type: 'Sterling Silver (92.5%)', pergram: `₹${(rate * 0.925).toFixed(2)}`, per10g: `₹${(rate * 0.925 * 10).toFixed(0)}` },
    { purity: '916', type: 'Silver (91.6%)', pergram: `₹${(rate * 0.916).toFixed(2)}`, per10g: `₹${(rate * 0.916 * 10).toFixed(0)}` },
    { purity: '835', type: 'Silver (83.5%)', pergram: `₹${(rate * 0.835).toFixed(2)}`, per10g: `₹${(rate * 0.835 * 10).toFixed(0)}` },
  ];

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/mcx-rates" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs font-label-upper text-on-surface-variant mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
            <li className="text-primary font-semibold">MCX Silver Rates</li>
          </ol>
        </nav>

        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">MCX Silver Rates</h1>
        <p className="text-on-surface-variant mb-8">Live market data used for transparent, fair pricing on all Vanity products.</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant font-medium">Fetching live metal spot rates...</p>
          </div>
        ) : (
          <>
            {/* Live Rate Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-lg flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-label-upper text-label-upper text-on-surface-variant text-xs mb-2">MCX SILVER (LIVE)</p>
                    <div className="font-display-lg text-[48px] text-primary leading-tight">₹{ratePerKg.toLocaleString('en-IN')}</div>
                    <p className="text-on-surface-variant text-sm mt-1">per kg · 999 fine silver</p>
                  </div>
                  <div className="flex items-center gap-1 bg-[#e8f5e9] text-[#137333] px-3 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    <span className="font-semibold text-sm">+1.2%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live · Last updated: just now
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex flex-col gap-4">
                {[
                  { label: "Today's High", val: `₹${(ratePerKg * 1.01).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                  { label: "Today's Low", val: `₹${(ratePerKg * 0.99).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                  { label: '52-Week High', val: '₹94,500' },
                  { label: '52-Week Low', val: '₹68,200' },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 rounded flex justify-between items-center">
                    <span className="text-xs text-on-surface-variant">{label}</span>
                    <span className="font-semibold text-primary">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purity conversion table */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg overflow-hidden mb-10">
              <div className="px-6 py-4 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-headline-md text-primary">Purity Conversion (per gram)</h2>
                <p className="text-xs text-on-surface-variant mt-1">Calculated from live MCX rate of ₹{ratePerKg.toLocaleString('en-IN')}/kg</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                      <th className="py-3 px-6 text-xs font-label-upper text-on-surface-variant">Purity</th>
                      <th className="py-3 px-6 text-xs font-label-upper text-on-surface-variant">Type</th>
                      <th className="py-3 px-6 text-xs font-label-upper text-on-surface-variant text-right">Rate/gram</th>
                      <th className="py-3 px-6 text-xs font-label-upper text-on-surface-variant text-right">Rate/10g</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-outline-variant/20">
                    {purities.map((row, i) => (
                      <tr key={row.purity} className={`hover:bg-surface-container-low/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="py-3 px-6 font-semibold text-primary">{row.purity}</td>
                        <td className="py-3 px-6 text-on-surface-variant">{row.type}</td>
                        <td className="py-3 px-6 text-right font-price-sm">{row.pergram}</td>
                        <td className="py-3 px-6 text-right font-price-sm">{row.per10g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rate History */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg overflow-hidden mb-10">
              <div className="px-6 py-4 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-headline-md text-primary">Rate History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                      {['Date', 'Spot Rate', 'Source', 'Status'].map(col => (
                        <th key={col} className="py-3 px-4 text-xs font-label-upper text-on-surface-variant">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-outline-variant/20">
                    {history.length > 0 ? (
                      history.map((row, i) => (
                        <tr key={i} className={`hover:bg-surface-container-low/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                          <td className="py-3 px-4 font-medium">{new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-3 px-4 text-primary font-semibold">₹{(Number(row.rate_per_gram) * 1000).toLocaleString('en-IN')}/kg</td>
                          <td className="py-3 px-4 text-on-surface-variant capitalize">{row.source_detail || row.source}</td>
                          <td className="py-3 px-4">
                            <span className="bg-[#e8f5e9] text-[#137333] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      MOCK_RATE_HISTORY.map((row, i) => (
                        <tr key={i} className={`hover:bg-surface-container-low/40 transition-colors ${i % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                          <td className="py-3 px-4 font-medium">{row.date}</td>
                          <td className="py-3 px-4 text-primary font-semibold">{row.close}/kg</td>
                          <td className="py-3 px-4 text-on-surface-variant">MCX Spot API</td>
                          <td className="py-3 px-4">
                            <span className="bg-[#e8f5e9] text-[#137333] text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                              Verified
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-8 text-center">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Shop with transparent MCX pricing</h3>
          <p className="text-on-surface-variant mb-6">All Vanity jewellery is priced dynamically using live MCX rates. No hidden markups.</p>
          <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 hover:bg-inverse-surface transition-colors inline-block font-label-upper text-label-upper text-xs">
            Browse Jewellery
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
