import { useFormattedLocalPrice } from '@/hooks/useLocalCurrency';

interface PriceDisplayProps {
  usdPrice: number;
  className?: string;
  showLoading?: boolean;
}

export function PriceDisplay({ usdPrice, className = "", showLoading = true }: PriceDisplayProps) {
  const { formattedPrice, isLoading, error } = useFormattedLocalPrice(usdPrice);

  if (isLoading && showLoading) {
    return (
      <span className={`${className} animate-pulse`}>
        Loading...
      </span>
    );
  }

  if (error) {
    // Fallback to USD display on error
    return (
      <span className={className}>
        ${usdPrice.toFixed(2)}
      </span>
    );
  }

  return (
    <span className={className}>
      {formattedPrice}
    </span>
  );
}