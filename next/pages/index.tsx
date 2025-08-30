import type { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'swr'
import { createClient } from '@supabase/supabase-js'

type Product = {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  short_description?: string
}

async function fetchProducts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return [] as Product[]
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data } = await supabase
    .from('products')
    .select('id,name,price,images,category,short_description')
    .eq('is_active', true)
    .limit(24)
  return data as Product[]
}

type Props = { initial: Product[] }

export default function Home({ initial }: Props) {
  const { data } = useSWR('products:home', fetchProducts, {
    fallbackData: initial,
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const products = data ?? initial

  return (
    <>
      <Head>
        <title>Swift Spark Store</title>
        <meta name="description" content="A modern e-commerce platform" />
      </Head>
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Featured Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="block border rounded-md p-4 hover:shadow-sm" aria-label={`View ${p.name}`}>
              <div className="font-medium mb-1">{p.name}</div>
              <div className="text-muted-foreground text-sm mb-2">{p.category}</div>
              <div className="text-primary font-semibold">${Math.round(p.price).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const initial = await fetchProducts()
  return {
    props: { initial: initial ?? [] },
    revalidate: 60,
  }
}

