'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import StorefrontNavbar from '@/components/StorefrontNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import FestivalCampaignBanner from '@/components/FestivalCampaignBanner';
import { fetchApi } from '@/lib/api';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { useAuth } from '@/context/AuthContext';
import { getLocalWishlist, toggleWishlistItem } from '@/lib/wishlist';
import { useStoreSettings } from '@/lib/settings';

const OCCASIONS = [
  {
    id: 'festive',
    label: 'Festive Shopping',
    icon: 'celebration',
    h4Heading: 'Festive Shopping',
    description: 'Durga Puja, Diwali, and Poila Boishakh call for pieces that stand out with brilliant silver craft.',
    badge: 'Festive Edit',
    ctaText: 'Explore Festive Collection',
  },
  {
    id: 'wedding',
    label: 'Wedding Season',
    icon: 'favorite',
    h4Heading: 'Wedding Season',
    description: 'From engagement to reception, find jewellery that complements every traditional and fusion outfit change.',
    badge: 'Bridal Edit',
    ctaText: 'Explore Bridal Collection',
  },
  {
    id: 'everyday',
    label: 'Everyday Elegance',
    icon: 'work_outline',
    h4Heading: 'Everyday Elegance',
    description: 'Simple, wearable, lightweight designs for work, college, meetings, or daily errands.',
    badge: 'Daily Wear',
    ctaText: 'Explore Daily Collection',
  },
  {
    id: 'gifting',
    label: 'Gifting',
    icon: 'redeem',
    h4Heading: 'Gifting',
    description: 'Thoughtful jewellery pieces that make birthdays, anniversaries, and milestone celebrations feel truly special.',
    badge: 'Gifting Special',
    ctaText: 'Explore Gift Collection',
  },
  {
    id: 'party',
    label: 'Party & Galas',
    icon: 'auto_awesome',
    h4Heading: 'Party & Galas',
    description: 'High-sparkle CZ diamonds and statement silver ornaments designed for evening glam.',
    badge: 'Party Edit',
    ctaText: 'Explore Party Collection',
  },
  {
    id: 'jaipur-gems',
    label: 'Gems from Jaipur',
    icon: 'diamond',
    h4Heading: 'Gems from Jaipur',
    description: 'Direct artisan sourced vibrant gemstones, ruby malas, emerald pendants, and heritage craft.',
    badge: 'Jaipur Craft',
    ctaText: 'Jodhpur Jewellery',
  },
];

const OCCASION_PRODUCTS_DATA: Record<string, any[]> = {
  festive: [
    {
      id: 201,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 202,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    },
    {
      id: 203,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    },
    {
      id: 204,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    }
  ],
  wedding: [
    {
      id: 205,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    },
    {
      id: 206,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 207,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    },
    {
      id: 208,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    }
  ],
  everyday: [
    {
      id: 209,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    },
    {
      id: 210,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    },
    {
      id: 211,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 212,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    }
  ],
  gifting: [
    {
      id: 213,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    },
    {
      id: 214,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    },
    {
      id: 215,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 216,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    }
  ],
  party: [
    {
      id: 217,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    },
    {
      id: 218,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    },
    {
      id: 219,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 220,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    }
  ],
  'jaipur-gems': [
    {
      id: 221,
      slug: 'imperial-ruby-pearl-drop-tops',
      name: 'Imperial Ruby & Pearl Drop Tops',
      silver_purity: '925',
      calculated_price: 5999,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
    },
    {
      id: 222,
      slug: 'rose-cushion-solitaire-pendant',
      name: 'Rose Cushion Solitaire Pendant',
      silver_purity: '925',
      calculated_price: 4499,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
    },
    {
      id: 223,
      slug: 'royal-floral-heritage-cz-bangle',
      name: 'Royal Floral Heritage CZ Bangle',
      silver_purity: '925',
      calculated_price: 7899,
      is_bestseller: true,
      images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
    },
    {
      id: 224,
      slug: 'crimson-heart-eternity-bracelet',
      name: 'Crimson Heart Eternity Bracelet',
      silver_purity: '925',
      calculated_price: 6299,
      is_new_arrival: true,
      images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
    }
  ]
};

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ananya Roy',
    location: 'Ballygunge, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Ordered the 925 Sterling Silver Royal Kada for Durga Puja. The craftsmanship is breathtaking, and the BIS hallmark certificate gives absolute peace of mind. Delivery was prompt within 24 hours!',
    product: 'Royal Silver Bangle Kada',
  },
  {
    id: 2,
    name: 'Debjani Mukherjee',
    location: 'Salt Lake Sector 5, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Vanity has redefined online jewellery shopping in Kolkata. The CZ diamond clarity in the Solitaire Pendant is stunning. Packaged like a royal gift box with certificate!',
    product: 'Rose Cushion Solitaire Pendant',
  },
  {
    id: 3,
    name: 'Poulomi Sen',
    location: 'Alipore, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: "Bought bridal silver accessories for my sister's wedding reception. Every single relative complimented the delicate finish and lustrous shine. Highly recommend Vanity!",
    product: 'Royal Floral Heritage Bangle',
  },
  {
    id: 4,
    name: 'Subhashis Banerji',
    location: 'New Town, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Fair and transparent live MCX silver rates, zero hidden fees, and lightning-fast customer support on WhatsApp. Truly an atelier-standard luxury shopping experience.',
    product: 'Imperial Ruby & Pearl Drop Tops',
  },
  {
    id: 5,
    name: 'Rituparna Das',
    location: 'South City, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: 'The Rose Cushion Pendant is my daily go-to jewellery now. Completely tarnish-free, lightweight, and super chic for everyday office and client meetings.',
    product: 'Rose Cushion Pendant',
  },
  {
    id: 6,
    name: 'Sneha Ganguly',
    location: 'Park Street, Kolkata',
    rating: 5,
    date: 'Verified Buyer',
    text: 'Exceptional customer service! Had a sizing inquiry and their team assisted instantly. The ruby drop tops look even more glamorous in person than in pictures.',
    product: 'Imperial Ruby Drop Tops',
  },
];

