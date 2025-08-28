import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowLeft, ExternalLink, Check, ArrowRight, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface Product {
  id: string;
  name: string;
  description: string;
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
  amazon_url?: string;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);

      // Fetch the main product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id,name,description,short_description,price,original_price,discount_percentage,category,badge,affiliate_link,images,is_amazon_product,amazon_affiliate_link,amazon_image_url,short_description_amazon,long_description_amazon,amazon_url')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        navigate('/');
        return;
      }

      setProduct(productData);

      // Fetch similar products - cap to 24 for speed
      let query = supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .eq('is_active', true);

      if (productData.is_amazon_product) {
        // Show ALL Amazon products, not just limited to 4
        query = query.eq('is_amazon_product', true);
      } else {
        query = query.eq('category', productData.category);
      }

      const { data: similarData, error: similarError } = await query.limit(24);

      if (!similarError && similarData) {
        setSimilarProducts(similarData);
      }

    } catch (error) {
      console.error('Error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (clickType: 'view_details' | 'buy_now') => {
    if (!product) return;

    try {
      await supabase
        .from('product_clicks')
        .insert({
          product_id: product.id,
          click_type: clickType,
          user_ip: 'unknown',
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    await trackClick('buy_now');
    const linkToOpen = product.is_amazon_product ? (product.amazon_affiliate_link || product.amazon_url) : product.affiliate_link;
    window.open(linkToOpen, '_blank');
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNowGrid = async (product: Product) => {
    await trackClick('buy_now');
    const linkToOpen = product.is_amazon_product ? (product.amazon_affiliate_link || product.amazon_url) : product.affiliate_link;
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
    const productUrl = `${window.location.origin}/product/${product?.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.short_description,
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
    const productUrl = `${window.location.origin}/product/${product?.id}`;

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header 
          onSearch={() => {}} 
          onFilterChange={() => {}} 
          selectedCategory="all" 
          searchQuery=""
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header 
          onSearch={() => {}} 
          onFilterChange={() => {}} 
          selectedCategory="all" 
          searchQuery=""
        />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product?.name ? `${product.name} - SwiftMart` : 'SwiftMart'}</title>
        <meta name="description" content={product?.short_description || product?.description || 'Premium products at SwiftMart'} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={product?.name || 'SwiftMart'} />
        <meta property="og:description" content={product?.short_description || product?.description || 'Premium products at SwiftMart'} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`${window.location.origin}/product/${product?.id}`} />
        {(product?.images?.[0] || product?.amazon_image_url) && (
          <meta property="og:image" content={product.images?.[0] || product.amazon_image_url} />
        )}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.name || 'SwiftMart'} />
        <meta name="twitter:description" content={product?.short_description || product?.description || 'Premium products at SwiftMart'} />
        {(product?.images?.[0] || product?.amazon_image_url) && (
          <meta name="twitter:image" content={product.images?.[0] || product.amazon_image_url} />
        )}

        {/* Product Schema */}
        {product && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "description": product.description || product.short_description,
              "image": product.images,
              "offers": {
                "@type": "Offer",
                "url": `${window.location.origin}/product/${product.id}`,
                "priceCurrency": "USD",
                "price": product.price,
                "availability": "https://schema.org/InStock"
              }
            })}
          </script>
        )}
      </Helmet>

      <Header 
        onSearch={() => {}} 
        onFilterChange={() => {}} 
        selectedCategory="all" 
        searchQuery=""
      />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            className="mb-6 hover:bg-muted/50" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </motion.div>

        {/* Amazon Product Layout */}
        {product.is_amazon_product ? (
          <div className="max-w-7xl mx-auto">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Left: Product Image with Auto Swipe Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="relative group">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-border/10 overflow-hidden">
                    <motion.div 
                      className="aspect-square relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      {product.images && product.images.length > 1 ? (
                        <motion.div
                          className="w-full h-full"
                          animate={{ 
                            x: [0, -100, -200, -300, 0] 
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="flex w-[400%] h-full">
                            {(product.images && product.images.length > 0 ? product.images : [product.amazon_image_url || '/placeholder.svg']).slice(0, 4).map((image, index) => (
                              <div key={index} className="w-1/4 h-full flex-shrink-0">
                                <OptimizedImage
                                  src={image}
                                  alt={`${product.name} - Image ${index + 1}`}
                                  className="w-full h-full object-contain rounded-2xl"
                                  priority={index === 0}
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <OptimizedImage
                          src={product.images?.[0] || product.amazon_image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-contain rounded-2xl"
                          priority={true}
                        />
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                  {/* Title */}
                  <motion.h1 
                    className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {product.name}
                  </motion.h1>

                {/* Short Description - Stylish */}
                <motion.div 
                  className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <p className="text-lg text-foreground leading-relaxed font-medium text-center">
                    {product.short_description_amazon || product.description}
                  </p>
                </motion.div>

                {/* Top Pick Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold text-lg shadow-lg"
                >
                  <Flame className="h-5 w-5" />
                  🔥 Top Pick 2025
                </motion.div>

                {/* Key Features */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-foreground">Key Features:</h3>
                  <div className="space-y-3">
                    {[
                      "🚀 Free & Fast Delivery via Amazon",
                      "⭐ Premium build & trusted brand",
                      "🔋 Long-lasting performance", 
                      "🎁 Great value for money",
                      "🔒 Secure purchase with Amazon checkout"
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-foreground font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="space-y-4"
                >
                  {/* Primary Buy Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleBuyNow}
                      className="w-full text-xl font-bold py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 rounded-2xl group"
                    >
                      Buy Now on Amazon
                      <ExternalLink className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>

                  {/* Secondary View on Amazon Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleBuyNow}
                      className="w-full text-lg font-semibold py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-2xl group"
                    >
                      View on Amazon
                      <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Regular Product Layout - keeping existing layout for non-Amazon products */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
            {/* Existing non-Amazon layout remains unchanged */}
          </div>
        )}

        {/* Similar Products Section - Only Amazon Products */}
{similarProducts.length > 0 && (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.2 }}
    className="mb-16"
  >
    <div className="bg-white dark:bg-card rounded-3xl shadow-2xl border border-border/10 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
        <motion.h2 
          className="text-3xl font-bold flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          🛍️
          </div>
          All Amazon Products
        </motion.h2>
        <motion.p 
          className="text-indigo-100 mt-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          Discover all our curated Amazon products
        </motion.p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {similarProducts
            .filter(product => product.is_amazon_product) // ✅ Show all Amazon products
            .map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-square p-4">
                  <OptimizedImage
                    src={product.images?.[0] || product.amazon_image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-xl"
                    priority={false}
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold text-foreground line-clamp-2 text-lg">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {product.short_description}
                  </p>
                  {product.badge && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {product.badge}
                    </Badge>
                  )}
                  <Button
                    onClick={() => handleBuyNowGrid(product)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl group"
                  >
                    View on Amazon
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
)}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/" className="block text-muted-foreground hover:text-primary transition-colors">Home</a>
                <a href="/contact" className="block text-muted-foreground hover:text-primary transition-colors">Contact</a>
                <a href="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">About</h3>
              <p className="text-muted-foreground text-sm">
                We help you find the best products on Amazon with honest reviews and recommendations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
              <div className="space-y-2">
                <a href="https://pin.it/5cHRxjxki" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12s5.373 12 12 12c6.628 0 12-5.372 12-12S18.628 0 12 0zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.713-1.227s.179.339.889.339c2.966 0 4.96-2.686 4.96-6.275 0-2.715-1.522-5.297-4.438-5.297-3.331 0-5.052 2.389-5.052 4.383 0 1.205.456 2.27 1.438 2.67.161.067.307.003.353-.18.033-.13.111-.437.145-.568.047-.181.029-.245-.1-.404-.284-.349-.465-.8-.465-1.442 0-1.855 1.389-3.517 3.617-3.517 1.972 0 3.055 1.205 3.055 2.812 0 2.115-936 3.821-2.131 3.821-.701 0-1.225-.578-.1.057.941.636 1.577 1.602 1.577 2.714 0 .309-.026.602-.078.884C16.605 18.658 19 15.634 19 12c0-3.859-3.141-7-7-7s-7 3.141-7 7 3.141 7 7 7z"/>
                  </svg>
                  Pinterest
                </a>
                <a href="https://www.instagram.com/swiftmart_fashion?igsh=MWR5aWxoejh1NzAxNA==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
          
          {/* Affiliate Disclaimer */}
          <div className="border-t border-border/20 pt-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50">
              <p className="text-center text-sm text-amber-700 dark:text-amber-300 font-medium">
                🛍️ As an Amazon Associate I earn from qualifying purchases. This helps support our site at no additional cost to you.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
