
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Check, CreditCard, MapPin, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentOptions from '@/components/PaymentOptions';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [step, setStep] = useState<'information' | 'payment'>('information');

  // Calculate shipping fee and taxes
  const shippingFee = cartTotal > 500 ? 0 : 50; // Free shipping for orders over ₹500
  const taxes = Math.round(cartTotal * 0.05); // 5% tax
  const orderTotal = cartTotal + shippingFee + taxes;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to place an order');
      if (cartItems.length === 0) throw new Error('Your cart is empty');
      if (!shippingAddress) throw new Error('Shipping address is required');
      
      setLoading(true);
      
      // Create orders for each item in the cart
      const orderPromises = cartItems.map(async (item) => {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            listing_id: item.listing_id,
            quantity: item.quantity,
            total_price: item.listing.price * item.quantity,
            order_status: 'placed',
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
            delivery_address: shippingAddress,
            delivery_notes: deliveryNotes,
            expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
      
      const orders = await Promise.all(orderPromises);
      return orders;
    },
    onSuccess: () => {
      clearCart.mutate();
      setLoading(false);
      toast.success('Order placed successfully!');
      navigate('/order-success');
    },
    onError: (error: any) => {
      setLoading(false);
      toast.error(error.message || 'Failed to place order');
    }
  });

  const handleContinueToPayment = () => {
    if (!shippingAddress) {
      toast.error('Please enter your shipping address');
      return;
    }
    setStep('payment');
  };

  const handlePaymentComplete = (method: string, details: any) => {
    setPaymentMethod(method);
    setPaymentDetails(details);
    placeOrder.mutate();
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add items to your cart before proceeding to checkout</p>
          <Button onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          {step === 'payment' && (
            <Button variant="ghost" onClick={() => setStep('information')}>
              Back to Shipping
            </Button>
          )}
          {step === 'information' && (
            <Button variant="ghost" onClick={() => navigate('/cart')}>
              Back to Cart
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'information' && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="mr-2 text-cropmate-primary" />
                    <h2 className="text-lg font-semibold">Shipping Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full address"
                        className="mt-1"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special instructions for delivery"
                        className="mt-1"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleContinueToPayment}
                      className="w-full"
                    >
                      Continue to Payment
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {step === 'payment' && (
              <PaymentOptions 
                amount={orderTotal}
                onPaymentComplete={handlePaymentComplete}
                isProcessing={loading || placeOrder.isPending}
              />
            )}
          </div>
          
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="max-h-80 overflow-y-auto mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex py-3 border-b">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.listing.image_url || 'https://via.placeholder.com/150'}
                          alt={item.listing.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.listing.title}</h3>
                          <p className="ml-4">₹{(item.listing.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.quantity} × ₹{item.listing.price}/{item.listing.unit || 'kg'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Taxes</span>
                    <span>₹{taxes.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <Truck className="mr-2" size={16} />
                    <span>Free shipping on orders over ₹500</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-green-600">
                    <Check className="mr-2" size={16} />
                    <span>Fresh produce guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
