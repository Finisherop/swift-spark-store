import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ProductGrid } from "@/components/ui/product-grid";
import { Header } from "@/components/ui/header";
import { ArrowLeft, ExternalLink, Star, Shield, Truck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Image Carousel */}
          <div className="animate-fade-in">
            <ImageCarousel 
              images={product.images} 
              alt={product.name}
              autoPlay={true}
              interval={4000}
            />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6 animate-slide-up">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground">
                {product.short_description}
              </p>
            </div>

            {/* Price Section */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="text-sm">
                    Save {product.discount_percentage}%
                  </Badge>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.badge && (
                <Badge variant={getBadgeVariant(product.badge)} className="text-sm px-3 py-1">
                  {product.badge}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm px-3 py-1">
                {product.category}
              </Badge>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-primary" />
                <span>Trusted Brand</span>
              </div>
            </div>

            {/* Buy Now Button */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 lg:static lg:bg-transparent lg:p-0">
              <Button
                size="lg"
                onClick={handleBuyNow}
                className="w-full text-lg py-6 shadow-strong hover:shadow-glow transition-all duration-300"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Buy Now - ₹{product.price.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Product Details</h2>
          <div className="prose prose-lg max-w-none">
            <div className="bg-card rounded-xl p-6 shadow-soft">
              {product.description ? (
                <div 
                  className="text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: product.description.replace(/\n/g, '<br/>') 
                  }}
                />
              ) : (
                <p className="text-muted-foreground">
                  {product.short_description}
                </p>
              )}
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