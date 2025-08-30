import { Search, ShoppingBag, Sparkles, Heart, Zap, Package } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "All Products", icon: Package },
  { id: "Fashion", name: "Fashion", icon: ShoppingBag },
  { id: "Health & Fitness", name: "Health & Fitness", icon: Zap },
  { id: "Digital Products", name: "Digital Products", icon: Sparkles },
  { id: "Beauty", name: "Beauty", icon: Heart },
];

interface SearchCategorySectionProps {
  onSearch: (query: string) => void;
  onFilterChange: (category: string) => void;
  selectedCategory: string;
  searchQuery: string;
}

export function SearchCategorySection({ 
  onSearch, 
  onFilterChange, 
  selectedCategory, 
  searchQuery 
}: SearchCategorySectionProps) {
  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Find Your Perfect Product
            </h2>
            <p className="text-lg text-muted-foreground">
              Search through our amazing collection of premium products
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6 transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Search for products, brands, categories..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-16 pr-6 h-16 text-lg bg-white/80 backdrop-blur-sm border-2 border-primary/20 focus:border-primary/50 focus:bg-white transition-all duration-300 shadow-medium hover:shadow-strong focus:shadow-glow rounded-2xl font-medium"
            />
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="lg"
                onClick={() => onFilterChange(category.id)}
                className={cn(
                  "h-16 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex flex-col items-center justify-center space-y-1",
                  selectedCategory === category.id 
                    ? "bg-gradient-to-r from-primary to-primary-hover text-white shadow-glow scale-105 transform" 
                    : "bg-white/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 hover:shadow-medium text-foreground"
                )}
              >
                <category.icon className="h-5 w-5" />
                <span className="text-sm">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Search Stats */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `Searching for "${searchQuery}"` : "Browse all categories to discover amazing products"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}