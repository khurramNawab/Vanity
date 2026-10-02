import type { Metadata } from 'next';
import HomePage from '../page';

export const metadata: Metadata = {
  title: 'Online Jewellery Shopping Kolkata | Vanity Jewels - 925 Sterling Silver',
  description: 'Looking for a trusted online jewellery brand in Kolkata? Vanity offers online jewellery shopping in Kolkata with authentic 925 Sterling Silver necklaces, earrings, bangles, bracelets, pendants, and malas.',
  keywords: [
    'online jewellery shopping kolkata',
    'silver jewellery online kolkata',
    '925 sterling silver jewellery',
    'jewellery brand in kolkata',
    'buy silver earrings online kolkata',
    'silver necklace kolkata'
  ],
  alternates: {
    canonical: 'https://thevanityjewels.com/online-jewellery-shopping-kolkata',
  },
  openGraph: {
    title: 'Online Jewellery Shopping Kolkata | Vanity Jewels',
    description: 'Looking for a trusted online jewellery brand in Kolkata? Vanity offers online jewellery shopping in Kolkata with authentic 925 Sterling Silver.',
    url: 'https://thevanityjewels.com/online-jewellery-shopping-kolkata',
    siteName: 'Vanity Jewels',
    images: [
      {
        url: '/images/hero-vanity-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanity Jewels - Online Jewellery Shopping Kolkata',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Jewellery Shopping Kolkata | Vanity Jewels',
    description: 'Authentic 925 Sterling Silver certified jewellery delivered across Kolkata and India.',
    images: ['/images/hero-vanity-banner.jpg'],
  },
};

export default function OnlineJewelleryShoppingKolkataPage() {
  return <HomePage />;
}
