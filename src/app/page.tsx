import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchFeaturedProducts } from '@/lib/products';
import { HomePageClient } from './HomePageClient';  
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const revalidate = 60; // ISR: revalidate every 60 seconds

// SEO metadata with proper structure
export const metadata: Metadata = {
  title: 'SwiftMart - Best Deals on Quality Products',
  description: 'Discover amazing products with the best deals and fast shipping. Shop electronics, fashion, beauty, and more at SwiftMart.',
  keywords: ['e-commerce', 'shopping', 'deals', 'electronics', 'fashion', 'beauty', 'home'],
  authors: [{ name: 'SwiftMart Team' }],
  creator: 'SwiftMart',
  openGraph: {
    title: 'SwiftMart - Best Deals on Quality Products',
    description: 'Discover amazing products with the best deals and fast shipping.',
    type: 'website',
    url: 'https://your-domain.com',
    siteName: 'SwiftMart',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SwiftMart - Your One-Stop Shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwiftMart - Best Deals on Quality Products',
    description: 'Discover amazing products with the best deals and fast shipping.',
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
};

export default async function HomePage() {
  // Fetch featured products with ISR
  const featuredProducts = await fetchFeaturedProducts(8);

  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <HomePageClient initialFeaturedProducts={featuredProducts} />
      </Suspense>
    </main>
  );
}