import { createContext, useContext } from "react";

export const CurrencyContext = createContext({ currency: "INR", rate: 1 });

export function useCurrency() {
  return useContext(CurrencyContext);
}