import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thevanityjewels.com'),
  title: {
    default: "Online Jewellery Shopping Kolkata | Vanity Jewels - 925 Sterling Silver",
    template: "%s | Vanity Jewels Kolkata"
  },
  description: "Looking for a trusted online jewellery brand in Kolkata? Vanity offers online jewellery shopping in Kolkata with authentic 925 Sterling Silver, BIS Hallmarked necklaces, earrings, bangles, bracelets, pendants, and malas.",
  keywords: [
    "online jewellery shopping kolkata",
    "silver jewellery online kolkata",
    "925 sterling silver jewellery",
    "vanity jewellery",
    "buy silver earrings online",
    "silver necklace kolkata",
    "jewellery brand in kolkata",
    "bis hallmarked silver jewellery",
    "cz diamond silver jewellery kolkata"
  ],
  authors: [{ name: "Vanity Jewels" }],
  creator: "Vanity Jewels",
  publisher: "Vanity Jewels",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Online Jewellery Shopping Kolkata | Vanity Jewels",
    description: "Discover Vanity, Kolkata's trusted destination for certified 925 Sterling Silver jewellery, necklaces, earrings, bangles, and pendants.",
    url: 'https://thevanityjewels.com',
    siteName: 'Vanity Jewels',
    images: [
      {
        url: '/images/hero-vanity-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Vanity Jewels - Online Jewellery Shopping Kolkata',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Online Jewellery Shopping Kolkata | Vanity Jewels",
    description: "Authentic 925 Sterling Silver & BIS Hallmarked jewellery delivered across Kolkata and India.",
    images: ['/images/hero-vanity-banner.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-background text-on-surface font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <WhatsAppFloatingButton />
        </AuthProvider>
      </body>
    </html>
  );
}
