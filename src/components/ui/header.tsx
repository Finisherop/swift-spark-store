"use client"

import { useState } from "react"
import { useRouter } from "next/router"
import { Search, ShoppingBag, Menu, X, User, Sparkles, Heart, Zap, Package } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { AuthModal } from "./auth-modal"
import { ProfileModal } from "./profile-modal"
import { useAuth } from "../../../components/NextAuthProvider"
import { cn } from "@/lib/utils"
import { AnimatedLogo } from "./swiftmart-logo"

interface HeaderProps {
  onSearch: (query: string) => void
  onFilterChange: (category: string) => void
  selectedCategory: string
  searchQuery: string
}

const categories = [
  { id: "all", name: "All Products", icon: Package },
  { id: "Fashion", name: "Fashion", icon: ShoppingBag },
  { id: "Health & Fitness", name: "Health & Fitness", icon: Zap },
  { id: "Digital Products", name: "Digital Products", icon: Sparkles },
  { id: "Beauty", name: "Beauty", icon: Heart },
]

export function Header({ onSearch, onFilterChange, selectedCategory, searchQuery }: HeaderProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const { user } = useAuth()

  const handleAdminClick = () => {
    router.push("/admin/login")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
        <div className="container mx-auto px-4">

          {/* Main Header */}
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative">
                <AnimatedLogo />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-full"
                />
              </div>
            </div>

            {/* Desktop Category Filter */}
            <div className="hidden lg:flex items-center space-x-1">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onFilterChange(category.id)}
                    className={cn(
                      "rounded-full px-3",
                      selectedCategory === category.id && "shadow-md"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    <span className="hidden xl:inline">{category.name}</span>
                  </Button>
                )
              })}
            </div>

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

              {/* Admin button only visible if logged in */}
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminClick}
                  className="hidden md:flex hover-scale transition-bounce"
                >
                  Admin
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

          {/* Mobile Search Bar */}
          <div className="md:hidden py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full"
              />
            </div>
          </div>

          {/* Mobile Category Filter */}
          <div className="md:hidden pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFilterChange(category.id)}
                    className={cn(
                      "rounded-full whitespace-nowrap",
                      selectedCategory === category.id && "shadow-md"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t animate-fade-in">
              <div className="space-y-2">
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowProfileModal(true)
                      setIsMobileMenuOpen(false)
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
                      setShowAuthModal(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                )}

                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleAdminClick()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    Admin
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} />
    </>
  )
}