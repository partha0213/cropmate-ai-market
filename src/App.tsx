
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProfilePage from "./pages/ProfilePage";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import CartPage from "./pages/CartPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            } />
            <Route path="/order-history" element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Farmer routes */}
            <Route path="/farmer/dashboard" element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/farmer/add-product" element={
              <ProtectedRoute requiredRole="farmer">
                {/* Will implement this later */}
                <div className="container mx-auto p-8">
                  <h1 className="text-2xl font-bold">Add New Product</h1>
                  <p className="mt-4">This page is under construction.</p>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Future routes for product details, checkout, user dashboards etc. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
