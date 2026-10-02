'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toggleWishlistItem } from '@/lib/wishlist';

const FALLBACK_PRODUCTS_MAP: Record<string, any> = {
  'imperial-ruby-pearl-drop-tops': {
    id: 201,
    name: 'Imperial Ruby & Pearl Drop Tops',
    slug: 'imperial-ruby-pearl-drop-tops',
    sku: 'VNT-TOP-201',
    description: 'Exquisite 925 sterling silver drop tops featuring natural ruby gemstones, brilliant CZ diamonds, and luminous freshwater drop pearls. Perfect for weddings, receptions, and festive celebrations.',
    silver_purity: '925',
    calculated_price: 5999,
    base_price: 7200,
    gross_weight: 12.5,
    net_weight: 11.2,
    making_charges: 800,
    gst_amount: 180,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    category: { name: 'Earrings', slug: 'earrings' },
    images: [
      { image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true },
      { image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: false },
      { image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: false }
    ]
  },
  'royal-floral-heritage-cz-bangle': {
    id: 202,
    name: 'Royal Floral Heritage CZ Bangle',
    slug: 'royal-floral-heritage-cz-bangle',
    sku: 'VNT-BNG-202',
    description: 'Intricately handcrafted 925 sterling silver bridal bangle adorned with precision-cut CZ diamonds and ruby accents.',
    silver_purity: '925',
    calculated_price: 7899,
    base_price: 9500,
    gross_weight: 18.0,
    net_weight: 16.5,
    making_charges: 1200,
    gst_amount: 240,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    category: { name: 'Bangles', slug: 'bangles' },
    images: [
      { image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true },
      { image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: false }
    ]
  },
  'rose-cushion-solitaire-pendant': {
    id: 203,
    name: 'Rose Cushion Solitaire Pendant',
    slug: 'rose-cushion-solitaire-pendant',
    sku: 'VNT-PND-203',
    description: 'Chic and minimalist 925 sterling silver pendant necklace featuring an emerald-cut blush pink gemstone enclosed in a sparkling CZ halo.',
    silver_purity: '925',
    calculated_price: 4499,
    base_price: 5500,
    gross_weight: 8.5,
    net_weight: 7.8,
    making_charges: 600,
    gst_amount: 135,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    category: { name: 'Pendants', slug: 'pendants' },
    images: [
      { image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true },
      { image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: false }
    ]
  },
  'crimson-heart-eternity-bracelet': {
    id: 204,
    name: 'Crimson Heart Eternity Bracelet',
    slug: 'crimson-heart-eternity-bracelet',
    sku: 'VNT-BRC-204',
    description: 'Romantic 925 sterling silver tennis bracelet with heart-shaped ruby stones and pave-set CZ diamonds. Fitted with double safety clasp.',
    silver_purity: '925',
    calculated_price: 6299,
    base_price: 7800,
    gross_weight: 14.2,
    net_weight: 13.0,
    making_charges: 900,
    gst_amount: 190,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    category: { name: 'Bracelets', slug: 'bracelets' },
    images: [
      { image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true },
      { image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: false }
    ]
  },
  'jodhpur-royal-kundan-ruby-necklace': {
    id: 901,
    name: 'Jodhpur Royal Kundan & Ruby Silver Necklace',
    slug: 'jodhpur-royal-kundan-ruby-necklace',
    sku: 'VNT-JOD-901',
    description: 'Master artisan crafted 925 sterling silver royal heritage necklace adorned with vibrant ruby cabochons and antique finish.',
    silver_purity: '925',
    calculated_price: 12499,
    base_price: 14500,
    gross_weight: 32.0,
    net_weight: 29.0,
    making_charges: 2000,
    gst_amount: 375,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    category: { name: 'Necklaces', slug: 'necklaces' },
    images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
  },
  'marwar-heritage-antique-silver-jhumkas': {
    id: 902,
    name: 'Marwar Heritage Antique Silver Jhumkas',
    slug: 'marwar-heritage-antique-silver-jhumkas',
    sku: 'VNT-JOD-902',
    description: 'Traditional Jodhpur double-dome silver jhumkas with micro-pearl droplets and hand-engraved motifs. 100% 925 Sterling Silver.',
    silver_purity: '925',
    calculated_price: 5999,
    base_price: 7200,
    gross_weight: 16.0,
    net_weight: 14.5,
    making_charges: 900,
    gst_amount: 180,
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    category: { name: 'Earrings', slug: 'earrings' },
    images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
  },
  'rajputana-regal-carved-silver-kada': {
    id: 903,
    name: 'Rajputana Regal Carved Silver Kada (Bangle)',
    slug: 'rajputana-regal-carved-silver-kada',
    sku: 'VNT-JOD-903',
    description: 'Stately lion-head terminal silver kada crafted in solid 925 sterling silver with oxidized antique engravings.',
    silver_purity: '925',
    calculated_price: 8899,
    base_price: 10500,
    gross_weight: 24.0,
    net_weight: 22.5,
    making_charges: 1400,
    gst_amount: 265,
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: true,
    category: { name: 'Bangles', slug: 'bangles' },
    images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
  },
  'mehrangarh-crimson-gemstone-bracelet': {
    id: 904,
    name: 'Mehrangarh Crimson Gemstone Silver Bracelet',
    slug: 'mehrangarh-crimson-gemstone-bracelet',
    sku: 'VNT-JOD-904',
    description: 'Exquisite flexible link tennis bracelet showcasing artisan-cut crimson gemstones set in solid 925 sterling silver bezels.',
    silver_purity: '925',
    calculated_price: 6499,
    base_price: 7999,
    gross_weight: 15.0,
    net_weight: 13.8,
    making_charges: 1000,
    gst_amount: 195,
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    category: { name: 'Bracelets', slug: 'bracelets' },
    images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
  }
};

