import { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchFeaturedProducts } from '@/lib/products';
import { HomePageClient } from './HomePageClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'E-Commerce Store - Best Deals & Products',
  description: 'Discover amazing products with the best deals and fast shipping. Shop our curated collection of premium items.',
  keywords: ['e-commerce', 'shopping', 'products', 'deals', 'online store'],
  openGraph: {
    title: 'E-Commerce Store - Best Deals & Products',
    description: 'Discover amazing products with the best deals and fast shipping.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Commerce Store - Best Deals & Products',
    description: 'Discover amazing products with the best deals and fast shipping.',
  },
};

// Revalidate every 5 minutes for fresh content
export const revalidate = 300;

export default async function HomePage() {
  // Fetch featured products for initial render
  const featuredProducts = await fetchFeaturedProducts(12);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HomePageClient initialFeaturedProducts={featuredProducts} />
    </Suspense>
  );
}