export default function HomePage() {
  const { token } = useAuth();
  const { settings: storeSettings } = useStoreSettings();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoEmail, setPromoEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [mcxRate, setMcxRate] = useState(84500);
  const [signupCode, setSignupCode] = useState('VANITY10');
  const [signupPercent, setSignupPercent] = useState(10);
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [showVideoCard, setShowVideoCard] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState('festive');
  const [occasionProducts, setOccasionProducts] = useState<any[]>([]);
  const [occasionLoading, setOccasionLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Campaign Offer Video & Image States
  const [campaignFestival, setCampaignFestival] = useState<string | null>('mothers_day');
  const [campaignText, setCampaignText] = useState<string>("Mother's Day & Special Festive Offer");
  const [campaignSubtitle, setCampaignSubtitle] = useState<string>("Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
  const [campaignCode, setCampaignCode] = useState<string>('VANITY10');
  const [campaignCtaText, setCampaignCtaText] = useState<string>('Explore Offer Collection');
  const [campaignCtaLink, setCampaignCtaLink] = useState<string>('/shop');
  const [campaignVideoUrl, setCampaignVideoUrl] = useState<string>('');
  const [campaignImageUrl, setCampaignImageUrl] = useState<string>('/images/kolkata-howrah-jewellery-banner.jpg');
  const [campaignProductSlug, setCampaignProductSlug] = useState<string | null>(null);
  const [showOfferSection, setShowOfferSection] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Appointment Booking Form States
  const [appointmentName, setAppointmentName] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [appointmentEmail, setAppointmentEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM - 01:00 PM');
  const [appointmentType, setAppointmentType] = useState('video_call');
  const [appointmentInterest, setAppointmentInterest] = useState('Sterling Silver Personalized Jewelry');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentName.trim() || !appointmentPhone.trim()) {
      setAppointmentError('Please provide your name and WhatsApp/Phone number.');
      return;
    }
    setAppointmentLoading(true);
    setAppointmentSuccess(null);
    setAppointmentError(null);

    try {
      const res = await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          name: appointmentName,
          phone: appointmentPhone,
          email: appointmentEmail || undefined,
          preferred_date: appointmentDate || undefined,
          time_slot: appointmentTime,
          consultation_type: appointmentType,
          jewelry_interest: appointmentInterest,
          notes: appointmentNotes || undefined,
        }),
      });

      if (res && res.success) {
        setAppointmentSuccess('Appointment booked successfully! Our jewellery stylist will contact you via WhatsApp / Call.');
        setAppointmentName('');
        setAppointmentPhone('');
        setAppointmentEmail('');
        setAppointmentDate('');
        setAppointmentNotes('');
      } else {
        setAppointmentSuccess('Appointment request received! Our team will contact you shortly.');
      }
    } catch (err: any) {
      setAppointmentSuccess('Appointment request received! Our team will reach out to you on WhatsApp.');
    } finally {
      setAppointmentLoading(false);
    }
  };

  const handleCopyCode = (codeToCopy: string) => {
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqs = [
    {
      q: 'Is it safe to buy jewellery online from Vanity?',
      a: 'Yes. Vanity uses secure payment gateways and verifies every product for quality and BIS Hallmarking before dispatch, so you can shop with confidence.',
    },
    {
      q: 'Does Vanity deliver jewellery across Kolkata and other cities?',
      a: 'Yes, Vanity delivers across Kolkata as well as other parts of India, with verified tracking and delivery timelines shown at checkout.',
    },
    {
      q: 'What types of jewellery does Vanity offer?',
      a: "Vanity's collection includes Necklace, Earrings, Bracelet, Bangle, Pendant, Tops, Mala suited for everyday wear, festive occasions, weddings, and gifting.",
    },
    {
      q: 'How do I choose the right size when shopping for jewellery online?',
      a: 'Each product page includes detailed sizing and weight specifications, and our customer support team is available via WhatsApp to help you pick the right fit.',
    },
    {
      q: 'Can I return or exchange jewellery bought online?',
      a: "Absolutely. If a piece doesn't meet your expectations, Vanity offers a simple 7-day return and exchange process within the specified window.",
    },
  ];

  useEffect(() => {
    setWishlistIds(getLocalWishlist());
    const handleUpdate = () => setWishlistIds(getLocalWishlist());
    window.addEventListener('vanity_wishlist_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('vanity_wishlist_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0`;
    }
    return '';
  };

  const defaultSlides = [
    {
      id: 1,
      image_path: '/images/hero-vanity-banner.jpg',
      headline: 'Online jewellery shopping in Kolkata',
      subtext: 'Necklace, Earrings, Bracelet, Bangle, Pendant, Tops, Malas — authentic 925 Sterling Silver & BIS Hallmarked.',
      cta_text: 'Shop now',
      cta_link: '/shop',
    },
    {
      id: 2,
      image_path: '/images/kolkata-howrah-jewellery-banner.jpg',
      headline: 'Heritage Silver & CZ Diamond Heirlooms',
      subtext: 'Silver, brass, precious & semi-precious stone jewellery with CZ diamonds — delivered across Kolkata and West Bengal.',
      cta_text: 'Explore Collection',
      cta_link: '/shop',
    },
    {
      id: 3,
      image_path: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1920&q=85',
      headline: 'Artisan Silver & CZ Diamond Heirlooms',
      subtext: '925 Sterling Silver with verified BIS Hallmarking and certified luxury craft.',
      cta_text: 'Explore Collection',
      cta_link: '/shop',
    }
  ];

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    // Parallel data loading for maximum performance
    Promise.allSettled([
      fetchApi('/products?bestseller=1&limit=4'),
      fetchApi('/products?limit=8'),
      fetchApi('/hero-slides'),
      fetchApi('/silver-rate'),
      fetchApi('/settings/public'),
    ]).then(([bestsellerRes, productsRes, slidesRes, rateRes, settingsRes]) => {
      if (bestsellerRes.status === 'fulfilled' && bestsellerRes.value.success) {
        setBestsellers(bestsellerRes.value.products.slice(0, 4));
      }
      if (productsRes.status === 'fulfilled' && productsRes.value.success) {
        setProducts(productsRes.value.products.slice(0, 8));
      }
      if (slidesRes.status === 'fulfilled' && slidesRes.value.success && slidesRes.value.slides?.length > 0) {
        const dbSlides = slidesRes.value.slides;
        setSlides([
          {
            id: 'featured-vanity-banner',
            image_path: '/images/hero-vanity-banner.jpg',
            headline: 'Online jewellery shopping in Kolkata',
            subtext: 'Necklace, Earrings, Bracelet, Bangle, Pendant, Tops, Malas — authentic 925 Sterling Silver & BIS Hallmarked.',
            cta_text: 'Shop now',
            cta_link: '/shop',
          },
          {
            id: 'featured-howrah-banner',
            image_path: '/images/kolkata-howrah-jewellery-banner.jpg',
            headline: 'Heritage Silver & CZ Diamond Heirlooms',
            subtext: 'Silver, brass, precious & semi-precious stone jewellery with CZ diamonds — delivered across Kolkata and West Bengal.',
            cta_text: 'Shop now',
            cta_link: '/shop',
          },
          ...dbSlides.filter((s: any) => s.image_path !== '/images/hero-vanity-banner.jpg' && s.image_path !== '/images/kolkata-howrah-jewellery-banner.jpg')
        ]);
      } else {
        setSlides(defaultSlides);
      }
      if (rateRes.status === 'fulfilled' && rateRes.value.success) {
        setMcxRate(Number(rateRes.value.rate) * 1000);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value.success) {
        const s = settingsRes.value.settings || {};
        const isVideoCardEnabled = s.campaign_show_video_card !== '0';
        const videoUrl = s.campaign_active_video_url || '';
        setShowVideoCard(Boolean(isVideoCardEnabled));
        setHeroVideoUrl(videoUrl);
        setCampaignVideoUrl(videoUrl);
        setCampaignFestival(s.campaign_active_festival && s.campaign_active_festival !== 'none' ? s.campaign_active_festival : 'mothers_day');
        setCampaignText(s.campaign_active_text || "Mother's Day & Special Festive Offer");
        setCampaignSubtitle(s.campaign_subtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount.");
        setCampaignCode(s.campaign_active_code || 'VANITY10');
        setCampaignCtaText(s.campaign_cta_text || 'Explore Offer Collection');
        setCampaignCtaLink(s.campaign_cta_link || '/shop');
        setShowOfferSection(s.campaign_show_offer_section !== '0');
        setCampaignImageUrl(settingsRes.value.campaign_product_image || s.campaign_active_image_url || '/images/kolkata-howrah-jewellery-banner.jpg');
        setCampaignProductSlug(settingsRes.value.campaign_product_slug || null);
      }
    });
  }, []);

  // Autoplay occasion change logic (turn by turn automatically)
  const [isOccasionPaused, setIsOccasionPaused] = useState(false);
  useEffect(() => {
    if (isOccasionPaused) return;
    const timer = setInterval(() => {
      setSelectedOccasion(prev => {
        const currentIndex = OCCASIONS.findIndex(o => o.id === prev);
        const nextIndex = (currentIndex + 1) % OCCASIONS.length;
        return OCCASIONS[nextIndex].id;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isOccasionPaused]);

  // Fetch occasion products dynamically when selected occasion changes
  useEffect(() => {
    let isMounted = true;
    setOccasionLoading(true);
    fetchApi(`/products?occasion=${selectedOccasion}&limit=8`)
      .then(res => {
        if (!isMounted) return;
        const fallbackList = OCCASION_PRODUCTS_DATA[selectedOccasion] || OCCASION_PRODUCTS_DATA.festive;
        if (res.success && res.products && res.products.length >= 4) {
          setOccasionProducts(res.products.slice(0, 4));
        } else if (res.success && res.products && res.products.length > 0) {
          // If fewer than 4 products returned by API, supplement with curated items so 4 cards are always shown
          const existingIds = new Set(res.products.map((p: any) => p.id));
          const extra = fallbackList.filter((f: any) => !existingIds.has(f.id));
          setOccasionProducts([...res.products, ...extra].slice(0, 4));
        } else {
          // Fallback to rich curated occasion products dataset
          setOccasionProducts(fallbackList);
        }
      })
      .catch(() => {
        if (isMounted) {
          setOccasionProducts(OCCASION_PRODUCTS_DATA[selectedOccasion] || OCCASION_PRODUCTS_DATA.festive);
        }
      })
      .finally(() => {
        if (isMounted) setOccasionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedOccasion]);

  // Autoplay carousel logic
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const forcePromo = urlParams.get('promo') === 'true' || isLocalhost;

      const subscribed = localStorage.getItem('vanity_subscribed');
      const closedAtStr = localStorage.getItem('vanity_promo_closed_at');

      if (subscribed === 'true' && !forcePromo) return;

      if (closedAtStr && !forcePromo) {
        const closedAt = parseInt(closedAtStr, 10);
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days frequency cap
        if (now - closedAt < sevenDays) {
          return;
        }
      }

      const timer = setTimeout(() => {
        setShowPromoModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromo = () => {
    setShowPromoModal(false);
    localStorage.setItem('vanity_promo_closed_at', Date.now().toString());
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoEmail.trim()) return;
    try {
      const res = await fetchApi('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: promoEmail })
      });
      if (res.success) {
        setSignupCode(res.coupon_code);
        setSignupPercent(res.discount_percent);
        setIsSubscribed(true);
        localStorage.setItem('vanity_subscribed', 'true');
      } else {
        alert(res.message || 'Newsletter signup failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while signing up.');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden">

      <StorefrontNavbar />

      {/* Main Content */}
      <main className="w-full">

        {/* Hero Image Showcase Slider */}
        <section className="relative w-full h-[450px] md:h-[620px] bg-[#0F172A] overflow-hidden border-b border-[#E8E6DF]">
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
              >
                <div
                  className="w-full h-full bg-no-repeat bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${slide.image_path}')`,
                    backgroundColor: '#0F172A'
                  }}
                  role="img"
                  aria-label={slide.headline || 'Vanity Jewellery Banner'}
                />
              </div>
            );
          })}

          {/* Carousel Controls */}
          {activeSlides.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? activeSlides.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-[#0F172A] flex items-center justify-center transition-all focus:outline-none shadow-md backdrop-blur-sm"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Next Button */}
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % activeSlides.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white text-[#0F172A] flex items-center justify-center transition-all focus:outline-none shadow-md backdrop-blur-sm"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary scale-125' : 'bg-primary/30 hover:bg-primary/50'
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Floating Video Card Overlapping Carousel */}
          {showVideoCard && heroVideoUrl && (
            <div className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 w-[90%] md:w-[350px] bg-white border border-[#9A7E44]/30 rounded-lg shadow-2xl p-4 z-20 flex flex-col hidden md:flex transition-all hover:scale-105 duration-300">
              <div className="text-[10px] font-bold text-[#9A7E44] uppercase tracking-widest border-b border-outline-variant/20 pb-2 mb-3 flex items-center justify-between">
                <span>Excellence Showcase</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9A7E44] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9A7E44]"></span>
                </span>
              </div>

              <div className="aspect-[4/3] w-full rounded bg-surface-container overflow-hidden border border-outline-variant/15 relative">
                {getYouTubeEmbedUrl(heroVideoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(heroVideoUrl)}
                    className="w-full h-full object-cover pointer-events-none"
                    allow="autoplay; encrypted-media"
                    frameBorder="0"
                    title="Craftsmanship Showcase Video"
                  />
                ) : (
                  <video
                    src={heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wide">Artisan Heritage Video</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-normal">
                  Experience the craftsmanship of raw sterling silver transitioning into modern heirlooms.
                </p>
                <Link
                  href="/shop"
                  className="mt-3 block text-center bg-primary text-on-primary py-2 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                >
                  Shop the Collection
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Section 1: H1 & Intro Description (Exact SEO Script) */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              {/* Left Column: Text Content */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                <h1 className="font-serif text-2xl md:text-[34px] text-[#0F172A] leading-[1.25] font-normal mb-2.5 tracking-tight">
                  Online Jewellery Shopping in Kolkata — Welcome to Vanity
                </h1>
                <div className="space-y-2 text-[#475569] font-sans text-xs md:text-sm leading-relaxed text-left">
                  <h2 className="font-normal text-xs md:text-sm leading-relaxed text-[#475569] m-0">
                    Looking for a trusted online jewellery brand in Kolkata that combines latest style, unique designs, and genuine value? Vanity makes online jewellery shopping in kolkata simple, convenient, and enjoyable. Explore our curated collection of beautifully crafted jewellery from the comfort of your home and discover designs for everyday wear, anniversary, birthday parties, weddings, special occasions, galas, gifting, and celebrations.
                  </h2>
                  <h2 className="font-normal text-xs md:text-sm leading-relaxed text-[#475569] m-0">
                    As a trusted online jewellery brand in Kolkata, Vanity brings the experience of a jewellery store directly to your computer, phone or laptop, without long queues or the pressure of an in-store visit. Browse, compare, and choose your favourite pieces with ease. Whether you’re looking for{' '}
                    <span className="font-semibold text-[#0F172A]">
                      <Link href="/shop?category=necklaces" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Necklace</Link>,{' '}
                      <Link href="/shop?category=earrings" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Earrings</Link>,{' '}
                      <Link href="/shop?category=bracelets" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Bracelet</Link>,{' '}
                      <Link href="/shop?category=bangles" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Bangle</Link>,{' '}
                      <Link href="/shop?category=pendants" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Pendant</Link>,{' '}
                      <Link href="/shop?category=tops" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Tops</Link>,{' '}
                      <Link href="/shop?category=mala" className="text-[#008080] hover:text-[#0F172A] underline underline-offset-2 transition-colors">Malas</Link>
                    </span>{' '}
                    Vanity offers a seamless way to find pieces that suit your style.
                  </h2>
                  <h2 className="font-normal text-xs md:text-sm leading-relaxed text-[#475569] m-0">
                    With convenient online shopping and a wide selection of designs, Vanity makes it easier to buy jewellery online in India with confidence. Start your online jewellery shopping journey with Vanity and discover jewellery that adds elegance to every occasion.
                  </h2>
                </div>
              </div>

              {/* Right Column: Model Image Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-[#B89758]/30 group ring-1 ring-[#B89758]/20">
                  <img
                    src="/images/kolkata-jewellery-model.jpg"
                    alt="Online Jewellery Shopping in Kolkata - Vanity Jewels Model"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: H3 - Kolkata jewellery e-shop (Products Display) */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 md:mb-4 gap-2">
              <div>
                <h2 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight flex items-center flex-wrap gap-2">
                  <span>Kolkata jewellery e-shop</span>
                  <span className="inline-block bg-white text-[#008080] border border-[#E5E7EB] text-xs md:text-sm font-sans font-semibold px-2.5 py-0.5 rounded-md shadow-2xs">
                    with Vanity
                  </span>
                </h2>
              </div>
              <Link 
                href="/shop" 
                className="font-sans text-xs font-bold uppercase tracking-widest text-[#008080] hover:text-[#0F172A] transition-colors flex items-center gap-2 border-b-2 border-[#008080]/50 hover:border-[#0F172A] pb-0.5 shrink-0"
              >
                VIEW COLLECTION <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col h-full animate-pulse bg-white p-3.5 rounded-2xl border border-[#E5DEC9]">
                    <div className="aspect-[4/5] bg-slate-100 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-100 w-3/4 rounded mb-2" />
                    <div className="h-3 bg-slate-100 w-1/2 rounded mb-3" />
                    <div className="h-5 bg-slate-100 w-1/3 rounded mt-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {(products.length > 0 ? products : [
                  {
                    id: 101,
                    slug: 'rose-cushion-solitaire-pendant',
                    name: 'Rose Cushion Solitaire Pendant',
                    silver_purity: '925',
                    calculated_price: 4499,
                    is_bestseller: true,
                    images: [{ image_path: '/images/showcase/pink-pendant-necklace.jpg', is_primary: true }]
                  },
                  {
                    id: 102,
                    slug: 'imperial-ruby-pearl-drop-tops',
                    name: 'Imperial Ruby & Pearl Drop Tops',
                    silver_purity: '925',
                    calculated_price: 5999,
                    is_new_arrival: true,
                    images: [{ image_path: '/images/showcase/ruby-pearl-earrings.jpg', is_primary: true }]
                  },
                  {
                    id: 103,
                    slug: 'royal-floral-heritage-cz-bangle',
                    name: 'Royal Floral Heritage CZ Bangle',
                    silver_purity: '925',
                    calculated_price: 7899,
                    is_bestseller: true,
                    images: [{ image_path: '/images/showcase/floral-bridal-bangle.jpg', is_primary: true }]
                  },
                  {
                    id: 104,
                    slug: 'crimson-heart-eternity-bracelet',
                    name: 'Crimson Heart Eternity Bracelet',
                    silver_purity: '925',
                    calculated_price: 6299,
                    is_new_arrival: true,
                    images: [{ image_path: '/images/showcase/heart-gem-bracelet.jpg', is_primary: true }]
                  }
                ]).map((product: any) => {
                  const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                  const imgUrl = primaryImg ? primaryImg.image_path : '/images/showcase/pink-pendant-necklace.jpg';
                  const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                  const priceText = `₹${Number(product.calculated_price).toLocaleString('en-IN')}`;

                  let tag = null;
                  let tagClass = '';
                  if (product.is_new_arrival) {
                    tag = 'New In';
                    tagClass = 'bg-[#0F172A] text-white border border-white/20';
                  } else if (product.is_bestseller) {
                    tag = 'Best Seller';
                    tagClass = 'bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white shadow-sm';
                  }

                  return (
                    <Link key={product.id} href={`/products/${product.slug || product.id}`} className="group cursor-pointer flex flex-col h-full bg-white p-3.5 rounded-2xl border border-[#E5DEC9] shadow-sm hover:shadow-xl hover:border-[#B89758]/60 hover:-translate-y-1.5 transition-all duration-300">
                      <div className="relative aspect-[4/5] bg-[#F8F8F7] mb-3.5 overflow-hidden rounded-xl">
                        {tag && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className={`${tagClass} text-[9px] md:text-[10px] px-2.5 py-1 tracking-widest uppercase font-bold rounded-md font-sans`}>
                              {tag}
                            </span>
                          </div>
                        )}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-108"
                          style={{ backgroundImage: `url('${imgUrl}')` }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-[#0F172A]/80 to-transparent flex justify-center">
                          <span className="bg-white text-[#0F172A] w-full py-2 tracking-wider hover:bg-[#0F172A] hover:text-white transition-colors text-xs text-center font-bold rounded-lg shadow-md font-sans">
                            QUICK VIEW
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col px-1 pb-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-medium text-[#0F172A] truncate pr-2 group-hover:text-[#B89758] transition-colors font-serif">{product.name}</h3>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await toggleWishlistItem(product.id, token);
                            }}
                            className={`shrink-0 p-0.5 transition-colors ${wishlistIds.includes(product.id)
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-slate-300 hover:text-[#B89758]'
                              }`}
                            title={wishlistIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {wishlistIds.includes(product.id) ? 'favorite' : 'favorite_border'}
                            </span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[#64748B] font-sans mb-2">{material}</p>
                        <p className="text-base font-serif font-bold text-[#0F172A] mt-auto">{priceText}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Section 3: H2 - Why Choose Vanity for Jewellery Online in Kolkata */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="text-left mb-3 md:mb-4">
              <h2 className="font-serif text-2xl md:text-[30px] text-[#0F172A] font-normal tracking-tight mb-1">
                Why Choose Vanity for Jewellery Online in Kolkata
              </h2>
              <h3 className="text-xs md:text-sm text-[#526071] font-normal max-w-3xl leading-relaxed font-sans">
                Buying jewellery online works only when the brand behind it earns your trust. Here&apos;s what makes Vanity different for shoppers across Kolkata:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {/* Feature 01 - Emerald Teal */}
              <div className="group bg-gradient-to-b from-[#F0FDF4] to-[#E6F4F1] p-6 rounded-2xl border-2 border-[#008080]/30 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(0,128,128,0.28)] hover:border-[#008080] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#008080] border border-[#006666] flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">design_services</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-medium text-[#0F172A] mb-1.5 group-hover:text-[#008080] transition-colors">
                    Thoughtfully designed pieces
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed font-sans">
                    From minimalist daily-wear to statement pieces for festive occasions, every design is created with real Kolkata lifestyles in mind.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-[#008080]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#008080] uppercase tracking-wider">
                  <span>Signature Craft</span>
                </div>
              </div>

              {/* Feature 02 - Royal Sapphire Blue */}
              <div className="group bg-gradient-to-b from-[#EFF6FF] to-[#E0E7FF] p-6 rounded-2xl border-2 border-[#2563EB]/30 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(37,99,235,0.28)] hover:border-[#2563EB] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#2563EB] border border-[#1D4ED8] flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">price_check</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-medium text-[#0F172A] mb-1.5 group-hover:text-[#2563EB] transition-colors">
                    Transparent pricing
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed font-sans">
                    No hidden charges, no confusing markups. Fair transparent silver rates aligned with live MCX standards.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-[#2563EB]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
                  <span>Live MCX Verified</span>
                </div>
              </div>

              {/* Feature 03 - Imperial Gold & Amber */}
              <div className="group bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] p-6 rounded-2xl border-2 border-[#D97706]/35 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(217,119,6,0.28)] hover:border-[#D97706] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#B89758] to-[#D97706] border border-[#B45309] flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">verified</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-medium text-[#0F172A] mb-1.5 group-hover:text-[#B45309] transition-colors">
                    Quality you can verify
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed font-sans">
                    Every piece goes through stringent quality checks and BIS Hallmarking certificate before it reaches your doorstep.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-[#D97706]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                  <span>925 BIS Hallmarked</span>
                </div>
              </div>

              {/* Feature 04 - Royal Amethyst Purple */}
              <div className="group bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF] p-6 rounded-2xl border-2 border-[#9333EA]/30 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(147,51,234,0.28)] hover:border-[#9333EA] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#9333EA] border border-[#7E22CE] flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">local_shipping</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-medium text-[#0F172A] mb-1.5 group-hover:text-[#9333EA] transition-colors">
                    Fast, reliable delivery
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed font-sans">
                    Get your order delivered safely across Kolkata and the rest of India in tamper-proof luxury packaging.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-[#9333EA]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#9333EA] uppercase tracking-wider">
                  <span>Insured Express Shipping</span>
                </div>
              </div>

              {/* Feature 05 - Ruby Crimson & Rose */}
              <div className="group bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6] p-6 rounded-2xl border-2 border-[#E11D48]/30 shadow-xs hover:shadow-[0_20px_35px_-10px_rgba(225,29,72,0.28)] hover:border-[#E11D48] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#E11D48] border border-[#BE123C] flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">assignment_return</span>
                  </div>
                  <h4 className="font-serif text-base md:text-lg font-medium text-[#0F172A] mb-1.5 group-hover:text-[#E11D48] transition-colors">
                    Hassle-free returns
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed font-sans">
                    If something doesn&apos;t feel right, our return and exchange process is simple, transparent, and hassle-free.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-[#E11D48]/20 flex items-center gap-1.5 text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">
                  <span>7-Day Return Policy</span>
                </div>
              </div>

              {/* Feature 06 - Midnight Obsidian & Gold */}
              <div className="group bg-gradient-to-br from-[#0B132B] via-[#152238] to-[#080D1A] text-white p-6 rounded-2xl border-2 border-[#D4AF37]/60 shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.35)] hover:border-[#D4AF37] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#B89758] to-[#F59E0B] border border-white/20 flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FDE047]">Guaranteed Commitment</span>
                  </div>
                  <h4 className="font-serif text-lg font-medium text-white mb-1.5">
                    The Vanity Promise
                  </h4>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">
                    When you buy jewellery online from Vanity, you&apos;re not just picking a product — you&apos;re choosing a luxury shopping experience built around confidence and comfort.
                  </p>
                </div>
                <div className="pt-3.5 mt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-serif text-[#FDE047]">
                  <span>Handcrafted in Kolkata</span>
                  <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: H3 - Jewellery for Every Occasion (Left Vertical Tabs + Right Dynamic Grid) */}
        <section
          className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6"
          onMouseEnter={() => setIsOccasionPaused(true)}
          onMouseLeave={() => setIsOccasionPaused(false)}
        >
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
              
              {/* Left Column: Vertical Occasion Tabs & CTA */}
              <div className="lg:col-span-4 flex flex-col text-left">
                <h3 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight mb-1">
                  Jewellery for Every Occasion
                </h3>
                <p className="text-xs md:text-sm text-[#64748B] font-sans leading-relaxed mb-3">
                  {OCCASIONS.find(o => o.id === selectedOccasion)?.description || 'Curated 925 sterling silver designs crafted for life’s moments.'}
                </p>

                {/* Vertical Occasion Navigation Buttons */}
                <div className="space-y-1.5 mb-3">
                  {OCCASIONS.map((occ) => {
                    const isSelected = selectedOccasion === occ.id;
                    return (
                      <button
                        key={occ.id}
                        onClick={() => {
                          setSelectedOccasion(occ.id);
                          setIsOccasionPaused(true);
                        }}
                        type="button"
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border font-sans cursor-pointer ${
                          isSelected
                            ? 'bg-[#008080] text-white border-[#008080] shadow-sm translate-x-1'
                            : 'bg-white text-[#475569] border-[#E5E7EB] hover:border-[#008080] hover:text-[#008080]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                            {occ.icon}
                          </span>
                          <span>{occ.label}</span>
                        </div>
                        <span className={`material-symbols-outlined text-[16px] transition-transform ${isSelected ? 'translate-x-0.5 text-white' : 'text-slate-300'}`}>
                          arrow_forward_ios
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Explore Occasion CTA Button */}
                <Link
                  href={`/shop?occasion=${selectedOccasion}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#008080] text-white hover:bg-[#006666] py-2.5 px-4 rounded-lg font-bold uppercase tracking-widest text-xs shadow-sm hover:shadow transition-all font-sans mb-3"
                >
                  <span>{OCCASIONS.find(o => o.id === selectedOccasion)?.ctaText || 'Explore Collection'}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>

                {/* Exclusive Festive / Mother's Day Offer Card (Positioned directly in Left Column below CTA Button) */}
                {showOfferSection && (
                  <div className="group flex flex-col bg-gradient-to-br from-[#1A1A1A] via-[#2A1820] to-[#111827] text-white p-3.5 md:p-4 rounded-xl border-2 border-[#D4AF37]/50 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    {/* Media Header (Video / Image) */}
                    <div className="relative aspect-[16/10] bg-black/60 mb-3 overflow-hidden rounded-lg border border-[#D4AF37]/30">
                      {heroVideoUrl || campaignVideoUrl ? (
                        (heroVideoUrl || campaignVideoUrl).includes('youtube.com') || (heroVideoUrl || campaignVideoUrl).includes('youtu.be') ? (
                          <iframe
                            src={getYouTubeEmbedUrl(heroVideoUrl || campaignVideoUrl)}
                            title="Campaign Offer Video"
                            className="w-full h-full object-cover border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={heroVideoUrl || campaignVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url('${campaignImageUrl || '/images/kolkata-howrah-jewellery-banner.jpg'}')` }}
                        />
                      )}
                      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                        <span className="bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                          {campaignFestival ? `${campaignFestival.replace('_', ' ').toUpperCase()} OFFER` : "MOTHER'S DAY & FESTIVE OFFER"}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="mb-2.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-[#D4AF37]/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>Exclusive Festive Edit</span>
                        </div>
                        <h4 className="text-sm md:text-base font-serif font-medium text-white mb-1">
                          {campaignText || "Mother's Day & Special Festive Offer"}
                        </h4>
                        <p className="text-[11px] text-[#CBD5E1] font-sans leading-relaxed line-clamp-2">
                          {campaignSubtitle || "Explore handcrafted 925 sterling silver necklaces, bangles, and earrings on exclusive discount."}
                        </p>
                      </div>

                      <div className="space-y-2 mt-auto pt-2 border-t border-white/10">
                        {Boolean(campaignCode || signupCode) && (
                          <button
                            type="button"
                            onClick={() => handleCopyCode(campaignCode || signupCode)}
                            className="w-full py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-[#D4AF37]/40 rounded-lg text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px] text-[#FDE047]">sell</span>
                            <span>{copiedCode ? 'COPIED TO CLIPBOARD!' : `USE CODE: ${campaignCode || signupCode}`}</span>
                            <span className="material-symbols-outlined text-[13px] text-stone-300">content_copy</span>
                          </button>
                        )}

                        <Link
                          href={campaignCtaLink || (campaignProductSlug ? `/products/${campaignProductSlug}` : `/shop?occasion=${selectedOccasion}`)}
                          className="w-full py-2 bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold uppercase tracking-wider rounded-lg font-sans text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>{campaignCtaText || "Explore Offer Collection"}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Curated Product Cards for Active Occasion (Large Luxury Grid) */}
              <div className="lg:col-span-8">
                {occasionLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="flex flex-col h-full animate-pulse bg-white p-3.5 rounded-xl border border-[#E5E7EB]">
                        <div className="aspect-[4/3.8] bg-slate-100 rounded-lg mb-3" />
                        <div className="h-4 bg-slate-100 w-3/4 rounded mb-2" />
                        <div className="h-3 bg-slate-100 w-1/2 rounded mb-2" />
                        <div className="h-5 bg-slate-100 w-1/3 rounded mt-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 transition-all duration-300">
                    {(occasionProducts.length > 0 ? occasionProducts : (OCCASION_PRODUCTS_DATA[selectedOccasion] || OCCASION_PRODUCTS_DATA.festive)).slice(0, 4).map((product) => {
                      const primaryImg = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
                      const imgUrl = primaryImg ? primaryImg.image_path : '/images/showcase/floral-bridal-bangle.jpg';
                      const material = product.silver_purity === '925' ? '925 Sterling Silver' : (product.silver_purity === '999' ? '999 Fine Silver' : 'Fine Silver');
                      const priceText = product.calculated_price ? `₹${Number(product.calculated_price).toLocaleString('en-IN')}` : (product.base_price ? `₹${Number(product.base_price).toLocaleString('en-IN')}` : '₹4,499');
                      const currentOccObj = OCCASIONS.find(o => o.id === selectedOccasion);
                      const tag = product.is_new_arrival ? 'New In' : (product.is_bestseller ? 'Best Seller' : (currentOccObj ? currentOccObj.badge : 'Occasion Special'));
                      const tagClass = product.is_new_arrival ? 'bg-[#008080] text-white' : (product.is_bestseller ? 'bg-gradient-to-r from-[#B89758] to-[#D4AF37] text-white shadow-xs' : 'bg-[#008080] text-white');

                      return (
                        <Link
                          key={`${selectedOccasion}-${product.id}`}
                          href={`/products/${product.slug || product.id}`}
                          className="group cursor-pointer flex flex-col h-full bg-white p-3.5 md:p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:shadow-lg hover:border-[#008080] hover:-translate-y-1 transition-all duration-300"
                        >
                          <div className="relative aspect-[4/3.8] bg-[#F8F8F7] mb-3 overflow-hidden rounded-lg">
                            {tag && (
                              <div className="absolute top-2.5 left-2.5 z-10">
                                <span className={`${tagClass} text-[10px] px-2.5 py-0.5 tracking-wider uppercase font-bold rounded font-sans shadow-xs`}>
                                  {tag}
                                </span>
                              </div>
                            )}
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url('${imgUrl}')` }}
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out bg-gradient-to-t from-[#0F172A]/75 to-transparent flex justify-center">
                              <span className="bg-white text-[#008080] w-full py-1.5 tracking-wider hover:bg-[#008080] hover:text-white transition-colors text-[11px] text-center font-bold rounded font-sans shadow-sm">
                                QUICK VIEW
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col px-0.5">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm md:text-base font-medium text-[#0F172A] truncate pr-2 group-hover:text-[#008080] transition-colors font-serif">
                                {product.name}
                              </h4>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  await toggleWishlistItem(product.id, token);
                                }}
                                className={`shrink-0 p-0.5 transition-colors ${wishlistIds.includes(product.id)
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-slate-300 hover:text-[#008080]'
                                  }`}
                                title={wishlistIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {wishlistIds.includes(product.id) ? 'favorite' : 'favorite_border'}
                                </span>
                              </button>
                            </div>
                            <p className="text-[11px] text-[#64748B] font-sans mb-2">{material}</p>
                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                              <p className="text-base md:text-lg font-serif font-bold text-[#0F172A]">{priceText}</p>
                              <span className="text-[11px] font-bold text-[#008080] group-hover:underline font-sans flex items-center gap-0.5">
                                Details <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: H3 - Shop by Category */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="max-w-3xl mb-3 md:mb-4 text-left">
              <div className="inline-block bg-[#008080]/10 text-[#008080] border border-[#008080]/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md mb-2 font-sans shadow-2xs">
                Explore
              </div>
              <h3 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight mb-1">
                Shop by Category
              </h3>
              <p className="text-[#526071] text-xs md:text-sm leading-relaxed font-sans">
                Vanity&apos;s Kolkata jewellery online store is organised to help you find exactly what you&apos;re looking for, without endless scrolling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {/* Category 1: Necklaces & Pendants */}
              <Link href="/shop?category=Necklaces" className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#008080]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="h-40 md:h-44 bg-[#F5F2EC] bg-cover bg-center transition-transform duration-500 group-hover:scale-105 relative overflow-hidden" style={{ backgroundImage: `url('/images/showcase/pink-pendant-necklace.jpg')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3.5 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-normal text-[#0F172A] mb-1 group-hover:text-[#008080] transition-colors font-serif">Necklaces &amp; Pendants</h4>
                    <p className="text-xs text-[#526071] leading-relaxed mb-2.5 font-sans">
                      Layer them, wear them solo, or gift them — designed for both traditional sarees and modern outfits.
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#008080] group-hover:text-[#0F172A] flex items-center gap-1 transition-colors font-sans">
                    BROWSE NECKLACES <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </span>
                </div>
              </Link>

              {/* Category 2: Earrings & Tops */}
              <Link href="/shop?category=Earrings" className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#008080]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="h-40 md:h-44 bg-[#F5F2EC] bg-cover bg-center transition-transform duration-500 group-hover:scale-105 relative overflow-hidden" style={{ backgroundImage: `url('/images/showcase/ruby-pearl-earrings.jpg')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3.5 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-normal text-[#0F172A] mb-1 group-hover:text-[#008080] transition-colors font-serif">Earrings &amp; Tops</h4>
                    <p className="text-xs text-[#526071] leading-relaxed mb-2.5 font-sans">
                      Studs for the office, jhumkas for festivals, hoops for the weekend — earrings that move with your day.
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#008080] group-hover:text-[#0F172A] flex items-center gap-1 transition-colors font-sans">
                    BROWSE EARRINGS <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </span>
                </div>
              </Link>

              {/* Category 3: Bangles & Bracelets */}
              <Link href="/shop?category=Bangles" className="group bg-white rounded-xl overflow-hidden border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#008080]/60 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="h-40 md:h-44 bg-[#F5F2EC] bg-cover bg-center transition-transform duration-500 group-hover:scale-105 relative overflow-hidden" style={{ backgroundImage: `url('/images/showcase/floral-bridal-bangle.jpg')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3.5 md:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base md:text-lg font-normal text-[#0F172A] mb-1 group-hover:text-[#008080] transition-colors font-serif">Bangles &amp; Bracelets</h4>
                    <p className="text-xs text-[#526071] leading-relaxed mb-2.5 font-sans">
                      A mix of contemporary and classic designs that pair beautifully with both Western and ethnic wear.
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#008080] group-hover:text-[#0F172A] flex items-center gap-1 transition-colors font-sans">
                    BROWSE BANGLES <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 6: Client Infinite Moving Testimonials */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12 mb-3 md:mb-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-[#008080]/10 text-[#008080] px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1 font-sans">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>Client Testimonials</span>
            </div>
            <h2 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight mb-0.5">
              Loved by 10,000+ Kolkata &amp; Pan-India Patrons
            </h2>
            <p className="text-xs text-[#64748B] font-sans max-w-xl mx-auto leading-relaxed">
              Real verified experiences from jewellery lovers who choose Vanity for weddings, festivals, and everyday modern heirlooms.
            </p>
          </div>

          {/* Infinite Marquee Carousel */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee flex gap-4 py-1.5">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div
                  key={`${t.id}-${idx}`}
                  className="w-[280px] md:w-[330px] shrink-0 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs hover:border-[#008080] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Stars & Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex text-[#F59E0B] gap-0.5">
                        {Array.from({ length: t.rating }).map((_, sIdx) => (
                          <span key={sIdx} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008080] bg-[#008080]/10 px-2 py-0.5 rounded font-sans">
                        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {t.date}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-xs text-[#334155] leading-relaxed font-sans mb-3 italic">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>

                  {/* Reviewer Details */}
                  <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-medium text-xs text-[#0F172A]">{t.name}</h4>
                      <p className="text-[10px] text-[#64748B] font-sans flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px] text-[#008080]">location_on</span>
                        {t.location}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-sans bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded max-w-[120px] truncate text-right">
                      {t.product}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: FAQs & Book an Appointment (2-Column Interactive Section) */}
        <section className="bg-[#FAFAFA] border-b border-[#E5E7EB] py-4 md:py-6">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Left Column (7 cols): Frequently Asked Questions Accordion */}
              <div className="lg:col-span-7 flex flex-col text-left">
                <div className="mb-3 md:mb-4">
                  <h2 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight mb-1">
                    Frequently Asked Questions (FAQ)
                  </h2>
                  <p className="text-xs md:text-sm text-[#64748B] font-sans">
                    Have questions about quality, hallmark certification, or express delivery? Find instant answers below.
                  </p>
                </div>

                <div className="space-y-2">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div
                        key={index}
                        className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden transition-all duration-200 shadow-xs hover:border-[#008080]/50"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="w-full text-left p-3 md:p-3.5 flex items-center justify-between gap-3 cursor-pointer focus:outline-none"
                        >
                          <h3 className="font-serif text-sm md:text-base font-medium text-[#0F172A] m-0">
                            {faq.q}
                          </h3>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#008080] text-white' : 'bg-[#FAFAFA] text-[#008080]'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                              expand_more
                            </span>
                          </div>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-60 opacity-100 px-3 md:px-3.5 pb-3.5 pt-0.5' : 'max-h-0 opacity-0 px-3 md:px-3.5'
                          }`}
                        >
                          <p className="text-xs md:text-sm text-[#64748B] font-normal leading-relaxed border-t border-[#E5E7EB]/60 pt-2 font-sans">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (5 cols): Sterling Silver Personalized Jewelry - Book an Appointment Form Card */}
              <div className="lg:col-span-5">
                <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-[#008080]/30 shadow-lg hover:border-[#008080] transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#008080]/5 rounded-bl-full pointer-events-none" />
                  
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 bg-[#008080]/10 text-[#008080] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 font-sans">
                      <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                      <span>VIP Consultation</span>
                    </div>
                    <h3 className="font-serif text-lg md:text-xl font-medium text-[#0F172A] leading-snug">
                      Sterling Silver Personalized Jewelry
                    </h3>
                    <p className="text-xs font-bold text-[#008080] tracking-wider uppercase font-sans mt-0.5">
                      Book an Appointment
                    </p>
                    <p className="text-xs text-[#64748B] font-sans mt-1 leading-relaxed">
                      Connect with our bespoke atelier for custom initials, bridal silverware, or personal video consultation.
                    </p>
                  </div>

                  {appointmentSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-sans flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
                      <span>{appointmentSuccess}</span>
                    </div>
                  )}

                  {appointmentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-sans flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0">error</span>
                      <span>{appointmentError}</span>
                    </div>
                  )}

                  <form onSubmit={handleBookAppointment} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={appointmentName}
                        onChange={(e) => setAppointmentName(e.target.value)}
                        placeholder="e.g. Debjani Mukherjee"
                        className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={appointmentPhone}
                          onChange={(e) => setAppointmentPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                          Time Slot
                        </label>
                        <select
                          value={appointmentTime}
                          onChange={(e) => setAppointmentTime(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                        >
                          <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                          <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                          <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                          Consultation Type
                        </label>
                        <select
                          value={appointmentType}
                          onChange={(e) => setAppointmentType(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                        >
                          <option value="video_call">Live Video Call</option>
                          <option value="in_store">In-Store Atelier Visit</option>
                          <option value="custom_design">Custom Design Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-1 font-sans">
                        Jewelry Interest / Message
                      </label>
                      <input
                        type="text"
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                        placeholder="e.g. Personalized Silver Pendant with name engraving"
                        className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#008080] focus:bg-white transition-all font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={appointmentLoading}
                      className="w-full py-2.5 bg-[#008080] hover:bg-[#006666] text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-sm hover:shadow transition-all font-sans flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">event_available</span>
                      <span>{appointmentLoading ? 'Scheduling...' : 'Book Appointment Now'}</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 8: Company Registered Address & Google Maps */}
        <section className="bg-[#FAFAFA] py-4 md:py-6 border-b border-[#E5E7EB]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="w-full h-[320px] md:h-[360px] bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden relative shadow-lg ring-1 ring-[#B89758]/20">
              <iframe
                title="Vanity Kolkata Location"
                src="https://maps.google.com/maps?q=Padmini%20Apartment%2044%2F19%20Durgapur%20Lane%20Kala%20Bagan%2C%20Chetla%2C%20Kolkata%20700027&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-[28px] text-[#0F172A] font-normal tracking-tight mb-4">Address</h2>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#B89758]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#B89758] text-[16px]">location_on</span>
                  </div>
                  <p className="text-[#475569] text-xs md:text-sm leading-relaxed font-sans pt-0.5">{storeSettings.store_address || 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#B89758]/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#B89758] text-[16px]">schedule</span>
                  </div>
                  <p className="text-[#475569] text-xs md:text-sm font-sans">Customer Support: Mon - Sat, 11:00 AM - 8:00 PM</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white border border-[#B89758]/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#B89758] text-[16px]">mark_email_read</span>
                  </div>
                  <a href="mailto:info@thevanityjewels.com" className="text-[#475569] hover:text-[#B89758] transition-colors text-xs md:text-sm font-sans">
                    info@thevanityjewels.com
                  </a>
                </div>
              </div>
              <a
                className="border-2 border-[#0F172A] bg-[#0F172A] text-white hover:bg-transparent hover:text-[#0F172A] px-6 py-2.5 transition-all inline-block text-center w-full md:w-auto text-xs font-bold uppercase tracking-widest rounded-lg shadow-sm font-sans"
                href={`https://maps.google.com/?q=${encodeURIComponent(storeSettings.store_address || 'Padmini Apartment 44/19 Durgapur Lane Kala Bagan, Chetla, Kolkata 700027')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                VIEW ON GOOGLE MAPS
              </a>
            </div>
          </div>
        </section>

      </main>

      <StorefrontFooter />

      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white p-8 shadow-xl border border-outline-variant/30 flex flex-col items-center text-center rounded-lg">
            {/* Close Button */}
            <button
              onClick={handleClosePromo}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {isSubscribed ? (
              <div className="flex flex-col items-center w-full py-4">
                <div className="mb-6 w-16 h-16 bg-[#fedb98]/20 rounded-full flex items-center justify-center border border-[#9A7E44]/20 animate-bounce">
                  <span className="material-symbols-outlined text-[#9A7E44] text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="font-headline-lg text-2xl text-primary mb-2 font-bold uppercase tracking-wide">YOU&apos;RE UNLOCKED!</h2>
                <p className="font-body-md text-sm text-on-surface-variant mb-6">Enjoy {signupPercent}% off your modern heirlooms.</p>

                <div className="bg-surface-container-low border border-outline-variant/30 px-6 py-4 rounded mb-6 font-mono font-bold text-xl tracking-widest text-[#9A7E44] select-all flex flex-col items-center gap-1 w-full bg-slate-50 border-dashed">
                  <span className="text-[10px] text-on-surface-variant font-sans font-medium uppercase tracking-widest">COUPON CODE</span>
                  <span>{signupCode}</span>
                </div>

                <button
                  onClick={handleClosePromo}
                  className="w-full bg-primary text-on-primary py-3 px-6 font-label-upper text-label-upper tracking-wider hover:bg-[#1A1A1A] transition-colors uppercase text-xs rounded"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Content */}
                <div className="mb-6 w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                </div>
                <h2 className="font-headline-lg text-2xl text-primary mb-2">UNLOCK {signupPercent}% OFF</h2>
                <p className="font-body-md text-sm text-on-surface-variant mb-8">Sign up now and save on your first order.</p>
                {/* Form */}
                <form onSubmit={handlePromoSubmit} className="w-full flex flex-col gap-4">
                  <div className="relative w-full">
                    <input
                      className="w-full px-4 py-3 bg-white border border-outline-variant/50 placeholder-on-surface-variant/70 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-sm rounded"
                      id="promo-email"
                      placeholder="Email address"
                      required
                      type="email"
                      value={promoEmail}
                      onChange={e => setPromoEmail(e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full bg-primary text-on-primary py-3 px-6 font-label-upper text-label-upper tracking-wider hover:bg-primary/90 transition-colors focus:outline-none uppercase text-xs rounded"
                    type="submit"
                  >
                    Sign Up
                  </button>
                </form>
                <p className="mt-6 text-xs text-on-surface-variant/70 font-body-md">By signing up, you agree to our Terms &amp; Privacy Policy.</p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
