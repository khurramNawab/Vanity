'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { BLOG_POSTS, getAllCategories } from '@/lib/blogs';

export default function BlogListPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = getAllCategories();

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS[0];

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      <StorefrontNavbar activePath="/blog" />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-8 flex flex-col">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: 'Blog & Heritage Guides' }]} />
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary bg-[#9A7E44]/10 px-3 py-1 rounded-full border border-[#9A7E44]/20">
            Heritage & Connoisseur Guides
          </span>
          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary font-bold mt-3 mb-4 tracking-tight">
            The Vanity Silver Journal
          </h1>
          <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
            Expert insights on 925 sterling silver purity, BIS hallmarking standards, Kolkata artisan craftsmanship, live market pricing, and styling guides.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-outline-variant/30">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search guides, purity, styling..."
              className="w-full bg-white border border-outline-variant/40 rounded-full pl-9 pr-4 py-2 text-xs text-primary focus:outline-none focus:border-primary placeholder:text-outline"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Featured Post Spotlight (When no search / All category) */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="mb-14 bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[300px]">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.imageAlt}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded shadow">
                  Featured Masterclass
                </span>
              </div>
              <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-3">
                    <span className="font-semibold text-secondary">{featuredPost.category}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-4 leading-snug">
                    <Link href={`/blog/${featuredPost.slug}`} className="hover:text-secondary transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-on-surface-variant text-sm line-clamp-3 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-primary">{featuredPost.author.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{featuredPost.publishedAt}</p>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary uppercase tracking-wider transition-colors"
                  >
                    Read Full Article &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-xl font-bold text-primary">
              {searchQuery ? `Search Results (${filteredPosts.length})` : 'All Articles & Guides'}
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">
              Showing {filteredPosts.length} of {BLOG_POSTS.length} posts
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low border border-outline-variant/30 rounded-lg">
              <span className="material-symbols-outlined text-[48px] text-outline-variant mb-2">article</span>
              <p className="text-primary font-semibold">No matching articles found.</p>
              <p className="text-xs text-on-surface-variant mt-1">Try searching for other topics like hallmark, rates, or chokers.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-opacity-90"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <article
                  key={post.slug}
                  className="bg-white border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group"
                >
                  <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                    <img
                      src={post.coverImage}
                      alt={post.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute bottom-3 left-3 bg-white/95 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mb-2">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h4 className="font-headline-md text-lg text-primary font-bold mb-2.5 group-hover:text-secondary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-[11px] font-semibold text-primary">{post.author.name}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                      >
                        Read
                        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Callout Banner */}
        <section className="bg-[#1A1A1A] text-white rounded-xl p-8 md:p-12 text-center border border-[#9A7E44]/40 relative overflow-hidden mb-8">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-secondary text-xs font-bold tracking-widest uppercase mb-2 block">
              The Vanity Connoisseur Club
            </span>
            <h3 className="font-headline-md text-2xl md:text-3xl font-bold mb-3">
              Receive Curated Jewellery Guides & Exclusive Offers
            </h3>
            <p className="text-on-surface-variant text-sm mb-6 text-gray-300">
              Join over 15,000 patrons across Kolkata and India receiving monthly bullion trends, styling masterclasses, and early access to festive collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-secondary rounded"
              />
              <button className="bg-secondary text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded hover:bg-[#8A6E34] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
