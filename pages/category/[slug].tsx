import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
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

type Props = {
  category: string
  categoryName: string
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

const categoryMap = {
  'fashion': { name: 'Fashion', icon: ShoppingBag },
  'health-fitness': { name: 'Health & Fitness', icon: Zap },
  'digital-products': { name: 'Digital Products', icon: Sparkles },
  'beauty': { name: 'Beauty', icon: Heart },
}

export default function CategoryPage({ category, categoryName }: Props) {
  const router = useRouter()
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

  // Filter products by category
  const categoryProducts = products?.filter(product => 
    product.category.toLowerCase() === categoryName.toLowerCase()
  ) || []

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

  const categoryInfo = categoryMap[category as keyof typeof categoryMap]

  return (
    <>
      <Head>
        <title>{categoryInfo?.name || categoryName} - Swift Spark Store</title>
        <meta name="description" content={`Browse our ${categoryInfo?.name || categoryName} collection`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center space-x-4 mb-4">
              {categoryInfo?.icon && (
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <categoryInfo.icon className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {categoryInfo?.name || categoryName}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Discover our {categoryInfo?.name || categoryName} collection
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {categoryProducts.length} products in {categoryInfo?.name || categoryName}
            </p>
          </div>

          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
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
                No products found in this category
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We're working on adding more products to this category.
              </p>
              <Button onClick={() => router.push('/products')}>
                Browse All Products
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(categoryMap).map((slug) => ({
    params: { slug },
  }))

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const categoryInfo = categoryMap[slug as keyof typeof categoryMap]

  if (!categoryInfo) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      category: slug,
      categoryName: categoryInfo.name,
    },
    revalidate: 60, // Revalidate every 60 seconds
  }
}