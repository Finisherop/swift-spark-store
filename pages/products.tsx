import Head from 'next/head'
import { useState } from 'react'
import { ProductCard } from '@/components/ui/product-card'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Package, ShoppingBag, Zap, Sparkles, Heart } from 'lucide-react'

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
  const { data, error } = await supabase.from('products').select('*');
  
  if (error) throw error;
  return data;
}

const categories = [
  { id: "all", name: "All Products", icon: Package },
  { id: "Fashion", name: "Fashion", icon: ShoppingBag },
  { id: "Health & Fitness", name: "Health & Fitness", icon: Zap },
  { id: "Digital Products", name: "Digital Products", icon: Sparkles },
  { id: "Beauty", name: "Beauty", icon: Heart },
]

export default function ProductsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: products, error, isLoading } = useSWR<Product[]>('all-products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  })

  const handleViewDetails = (product: Product) => {
    router.push(`/product/${product.id}`)
  }

  const handleBuyNow = (product: Product) => {
    const link = product.affiliate_link || product.amazon_affiliate_link
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  // Filter products based on category and search
  const filteredProducts = products?.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  }) || []

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
        <title>All Products - Swift Spark Store</title>
        <meta name="description" content="Browse all our amazing products" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Products
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover our complete collection of premium products
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="mb-8">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>

            {/* Search */}
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {filteredProducts.length} of {products?.length || 0} products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  }
}