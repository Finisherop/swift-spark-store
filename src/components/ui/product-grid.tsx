import { ProductCard as ImportedProductCard } from "./product-card";
import { Loader2 } from "lucide-react";
import { formatCurrency, convertPrice } from "@/utils/currency"
import { CurrencyProvider, useCurrency } from "@/utils/CurrencyContext"
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

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onViewDetails: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  onViewDetails,
  onBuyNow,
}: ProductGridProps) {
  const { currency, rate } = useCurrency();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-gradient">Featured Products</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated collection of premium products at unbeatable prices
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const convertedPrice = product.price * rate;
            const convertedOriginalPrice = product.original_price
              ? product.original_price * rate
              : null;

            return (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ImportedProductCard
                  product={{
                    ...product,
                    price: convertedPrice,
                    original_price: convertedOriginalPrice || undefined,
                    formattedPrice: formatPrice(convertedPrice, currency),
                    formattedOriginalPrice: convertedOriginalPrice
                      ? formatPrice(convertedOriginalPrice, currency)
                      : undefined,
                  }}
                  onViewDetails={() => onViewDetails(product)}
                  onBuyNow={() => onBuyNow(product)}
                />
              </div>
            );
          })}
        </div>

        {/* Load More Section */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Showing {products.length} products
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
