import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { fetchProduct, type Product } from '../../lib/fetchProduct'
import { createClient } from '@supabase/supabase-js'

async function fetcher(id: string) {
	const { product } = await fetchProduct(id)
	return product
}

type Props = {
	product: Product | null
	id: string
}

export default function ProductDetailPage({ product, id }: Props) {
	const router = useRouter()

	const { data } = useSWR(product ? ['product', id] : null, () => fetcher(id), {
		fallbackData: product,
		revalidateOnFocus: false,
		dedupingInterval: 60_000,
	})

	const current = data ?? product

	if (router.isFallback) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading product…</p>
			</div>
		)
	}

	if (!current) {
		return (
			<main className="min-h-screen container mx-auto px-4 py-20 text-center">
				<h1 className="text-2xl font-semibold mb-2">Product not found</h1>
				<p className="text-muted-foreground mb-6">It may have been removed or is temporarily unavailable.</p>
				<Link href="/" aria-label="Back to Home" className="underline">
					Back to Home
				</Link>
			</main>
		)
	}

	const cover = current.images?.[0] ?? current.amazon_image_url ?? '/images/placeholder.webp'

	return (
		<>
			<Head>
				<title>{current.name} • Store</title>
				<meta name="description" content={current.short_description || current.description || 'Product detail'} />
				<link rel="preload" as="image" href={cover} />
			</Head>

			<main className="min-h-screen bg-background">
				<article className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
						<Image
							src={cover}
							alt={current.name}
							fill
							sizes="(max-width: 768px) 100vw, 50vw"
							priority={false}
							loading="lazy"
							quality={80}
						/>
					</div>

					<div>
						<h1 className="text-3xl font-bold mb-3">{current.name}</h1>
						<p className="text-muted-foreground mb-4">
							{current.short_description || current.description || '—'}
						</p>

						<div className="flex items-center gap-3 mb-6">
							<span className="text-2xl font-semibold">${Math.round(current.price).toLocaleString()}</span>
							{current.original_price ? (
								<span className="text-muted-foreground line-through">
									${Math.round(current.original_price).toLocaleString()}
								</span>
							) : null}
						</div>

						<div className="flex gap-3">
							{current.is_amazon_product ? (
								<a
									href={current.amazon_affiliate_link || current.amazon_url || '#'}
									target="_blank"
									rel="noopener"
									className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground"
									aria-label="Buy on Amazon"
								>
									Buy Now
								</a>
							) : (
								<a
									href={current.affiliate_link || '#'}
									target="_blank"
									rel="noopener"
									className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground"
									aria-label="Buy now"
								>
									Buy Now
								</a>
							)}
							<Link
								href="/"
								className="inline-flex items-center px-4 py-2 rounded-md border"
								aria-label="Back to home"
							>
								Back
							</Link>
						</div>
					</div>
				</article>
			</main>
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return { paths: [], fallback: 'blocking' }
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data } = await supabase
    .from('products')
    .select('id')
    .eq('is_active', true)
    .limit(50)

	const paths = data?.map((p) => ({ params: { id: String(p.id) } })) ?? []

	return {
		paths,
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const id = String(params?.id || '')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return { props: { product: null, id }, revalidate: 60 }
  }
  const { product } = await fetchProduct(id)

	if (!product) {
		return {
			props: { product: null, id },
			revalidate: 60,
		}
	}

	return {
		props: { product, id },
		revalidate: 60,
	}
}

