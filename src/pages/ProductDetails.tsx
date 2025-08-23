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

      // Fetch similar products from the same category
      let query = supabase
        .from('products')
        .select('*')
        .eq('category', productData.category)
        .neq('id', productId)
        .eq('is_active', true);

      // If current product is Amazon product, show only Amazon products as similar
      if (productData.is_amazon_product) {
        query = query.eq('is_amazon_product', true);
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
    const linkToOpen = product.is_amazon_product ? product.amazon_affiliate_link : product.affiliate_link;
    window.open(linkToOpen, '_blank');
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

        {/* Product Details Section - Enhanced Professional Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          {/* Left: Image Carousel - Professional Presentation */}
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
            {/* Product Features Grid - Professional */}
            {product.is_amazon_product && (
              <div className="mt-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 shadow-soft">
                <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <Star className="h-6 w-6 text-amber-500" />
                  Why Choose This Product
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Amazon Verified</h4>
                      <p className="text-sm text-slate-600">Authentic products with Amazon's guarantee</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Fast Delivery</h4>
                      <p className="text-sm text-slate-600">Prime eligible with quick shipping</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Top Rated</h4>
                      <p className="text-sm text-slate-600">Highly rated by customers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">Easy Returns</h4>
                      <p className="text-sm text-slate-600">Hassle-free return policy</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Product Info - Professional Sidebar */}
          <div className="xl:col-span-1 space-y-6 animate-slide-up">
            {/* Professional Product Card */}
            <div className="bg-white rounded-3xl shadow-luxury border border-muted/20 p-8 sticky top-6">
              {/* Title & Category */}
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
                
                {product.name && (
                  <h1 className="text-2xl lg:text-3xl font-black leading-tight text-slate-800 mb-4">
                    {product.name}
                  </h1>
                )}
                
                <p className="text-slate-600 leading-relaxed">
                  {product.is_amazon_product ? product.short_description_amazon : product.short_description}
                </p>
              </div>

              {/* Professional Rating Display */}
              {product.is_amazon_product && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                    <span className="text-sm font-semibold text-slate-700 ml-2">Highly Rated on Amazon</span>
                  </div>
                  <p className="text-xs text-amber-700">Check current reviews and ratings on Amazon</p>
                </div>
              )}

              {/* Price Section - Enhanced */}
              {!product.is_amazon_product ? (
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
              ) : (
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-2">💰 Check Price on Amazon</div>
                    <p className="text-sm text-blue-600 mb-3">Live pricing with current deals & discounts</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-500">
                      <RefreshCw className="h-3 w-3" />
                      <span>Updated in real-time</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional CTA Button */}
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="w-full text-lg font-bold py-4 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-luxury hover:shadow-glow transition-all duration-300 rounded-2xl"
              >
                <ExternalLink className="mr-3 h-5 w-5" />
                {product.is_amazon_product ? "View on Amazon →" : `Buy Now - $${Math.round(product.price)}`}
              </Button>

              {/* Trust Signals */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 font-medium">
                    {product.is_amazon_product ? "Amazon A-to-Z Guarantee" : "Secure Checkout"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-700 font-medium">
                    {product.is_amazon_product ? "Prime Eligible Delivery" : "Fast & Free Shipping"}
                  </span>
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

            {/* Amazon Compliance Notice - Professional */}
            {product.is_amazon_product && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-bold text-amber-800 mb-1">📢 Amazon Product Notice</h4>
                      <p className="text-amber-700 leading-relaxed">
                        This page promotes Amazon products. Please verify current pricing and availability on Amazon.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-200">
                      <p className="text-amber-700 font-medium">
                        💰 <strong>Affiliate Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Product Description Section */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl shadow-luxury border border-muted/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 text-white">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  📋
                </div>
                Product Details
              </h2>
              <p className="text-slate-200 mt-2">Everything you need to know about this product</p>
            </div>
            
            <div className="p-8">
              {product.is_amazon_product ? (
                <div className="space-y-8">
                  {product.long_description_amazon ? (
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: product.long_description_amazon.replace(/\n/g, '<br/>') 
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">Amazon Product</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Complete product details and specifications are available on Amazon. 
                        Click the button above to view full information.
                      </p>
                    </div>
                  )}

                  {/* Professional Amazon Features Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-200">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-lg">Amazon Benefits</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <span className="text-slate-700">A-to-Z Purchase Protection</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <Truck className="h-5 w-5 text-green-600" />
                          <span className="text-slate-700">Prime Eligible Shipping</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <Star className="h-5 w-5 text-purple-600" />
                          <span className="text-slate-700">Customer Reviews & Ratings</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-lg">Why Buy from Amazon?</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <RefreshCw className="h-5 w-5 text-orange-600" />
                          <span className="text-slate-700">Easy Returns & Exchanges</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                          <Shield className="h-5 w-5 text-indigo-600" />
                          <span className="text-slate-700">Secure Payment Options</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                          <Star className="h-5 w-5 text-emerald-600" />
                          <span className="text-slate-700">Trusted Global Platform</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  {product.description ? (
                    <div 
                      className="text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: product.description.replace(/\n/g, '<br/>') 
                      }}
                    />
                  ) : (
                    <p className="text-slate-600 text-center py-8">
                      Product description will be available soon.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Professional Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="mb-16">
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