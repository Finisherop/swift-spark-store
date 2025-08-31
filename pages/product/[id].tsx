import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { useRouter } from 'next/router'
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

type Props = {
  product: Product | null
  id: string
}

const fetcher = async (url: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not set.");
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from('products').select('*').eq('id', url).single();
  
  if (error) throw error;
  return data;
}

export default function ProductDetailPage({ product, id }: Props) {
  const router = useRouter()
  
  const { data: currentProduct, error } = useSWR<Product>(
    product ? null : id, // Only fetch if we don't have initial data
    fetcher,
    {
      fallbackData: product,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  const displayProduct = currentProduct || product

  if (router.isFallback) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error || !displayProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{displayProduct.name} - Swift Spark Store</title>
        <meta name="description" content={displayProduct.short_description || displayProduct.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Products
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="aspect-square relative">
                <Image
                  src={displayProduct.images?.[0] || displayProduct.amazon_image_url || '/placeholder.jpg'}
                  alt={displayProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              
              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {displayProduct.name}
                  </h1>
                  {displayProduct.badge && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {displayProduct.badge}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-green-600">
                    ${displayProduct.price}
                  </span>
                  {displayProduct.original_price > displayProduct.price && (
                    <span className="text-xl text-gray-500 line-through">
                      ${displayProduct.original_price}
                    </span>
                  )}
                  {displayProduct.discount_percentage > 0 && (
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {displayProduct.discount_percentage}% OFF
                    </span>
                  )}
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300">
                    {displayProduct.short_description || displayProduct.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <a
                    href={displayProduct.affiliate_link || displayProduct.amazon_affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-center block"
                  >
                    View Product
                  </a>
                  
                  {displayProduct.category && (
                    <div className="text-sm text-gray-500">
                      Category: <span className="font-medium">{displayProduct.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set for getStaticPaths.");
    return { paths: [], fallback: 'blocking' };
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .limit(100) // Pre-generate first 100 products
    
    if (error) {
      console.error('Error fetching products for static paths:', error);
      return { paths: [], fallback: 'blocking' };
    }
    
    const paths = products?.map((product) => ({
      params: { id: product.id },
    })) || []
    
    return {
      paths,
      fallback: 'blocking',
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = params?.id as string
  
  if (!id) {
    return {
      notFound: true,
    }
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are not set for getStaticProps.");
    return {
      props: { product: null, id },
      revalidate: 60,
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !product) {
      return {
        notFound: true,
        revalidate: 60,
      }
    }
    
    return {
      props: {
        product,
        id,
      },
      revalidate: 60, // Revalidate every 60 seconds
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
      revalidate: 60,
    }
  }
}

