import { useEffect, useState } from "react";
import { Button } from "./button";
import { ShoppingBag, Sparkles, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/hero-bg.jpg";
import fashionHoodie from "@/assets/products/fashion-hoodie.jpg";
import beautyProducts from "@/assets/products/beauty-products.jpg";
import proteinFoods from "@/assets/products/protein-foods.jpg";
import digitalEbook from "@/assets/products/digital-ebook.jpg";

const heroSlides = [
  {
    title: "Swift Shopping, Smart Savings",
    subtitle: "Discover premium products at unbeatable prices",
    icon: <Zap className="h-6 w-6" />,
    cta: "Shop Now",
    image: fashionHoodie
  },
  {
    title: "Beauty & Wellness Collection",
    subtitle: "Premium skincare and beauty products for your glow",
    icon: <Heart className="h-6 w-6" />,
    cta: "Explore Beauty",
    image: beautyProducts
  },
  {
    title: "Health & Fitness Essentials",
    subtitle: "Fuel your body with premium protein and nutrition",
    icon: <Sparkles className="h-6 w-6" />,
    cta: "Shop Health",
    image: proteinFoods
  },
  {
    title: "Digital Products & Guides",
    subtitle: "Transform your business with our digital resources",
    icon: <ShoppingBag className="h-6 w-6" />,
    cta: "Get Digital",
    image: digitalEbook
  }
];

interface HeroSectionProps {
  onExploreClick: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
      </div>

      {/* Hero Content */}
      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm shadow-glow animate-bounce-in">
              {currentHero.icon}
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
            {currentHero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            {currentHero.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button
              size="lg"
              onClick={onExploreClick}
              className="bg-white text-primary hover:bg-white/95 shadow-strong transition-bounce text-lg px-8 py-4"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {currentHero.cta}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary transition-smooth text-lg px-8 py-4"
            >
              Learn More
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentSlide 
                    ? "bg-white shadow-glow" 
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/15 rounded-full blur-lg animate-pulse" />
    </section>
  );
}