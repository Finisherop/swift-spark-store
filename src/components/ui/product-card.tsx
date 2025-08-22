import { useState, useEffect } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Eye, ShoppingCart, Star, Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

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
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails, onBuyNow }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Get local currency data
  const { price: localPrice, currencySymbol, currencyCode } = useLocalCurrency(product.price);
  const { price: originalLocalPrice } = useLocalCurrency(product.original_price || 0);

  // Auto-swipe images every 3 seconds
  useEffect(() => {
    if (product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [product.images.length]);

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
    const shareText = `Check out this amazing product: ${product.name} - Only ${currencySymbol}${Math.round(localPrice).toLocaleString()}!`;
    
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
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badge */}
        {product.badge && (
          <Badge 
            variant={getBadgeVariant(product.badge)}
            className="absolute top-3 left-3 animate-bounce-in"
          >
            {product.badge}
          </Badge>
        )}

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <Badge 
            variant="destructive"
            className="absolute top-3 right-3 animate-bounce-in"
          >
            -{product.discount_percentage}%
          </Badge>
        )}

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentImageIndex 
                    ? "bg-white shadow-glow" 
                    : "bg-white/60"
                )}
              />
            ))}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
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
          {product.short_description}
        </p>

        {/* Price Section */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">
            {currencySymbol}{Math.round(localPrice).toLocaleString()}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {currencySymbol}{Math.round(originalLocalPrice).toLocaleString()}
            </span>
          )}
        </div>

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
            Buy Now
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