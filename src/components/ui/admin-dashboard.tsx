import { useState, useEffect } from "react";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Badge } from "./badge";
import { ProductForm } from "./product-form";
import { 
  Plus, 
  Package, 
  Users, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  LogOut,
  BarChart3
} from "lucide-react";
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
  is_active: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ClickStats {
  product_id: string;
  product_name: string;
  total_clicks: number;
  view_details_clicks: number;
  buy_now_clicks: number;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [clickStats, setClickStats] = useState<ClickStats[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const { data: products = [], loading, refetch } = useCachedQuery({
    queryKey: 'admin-products',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch click statistics
      const { data: clicksData, error: clicksError } = await supabase
        .from('product_clicks')
        .select(`
          product_id,
          click_type,
          products!inner(name)
        `);

      if (!clicksError && clicksData) {
        const statsMap = new Map<string, ClickStats>();
        
        clicksData.forEach((click: any) => {
          const productId = click.product_id;
          const productName = click.products.name;
          
          if (!statsMap.has(productId)) {
            statsMap.set(productId, {
              product_id: productId,
              product_name: productName,
              total_clicks: 0,
              view_details_clicks: 0,
              buy_now_clicks: 0
            });
          }
          
          const stats = statsMap.get(productId)!;
          stats.total_clicks++;
          
          if (click.click_type === 'view_details') {
            stats.view_details_clicks++;
          } else if (click.click_type === 'buy_now') {
            stats.buy_now_clicks++;
          }
        });
        
        setClickStats(Array.from(statsMap.values()).sort((a, b) => b.total_clicks - a.total_clicks));
      }

      // Fetch user count
      const { count: userCount, error: userCountError } = await supabase
        .from('website_users')
        .select('*', { count: 'exact', head: true });

      if (!userCountError) {
        setTotalUsers(userCount || 0);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">SwiftMart Admin</h1>
            <p className="text-sm text-muted-foreground">Manage your store</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Website visitors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clickStats.reduce((sum, stat) => sum + stat.total_clicks, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Product interactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <Button onClick={() => setShowProductForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {!product.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {product.badge && (
                            <Badge variant={getBadgeVariant(product.badge)}>
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.short_description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="font-semibold">${product.price.toLocaleString()}</span>
                          <span className="text-muted-foreground">{product.category}</span>
                          <span className="text-muted-foreground">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                        >
                          {product.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-6">Product Analytics</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Top Performing Products
                  </CardTitle>
                  <CardDescription>
                    Products with the highest click rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clickStats.slice(0, 10).map((stat, index) => (
                      <div key={stat.product_id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{stat.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {stat.view_details_clicks} views • {stat.buy_now_clicks} purchases
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {stat.total_clicks} clicks
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      {(showProductForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            refetch();
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}