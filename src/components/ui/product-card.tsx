import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { ImageCarousel } from "./image-carousel";
import { OptimizedImage } from "./optimized-image";
import { Eye, ShoppingCart, Star, Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


interface Product {
  id: string;
  name: string;
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
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails, onBuyNow }: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getBadgeVariant = (badge: string) => {
    switch (badge?.toLowerCase()) {
      case 'new':
        return 'info';
      case 'best seller':
        return 'success';
      case 'trending':
        return 'warning';
      case 'limited stock':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleViewDetails = () => {
    onViewDetails(product);
  };

  const handleBuyNow = () => {
    onBuyNow(product);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    const shareText = `Check out this amazing product: ${product.name} - Only $${Math.round(product.price).toLocaleString()}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        toast({
          title: "Link Copied!",
          description: "Product link has been copied to clipboard",
        });
        
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.log('Copy failed:', error);
        toast({
          title: "Share Failed",
          description: "Unable to copy link to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="product-card group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        {product.images && product.images.length > 1 ? (
          <div className="h-full">
            <ImageCarousel 
              images={product.images} 
              alt={product.name}
              autoPlay={true}
              interval={4000}
            />
          </div>
        ) : (
          <OptimizedImage
            src={product.images?.[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            lazy={true}
          />
        )}
        
        {/* Badge */}
        {product.badge && (
          <Badge 
            variant={getBadgeVariant(product.badge)}
            className="absolute top-3 left-3 animate-bounce-in z-10"
          >
            {product.badge}
          </Badge>
        )}

        {/* Discount Badge */}
        {!product.is_amazon_product && product.discount_percentage > 0 && (
          <Badge 
            variant="destructive"
            className="absolute top-3 right-3 animate-bounce-in z-10"
          >
            -{product.discount_percentage}%
          </Badge>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-medium"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            className="shadow-medium"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="shadow-medium bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            onClick={handleShare}
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.is_amazon_product ? product.short_description_amazon : product.short_description}
        </p>

        {/* Price Section */}
        {!product.is_amazon_product ? (
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              ${Math.round(product.price).toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ${Math.round(product.original_price).toLocaleString()}
              </span>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-700">
              Price available on Amazon
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="flex-1 transition-smooth hover:shadow-medium"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            onClick={handleBuyNow}
            className="flex-1 transition-smooth hover:shadow-medium"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.is_amazon_product ? "View on Amazon" : "Buy Now"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="px-3 transition-smooth hover:shadow-medium hover:bg-primary/10"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}