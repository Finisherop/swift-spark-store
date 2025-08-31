import Head from 'next/head'
import Link from 'next/link'
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
  const { data: products, error, isLoading } = useSWR<Product[]>('products', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  })

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center min-h-screen">Error loading products</div>

  return (
    <>
      <Head>
        <title>Swift Spark Store - Premium Products</title>
        <meta name="description" content="Discover amazing products at great prices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Welcome to Swift Spark Store
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={product.images?.[0] || product.amazon_image_url || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price}
                      </span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  }
}

