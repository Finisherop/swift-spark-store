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
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        navigate('/');
        return;
      }

      setProduct(productData);

      // Fetch similar products - only Amazon products if current is Amazon
      let query = supabase
        .from('products')
        .select('*')
        .neq('id', productId)
        .eq('is_active', true);

      if (productData.is_amazon_product) {
        query = query.eq('is_amazon_product', true);
      } else {
        query = query.eq('category', productData.category);
      }

      const { data: similarData, error: similarError } = await query.limit(4);

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
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        {/* Amazon Product - Blog Style Layout */}
        {product.is_amazon_product ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            {/* Hero Image Section */}
            <div className="text-center">
              <div className="relative bg-white rounded-3xl shadow-luxury border border-muted/20 overflow-hidden max-w-2xl mx-auto">
                <div className="aspect-square">
                  <ImageCarousel 
                    images={product.images} 
                    alt={product.name}
                    autoPlay={true}
                    interval={5000}
                  />
                </div>
              </div>
            </div>

            {/* Blog Title */}
            <div className="text-center animate-scale-in">
              <h1 className="text-4xl md:text-6xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-tight">
                {product.name}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8"></div>
            </div>

            {/* Blog Content */}
            <article className="prose prose-xl max-w-none animate-fade-in delay-200">
              <div className="bg-gradient-to-br from-background to-muted/30 rounded-3xl p-8 md:p-12 shadow-elegant border border-border/50">
                <div className="text-lg md:text-xl leading-relaxed text-foreground/80 text-center whitespace-pre-line">
                  {product.long_description_amazon || product.description || product.short_description_amazon}
                </div>
              </div>
            </article>

            {/* Disclosure Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 animate-fade-in delay-300">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 dark:text-amber-400 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Affiliate Disclosure
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This post contains affiliate links. When you purchase through these links, we may earn a commission at no additional cost to you.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center animate-scale-in delay-400">
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow group"
              >
                <span>Buy Now on Amazon</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          /* Regular Product Layout */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
            {/* Left: Image Carousel */}
            <div className="xl:col-span-2 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-luxury border border-muted/20 overflow-hidden">
                <div className="aspect-square lg:aspect-[4/3] relative">
                  <ImageCarousel 
                    images={product.images} 
                    alt={product.name}
                    autoPlay={true}
                    interval={5000}
                  />
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="xl:col-span-1 space-y-6 animate-slide-up">
              <div className="bg-white rounded-3xl shadow-luxury border border-muted/20 p-8 sticky top-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                      {product.category}
                    </Badge>
                    {product.badge && (
                      <Badge variant={getBadgeVariant(product.badge)} className="text-xs px-2 py-1">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-2xl lg:text-3xl font-black leading-tight text-slate-800 mb-4">
                    {product.name}
                  </h1>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {product.short_description}
                  </p>
                </div>

                {/* Price Section */}
                <div className="mb-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-emerald-700">
                      ${Math.round(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <div className="text-right">
                        <span className="text-lg text-slate-500 line-through block">
                          ${Math.round(product.original_price)}
                        </span>
                        {product.discount_percentage > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Save {product.discount_percentage}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-emerald-600 font-medium">✓ Best Price Guaranteed</p>
                </div>

                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  className="w-full text-lg font-bold py-4 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-luxury hover:shadow-glow transition-all duration-300 rounded-2xl"
                >
                  <ExternalLink className="mr-3 h-5 w-5" />
                  Buy Now - ${Math.round(product.price)}
                </Button>

                {/* Trust Signals */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700 font-medium">Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="text-slate-700 font-medium">Fast & Free Shipping</span>
                  </div>
                </div>

                {/* Share Options */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Share this product</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShareProduct}
                      className="flex-1 text-xs"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex-1 text-xs"
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="mb-16 animate-fade-in delay-500">
            <div className="bg-white rounded-3xl shadow-luxury border border-muted/20 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    🔍
                  </div>
                  {product.is_amazon_product ? "More Amazon Products" : "Similar Products"}
                </h2>
                <p className="text-indigo-100 mt-2">
                  {product.is_amazon_product 
                    ? "Discover more quality products available on Amazon" 
                    : "You might also like these products"
                  }
                </p>
              </div>
              
              <div className="p-8">
                <ProductGrid
                  products={similarProducts}
                  loading={false}
                  onViewDetails={handleViewDetails}
                  onBuyNow={handleBuyNowGrid}
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
