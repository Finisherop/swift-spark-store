import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";

// Code-split top-level routes using React.lazy for smaller initial bundle
// NOTE: The fallback renders a minimal shell to keep TTI fast
const Index = lazy(() => import("./pages/Index"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <HelmetProvider>
            <AuthProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  {/* Suspense boundary for route-level code splitting */}
                  <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                  <Sonner />
                </div>
              </TooltipProvider>
            </AuthProvider>
          </HelmetProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;