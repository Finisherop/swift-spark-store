import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  sizes?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with lazy loading and modern format support
 * - Lazy loading by default
 * - Prefers WebP/AVIF formats when available
 * - Fallback to original format if modern formats fail
 * - Works seamlessly with Supabase Storage URLs
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  sizes = "100vw",
  fallbackSrc = '/placeholder.svg',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Try to optimize Supabase URLs for modern formats
  const getOptimizedSrc = (originalSrc: string): string => {
    // Check if it's a Supabase Storage URL
    if (originalSrc.includes('supabase.co/storage/')) {
      // For Supabase, we can add transform parameters for optimization
      // Note: This depends on Supabase's image transformation features
      // You may need to enable these in your Supabase project
      try {
        const url = new URL(originalSrc);
        // Add quality and format optimization parameters
        url.searchParams.set('quality', '80');
        url.searchParams.set('format', 'webp');
        return url.toString();
      } catch {
        return originalSrc;
      }
    }
    return originalSrc;
  };

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    
    // Try fallback strategies
    if (currentSrc !== src && currentSrc !== fallbackSrc) {
      // If optimized version failed, try original
      setCurrentSrc(src);
    } else if (currentSrc !== fallbackSrc) {
      // If original failed, use fallback
      setCurrentSrc(fallbackSrc);
    }
    
    onError?.();
  };

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(getOptimizedSrc(src));
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        !imageLoaded && "bg-muted animate-pulse",
        className
      )}
      style={{ width, height }}
    >
      {isInView && (
        <>
          {/* Main optimized image */}
          <picture>
            {/* Try WebP format first (if supported) */}
            {src.includes('supabase.co/storage/') && (
              <source 
                srcSet={getOptimizedSrc(src)} 
                type="image/webp" 
              />
            )}
            
            {/* Fallback to original format */}
            <img
              src={currentSrc}
              alt={alt}
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              width={width}
              height={height}
              sizes={sizes}
              loading={lazy ? "lazy" : "eager"}
              onLoad={handleLoad}
              onError={handleError}
              decoding="async"
            />
          </picture>

          {/* Loading placeholder */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Error state */}
          {imageError && currentSrc === fallbackSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              <span className="text-sm">Failed to load image</span>
            </div>
          )}
        </>
      )}

      {/* Lazy loading placeholder */}
      {!isInView && lazy && (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  );
}