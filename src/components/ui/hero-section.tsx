import { useEffect, useState } from "react";
import { Button } from "./button";
import { ShoppingBag, Sparkles, Zap, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Using uploaded product images as backgrounds
const fashionHoodie = "/lovable-uploads/563d724a-36dd-42a4-89fe-dd6da4112a9f.png";
const beautyProducts = "/lovable-uploads/21d04899-2269-45bd-ab8f-2ef307047715.png"; 
const sugarWater = "/lovable-uploads/47d1547e-d93f-4fbc-a97e-46a9550448cf.png";
const hairGel = "/lovable-uploads/85401cb0-d330-48b5-80d9-8e8eed884cde.png";
const bandTshirts = "/lovable-uploads/328f97d2-dd57-494d-aab7-e4c8053a640b.png";
const ebook = "/lovable-uploads/039e3adf-5558-4aeb-af7c-f789086de694.png";
const audiobook = "/lovable-uploads/936dc5df-2cf8-47b0-8208-cb5b770058d0.png";
const proteinFoods = "/lovable-uploads/eb1cb5d5-51b0-4c70-85c8-ec1a6ffff08e.png";

const heroSlides = [
  {
    title: "Premium Fashion Collection",
    subtitle: "Stylish hoodies and trendy apparel for every occasion",
    icon: <Zap className="h-6 w-6" />,
    cta: "Shop Fashion",
    bgImage: fashionHoodie
  },
  {
    title: "Beauty & Skincare Essentials",
    subtitle: "Luxurious beauty products for your perfect glow",
    icon: <Heart className="h-6 w-6" />,
    cta: "Explore Beauty",
    bgImage: beautyProducts
  },
  {
    title: "Health & Nutrition",
    subtitle: "Premium protein and nutrition for your fitness goals",
    icon: <Sparkles className="h-6 w-6" />,
    cta: "Shop Health",
    bgImage: proteinFoods
  },
  {
    title: "Digital Learning Resources",
    subtitle: "Transform your business with expert guides and ebooks",
    icon: <ShoppingBag className="h-6 w-6" />,
    cta: "Get Digital",
    bgImage: ebook
  },
  {
    title: "Music & Entertainment",
    subtitle: "Vintage band tees and entertainment merchandise",
    icon: <Heart className="h-6 w-6" />,
    cta: "Shop Music",
    bgImage: bandTshirts
  },
  {
    title: "Hair & Body Care",
    subtitle: "Premium hair styling and body care products",
    icon: <Sparkles className="h-6 w-6" />,
    cta: "Shop Care",
    bgImage: sugarWater
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
      {/* Dynamic Background Image - No Style Changes */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentHero.bgImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
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
              className="bg-gradient-to-r from-primary to-primary-hover text-white hover:from-primary-hover hover:to-primary shadow-strong hover:shadow-glow transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold transform hover:scale-105 hover:-translate-y-1"
            >
              <ShoppingBag className="mr-3 h-6 w-6" />
              {currentHero.cta}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg px-10 py-4 rounded-full font-semibold transform hover:scale-105 hover:-translate-y-1 shadow-medium hover:shadow-glow"
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