"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface CurrencyContextType {
  currency: string;
  rate: number;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  rate: 1,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    async function fetchCurrency() {
      try {
        // User ke IP ke hisaab se currency detect karne ke liye free API
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const userCurrency = data.currency || "USD";

        // Exchange rate fetch
        const rateRes = await fetch(
          `https://api.exchangerate.host/latest?base=USD&symbols=${userCurrency}`
        );
        const rateData = await rateRes.json();

        setCurrency(userCurrency);
        setRate((rateData.rates && rateData.rates[userCurrency]) || 1);
      } catch (error) {
        console.error("Currency fetch error:", error);
        // Fallback to USD if currency detection fails
        setCurrency("USD");
        setRate(1);
      }
    }

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
}
