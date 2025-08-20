import { useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import swiftMartLogo from "@/assets/swiftmart-logo.png";

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (category: string) => void;
  selectedCategory: string;
  searchQuery: string;
  isAdmin?: boolean;
  onAdminClick?: () => void;
}

const categories = [
  { id: "all", name: "All Products" },
  { id: "Fashion", name: "Fashion" },
  { id: "Health & Fitness", name: "Health & Fitness" },
  { id: "Digital Products", name: "Digital Products" },
  { id: "Beauty", name: "Beauty" },
];

export function Header({ 
  onSearch, 
  onFilterChange, 
  selectedCategory, 
  searchQuery,
  isAdmin = false,
  onAdminClick 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
      <div className="container mx-auto px-4">
        {/* Welcome Message */}
        <div className="py-2 text-center bg-primary/5 text-sm text-muted-foreground">
          🎉 Welcome to SwiftMart! Discover amazing products at unbeatable prices 🛍️
        </div>
        
        {/* Main Header */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img 
              src={swiftMartLogo} 
              alt="SwiftMart Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gradient">SwiftMart</h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 transition-smooth focus:shadow-glow"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onFilterChange(category.id)}
                className="transition-smooth"
              >
                {category.name}
              </Button>
            ))}
          </nav>

          {/* Admin/Mobile Controls */}
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAdminClick}
                className="hidden md:flex"
              >
                Admin Panel
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mobile Categories */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onFilterChange(category.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Mobile Admin Button */}
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onAdminClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Admin Panel
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}