import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ProductGrid } from "@/components/ui/product-grid";
import { Header } from "@/components/ui/header";
import { ArrowLeft, ExternalLink, Star, Shield, Truck, RefreshCw, Share, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/utils/CurrencyContext";
import { convertAndFormatPrice } from "@/utils/currency";

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
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Currency context
  const { currency, rate } = useCurrency();

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
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        navigate('/');
        return;
      }

      setProduct(productData);

      // Fetch similar products from the same category
      const { data: similarData, error: similarError } = await supabase
        .from('products')
        .select('*')
        .eq('category', productData.category)
        .neq('id', productId)
        .eq('is_active', true)
        .limit(4);

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
          user_ip: 'unknown', // Would be populated by backend in real scenario
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    await trackClick('buy_now');
    window.open(product.affiliate_link, '_blank');
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNowGrid = async (product: Product) => {
    await trackClick('buy_now');
    if (product.category === 'Fashion') {
      window.open(product.affiliate_link, '_blank');
    } else {
      window.open(product.affiliate_link, '_blank');
    }
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
        {product?.images?.[0] && <meta property="og:image" content={product.images[0]} />}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product?.name || 'SwiftMart'} />
        <meta name="twitter:description" content={product?.short_description || product?.description || 'Premium products at SwiftMart'} />
        {product?.images?.[0] && <meta name="twitter:image" content={product.images[0]} />}

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
                "priceCurrency": currency,
                "price": product.price * rate,
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
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: Image Carousel - Mobile First */}
          <div className="animate-fade-in order-1 lg:order-1">
            <ImageCarousel 
              images={product.images} 
              alt={product.name}
              autoPlay={true}
              interval={4000}
            />
          </div>

          {/* Right: Product Info - Highlighted Content */}
          <div className="space-y-8 animate-slide-up order-2 lg:order-2">
            {/* Title - Prominently Highlighted */}
            <div className="bg-gradient-to-r from-primary-light/20 to-transparent p-6 rounded-2xl border-l-4 border-l-primary">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-4 text-foreground bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                {product.name}
              </h1>
              <div className="bg-accent/30 p-4 rounded-xl">
                <p className="text-base lg:text-lg font-semibold text-accent-foreground leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            </div>

            {/* Price Section - Bold and Prominent */}
            <div className="bg-gradient-to-br from-success/10 to-success/5 p-6 rounded-2xl border border-success/20 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl lg:text-5xl font-black text-success drop-shadow-sm">
                    {formatCurrency(product.price * rate, currency)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-lg lg:text-xl text-muted-foreground/60 line-through font-medium">
                      {formatCurrency(product.original_price * rate, currency)}
                    </span>
                  )}
                </div>
                {product.discount_percentage > 0 && (
                  <Badge variant="destructive" className="text-sm font-bold px-3 py-1 shadow-soft">
                    Save {product.discount_percentage}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Badges and Share */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {product.badge && (
                  <Badge variant={getBadgeVariant(product.badge)} className="text-sm px-3 py-1 font-semibold">
                    {product.badge}
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm px-3 py-1 font-medium">
                  {product.category}
                </Badge>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareProduct}
                  className="flex items-center gap-2 font-medium"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 font-medium"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Shield className="h-5 w-5 text-primary" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Truck className="h-5 w-5 text-primary" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Star className="h-5 w-5 text-primary" />
                <span>Trusted Brand</span>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 -mx-4 lg:static lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="w-full text-lg font-bold py-6 shadow-strong hover:shadow-glow transition-all duration-300 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Buy Now - {formatCurrency(product.price * rate, currency)}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Description - Highlighted */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-accent/20 to-transparent p-1 rounded-2xl">
            <div className="bg-background rounded-2xl p-8 shadow-medium border border-accent/30">
              <h2 className="text-2xl lg:text-3xl font-black mb-6 text-foreground bg-gradient-to-r from-accent-foreground to-muted-foreground bg-clip-text text-transparent">
                Product Details
              </h2>
              <div className="prose prose-lg max-w-none">
                <div className="bg-muted/20 rounded-xl p-6 border-l-4 border-l-accent">
                  {product.description ? (
                    <div 
                      className="text-foreground leading-relaxed text-base lg:text-lg font-medium"
                      dangerouslySetInnerHTML={{ 
                        __html: product.description.replace(/\n/g, '<br/>') 
                      }}
                    />
                  ) : (
                    <p className="text-foreground leading-relaxed text-base lg:text-lg font-medium">
                      {product.short_description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <ProductGrid
              products={similarProducts}
              onViewDetails={handleViewDetails}
              onBuyNow={handleBuyNowGrid}
            />
          </section>
        )}
      </main>
    </div>
  );
}