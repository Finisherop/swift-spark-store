import useSWR, { SWRConfiguration } from 'swr';
import { Product, fetchProduct, fetchSimilarProducts } from './products';

// SWR configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  refreshInterval: 0, // Disable auto refresh
};

// Custom fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Hook for fetching product data with SWR
export function useProduct(productId: string, fallbackData?: Product) {
  const { data, error, isLoading, mutate } = useSWR<Product>(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      ...swrConfig,
      fallbackData,
      revalidateIfStale: false, // Don't revalidate if we have fallback data
    }
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching similar products with SWR
export function useSimilarProducts(
  currentProduct: Product | null,
  fallbackData?: Product[]
) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    currentProduct ? `/api/products/${currentProduct.id}/similar` : null,
    fetcher,
    {
      ...swrConfig,
      fallbackData,
      revalidateIfStale: false,
    }
  );

  return {
    similarProducts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching featured products
export function useFeaturedProducts(fallbackData?: Product[]) {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    '/api/products/featured',
    fetcher,
    {
      ...swrConfig,
      fallbackData,
      revalidateIfStale: false,
    }
  );

  return {
    featuredProducts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for tracking product clicks
export function useProductTracking() {
  const trackClick = async (
    productId: string,
    clickType: 'view_details' | 'buy_now'
  ) => {
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          clickType,
        }),
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  return { trackClick };
}