import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_STALE_TIME = 60 * 1000; // 60 seconds

  set<T>(key: string, data: T, staleTime = this.DEFAULT_STALE_TIME) {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + staleTime
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() > entry.expiresAt;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

interface UseCachedQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  fallbackData?: T;
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 60 * 1000,
  refetchOnWindowFocus = true,
  fallbackData
}: UseCachedQueryOptions<T>) {
  const [data, setData] = useState<T | undefined>(() => {
    const cached = queryCache.get<T>(queryKey);
    return cached || fallbackData;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async (options?: { signal?: AbortSignal }) => {
    try {
      setLoading(true);
      setError(null);

      const result = await queryFn();
      
      if (options?.signal?.aborted) return;

      setData(result);
      queryCache.set(queryKey, result, staleTime);
    } catch (err) {
      if (options?.signal?.aborted) return;
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Query error for ${queryKey}:`, error);
    } finally {
      if (!options?.signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const refetch = () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    return fetchData({ signal: abortControllerRef.current.signal });
  };

  useEffect(() => {
    const cachedData = queryCache.get<T>(queryKey);
    
    if (cachedData && !queryCache.isStale(queryKey)) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Data is stale or doesn't exist, fetch fresh data
    refetch();

    // Window focus refetch
    const handleFocus = () => {
      if (refetchOnWindowFocus && queryCache.isStale(queryKey)) {
        refetch();
      }
    };

    if (refetchOnWindowFocus) {
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey, staleTime, refetchOnWindowFocus]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale: queryCache.isStale(queryKey)
  };
}

export { queryCache };