import { useState } from "react";
import { Search, ShoppingBag, Menu, X, User, Sparkles, Heart, Zap, Package } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { AuthModal } from "./auth-modal";
import { ProfileModal } from "./profile-modal";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import swiftMartLogo from "@/assets/swiftmart-logo.png";

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (category: string) => void;
  selectedCategory: string;
  searchQuery: string;
  onAdminClick?: () => void;
}

const categories = [
  { id: "all", name: "All Products", icon: Package },
  { id: "Fashion", name: "Fashion", icon: ShoppingBag },
  { id: "Health & Fitness", name: "Health & Fitness", icon: Zap },
  { id: "Digital Products", name: "Digital Products", icon: Sparkles },
  { id: "Beauty", name: "Beauty", icon: Heart },
];

export function Header({ 
  onSearch, 
  onFilterChange, 
  selectedCategory, 
  searchQuery,
  onAdminClick 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user } = useAuth();

  return (
    <>
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
                className="h-10 w-10 object-contain animate-bounce-in"
              />
              <h1 className="text-2xl font-bold text-gradient">SwiftMart</h1>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base bg-white/50 backdrop-blur-sm border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all duration-300 shadow-soft hover:shadow-medium focus:shadow-glow rounded-xl"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onFilterChange(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground shadow-glow scale-105" 
                      : "hover:bg-primary/10 hover:text-primary hover:scale-105"
                  )}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </nav>

            {/* Auth/Admin/Mobile Controls */}
            <div className="flex items-center space-x-2">
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowProfileModal(true)}
                  className="hidden md:flex items-center gap-2 hover-scale transition-bounce"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex hover-scale transition-bounce"
                >
                  Sign In
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAdminClick}
                className="hidden md:flex hover-scale transition-bounce"
              >
                Admin
              </Button>
              
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
              <div className="relative mb-4 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-12 pr-4 h-12 text-base bg-white/50 backdrop-blur-sm border-2 border-transparent focus:border-primary/30 focus:bg-white transition-all duration-300 shadow-soft hover:shadow-medium focus:shadow-glow rounded-xl"
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
                    className={cn(
                      "justify-start transition-all duration-300",
                      selectedCategory === category.id 
                        ? "shadow-glow scale-105" 
                        : "hover:scale-105"
                    )}
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Mobile Auth/Admin Buttons */}
              <div className="space-y-2">
                {user ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowProfileModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onAdminClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  Admin
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} />
    </>
  );
}