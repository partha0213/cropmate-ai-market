import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CropCategory, Listing, Order, Profile } from '@/types/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Package, Truck, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Define proper interfaces for the order with related data
interface OrderWithListing extends Order {
  listing: Listing & {
    farmer: {
      id: string;
      full_name: string;
    }
  };
}

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async (): Promise<OrderWithListing[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listing:listing_id (
            *,
            farmer:farmer_id (
              id,
              full_name
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      
      // Type assertion to satisfy TypeScript
      return data as unknown as OrderWithListing[];
    },
    enabled: !!user?.id,
  });

  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading orders. Please try again later.</p>
              </div>
            ) : orders?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Order placed</p>
                          <p className="font-medium">{format(new Date(order.created_at), 'PP')}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">₹{order.total_amount}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Order ID</p>
                          <p className="font-medium text-sm">{order.id.substring(0, 8)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img 
                              src={order.listing.image_url || '/placeholder.svg'} 
                              alt={order.listing.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{order.listing.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <User size={14} className="mr-1" />
                                Seller: {order.listing.farmer.full_name}
                              </span>
                              <span className="flex items-center">
                                <Package size={14} className="mr-1" />
                                Quantity: {order.quantity} {order.listing.unit || 'kg'}
                              </span>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              <span className="flex items-center text-gray-600">
                                <Truck size={14} className="mr-1" />
                                Expected delivery: {order.expected_delivery_date ? 
                                  format(new Date(order.expected_delivery_date), 'PP') : 
                                  'Not specified'}
                              </span>
                              
                              {order.status.toLowerCase() === 'delivered' && order.actual_delivery_date && (
                                <span className="flex items-center text-green-600">
                                  <Calendar size={14} className="mr-1" />
                                  Delivered on: {format(new Date(order.actual_delivery_date), 'PP')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpanded(order.id)}
                          className="mt-2 text-gray-500 hover:text-gray-700 w-full flex justify-center"
                        >
                          {expandedOrders[order.id] ? (
                            <>
                              <span>Show less</span>
                              <ChevronUp size={16} className="ml-1" />
                            </>
                          ) : (
                            <>
                              <span>Show details</span>
                              <ChevronDown size={16} className="ml-1" />
                            </>
                          )}
                        </Button>
                        
                        {expandedOrders[order.id] && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="font-medium mb-2">Delivery Details</h4>
                                <p className="text-sm text-gray-600">{order.delivery_address}</p>
                                {order.delivery_notes && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Notes: {order.delivery_notes}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Payment Information</h4>
                                <p className="text-sm text-gray-600">
                                  Method: {order.payment_method || 'Cash on Delivery'}
                                </p>
                                <div className="flex justify-between text-sm text-gray-600 mt-1">
                                  <span>Item Total:</span>
                                  <span>₹{order.subtotal_amount || order.total_amount}</span>
                                </div>
                                {order.delivery_fee && (
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Fee:</span>
                                    <span>₹{order.delivery_fee}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium mt-1">
                                  <span>Total:</span>
                                  <span>₹{order.total_amount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Other tab contents would be similar but filtered by order status */}
          <TabsContent value="active">
            {/* Filter orders that are not delivered or cancelled */}
          </TabsContent>
          
          <TabsContent value="completed">
            {/* Show only delivered orders */}
          </TabsContent>
          
          <TabsContent value="cancelled">
            {/* Show only cancelled orders */}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
