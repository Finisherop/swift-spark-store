import { useState, useEffect } from 'react';
import { getCurrencyFromCountry, getCurrencySymbol } from '@/utils/currencyMapping';

interface LocalCurrencyResult {
  localPrice: number;
  currencyCode: string;
  currencySymbol: string;
  isLoading: boolean;
  error: string | null;
}

interface IPApiResponse {
  country_code: string;
  currency?: string;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

// Cache for exchange rates to avoid repeated API calls
let exchangeRateCache: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useLocalCurrency(usdPrice: number): LocalCurrencyResult {
  const [localPrice, setLocalPrice] = useState(usdPrice);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function detectAndConvertCurrency() {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Detect user's country from IP
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (!ipResponse.ok) {
          throw new Error('Failed to detect location');
        }
        
        const ipData: IPApiResponse = await ipResponse.json();
        const countryCode = ipData.country_code;
        
        if (!countryCode) {
          throw new Error('Could not determine country from IP');
        }

        // Step 2: Get currency from country
        const detectedCurrency = getCurrencyFromCountry(countryCode);
        const symbol = getCurrencySymbol(detectedCurrency);

        // Step 3: If currency is USD, no conversion needed
        if (detectedCurrency === 'USD') {
          setLocalPrice(usdPrice);
          setCurrencyCode('USD');
          setCurrencySymbol('$');
          setIsLoading(false);
          return;
        }

        // Step 4: Check if we need to fetch exchange rates
        const now = Date.now();
        const needsFetch = !exchangeRateCache[detectedCurrency] || 
                          (now - lastFetchTime) > CACHE_DURATION;

        if (needsFetch) {
          // Fetch exchange rate
          const rateResponse = await fetch(
            `https://api.exchangerate.host/latest?base=USD&symbols=${detectedCurrency}`
          );
          
          if (!rateResponse.ok) {
            throw new Error('Failed to fetch exchange rates');
          }
          
          const rateData: ExchangeRateResponse = await rateResponse.json();
          
          if (!rateData.rates || !rateData.rates[detectedCurrency]) {
            throw new Error(`Exchange rate not available for ${detectedCurrency}`);
          }

          // Update cache
          exchangeRateCache = { ...exchangeRateCache, ...rateData.rates };
          lastFetchTime = now;
        }

        // Step 5: Convert price
        const exchangeRate = exchangeRateCache[detectedCurrency];
        const convertedPrice = usdPrice * exchangeRate;

        setLocalPrice(convertedPrice);
        setCurrencyCode(detectedCurrency);
        setCurrencySymbol(symbol);

      } catch (err) {
        console.error('Currency detection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to USD
        setLocalPrice(usdPrice);
        setCurrencyCode('USD');
        setCurrencySymbol('$');
      } finally {
        setIsLoading(false);
      }
    }

    detectAndConvertCurrency();
  }, [usdPrice]);

  return {
    localPrice,
    currencyCode,
    currencySymbol,
    isLoading,
    error
  };
}

// Helper hook for formatting the price with currency
export function useFormattedLocalPrice(usdPrice: number): {
  formattedPrice: string;
  isLoading: boolean;
  error: string | null;
} {
  const { localPrice, currencyCode, currencySymbol, isLoading, error } = useLocalCurrency(usdPrice);

  const formattedPrice = isLoading 
    ? '$0.00' 
    : new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(localPrice);

  return {
    formattedPrice,
    isLoading,
    error
  };
}