'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowLeft, ExternalLink, Check, ArrowRight, Flame } from "lucide-react";
import { ProductService, Product } from "@/services/productService";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetails() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Use cached query for product data with SWR-like behavior
  const {
    data: product,
    loading,
    error
  } = useCachedQuery<Product | null>({
    queryKey: `product:${id}`,
    queryFn: () => id ? ProductService.fetchProduct(id) : Promise.resolve(null),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false
  });

  // Use cached query for similar products
  const {
    data: similarProducts = [],
  } = useCachedQuery<Product[]>({
    queryKey: `similar:${id}:${product?.category || ''}:${product?.is_amazon_product ? 1 : 0}`,
    queryFn: () => id && product ? ProductService.fetchSimilarProducts(id, product.is_amazon_product) : Promise.resolve([]),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Handle product not found or error
  useEffect(() => {
    if (error || (product === null && !loading)) {
      toast({
        title: "Product Not Found",
        description: "The product you're looking for doesn't exist.",
        variant: "destructive"
      });
      router.push('/');
    }
  }, [error, product, loading, toast, router]);

  // Track page view when product loads
  useEffect(() => {
    if (product?.id) {
      ProductService.trackClick(product.id, 'view_details');
    }
  }, [product?.id]);

  const handleBuyNow = () => {
    if (product) {
      ProductService.trackClick(product.id, 'buy_now');
      window.open(product.affiliate_link, '_blank');
    }
  };

  const handleSimilarProductClick = (similarProduct: Product) => {
    ProductService.trackClick(similarProduct.id, 'view_details');
    if (similarProduct.category === 'Fashion') {
      window.open(similarProduct.affiliate_link, '_blank');
    } else {
      router.push(`/product/${similarProduct.id}`);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Product link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <OptimizedImage
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                priority
              />
              {product.discount_percentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{product.discount_percentage}% OFF
                </Badge>
              )}
              {product.badge === 'trending' && (
                <Badge className="absolute top-4 right-4 bg-orange-500 text-white">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {product.short_description}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {product.discount_percentage > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      ₹{Math.round(product.price * (1 - product.discount_percentage / 100))}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.price}
                    </span>
                    <Badge variant="destructive">
                      {product.discount_percentage}% OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    ₹{product.price}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  size="lg"
                >
                  Buy Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(window.location.href)}
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    'Share Product'
                  )}
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Product Highlights</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Free shipping available</li>
                  <li>• Secure payment processing</li>
                  <li>• Customer support available</li>
                  {product.is_amazon_product && <li>• Amazon Prime eligible</li>}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Product Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Product Description</h2>
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </motion.div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Similar Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.slice(0, 6).map((similarProduct) => (
                  <motion.div
                    key={similarProduct.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-card rounded-lg shadow-sm border overflow-hidden cursor-pointer"
                    onClick={() => handleSimilarProductClick(similarProduct)}
                  >
                    <div className="relative">
                      <OptimizedImage
                        src={similarProduct.images[0]}
                        alt={similarProduct.name}
                        className="w-full h-48 object-cover"
                      />
                      {similarProduct.discount_percentage > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                          -{similarProduct.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {similarProduct.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {similarProduct.short_description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {similarProduct.discount_percentage > 0 ? (
                            <>
                              <span className="font-bold text-primary">
                                ₹{Math.round(similarProduct.price * (1 - similarProduct.discount_percentage / 100))}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{similarProduct.price}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-primary">
                              ₹{similarProduct.price}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}