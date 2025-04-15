
import React from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import CartDisplay from '@/components/CartDisplay';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, isLoading, cartTotal, itemsCount } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart ({itemsCount} items)</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <CartDisplay />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;