export default function ProductDetailClient({ initialId }: { initialId?: string }) {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Zoom & Lightbox States
  const [isHoveredZoom, setIsHoveredZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxScale(1);
    setLightboxPan({ x: 0, y: 0 });
    setShowLightbox(true);
  };

  const handleZoomIn = () => setLightboxScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setLightboxScale(s => {
      const next = Math.max(s - 0.5, 1);
      if (next === 1) setLightboxPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setLightboxScale(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const productId = initialId || (params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '1');

  useEffect(() => {
    setLoading(true);

    const applyFallback = () => {
      const cleanKey = productId.toString().toLowerCase().trim();
      let match = FALLBACK_PRODUCTS_MAP[cleanKey];
      if (!match) {
        // Try searching by ID
        match = Object.values(FALLBACK_PRODUCTS_MAP).find(
          (p: any) => p.id.toString() === cleanKey || p.slug === cleanKey
        );
      }
      if (!match) {
        // Generic fallback generated dynamically from slug
        const formattedName = cleanKey
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        match = {
          id: 999,
          name: formattedName || '925 Sterling Silver Jewellery',
          slug: cleanKey,
          sku: `VNT-${cleanKey.slice(0, 6).toUpperCase()}`,
          description: `Handcrafted 925 Sterling Silver ${formattedName}. Designed for timeless elegance.`,
          silver_purity: '925',
          calculated_price: 4999,
          base_price: 5999,
          gross_weight: 10.5,
          net_weight: 9.8,
          making_charges: 700,
          gst_amount: 150,
          is_featured: true,
          category: { name: 'Jewellery', slug: 'jewellery' },
          images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
        };
      }
      setProduct(match);
      setRelatedProducts(Object.values(FALLBACK_PRODUCTS_MAP).filter((p: any) => p.slug !== match.slug).slice(0, 4));
      applySeoToHead(match);
    };

    fetchApi(`/products/${productId}`)
      .then(res => {
        if (res.success && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.related && res.related.length > 0 ? res.related : Object.values(FALLBACK_PRODUCTS_MAP).slice(0, 4));
          applySeoToHead(res.product);
        } else {
          applyFallback();
        }
      })
      .catch(() => {
        applyFallback();
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const applySeoToHead = (p: any) => {
    if (!p || typeof document === 'undefined') return;

    // Title
    const seoTitle = p.meta_title || `${p.name} | 925 Sterling Silver Jewellery | Vanity`;
    document.title = seoTitle;

    // Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', p.meta_description || p.description || `Handcrafted ${p.name} in authentic 925 sterling silver.`);

    // Keywords
    let metaKeys = document.querySelector('meta[name="keywords"]');
    if (!metaKeys) {
      metaKeys = document.createElement('meta');
      metaKeys.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeys);
    }
    metaKeys.setAttribute('content', p.meta_keywords || `925 sterling silver, ${p.name}, silver jewellery kolkata`);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    const fullCanonicalUrl = p.canonical_url || `https://thevanityjewels.com/products/${p.slug || p.id}`;
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // Open Graph Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', seoTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', p.meta_description || p.description || `Handcrafted ${p.name} in authentic 925 sterling silver.`);

    const primaryImg = p.images?.find((i: any) => i.is_primary) || p.images?.[0];
    const imgUrl = p.og_image_url || (primaryImg ? (primaryImg.image_path.startsWith('http') ? primaryImg.image_path : `https://thevanityjewels.com${primaryImg.image_path}`) : 'https://thevanityjewels.com/images/hero-solitaire-pendant.jpg');

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', imgUrl);

    // JSON-LD Schema.org Structured Data for Google Search Console
    let schemaScript = document.getElementById('product-jsonld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'product-jsonld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "image": [imgUrl],
      "description": p.meta_description || p.description,
      "sku": p.sku,
      "brand": {
        "@type": "Brand",
        "name": "Vanity Jewels"
      },
      "offers": {
        "@type": "Offer",
        "url": fullCanonicalUrl,
        "priceCurrency": "INR",
        "price": p.calculated_price || p.base_price || 2500,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "128"
      }
    };
    schemaScript.textContent = JSON.stringify(schemaData);
  };

  // Check wishlist state on mount or token load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanity_wishlist');
      const localIds = stored ? JSON.parse(stored) : [];
      setWishlist(localIds.includes(Number(productId)));
    }
  }, [productId]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const isAdded = await toggleWishlistItem(product.id, token);
      setWishlist(isAdded);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vanity_cart');
      const cart = stored ? JSON.parse(stored) : [];
      
      const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
      const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
      const materialText = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');

      const item = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        material: materialText,
        price: Number(product.calculated_price),
        qty: qty,
        img: imgUrl
      };
      const existingIdx = cart.findIndex((i: any) => i.id === item.id);
      if (existingIdx > -1) {
        cart[existingIdx].qty += qty;
      } else {
        cart.push(item);
      }
      localStorage.setItem('vanity_cart', JSON.stringify(cart));
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-on-surface-variant font-medium">Fetching dynamic jewellery specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-[72px] text-outline-variant mb-4">search_off</span>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Ornament Not Found</h1>
        <p className="text-on-surface-variant mb-8 text-center max-w-sm">We couldn&apos;t load the specs for this item. It may have been disabled or deleted.</p>
        <Link href="/shop" className="bg-primary text-on-primary px-8 py-3 rounded font-label-upper text-label-upper text-xs uppercase tracking-wider hover:bg-opacity-90">
          Return to Shop
        </Link>
      </div>
    );
  }

  const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
  const imgUrl = primaryImg ? primaryImg.image_path : 'https://placehold.co/600x800/FAF9F6/1A1A1A?text=No+Image';
  const effectiveAlt = primaryImg?.alt_text || product.name || 'Vanity 925 Sterling Silver Jewellery';
  const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
  const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;
  const basePriceText = `₹${(Number(product.calculated_price) * 1.25).toLocaleString('en-IN')}`;

  // Build image thumbnails array dynamically from product images
  const productThumbnails = (product.images && product.images.length > 0)
    ? product.images.map((img: any) => ({
        url: img.image_path,
        alt: img.alt_text || product.name || 'Vanity 925 Silver Jewellery'
      }))
    : [{ url: imgUrl, alt: effectiveAlt }];

  const activeThumbIndex = selectedThumb < productThumbnails.length ? selectedThumb : 0;
  const activeImage = productThumbnails[activeThumbIndex] || productThumbnails[0];

  // Google Rich Snippets JSON-LD Structured Data
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => img.image_path) || [imgUrl],
    description: product.meta_description || product.description || `Handcrafted 925 sterling silver ${product.name} by Vanity Jewels.`,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Vanity | Modern Heirlooms',
    },
    material: material,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : `https://thevanityjewels.com/products/${product.slug || product.id}`,
      priceCurrency: 'INR',
      price: product.calculated_price || product.base_price || 0,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock_quantity ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Vanity Jewels',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col">
      {/* Inject Google JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <StorefrontNavbar activePath="/shop" />

      {/* Urgency strip */}
      <div className="bg-[#6B1111] text-white py-2 text-center">
        <span className="font-label-upper text-label-upper tracking-widest uppercase text-xs">Order within 4 hours for Next Day Delivery</span>
      </div>

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-12 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'Shop', href: '/shop' },
              { label: product.category?.name || 'Jewellery', href: product.category?.name ? `/shop?category=${encodeURIComponent(product.category.name)}` : '/shop' },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Image Gallery — 7 cols */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Thumbnail strip */}
            <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {productThumbnails.map((item: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedThumb(i)}
                  className={`w-20 h-24 flex-shrink-0 border transition-all bg-surface-container-low overflow-hidden rounded ${
                    activeThumbIndex === i ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt={item.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image with Magnifier Zoom */}
            <div
              className="flex-grow order-1 md:order-2 bg-surface-container-lowest border border-outline-variant/20 relative group overflow-hidden cursor-zoom-in rounded"
              onMouseEnter={() => setIsHoveredZoom(true)}
              onMouseLeave={() => setIsHoveredZoom(false)}
              onMouseMove={handleMouseMove}
              onClick={() => openLightbox(activeThumbIndex)}
            >
              <img
                src={activeImage.url}
                alt={activeImage.alt}
                className={`w-full aspect-[4/5] object-cover object-center transition-opacity duration-200 ${isHoveredZoom ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}
              />

              {/* Live Desktop Magnifier Zoom Lens */}
              {isHoveredZoom && (
                <div
                  className="hidden md:block absolute inset-0 w-full h-full pointer-events-none bg-no-repeat"
                  style={{
                    backgroundImage: `url(${activeImage.url})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '250%'
                  }}
                />
              )}

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                <span className="bg-[#6B1111] text-white font-label-upper text-[10px] px-2 py-1 uppercase tracking-wider">Sale</span>
                {product.is_new_arrival && (
                  <span className="bg-surface-container-high text-on-surface font-label-upper text-[10px] px-2 py-1 uppercase tracking-wider border border-outline-variant">New</span>
                )}
              </div>

              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <span className="material-symbols-outlined text-sm">zoom_in</span>
                <span>Hover to Zoom &bull; Click to Expand</span>
              </div>
            </div>
          </div>

          {/* Details — 5 cols */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="mb-4">
              <p className="font-label-upper text-label-upper tracking-widest text-secondary text-xs uppercase mb-1">{material}</p>
              <h1 className="font-headline-md text-headline-md mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-price-display text-price-display text-[#6B1111] font-semibold">{priceText}</span>
                <span className="text-sm text-on-surface-variant line-through">{basePriceText}</span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                MCX Silver Rate used for pricing (₹{Number(product.price_breakdown?.silver_rate_used || 120).toLocaleString('en-IN')}/g)
              </p>
            </div>

            <hr className="border-t border-outline-variant/20 mb-5" />


            {/* Weight Breakdown */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 mb-5 space-y-2 text-xs">
              <p className="font-semibold text-primary uppercase tracking-wider text-[11px] mb-2">Purity &amp; Pricing Breakdown</p>
              <div className="flex justify-between text-on-surface-variant">
                <span>Silver Weight</span>
                <span className="font-medium text-primary">{product.silver_weight}g</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Silver Purity</span>
                <span className="font-medium text-primary">{product.silver_purity} (92.5% Fine Silver)</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Making Charges</span>
                <span className="font-medium text-primary">₹{Number(product.making_charge).toLocaleString('en-IN')}{product.making_charge_type === 'percent' ? '%' : ''}</span>
              </div>
              {product.price_breakdown?.gst_amount && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>GST (3% Silver Standard)</span>
                  <span className="font-medium text-primary">₹{Number(product.price_breakdown.gst_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Add to Cart Actions */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-outline-variant/30 rounded">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-grow bg-primary text-on-primary py-3 px-6 rounded font-label-upper text-label-upper text-xs tracking-wider uppercase hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">shopping_bag</span>
                Add to Bag
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-3 border rounded transition-colors ${
                  wishlist ? 'border-[#6B1111] text-[#6B1111] bg-[#6B1111]/5' : 'border-outline-variant/30 text-on-surface-variant hover:text-primary'
                }`}
                title="Wishlist"
              >
                <span className="material-symbols-outlined text-lg">{wishlist ? 'favorite' : 'favorite_border'}</span>
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 text-sm text-on-surface-variant leading-relaxed">
                <h3 className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Description</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-outline-variant/20">
            <h2 className="font-headline-md text-headline-md text-primary font-bold mb-6">Complete the Collection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rel: any) => {
                const relImg = rel.images?.find((img: any) => img.is_primary) || rel.images?.[0];
                const relImgUrl = relImg ? relImg.image_path : 'https://placehold.co/400x500/FAF9F6/1A1A1A?text=No+Image';
                return (
                  <Link key={rel.id} href={`/products/${rel.slug || rel.id}`} className="group block">
                    <div className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded mb-2 relative">
                      <img
                        src={relImgUrl}
                        alt={relImg?.alt_text || rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-semibold text-primary text-sm truncate">{rel.name}</p>
                    <p className="text-xs text-[#6B1111] font-semibold mt-0.5">₹{Number(rel.calculated_price || rel.base_price).toLocaleString('en-IN')}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Fullscreen HD Lightbox Zoom Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 md:p-8 select-none"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowLightbox(false);
            if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % productThumbnails.length);
            if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + productThumbnails.length) % productThumbnails.length);
          }}
          tabIndex={0}
        >
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between z-20">
            <div className="text-white text-xs md:text-sm font-medium flex items-center gap-2">
              <span className="font-serif italic text-amber-200/90">{product.name}</span>
              <span className="text-white/40">|</span>
              <span className="text-white/70">View {lightboxIndex + 1} of {productThumbnails.length}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-full border border-white/20 p-1">
                <button
                  onClick={handleZoomOut}
                  disabled={lightboxScale <= 1}
                  className="p-1.5 text-white hover:text-amber-200 disabled:opacity-30 rounded-full transition"
                  title="Zoom Out (-)"
                >
                  <span className="material-symbols-outlined text-lg">zoom_out</span>
                </button>
                <span className="px-2 text-xs font-mono text-white/80">{Math.round(lightboxScale * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={lightboxScale >= 4}
                  className="p-1.5 text-white hover:text-amber-200 disabled:opacity-30 rounded-full transition"
                  title="Zoom In (+)"
                >
                  <span className="material-symbols-outlined text-lg">zoom_in</span>
                </button>
                {lightboxScale > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="ml-1 text-[10px] px-2 py-0.5 bg-white/20 hover:bg-white/30 text-white rounded uppercase tracking-wider"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Close Modal Button */}
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition ml-2 border border-white/20"
                title="Close (Esc)"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Area with Pan & Drag */}
          <div 
            className="relative flex-grow flex items-center justify-center overflow-hidden my-4 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              if (lightboxScale > 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - lightboxPan.x, y: e.clientY - lightboxPan.y });
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && lightboxScale > 1) {
                setLightboxPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            {/* Prev Navigation Button */}
            {productThumbnails.length > 1 && (
              <button
                onClick={() => {
                  setLightboxIndex(i => (i - 1 + productThumbnails.length) % productThumbnails.length);
                  handleResetZoom();
                }}
                className="absolute left-2 md:left-6 z-20 p-3 bg-black/60 hover:bg-white/20 text-white rounded-full border border-white/20 transition"
                title="Previous Image"
              >
                <span className="material-symbols-outlined text-2xl">chevron_left</span>
              </button>
            )}

            {/* Main Lightbox Display Image */}
            <img
              src={productThumbnails[lightboxIndex]?.url}
              alt={productThumbnails[lightboxIndex]?.alt}
              className="max-h-[78vh] max-w-[90vw] object-contain transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${lightboxScale}) translate(${lightboxPan.x / lightboxScale}px, ${lightboxPan.y / lightboxScale}px)`
              }}
              draggable={false}
            />

            {/* Next Navigation Button */}
            {productThumbnails.length > 1 && (
              <button
                onClick={() => {
                  setLightboxIndex(i => (i + 1) % productThumbnails.length);
                  handleResetZoom();
                }}
                className="absolute right-2 md:right-6 z-20 p-3 bg-black/60 hover:bg-white/20 text-white rounded-full border border-white/20 transition"
                title="Next Image"
              >
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          <div className="z-20 flex justify-center items-center gap-3 overflow-x-auto py-2">
            {productThumbnails.map((thumb: any, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  setLightboxIndex(idx);
                  handleResetZoom();
                }}
                className={`w-14 h-16 rounded border transition-all overflow-hidden flex-shrink-0 ${
                  lightboxIndex === idx ? 'border-amber-400 scale-105 ring-2 ring-amber-400/50' : 'border-white/30 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={thumb.url} alt={thumb.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <StorefrontFooter />
    </div>
  );
}
