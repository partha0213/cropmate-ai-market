
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useListings } from '@/hooks/useListings';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';

const deliverySchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  address: z.string().min(5, { message: 'Please enter a valid address' }),
  city: z.string().min(2, { message: 'Please enter a valid city' }),
  state: z.string().min(2, { message: 'Please enter a valid state' }),
  pincode: z.string().min(6, { message: 'Please enter a valid pincode' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  deliveryMethod: z.enum(['standard', 'express']),
  paymentMethod: z.enum(['cod', 'card']),
  notes: z.string().optional(),
});

type DeliveryFormValues = z.infer<typeof deliverySchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cart, clearCart } = useCart();
  const { listings } = useListings();
  const [processing, setProcessing] = useState(false);
  
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      fullName: profile?.full_name || '',
      address: profile?.address || '',
      city: '',
      state: '',
      pincode: '',
      phone: profile?.phone || '',
      deliveryMethod: 'standard',
      paymentMethod: 'cod',
      notes: '',
    },
  });
  
  // Calculate cart totals
  const cartItems = cart.filter(item => 
    listings.some(listing => listing.id === item.listing_id)
  );
  
  const cartListings = cartItems.map(item => {
    const listing = listings.find(l => l.id === item.listing_id);
    return {
      ...item,
      listing: listing!,
      total: item.quantity * listing!.price
    };
  });
  
  const subtotal = cartListings.reduce((total, item) => total + item.total, 0);
  const deliveryFee = form.watch('deliveryMethod') === 'express' ? 100 : 50;
  const total = subtotal + deliveryFee;
  
  // Handle form submission
  const createOrder = useMutation({
    mutationFn: async (formData: DeliveryFormValues) => {
      if (!user) throw new Error('User not authenticated');
      
      // Create an order for each product (from different farmers)
      const orders = await Promise.all(
        cartListings.map(async (item) => {
          const deliveryAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
          
          const { data, error } = await supabase
            .from('orders')
            .insert({
              buyer_id: user.id,
              listing_id: item.listing_id,
              quantity: item.quantity,
              total_price: item.total,
              status: 'placed',
              order_status: 'placed',
              payment_method: formData.paymentMethod,
              payment_status: formData.paymentMethod === 'cod' ? 'pending' : 'completed',
              delivery_address: deliveryAddress,
              delivery_notes: formData.notes || null,
              expected_delivery_date: new Date(
                Date.now() + (formData.deliveryMethod === 'express' ? 2 : 5) * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .select();
            
          if (error) throw error;
          return data[0];
        })
      );
      
      // Clear cart after successful order
      await Promise.all(
        cartItems.map(async (item) => {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', item.id);
            
          if (error) console.error('Error clearing cart item:', error);
        })
      );
      
      return orders;
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: 'Order placed successfully!',
        description: 'You will receive a confirmation shortly.',
      });
      navigate('/order-success');
    },
    onError: (error) => {
      console.error('Order error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to place order',
        description: 'Please try again later.',
      });
      setProcessing(false);
    },
  });
  
  const onSubmit = (data: DeliveryFormValues) => {
    setProcessing(true);
    createOrder.mutate(data);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/marketplace');
    }
  }, [cartItems, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-gray-500">Complete your order</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Delivery Information
                    </CardTitle>
                    <CardDescription>Enter your delivery details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter your street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PIN Code</FormLabel>
                            <FormControl>
                              <Input placeholder="PIN code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any specific instructions for delivery" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      Delivery Method
                    </CardTitle>
                    <CardDescription>Select your preferred delivery method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="deliveryMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <FormItem className="flex-1">
                                <FormControl>
                                  <RadioGroupItem 
                                    value="standard" 
                                    id="standard" 
                                    className="peer sr-only" 
                                  />
                                </FormControl>
                                <FormLabel 
                                  htmlFor="standard"
                                  className="flex flex-col gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <span className="font-semibold">Standard Delivery</span>
                                  <span className="text-sm font-normal text-muted-foreground">3-5 business days</span>
                                  <span className="font-medium text-primary">₹50</span>
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex-1">
                                <FormControl>
                                  <RadioGroupItem 
                                    value="express" 
                                    id="express" 
                                    className="peer sr-only" 
                                  />
                                </FormControl>
                                <FormLabel 
                                  htmlFor="express"
                                  className="flex flex-col gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <span className="font-semibold">Express Delivery</span>
                                  <span className="text-sm font-normal text-muted-foreground">1-2 business days</span>
                                  <span className="font-medium text-primary">₹100</span>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <FormItem className="flex-1">
                                <FormControl>
                                  <RadioGroupItem 
                                    value="cod" 
                                    id="cod" 
                                    className="peer sr-only" 
                                  />
                                </FormControl>
                                <FormLabel 
                                  htmlFor="cod"
                                  className="flex flex-col gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <span className="font-semibold">Cash on Delivery</span>
                                  <span className="text-sm font-normal text-muted-foreground">Pay when you receive</span>
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex-1">
                                <FormControl>
                                  <RadioGroupItem 
                                    value="card" 
                                    id="card" 
                                    className="peer sr-only" 
                                  />
                                </FormControl>
                                <FormLabel 
                                  htmlFor="card"
                                  className="flex flex-col gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <span className="font-semibold">Credit/Debit Card</span>
                                  <span className="text-sm font-normal text-muted-foreground">Pay securely online</span>
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                
                <div className="lg:hidden">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cartListings.map((item) => (
                          <div key={item.listing_id} className="flex justify-between">
                            <div>
                              <span className="font-medium">{item.listing.title}</span>
                              <div className="text-sm text-gray-500">
                                {item.quantity} x {formatCurrency(item.listing.price)}
                              </div>
                            </div>
                            <div className="font-medium">{formatCurrency(item.total)}</div>
                          </div>
                        ))}
                        
                        <Separator />
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery</span>
                          <span>{formatCurrency(deliveryFee)}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={processing || cartItems.length === 0}
                      >
                        {processing ? 'Processing...' : 'Place Order'}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="hidden lg:block">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={processing || cartItems.length === 0}
                  >
                    {processing ? 'Processing...' : 'Place Order'}
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    By placing an order, you agree to our Terms and Conditions
                  </p>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartListings.map((item) => (
                      <div key={item.listing_id} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.listing.title}</span>
                          <div className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(item.listing.price)}
                          </div>
                        </div>
                        <div className="font-medium">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center text-center">
                  <div className="flex items-center text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Secure Checkout</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    All transactions are secure and encrypted
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
