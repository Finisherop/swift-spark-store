import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  autoPlay?: boolean;
  interval?: number;
}

export function ImageCarousel({ 
  images, 
  alt, 
  autoPlay = true, 
  interval = 4000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, images.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-medium"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-medium"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary shadow-glow scale-110"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip (for mobile) */}
      {images.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300",
                index === currentIndex
                  ? "border-primary shadow-glow"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}