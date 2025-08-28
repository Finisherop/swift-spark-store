import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { fetchProduct, fetchSimilarProducts, fetchAllProductIds, Product } from '@/lib/products';
import { ProductDetailsClient } from './ProductDetailsClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProductPageProps {
  params: { id: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: product.name,
    description: product.short_description,
    openGraph: {
      title: product.name,
      description: product.short_description,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : [],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.short_description,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

// Generate static paths for all products
export async function generateStaticParams() {
  const productIds = await fetchAllProductIds();
  
  return productIds.map((id) => ({
    id,
  }));
}

// Get static props with ISR
export async function generateStaticProps({ params }: ProductPageProps) {
  const product = await fetchProduct(params.id);
  
  if (!product) {
    return {
      notFound: true,
    };
  }

  const similarProducts = await fetchSimilarProducts(product);

  return {
    props: {
      product,
      similarProducts,
    },
    revalidate: 60, // Revalidate every 60 seconds
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch data for initial render (ISR)
  const product = await fetchProduct(params.id);
  
  if (!product) {
    notFound();
  }

  const similarProducts = await fetchSimilarProducts(product);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductDetailsClient 
        initialProduct={product}
        initialSimilarProducts={similarProducts}
      />
    </Suspense>
  );
}