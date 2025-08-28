'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Check, ArrowRight, Flame, Share2, Copy } from 'lucide-react';
import { useProduct, useSimilarProducts, useProductTracking } from '@/lib/swr';
import { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailsClientProps {
  initialProduct: Product;
  initialSimilarProducts: Product[];
}

export function ProductDetailsClient({ 
  initialProduct, 
  initialSimilarProducts 
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Use SWR with fallback data for instant loading
  const { product } = useProduct(initialProduct.id, initialProduct);
  const { similarProducts } = useSimilarProducts(initialProduct, initialSimilarProducts);
  const { trackClick } = useProductTracking();

  const currentProduct = product || initialProduct;

  const handleBuyNow = async () => {
    if (!currentProduct) return;

    await trackClick(currentProduct.id, 'buy_now');
    const linkToOpen = currentProduct.is_amazon_product 
      ? (currentProduct.amazon_affiliate_link || currentProduct.amazon_url) 
      : currentProduct.affiliate_link;
    window.open(linkToOpen, '_blank');
  };

  const handleViewDetails = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleBuyNowGrid = async (product: Product) => {
    await trackClick(product.id, 'buy_now');
    const linkToOpen = product.is_amazon_product 
      ? (product.amazon_affiliate_link || product.amazon_url) 
      : product.affiliate_link;
    window.open(linkToOpen, '_blank');
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case 'new':
        return 'info' as const;
      case 'best seller':
        return 'success' as const;
      case 'trending':
        return 'warning' as const;
      case 'limited stock':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleShareProduct = async () => {
    const productUrl = `${window.location.origin}/product/${currentProduct?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          text: currentProduct?.short_description,
          url: productUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}/product/${currentProduct?.id}`;

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src={currentProduct.images[selectedImageIndex] || currentProduct.images[0]}
                alt={currentProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedImageIndex === 0}
                quality={85}
              />
            </div>
            
            {/* Image Thumbnails */}
            {currentProduct.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-md border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    aria-label={`View image ${index + 1} of ${currentProduct.images.length}`}
                  >
                    <Image
                      src={image}
                      alt={`${currentProduct.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                      loading={index < 4 ? 'eager' : 'lazy'}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badge */}
            {currentProduct.badge && (
              <Badge variant={getBadgeVariant(currentProduct.badge)}>
                {currentProduct.badge}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight">
              {currentProduct.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                ${currentProduct.price.toFixed(2)}
              </span>
              {currentProduct.original_price && currentProduct.original_price > currentProduct.price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${currentProduct.original_price.toFixed(2)}
                </span>
              )}
              {currentProduct.discount_percentage > 0 && (
                <Badge variant="destructive">
                  {currentProduct.discount_percentage}% OFF
                </Badge>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                {currentProduct.short_description}
              </p>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleBuyNow}
                className="flex-1"
                aria-label={`Buy ${currentProduct.name} now`}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShareProduct}
                aria-label="Share this product"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyLink}
                aria-label="Copy product link"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>

            {/* Features */}
            {currentProduct.is_amazon_product && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                <span>Amazon Prime eligible</span>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.badge && (
                        <Badge variant={getBadgeVariant(product.badge)} size="sm">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(product)}
                        className="flex-1"
                        aria-label={`View details for ${product.name}`}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBuyNowGrid(product)}
                        aria-label={`Buy ${product.name} now`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}