'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import { fetchApi } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetchApi(`/products?search=${encodeURIComponent(query)}`);
      if (res.success) {
        setResults(res.products || []);
      }
    } catch (err) {
      console.error('Error performing search:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerPopularSearch = (term: string) => {
    setQuery(term);
  };

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query]);

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="" />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-12">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Search Catalogue</h1>
        
        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
          <input
            className="flex-1 border border-outline-variant/30 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary bg-surface-container-lowest"
            placeholder="Search for jewellery, silver, collections..."
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded hover:bg-inverse-surface transition-colors font-label-upper text-label-upper text-xs font-semibold uppercase tracking-wider">
            Search
          </button>
        </form>

        {/* Popular searches suggestions */}
        {!searched && (
          <div className="mb-8">
            <h3 className="font-label-upper text-label-upper text-on-surface-variant text-xs mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Silver', 'Earrings', 'Choker', 'Bracelet', 'Pendant', 'Ring'].map(term => (
                <button
                  key={term}
                  onClick={() => triggerPopularSearch(term)}
                  className="px-4 py-1.5 border border-outline-variant/30 text-xs text-on-surface-variant hover:border-primary hover:text-primary transition-colors rounded uppercase tracking-wider font-semibold"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Status & Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-xs">Querying database catalogue...</p>
          </div>
        ) : searched ? (
          <div>
            <h2 className="text-sm font-semibold text-on-surface-variant mb-6 uppercase tracking-wider">
              {results.length} {results.length === 1 ? 'item' : 'items'} found for &quot;{query}&quot;
            </h2>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {results.map((product) => {
                  const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
                  const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                  const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;

                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="group block">
                      <div className="w-full aspect-[3/4] bg-surface-container-low mb-3 relative overflow-hidden border border-outline-variant/10">
                        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                      <h3 className="font-body-md text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">{product.name}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">{material}</p>
                      <p className="text-sm text-primary font-semibold mt-1">{priceText}</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center">
                <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">search_off</span>
                <p className="text-on-surface-variant text-sm max-w-sm">No items found matching your keywords. Please try adjusting your search filters.</p>
              </div>
            )}
          </div>
        ) : null}
      </main>
      
      <StorefrontFooter />
    </div>
  );
}
