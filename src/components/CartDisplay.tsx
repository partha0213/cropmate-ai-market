
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const CartDisplay = () => {
  const { cartItems, isLoading, removeFromCart, updateCartItem, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
        <p className="mt-4 text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6 text-center">
          Add fresh, locally-grown products to your cart and support local farmers.
        </p>
        <Button 
          onClick={() => navigate('/marketplace')}
          className="bg-cropmate-primary hover:bg-cropmate-primary/90"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  const handleUpdateQuantity = (id: string, currentQuantity: number, delta: number) => {
    updateCartItem.mutate({ id, quantity: currentQuantity + delta });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto py-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex border-b border-gray-100 py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <img
                src={item.listing.image_url || 'https://via.placeholder.com/150'}
                alt={item.listing.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
            
            <div className="ml-4 flex flex-1 flex-col">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <h3>
                  <Link to={`/product/${item.listing_id}`}>{item.listing.title}</Link>
                </h3>
                <p className="ml-4">₹{(item.listing.price * item.quantity).toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                ₹{item.listing.price}/{item.listing.unit || 'kg'}
              </p>
              
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-2">{item.quantity}</span>
                  <Button
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeFromCart.mutate(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4">
        <Separator className="my-4" />
        
        <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
          <p>Subtotal</p>
          <p>₹{cartTotal.toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Shipping and taxes calculated at checkout.
        </p>
        
        <Button 
          className="w-full bg-cropmate-primary hover:bg-cropmate-primary/90 mb-2"
          onClick={() => navigate('/checkout')}
        >
          Checkout
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/marketplace')}
        >
          Continue Shopping
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full mt-4 text-red-500 hover:text-red-700"
          onClick={() => clearCart.mutate()}
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartDisplay;
