import { useLocalCurrency } from '@/hooks/useLocalCurrency';
import { useCurrency } from '@/utils/CurrencyContext';

export function CurrencyDemo() {
  const { currency, currencySymbol, isLoading } = useCurrency();
  const { localPrice, currencyCode, currencySymbol: hookSymbol } = useLocalCurrency(10); // $10 USD

  if (isLoading) {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">Detecting your location and currency...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">Currency Detection Demo</h3>
      <div className="space-y-1 text-sm">
        <p><strong>Detected Currency:</strong> {currency} ({currencySymbol})</p>
        <p><strong>Example:</strong> $10.00 USD = {hookSymbol}{localPrice.toFixed(2)} {currencyCode}</p>
      </div>
    </div>
  );
}