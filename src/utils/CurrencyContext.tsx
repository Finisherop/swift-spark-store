"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrencyFromCountry, getCurrencySymbol } from "./currencyMapping";

interface CurrencyContextType {
  currency: string;
  rate: number;
  exchangeRates: Record<string, number>;
  currencySymbol: string;
  isLoading: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  rate: 1,
  exchangeRates: {},
  currencySymbol: "$",
  isLoading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrency() {
      try {
        setIsLoading(true);
        
        // Step 1: Detect user's country from IP using ipapi.co
        const ipResponse = await fetch("https://ipapi.co/json/");
        if (!ipResponse.ok) {
          throw new Error('Failed to detect location');
        }
        
        const ipData = await ipResponse.json();
        const countryCode = ipData.country_code;
        
        // Step 2: Get currency from country code
        const detectedCurrency = getCurrencyFromCountry(countryCode || 'US');
        const symbol = getCurrencySymbol(detectedCurrency);

        // Step 3: Fetch exchange rates for all supported currencies
        const supportedCurrencies = 'USD,INR,EUR,GBP,JPY,CAD,AUD,CHF,CNY,KRW,SGD,HKD,NZD,SEK,NOK,DKK,PLN,CZK,HUF,RUB,BRL,ARS,CLP,THB,MYR,IDR,PHP,VND,AED,SAR,QAR,KWD,BHD,OMR,ILS,TRY,EGP,ZAR,NGN,KES,GHS,MAD,DZD,TND,ETB';
        
        const rateResponse = await fetch(
          `https://api.exchangerate.host/latest?base=USD&symbols=${supportedCurrencies}`
        );
        
        if (!rateResponse.ok) {
          throw new Error('Failed to fetch exchange rates');
        }
        
        const rateData = await rateResponse.json();

        setCurrency(detectedCurrency);
        setCurrencySymbol(symbol);
        setRate((rateData.rates && rateData.rates[detectedCurrency]) || 1);
        setExchangeRates(rateData.rates || { USD: 1 });
        
      } catch (error) {
        console.error("Currency detection error:", error);
        // Fallback to USD if currency detection fails
        setCurrency("USD");
        setCurrencySymbol("$");
        setRate(1);
        setExchangeRates({ USD: 1 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      rate, 
      exchangeRates, 
      currencySymbol, 
      isLoading 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}
