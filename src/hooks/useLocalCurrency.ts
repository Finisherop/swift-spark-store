import { useState, useEffect } from 'react';
import { COUNTRY_TO_CURRENCY, CURRENCY_SYMBOLS } from '@/utils/currencyMapping';

interface CurrencyData {
  price: number;
  currencyCode: string;
  currencySymbol: string;
}

interface GeolocationData {
  country_code: string;
  currency?: string;
}

interface CachedCurrencyData {
  currencyCode: string;
  currencySymbol: string;
  exchangeRate: number;
  timestamp: number;
}

export function useLocalCurrency(usdPrice: number): CurrencyData {
  const [currencyData, setCurrencyData] = useState<CurrencyData>({
    price: usdPrice,
    currencyCode: 'USD',
    currencySymbol: '$'
  });

  useEffect(() => {
    async function detectAndSetCurrency() {
      // Check localStorage cache first
      const cacheKey = 'swiftmart_currency_cache';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedData: CachedCurrencyData = JSON.parse(cached);
          const now = Date.now();
          const cacheAge = now - cachedData.timestamp;
          const cacheExpiryHours = 12;
          
          // If cache is still valid (less than 12 hours)
          if (cacheAge < cacheExpiryHours * 60 * 60 * 1000) {
            const price = usdPrice * cachedData.exchangeRate;
            setCurrencyData({
              price,
              currencyCode: cachedData.currencyCode,
              currencySymbol: cachedData.currencySymbol
            });
            return;
          }
        } catch (error) {
          console.error('Error parsing cached currency data:', error);
        }
      }

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
        
        // Step 4: Calculate price and get symbol
        const price = usdPrice * exchangeRate;
        const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || '$';
        
        // Cache the result for 12 hours
        const cacheData: CachedCurrencyData = {
          currencyCode,
          currencySymbol,
          exchangeRate,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        setCurrencyData({
          price,
          currencyCode,
          currencySymbol
        });
        
      } catch (error) {
        console.error('Currency detection failed:', error);
        // Fallback to USD
        setCurrencyData({
          price: usdPrice,
          currencyCode: 'USD',
          currencySymbol: '$'
        });
      }
    }

    detectAndSetCurrency();
  }, [usdPrice]);

  return currencyData;
}