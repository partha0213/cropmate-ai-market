import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Order, Listing, QualityGrade, CropCategory } from '@/types/supabase';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Calendar, Clock, Package, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Extended Listing interface for type safety
interface ListingWithFarmer extends Listing {
  farmer?: {
    full_name: string;
    phone: string;
  } | null;
}

// Extended Order interface with additional fields needed for the UI
interface OrderWithListing extends Order {
  listing: ListingWithFarmer;
  total_amount: number;
  subtotal_amount: number;
  delivery_fee: number;
}

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Fetch user's order history
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['order-history', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First get orders without joins to avoid relation errors
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      // Now process each order to get its listing and farmer details separately
      const processedOrders = await Promise.all((orders || []).map(async (order) => {
        // Get the listing details
        const { data: listingData } = await supabase
          .from('listings')
          .select('*')
          .eq('id', order.listing_id)
          .single();
          
        let listing = listingData || {
          id: order.listing_id,
          title: 'Unknown Product',
          price: 0,
          quantity: 0,
          farmer_id: '',
          category: 'vegetables' as CropCategory,
          quality_grade: 'A' as QualityGrade,
          description: '', // Add missing required properties
          status: 'unknown' // Add missing required properties
        };
        
        // Get the farmer details if we have a farmer_id
        let farmer = null;
        if (listing && listing.farmer_id) {
          const { data: farmerData } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', listing.farmer_id)
            .single();
            
          farmer = farmerData || null;
        }
        
        // Create the final listing object with farmer info
        const processedListing: ListingWithFarmer = {
          ...listing,
          category: (listing.category || 'vegetables') as CropCategory,
          quality_grade: (listing.quality_grade || 'A') as QualityGrade,
          description: listing.description || '', // Ensure description is included
          status: listing.status || 'unknown', // Ensure status is included
          farmer: farmer ? {
            full_name: farmer.full_name || 'Unknown',
            phone: farmer.phone || 'N/A'
          } : {
            full_name: 'Unknown',
            phone: 'N/A'
          }
        };
        
        // Return the final order object
        return {
          ...order,
          listing: processedListing,
          total_amount: order.total_price,
          subtotal_amount: order.total_price * 0.95,
          delivery_fee: order.total_price * 0.05
        } as OrderWithListing;
      }));
      
      return processedOrders;
    },
    enabled: !!user?.id,
  });
  
  // Safely access orders
  const orders = ordersData || [];
  
  // Filter orders based on active tab
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    
    switch (activeTab) {
      case 'active':
        return orders.filter(order => 
          ['placed', 'confirmed', 'processing', 'shipped'].includes(order.status.toLowerCase())
        );
      case 'completed':
        return orders.filter(order => 
          order.status.toLowerCase() === 'delivered'
        );
      case 'cancelled':
        return orders.filter(order => 
          order.status.toLowerCase() === 'cancelled'
        );
      default:
        return orders;
    }
  }, [orders, activeTab]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'placed':
      case 'confirmed':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Your Order History</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'all' 
                    ? "You haven't placed any orders yet." 
                    : `You don't have any ${activeTab} orders.`}
                </p>
                <Button onClick={() => window.location.href = "/marketplace"}>
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="border-b px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                      <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Placed on {format(new Date(order.created_at), 'PP')}</span>
                      </div>
                      {order.expected_delivery_date && (
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          <span>
                            Expected delivery by {format(new Date(order.expected_delivery_date), 'PP')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Track Order
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <img 
                            src={order.listing.image_url || '/placeholder.svg'} 
                            alt={order.listing.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{order.listing.title}</h3>
                          <p className="text-gray-500 text-sm">
                            Seller: {order.listing.farmer?.full_name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-medium">
                              {formatCurrency(order.listing.price)} / {order.listing.unit || 'kg'}
                            </span>
                            <span className="text-gray-500">x {order.quantity}</span>
                          </div>
                          <Badge variant="outline" className="mt-2 capitalize">
                            {order.listing.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="min-w-[200px] border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
                      <h4 className="font-medium mb-2">Order Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal:</span>
                          <span>{formatCurrency(order.subtotal_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery:</span>
                          <span>{formatCurrency(order.delivery_fee)}</span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-sm font-medium">
                        Order Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Delivery Address</h4>
                            <p className="text-gray-600">
                              {order.delivery_address || 'Address not provided'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Payment Information</h4>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Method:</span>
                              <Badge variant="outline">
                                {order.payment_method?.toUpperCase() || 'Cash on Delivery'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-gray-600">Status:</span>
                              <Badge variant={order.payment_status === 'completed' ? 'default' : 'outline'}>
                                {order.payment_status?.toUpperCase() || 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
