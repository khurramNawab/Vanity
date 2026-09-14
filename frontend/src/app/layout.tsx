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
  title: "Vanity | Modern Heirlooms",
  description: "Premium Silver Jewellery E-Commerce Platform",
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
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
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
