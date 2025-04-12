import { useCart } from '@/hooks/useCart';
import { useListings } from '@/hooks/useListings';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Truck, MapPin, Package, ChevronsRight } from 'lucide-react';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'cod' | 'card';
  deliveryNotes?: string;
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartTotal, itemsCount, clearCart: clearCartMutation } = useCart();
  const { data: listingsData } = useListings();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cod',
  });

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/marketplace');
    return null;
  }

  // Mutation for placing an order
  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to place an order');
      
      // Create orders for each cart item
      const orders = cartItems.map(item => ({
        buyer_id: user.id,
        listing_id: item.listing_id,
        quantity: item.quantity,
        total_price: item.listing.price * item.quantity,
        status: 'placed',
        order_status: 'placed',
        payment_method: formData.paymentMethod === 'card' ? 'stripe' : 'cash_on_delivery',
        payment_status: formData.paymentMethod === 'card' ? 'completed' : 'pending',
        delivery_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        delivery_notes: formData.deliveryNotes,
        expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }));
      
      // Insert orders into the database
      const { data, error } = await supabase
        .from('orders')
        .insert(orders)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Clear the cart after successful order
      clearCartMutation.mutate();
      
      // Navigate to success page
      navigate('/order-success');
      
      // Show success message
      toast.success('Your order has been placed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place your order');
    }
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Process payment (mock for now)
    if (formData.paymentMethod === 'card') {
      // In a real app, you would integrate with Stripe or Razorpay here
      // For now, we'll just simulate a successful payment
      setTimeout(() => {
        placeOrder.mutate();
      }, 1000);
    } else {
      // Cash on delivery - place order directly
      placeOrder.mutate();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: 'cod' | 'card') => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate delivery fee and total
  const deliveryFee = cartTotal * 0.05; // 5% of cart total
  const orderTotal = cartTotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleCheckout}>
              <Card className="mb-6">
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
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                    <Textarea 
                      id="deliveryNotes" 
                      name="deliveryNotes" 
                      value={formData.deliveryNotes || ''} 
                      onChange={handleInputChange} 
                      placeholder="Special instructions for delivery" 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handlePaymentMethodChange(value as 'cod' | 'card')}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">Credit/Debit Card</Label>
                    </div>
                  </RadioGroup>
                  
                  {formData.paymentMethod === 'card' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-500">
                        In a real application, a card payment form would be displayed here.
                        For this demo, we'll simulate a successful payment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={placeOrder.isPending}
              >
                {placeOrder.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Complete Order
                    <ChevronsRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={item.listing.image_url || '/placeholder.svg'} 
                          alt={item.listing.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.listing.title}</h4>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{formatCurrency(item.listing.price)} × {item.quantity}</span>
                          <span>{formatCurrency(item.listing.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md flex items-center text-sm">
                    <Truck className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Estimated delivery: 5-7 business days</span>
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
