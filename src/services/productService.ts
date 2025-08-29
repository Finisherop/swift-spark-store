import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  category: string;
  badge?: string;
  affiliate_link: string;
  images: string[];
  is_amazon_product?: boolean;
  amazon_affiliate_link?: string;
  amazon_image_url?: string;
  short_description_amazon?: string;
  long_description_amazon?: string;
  amazon_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ProductService {
  // Cache for products with TTL
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private static setCache(key: string, data: any, ttl = this.DEFAULT_TTL) {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    this.cache.set(key, entry);
    try {
      localStorage.setItem(`ps_cache:${key}`, JSON.stringify(entry));
    } catch {}
  }

  private static getCache(key: string) {
    const now = Date.now();
    let cached = this.cache.get(key);

    if (!cached) {
      try {
        const raw = localStorage.getItem(`ps_cache:${key}`);
        if (raw) {
          const parsed = JSON.parse(raw) as { data: any; timestamp: number; ttl: number };
          if (now - parsed.timestamp <= parsed.ttl) {
            this.cache.set(key, parsed);
            cached = parsed as any;
          } else {
            localStorage.removeItem(`ps_cache:${key}`);
          }
        }
      } catch {}
    }

    if (!cached) return null;

    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      try { localStorage.removeItem(`ps_cache:${key}`); } catch {}
      return null;
    }

    return cached.data;
  }

  static async fetchProduct(productId: string): Promise<Product | null> {
    try {
      const cacheKey = `product:${productId}`;
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return cached;
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .maybeSingle();

      if (productError) {
        throw productError;
      }

      if (!productData) {
        return null;
      }

      this.setCache(cacheKey, productData);
      return productData;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  static async fetchProducts(options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    try {
      const { category, limit = 24, offset = 0 } = options || {};
      const cacheKey = `products:${category || 'all'}:${limit}:${offset}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      const products = data || [];
      this.setCache(cacheKey, products);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async fetchSimilarProducts(productId: string, isAmazonProduct?: boolean): Promise<Product[]> {
    try {
      const cacheKey = `similar:${productId}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      // First get the current product to determine category
      const currentProduct = await this.fetchProduct(productId);
      if (!currentProduct) return [];

      // Build with fallbacks for Amazon products
      let data: Product[] | null = null;
      let error: any = null;

      if (currentProduct.is_amazon_product) {
        const res1 = await supabase
          .from('products')
          .select('*')
          .neq('id', productId)
          .eq('is_active', true)
          .eq('is_amazon_product', true)
          .limit(6);
        data = res1.data; error = res1.error;

        // Fallback to same category if none found
        if (!error && (!data || data.length === 0) && currentProduct.category) {
          const res2 = await supabase
            .from('products')
            .select('*')
            .neq('id', productId)
            .eq('is_active', true)
            .eq('category', currentProduct.category)
            .limit(6);
          data = res2.data; error = res2.error;
        }
      } else {
        const res = await supabase
          .from('products')
          .select('*')
          .neq('id', productId)
          .eq('is_active', true)
          .eq('category', currentProduct.category)
          .limit(6);
        data = res.data; error = res.error;
      }

      // Final fallback: latest active products
      if (!error && (!data || data.length === 0)) {
        const res3 = await supabase
          .from('products')
          .select('*')
          .neq('id', productId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);
        data = res3.data; error = res3.error;
      }

      if (error) throw error;

      const similarProducts = data || [];
      if (similarProducts.length > 0) {
        this.setCache(cacheKey, similarProducts);
      }
      return similarProducts;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      return [];
    }
  }

  static async trackClick(productId: string, clickType: 'view_details' | 'buy_now') {
    try {
      await supabase
        .from('product_clicks')
        .insert({
          product_id: productId,
          click_type: clickType,
          user_ip: 'unknown',
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking click:', error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  static async trackUserVisit() {
    try {
      const userAgent = navigator.userAgent;
      await supabase
        .from('website_users')
        .upsert({
          user_ip: 'unknown',
          user_agent: userAgent,
          last_visit: new Date().toISOString()
        }, {
          onConflict: 'user_ip'
        });
    } catch (error) {
      console.error('Error tracking user visit:', error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Preload products for better UX
  static async preloadProducts(productIds: string[]) {
    const promises = productIds.map(id => this.fetchProduct(id).catch(() => null));
    await Promise.allSettled(promises);
  }
}