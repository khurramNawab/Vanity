import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { BLOG_POSTS, getBlogBySlug } from '@/lib/blogs';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Vanity Jewels',
      description: 'The requested jewellery article could not be found.',
    };
  }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: post.canonicalUrl,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: post.canonicalUrl,
      siteName: 'Vanity | Modern Heirlooms',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.relatedSlugs
    .map(rSlug => getBlogBySlug(rSlug))
    .filter(Boolean) as typeof BLOG_POSTS;

  // JSON-LD Schema for BlogPosting
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vanity Jewels',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thevanityjewels.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.canonicalUrl,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      <StorefrontNavbar activePath="/blog" />

      <main className="flex-grow w-full max-w-[1080px] mx-auto px-5 md:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
          />
        </div>

        {/* Article Header */}
        <header className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-[#9A7E44]/10 border border-[#9A7E44]/30 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {post.readTime}
            </span>
          </div>

          <h1 className="font-headline-lg text-3xl md:text-5xl text-primary font-bold leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Author info bar */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-outline-variant/30">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover border border-outline-variant/30"
            />
            <div className="text-left">
              <p className="text-sm font-bold text-primary">{post.author.name}</p>
              <p className="text-xs text-on-surface-variant">{post.author.role} • Updated {post.modifiedAt}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-12 shadow-lg border border-outline-variant/30">
          <img
            src={post.coverImage}
            alt={post.imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content */}
          <article className="lg:col-span-8 prose prose-neutral max-w-none text-on-surface">
            <div className="space-y-6 text-sm md:text-base leading-relaxed text-[#2B2B2B]">
              {/* Parse sections and content */}
              {post.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('# ')) {
                  return null; // Already rendered as H1
                }

                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={idx} className="font-headline-md text-2xl md:text-3xl font-bold text-primary pt-6 border-b border-outline-variant/20 pb-2">
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="font-headline-md text-xl font-semibold text-primary pt-4">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }

                if (trimmed.startsWith('---')) {
                  return <hr key={idx} className="border-outline-variant/30 my-6" />;
                }

                if (trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
                  return (
                    <div key={idx} className="bg-surface-container-lowest border-l-4 border-secondary p-4 rounded-r my-4">
                      <p className="text-sm md:text-base text-primary whitespace-pre-line leading-relaxed">
                        {trimmed}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="leading-relaxed text-sm md:text-base">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Inner Link Showcase Banner */}
            <div className="bg-[#FAF9F6] border border-[#9A7E44]/40 rounded-xl p-6 md:p-8 my-10 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Artisan Craftsmanship
                  </span>
                  <h4 className="font-headline-md text-xl font-bold text-primary mt-1 mb-2">
                    Experience BIS Hallmarked Kolkata Jewellery
                  </h4>
                  <p className="text-xs text-on-surface-variant max-w-md">
                    Explore our certified 925 sterling silver, CZ diamond embellished pieces, and handcrafted filigree chokers with doorstep delivery across Kolkata.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="bg-primary text-white font-bold text-xs px-6 py-3 rounded uppercase tracking-wider hover:bg-secondary transition-colors whitespace-nowrap"
                >
                  Browse Catalogue &rarr;
                </Link>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface-variant mr-2">Topic Tags:</span>
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-surface-container px-3 py-1 rounded-full text-on-surface-variant font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Author Box */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                About the Author
              </h4>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-outline-variant/30"
                />
                <div>
                  <p className="text-sm font-bold text-primary">{post.author.name}</p>
                  <p className="text-[11px] text-secondary font-medium">{post.author.role}</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Specializing in precious metal assaying, gemstone grading, and historic jewellery craftsmanship in Bengal.
              </p>
            </div>

            {/* Quick Links & Categories */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                Jewellery Categories
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/shop?category=Silver" className="flex items-center justify-between text-on-surface-variant hover:text-primary py-1 border-b border-outline-variant/15">
                    <span>925 Sterling Silver</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=CZ+Embellished" className="flex items-center justify-between text-on-surface-variant hover:text-primary py-1 border-b border-outline-variant/15">
                    <span>CZ American Diamonds</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Brass" className="flex items-center justify-between text-on-surface-variant hover:text-primary py-1 border-b border-outline-variant/15">
                    <span>Artisan Brass & Gold Plated</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Stones" className="flex items-center justify-between text-on-surface-variant hover:text-primary py-1 border-b border-outline-variant/15">
                    <span>Precious & Semi-Precious Stones</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Related Articles Carousel/Grid */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-outline-variant/30">
            <h3 className="font-headline-md text-2xl font-bold text-primary mb-6">
              Related Masterclasses & Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group bg-white border border-outline-variant/30 rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-surface-container-low relative">
                    <img
                      src={related.coverImage}
                      alt={related.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 left-2 bg-white/95 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {related.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <h4 className="font-headline-md text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2 mb-2">
                      {related.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-3">
                      {related.excerpt}
                    </p>
                    <span className="text-[11px] font-bold text-secondary inline-flex items-center gap-1 mt-auto">
                      Read Article &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <StorefrontFooter />
    </div>
  );
}
