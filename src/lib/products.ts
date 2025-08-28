import { createServerSupabaseClient } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number | null;
  discount_percentage: number;
  category: string;
  badge?: string | null;
  affiliate_link: string;
  images: string[];
  is_amazon_product?: boolean;
  amazon_affiliate_link?: string | null;
  amazon_image_url?: string | null;
  short_description_amazon?: string | null;
  long_description_amazon?: string | null;
  amazon_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SimilarProduct extends Product {}

/**
 * Fetch a single product by ID with graceful error handling
 * Used for ISR and server-side rendering
 */
export async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    console.log('🔎 Fetching product with id:', productId);

    const supabase = createServerSupabaseClient();
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Error fetching product:', error);
      
      // Handle specific error cases
      if (error.code === 'PGRST116') {
        console.log('📝 Product not found, returning null');
        return null;
      }
      
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    if (!product) {
      console.log('📝 No product found for id:', productId);
      return null;
    }

    console.log('✅ Product fetched successfully:', product.name);
    return {
      ...product,
      description: product.description || '',
      short_description: product.short_description || '',
      original_price: product.original_price || undefined,
      discount_percentage: product.discount_percentage || 0,
      images: product.images || [],
      is_amazon_product: product.is_amazon_product || false,
      is_active: product.is_active || false,
    };
  } catch (error) {
    console.error('💥 Unexpected error fetching product:', error);
    return null;
  }
}

/**
 * Fetch similar products based on category or Amazon status
 * Used for ISR and server-side rendering
 */
export async function fetchSimilarProducts(
  currentProduct: Product,
  limit: number = 4
): Promise<SimilarProduct[]> {
  try {
    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('products')
      .select('*')
      .neq('id', currentProduct.id)
      .eq('is_active', true);

    // Filter by Amazon products if current product is Amazon
    if (currentProduct.is_amazon_product) {
      query = query.eq('is_amazon_product', true);
    } else {
      query = query.eq('category', currentProduct.category);
    }

    const { data: similarProducts, error } = await query
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching similar products:', error);
      return [];
    }

    console.log(`✅ Found ${similarProducts?.length || 0} similar products`);
    return (similarProducts || []).map(product => ({
      ...product,
      description: product.description || '',
      short_description: product.short_description || '',
      original_price: product.original_price || undefined,
      discount_percentage: product.discount_percentage || 0,
      images: product.images || [],
      is_amazon_product: product.is_amazon_product || false,
      is_active: product.is_active || false,
    }));
  } catch (error) {
    console.error('💥 Unexpected error fetching similar products:', error);
    return [];
  }
}

/**
 * Fetch all product IDs for static generation
 * Used for getStaticPaths
 */
export async function fetchAllProductIds(): Promise<string[]> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error fetching product IDs:', error);
      return [];
    }

    const productIds = products?.map(product => product.id) || [];
    console.log(`✅ Found ${productIds.length} product IDs for static generation`);
    return productIds;
  } catch (error) {
    console.error('💥 Unexpected error fetching product IDs:', error);
    return [];
  }
}

/**
 * Fetch featured products for homepage
 * Used for ISR and server-side rendering
 */
export async function fetchFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching featured products:', error);
      return [];
    }

    console.log(`✅ Found ${products?.length || 0} featured products`);
    return (products || []).map(product => ({
      ...product,
      description: product.description || '',
      short_description: product.short_description || '',
      original_price: product.original_price || undefined,
      discount_percentage: product.discount_percentage || 0,
      images: product.images || [],
      is_amazon_product: product.is_amazon_product || false,
      is_active: product.is_active || false,
    }));
  } catch (error) {
    console.error('💥 Unexpected error fetching featured products:', error);
    return [];
  }
}

/**
 * Track product clicks for analytics
 */
export async function trackProductClick(
  productId: string,
  clickType: 'view_details' | 'buy_now',
  userAgent?: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    
    await supabase
      .from('product_clicks')
      .insert({
        product_id: productId,
        click_type: clickType,
        user_ip: 'unknown', // Will be set by Supabase RLS
        user_agent: userAgent || 'unknown'
      });
  } catch (error) {
    console.error('❌ Error tracking product click:', error);
    // Don't throw - analytics failures shouldn't break the app
  }
}