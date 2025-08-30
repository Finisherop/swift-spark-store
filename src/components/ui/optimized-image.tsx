import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  sizes?: string;
  priority?: boolean;
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
  priority = false,
}: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
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

  const handleLoad = () => {
    setImageLoaded(true);
  };
  useEffect(() => {
    setImageLoaded(false);
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
        <Image
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          fill={Boolean(!width && !height)}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
        />
      )}

      {/* Lazy loading placeholder */}
      {!isInView && lazy && (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  );
}