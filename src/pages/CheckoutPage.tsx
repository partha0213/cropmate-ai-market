
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Package,
  Loader2
} from 'lucide-react';

type PaymentMethod = 'cash_on_delivery' | 'card';
type DeliveryMethod = 'standard' | 'express';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  // For card payment (just mock)
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cash_on_delivery',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate delivery fee based on delivery method
  const deliveryFee = formData.deliveryMethod === 'express' ? 80 : 40;
  const totalAmount = cartTotal + deliveryFee;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to place an order');
      setIsSubmitting(true);

      // For each cart item, create an order
      const orderPromises = cartItems.map(async (item) => {
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`;
        
        // Calculate expected delivery date
        const today = new Date();
        const deliveryDays = formData.deliveryMethod === 'express' ? 2 : 5;
        const expectedDeliveryDate = new Date(today);
        expectedDeliveryDate.setDate(today.getDate() + deliveryDays);
        
        const { data, error } = await supabase
          .from('orders')
          .insert([
            { 
              buyer_id: user.id,
              listing_id: item.listing_id,
              quantity: item.quantity,
              total_price: item.listing.price * item.quantity,
              status: 'placed',
              order_status: 'placed',
              payment_method: formData.paymentMethod,
              payment_status: 'pending',
              delivery_address: fullAddress,
              expected_delivery_date: expectedDeliveryDate.toISOString(),
            }
          ])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      });

      // Wait for all orders to be created
      const results = await Promise.all(orderPromises);
      
      // Clear the cart after successful order placement
      await clearCart.mutateAsync();
      
      return results;
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      navigate('/order-success');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    placeOrder.mutate();
  };

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Your Cart is Empty</CardTitle>
              <CardDescription>Add some products to your cart before checkout.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={() => navigate('/marketplace')} 
                className="w-full"
              >
                Back to Marketplace
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input 
                        id="pincode" 
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.deliveryMethod} 
                    onValueChange={(value) => handleRadioChange('deliveryMethod', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="font-medium">Standard Delivery</div>
                        <div className="text-sm text-gray-500">Delivery in 4-5 business days</div>
                      </Label>
                      <div className="font-medium">₹40</div>
                    </div>
                    
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="font-medium">Express Delivery</div>
                        <div className="text-sm text-gray-500">Delivery in 1-2 business days</div>
                      </Label>
                      <div className="font-medium">₹80</div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleRadioChange('paymentMethod', value as PaymentMethod)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="cash_on_delivery" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-500">Pay when you receive your order</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="font-medium">Credit / Debit Card</div>
                        <div className="text-sm text-gray-500">Pay securely online</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {formData.paymentMethod === 'card' && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          name="cardNumber"
                          placeholder="1234 1234 1234 1234"
                          value={formData.cardNumber || ''}
                          onChange={handleChange}
                          required={formData.paymentMethod === 'card'}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input 
                            id="cardExpiry" 
                            name="cardExpiry"
                            placeholder="MM/YY"
                            value={formData.cardExpiry || ''}
                            onChange={handleChange}
                            required={formData.paymentMethod === 'card'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvc">CVC</Label>
                          <Input 
                            id="cardCvc" 
                            name="cardCvc"
                            placeholder="123"
                            value={formData.cardCvc || ''}
                            onChange={handleChange}
                            required={formData.paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="lg:hidden">
                <OrderSummary 
                  cartItems={cartItems} 
                  cartTotal={cartTotal} 
                  deliveryFee={deliveryFee} 
                  totalAmount={totalAmount}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - ₹${totalAmount.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>
          
          {/* Order Summary (desktop) */}
          <div className="hidden lg:block">
            <OrderSummary 
              cartItems={cartItems} 
              cartTotal={cartTotal} 
              deliveryFee={deliveryFee} 
              totalAmount={totalAmount}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Helper component for order summary
interface OrderSummaryProps {
  cartItems: any[];
  cartTotal: number;
  deliveryFee: number;
  totalAmount: number;
}

const OrderSummary = ({ cartItems, cartTotal, deliveryFee, totalAmount }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>{cartItems.length} items in your cart</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                <img
                  src={item.listing.image_url || '/placeholder.svg'}
                  alt={item.listing.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div>
                <p className="font-medium">{item.listing.title}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × ₹{item.listing.price}
                </p>
              </div>
            </div>
            <p className="font-medium">
              ₹{(item.listing.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-gray-500">Subtotal</p>
            <p>₹{cartTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-500">Delivery Fee</p>
            <p>₹{deliveryFee.toFixed(2)}</p>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <p>Total</p>
            <p>₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutPage;
