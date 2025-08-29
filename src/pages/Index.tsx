import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/header";
import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/ui/hero-section";
import { SearchCategorySection } from "@/components/ui/search-category-section";
import { ProductGrid } from "@/components/ui/product-grid";
import { AdminLogin } from "@/components/ui/admin-login";
import { AdminDashboard } from "@/components/ui/admin-dashboard";
import { ProductService, Product } from "@/services/productService";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { useToast } from "@/hooks/use-toast";

// Product interface now imported from ProductService

const ADMIN_EMAIL = "akk116636@gmail.com";
const ADMIN_PASSWORD = "alikhan";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use cached query for products with SWR-like behavior
  const {
    data: products = [],
    loading,
    error
  } = useCachedQuery<Product[]>({
    queryKey: `products:${selectedCategory}`,
    queryFn: () => ProductService.fetchProducts({ category: selectedCategory }),
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: true
  });

  // Track user visit on mount
  useEffect(() => {
    ProductService.trackUserVisit();
  }, []);

  // Handle fetch errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Optimized click handlers with service
  const trackClick = (productId: string, clickType: 'view_details' | 'buy_now') => {
    ProductService.trackClick(productId, clickType);
  };

  const handleViewDetails = (product: Product) => {
    trackClick(product.id, 'view_details');
    if (product.category === 'Fashion') {
      window.open(product.affiliate_link, '_blank');
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleBuyNow = (product: Product) => {
    trackClick(product.id, 'buy_now');
    window.open(product.affiliate_link, '_blank');
  };

  const handleAdminLogin = (email: string, password: string) => {
    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        toast({
          title: "Success",
          description: "Welcome to SwiftMart Admin Panel!",
        });
      } else {
        setLoginError("Invalid credentials. Please check your email and password.");
      }
      setLoginLoading(false);
    }, 1000);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
  };

  const scrollToProducts = () => {
    const element = document.getElementById('search-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showAdminLogin) {
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        error={loginError}
        loading={loginLoading}
      />
    );
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Header
        onSearch={setSearchQuery}
        onFilterChange={setSelectedCategory}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onAdminClick={() => setShowAdminLogin(true)}
      />

      <HeroSection onExploreClick={scrollToProducts} />

      <div id="search-section">
        <SearchCategorySection
          onSearch={setSearchQuery}
          onFilterChange={setSelectedCategory}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </div>

      <div id="products-section">
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onViewDetails={handleViewDetails}
          onBuyNow={handleBuyNow}
        />
      </div>
    </div>
  );
}