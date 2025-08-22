import { useState, useEffect } from 'react';
import { COUNTRY_TO_CURRENCY, CURRENCY_SYMBOLS } from '@/utils/currencyMapping';

interface CurrencyData {
  localPrice: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
}

interface GeolocationData {
  country_code: string;
  currency?: string;
}

export function useLocalCurrency(usdPrice: number): CurrencyData {
  const [currencyData, setCurrencyData] = useState<CurrencyData>({
    localPrice: usdPrice,
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRate: 1
  });

  useEffect(() => {
    async function detectAndSetCurrency() {
      try {
        // Step 1: Detect user's country
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData: GeolocationData = await geoResponse.json();
        
        // Step 2: Get currency from country code
        const countryCode = geoData.country_code || 'US';
        const currencyCode = COUNTRY_TO_CURRENCY[countryCode] || COUNTRY_TO_CURRENCY.DEFAULT;
        
        // Step 3: Fetch exchange rate if not USD
        let exchangeRate = 1;
        if (currencyCode !== 'USD') {
          const rateResponse = await fetch(
            `https://api.exchangerate.host/latest?base=USD&symbols=${currencyCode}`
          );
          const rateData = await rateResponse.json();
          exchangeRate = rateData.rates?.[currencyCode] || 1;
        }
        
        // Step 4: Calculate local price
        const localPrice = usdPrice * exchangeRate;
        const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
        
        setCurrencyData({
          localPrice,
          currencyCode,
          currencySymbol,
          exchangeRate
        });
        
      } catch (error) {
        console.error('Currency detection failed:', error);
        // Fallback to USD
        setCurrencyData({
          localPrice: usdPrice,
          currencyCode: 'USD',
          currencySymbol: '$',
          exchangeRate: 1
        });
      }
    }

    detectAndSetCurrency();
  }, [usdPrice]);

  return currencyData;
}