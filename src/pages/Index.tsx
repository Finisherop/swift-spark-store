import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { SearchCategorySection } from "@/components/ui/search-category-section";
import { ProductGrid } from "@/components/ui/product-grid";
import { AdminLogin } from "@/components/ui/admin-login";
import { AdminDashboard } from "@/components/ui/admin-dashboard";
import { supabase } from "@/integrations/supabase/client";
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
}

const ADMIN_EMAIL = "akk116636@gmail.com";
const ADMIN_PASSWORD = "alikhan";

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    trackUser();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const trackUser = async () => {
    try {
      const userAgent = navigator.userAgent;
      const { error } = await supabase
        .from('website_users')
        .upsert({
          user_ip: 'unknown',
          user_agent: userAgent,
          last_visit: new Date().toISOString()
        }, {
          onConflict: 'user_ip'
        });

      if (error) console.error('Error tracking user:', error);
    } catch (error) {
      console.error('Error tracking user:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const trackClick = async (productId: string, clickType: 'view_details' | 'buy_now') => {
    try {
      await supabase
        .from('product_clicks')
        .insert({
          product_id: productId,
          click_type: clickType,
          user_ip: 'unknown',
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
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