"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CurrencyContextType {
  currency: string;
  rate: number;
  exchangeRates: Record<string, number>;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  rate: 1,
  exchangeRates: {},
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCurrency() {
      try {
        // User ke IP ke hisaab se currency detect karne ke liye free API
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const userCurrency = data.currency || "USD";

        // Fetch exchange rates for all supported currencies
        const rateRes = await fetch(
          `https://api.exchangerate.host/latest?base=USD&symbols=USD,INR,EUR,GBP,JPY,CAD,AUD`
        );
        const rateData = await rateRes.json();

        setCurrency(userCurrency);
        setRate((rateData.rates && rateData.rates[userCurrency]) || 1);
        setExchangeRates(rateData.rates || {});
      } catch (error) {
        console.error("Currency fetch error:", error);
        // Fallback to USD if currency detection fails
        setCurrency("USD");
        setRate(1);
        setExchangeRates({ USD: 1 });
      }
    }

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, rate, exchangeRates }}>
      {children}
    </CurrencyContext.Provider>
  );
}
