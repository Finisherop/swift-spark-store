import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
	src: string;
	alt: string;
	className?: string;
	containerClassName?: string;
	imgClassName?: string;
	width?: number;
	height?: number;
	priority?: boolean;
	placeholder?: string;
	onLoad?: () => void;
	onError?: () => void;
	quality?: number;
	webpEnabled?: boolean;
}

export function OptimizedImage({
	src,
	alt,
	className,
	containerClassName,
	imgClassName,
	width,
	height,
	priority = false,
	placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YWFhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
	quality = 85,
	webpEnabled = true,
	onLoad,
	onError,
}: OptimizedImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [isInView, setIsInView] = useState(priority);
	const [webpSrc, setWebpSrc] = useState<string>('');
	const [supportsWebp, setSupportsWebp] = useState<boolean | null>(null);
	const imgRef = useRef<HTMLImageElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	// Check WebP support
	useEffect(() => {
		const checkWebpSupport = () => {
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const dataURL = canvas.toDataURL('image/webp');
			setSupportsWebp(dataURL.startsWith('data:image/webp'));
		};
		
		checkWebpSupport();
	}, []);

	// Convert image to WebP format
	useEffect(() => {
		if (!webpEnabled || supportsWebp === null || !src) return;

		const convertToWebP = async () => {
			try {
				// For external URLs, try to append webp format if it's a service that supports it
				if (src.includes('unsplash.com') || src.includes('amazonaws.com') || src.includes('cloudinary.com')) {
					const webpUrl = src.includes('?') 
						? `${src}&f=webp&q=${quality}` 
						: `${src}?f=webp&q=${quality}`;
					setWebpSrc(webpUrl);
				} else if (supportsWebp && src.startsWith('data:') === false) {
					// For other URLs, create a WebP version if browser supports it
					const img = new Image();
					img.crossOrigin = 'anonymous';
					img.onload = () => {
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');
						if (!ctx) {
							setWebpSrc(src);
							return;
						}

						canvas.width = img.naturalWidth;
						canvas.height = img.naturalHeight;
						ctx.drawImage(img, 0, 0);

						try {
							const webpDataUrl = canvas.toDataURL('image/webp', quality / 100);
							setWebpSrc(webpDataUrl);
						} catch (error) {
							// Fallback to original if WebP conversion fails
							setWebpSrc(src);
						}
					};
					img.onerror = () => setWebpSrc(src);
					img.src = src;
				} else {
					setWebpSrc(src);
				}
			} catch (error) {
				setWebpSrc(src);
			}
		};

		convertToWebP();
	}, [src, webpEnabled, supportsWebp, quality]);

	// Intersection Observer for lazy loading
	useEffect(() => {
		if (priority) {
			setIsInView(true);
			return;
		}

		if (!imgRef.current) return;

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observerRef.current?.disconnect();
				}
			},
			{
				rootMargin: '100px',
				threshold: 0.01,
			}
		);

		observerRef.current.observe(imgRef.current);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [priority]);

	const handleLoad = () => {
		setIsLoaded(true);
		onLoad?.();
	};

	const handleError = () => {
		setHasError(true);
		onError?.();
	};

	if (hasError) {
		return (
			<div
				className={cn(
					'flex items-center justify-center bg-muted text-muted-foreground',
					className,
					containerClassName
				)}
				style={{ width, height }}
			>
				<div className="text-center">
					<div className="text-2xl mb-2">🖼️</div>
					<div className="text-sm">Image failed to load</div>
				</div>
			</div>
		);
	}

	return (
		<div className={cn('relative overflow-hidden', className, containerClassName)} style={{ width, height }}>
			{/* Placeholder */}
			{!isLoaded && (
				<img
					src={placeholder}
					alt=""
					className={cn('absolute inset-0 w-full h-full object-cover', imgClassName)}
					aria-hidden="true"
				/>
			)}
			
			{/* Main Image with WebP Support */}
			{isInView && webpSrc && (
				<picture>
					{webpEnabled && supportsWebp && webpSrc !== src && (
						<source srcSet={webpSrc} type="image/webp" />
					)}
					<img
						ref={imgRef}
						src={webpSrc}
						alt={alt}
						className={cn(
							'w-full h-full object-cover transition-all duration-500 ease-out',
							isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
							imgClassName
						)}
						onLoad={handleLoad}
						onError={handleError}
						loading={priority ? 'eager' : 'lazy'}
						decoding="async"
						fetchPriority={priority ? 'high' : 'auto'}
					/>
				</picture>
			)}
			
			{/* Loading Spinner with Shimmer Effect */}
			{!isLoaded && isInView && (
				<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse">
					<div className="flex flex-col items-center space-y-2">
						<div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
						<div className="text-xs text-muted-foreground">Loading...</div>
					</div>
				</div>
			)}
		</div>
	);
}