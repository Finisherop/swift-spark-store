import { useState, useEffect, useCallback } from 'react';

export function usePerformance() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateConnectionSpeed = () => {
          if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            setConnectionSpeed('slow');
          } else if (connection.effectiveType === '3g' || connection.effectiveType === '4g') {
            setConnectionSpeed('fast');
          } else {
            setConnectionSpeed('unknown');
          }
        };

        updateConnectionSpeed();
        connection.addEventListener('change', updateConnectionSpeed);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionSpeed);
        }
      }
    };
  }, []);

  const preloadImage = useCallback((src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (srcs: string[]) => {
    if (connectionSpeed === 'slow') {
      // Only preload first image on slow connections
      return Promise.all([preloadImage(srcs[0])]);
    }
    
    // Preload all images on fast connections
    return Promise.all(srcs.map(src => preloadImage(src)));
  }, [connectionSpeed, preloadImage]);

  const shouldLazyLoad = useCallback(() => {
    return connectionSpeed === 'slow' || !isOnline;
  }, [connectionSpeed, isOnline]);

  const getImageQuality = useCallback(() => {
    if (connectionSpeed === 'slow') {
      return 'low';
    }
    return 'high';
  }, [connectionSpeed]);

  return {
    isOnline,
    connectionSpeed,
    preloadImage,
    preloadImages,
    shouldLazyLoad,
    getImageQuality,
  };
}