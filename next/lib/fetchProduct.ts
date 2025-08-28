import { createClient } from '@supabase/supabase-js'

export type Product = {
	id: string
	name: string
	description?: string
	short_description?: string
	price: number
	original_price?: number
	discount_percentage?: number
	category: string
	badge?: string
	affiliate_link?: string
	images: string[]
	is_amazon_product?: boolean
	amazon_affiliate_link?: string
	amazon_image_url?: string
	short_description_amazon?: string
	long_description_amazon?: string
	amazon_url?: string
	is_active?: boolean
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function fetchProduct(productId: string) {
	if (!productId) {
		return { product: null as Product | null, error: new Error('Missing productId') }
	}

	const { data, error } = await supabase
		.from('products')
		.select(
			'id,name,description,short_description,price,original_price,discount_percentage,category,badge,affiliate_link,images,is_amazon_product,amazon_affiliate_link,amazon_image_url,short_description_amazon,long_description_amazon,amazon_url,is_active'
		)
		.eq('id', productId)
		.eq('is_active', true)
		.single()

	if (error || !data) {
		return { product: null as Product | null, error: error ?? new Error('Product not found') }
	}

	return { product: data as Product, error: null as Error | null }
}

