import Head from 'next/head'
import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/ui/hero-section'
import { ProductCard } from '@/components/ui/product-card'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { createClient } from '@supabase/supabase-js'

type Product = {
  id: string
  name: string
  price: number
  original_price: number
  discount_percentage: number
  category: string
  badge: string
  affiliate_link: string
  images: string[]
  is_amazon_product: boolean
  amazon_affiliate_link: string
  amazon_image_url: string
  short_description: string
  short_description_amazon: string
  long_description_amazon: string
  amazon_url: string
  description: string
}

const fetcher = async (url: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set.");
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from('products').select('*').limit(12);
  
  if (error) throw error;
  return data;
}

export default function HomePage() {
  const router = useRouter()
  const { data: products, error, isLoading } = useSWR<Product[]>('products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  })

  const handleExploreClick = () => {
    // Scroll to products section or navigate to products page
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleViewDetails = (product: Product) => {
    router.push(`/product/${product.id}`)
  }

  const handleBuyNow = (product: Product) => {
    // Open affiliate link in new tab
    const link = product.affiliate_link || product.amazon_affiliate_link
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  )

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading products</h2>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Swift Spark Store - Premium Products</title>
        <meta name="description" content="Discover amazing products at great prices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hero Section */}
      <HeroSection onExploreClick={handleExploreClick} />
      
      {/* Products Section */}
      <section id="products-section" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our curated collection of premium products at unbeatable prices
            </p>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={handleViewDetails}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {products && products.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => router.push('/products')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  }
}

