import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/ui/header";
import { Navigation } from "@/components/ui/navigation";
import { HeroSection } from "@/components/ui/hero-section";
import { SearchCategorySection } from "@/components/ui/search-category-section";
import { ProductGrid } from "@/components/ui/product-grid";
import { AdminLogin } from "@/components/ui/admin-login";
import { AdminDashboard } from "@/components/ui/admin-dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePerformance } from "@/hooks/usePerformance";

interface Product {
  id: string;
  name: string;
  short_description: string | null;
  price: number;
  original_price?: number | null;
  discount_percentage: number | null;
  category: string;
  badge?: string | null;
  affiliate_link: string;
  images: string[] | null;
  is_amazon_product?: boolean | null;
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
  const { preloadImages, shouldLazyLoad } = usePerformance();

  useEffect(() => {
    fetchProducts();
    trackUser();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    const CACHE_KEY = 'swiftmart_products_cache_v1';
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    const readCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { ts: number; data: Product[] };
        if (Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.data;
        return null;
      } catch {
        return null;
      }
    };

    const writeCache = (data: Product[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      } catch {}
    };

    const attemptFetch = async () => {
      return supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    };

    try {
      // Optimistic render from cache for faster first paint
      const cached = readCache();
      if (cached && cached.length > 0) {
        setProducts(cached);
      }

      // Network fetch with a simple retry
      let { data, error } = await attemptFetch();
      if (error) {
        // retry once
        ({ data, error } = await attemptFetch());
      }
      if (error) throw error;

      const productsData = (data || []) as Product[];
      setProducts(productsData);
      writeCache(productsData);

      // Preload images for better performance
      if (productsData.length > 0 && !shouldLazyLoad()) {
        const imageUrls = productsData
          .flatMap(product => product.images || [])
          .filter(Boolean) as string[];
        if (imageUrls.length > 0) {
          preloadImages(imageUrls).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const cached = readCache();
      if (cached && cached.length > 0) {
        setProducts(cached);
      } else {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive"
        });
      }
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
    let filtered = products.slice();

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => (product.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(product => {
        const name = (product.name || '').toLowerCase();
        const shortDesc = (product.short_description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        return name.includes(query) || shortDesc.includes(query) || category.includes(query);
      });
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