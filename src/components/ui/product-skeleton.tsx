import { Skeleton } from "./skeleton";

export function ProductSkeleton() {
  return (
    <div className="product-card animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Price Skeleton */}
        <Skeleton className="h-8 w-1/3" />
        
        {/* Button Skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}