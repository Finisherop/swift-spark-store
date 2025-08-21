import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import { CurrencyContext } from "./CurrencyContext";
import { getUserCurrencyRate } from "./utils/currency";

function App() {
  const [currency, setCurrency] = useState("INR");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    async function fetchCurrency() {
      const { currency, rate } = await getUserCurrencyRate();
      setCurrency(currency);
      setRate(rate);
    }
    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, rate }}>
      {/* 👇 Tumhara purana pura App code as it is */}
    </CurrencyContext.Provider>
  );
}

export default App;

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
