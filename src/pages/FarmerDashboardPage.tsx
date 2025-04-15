import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FarmerOrder } from '@/types/order';
import { OrderStatus, PaymentStatus } from '@/types/supabase';

const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  
  // Fetch the farmer's orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['farmer-orders', user?.id, filter],
    queryFn: async (): Promise<FarmerOrder[]> => {
      if (!user) return [];
      
      // First get all listings by the farmer
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, price, unit')
        .eq('farmer_id', user.id);
      
      if (listingsError) throw listingsError;
      
      if (!listings || listings.length === 0) {
        return [];
      }
      
      const listingIds = listings.map(listing => listing.id);
      
      // Then get all orders for those listings
      let query = supabase
        .from('orders')
        .select(`
          id,
          listing_id,
          buyer_id,
          quantity,
          total_price,
          order_status,
          payment_status,
          created_at,
          delivery_address,
          delivery_notes
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('order_status', filter);
      }
      
      const { data: orderData, error: ordersError } = await query;
      
      if (ordersError) throw ordersError;
      
      // Now enrich the orders with listing details and buyer info
      const enrichedOrders = await Promise.all(
        (orderData || []).map(async (order) => {
          // Find the listing details
          const listing = listings.find(l => l.id === order.listing_id);
          
          // Get buyer details
          const { data: buyer } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('id', order.buyer_id)
            .single();
          
          return {
            id: order.id,
            listing_id: order.listing_id,
            listing_title: listing?.title || 'Unknown Product',
            listing_price: listing?.price || 0,
            listing_unit: listing?.unit || 'kg',
            quantity: order.quantity,
            total_price: order.total_price,
            order_status: order.order_status as OrderStatus,
            payment_status: (order.payment_status || 'pending') as PaymentStatus,
            created_at: order.created_at || new Date().toISOString(),
            buyer: {
              id: buyer?.id || order.buyer_id,
              full_name: buyer?.full_name || 'Unknown Buyer',
              phone: buyer?.phone || 'N/A'
            },
            delivery_address: order.delivery_address || 'No address provided',
            delivery_notes: order.delivery_notes || null
          };
        })
      );
      
      return enrichedOrders;
    },
    enabled: !!user,
  });
  
  const getStatusBadge = (status: OrderStatus) => {
    let color = '';
    
    switch (status) {
      case 'placed':
        color = 'bg-blue-500';
        break;
      case 'confirmed':
        color = 'bg-indigo-500';
        break;
      case 'packed':
        color = 'bg-yellow-500';
        break;
      case 'shipped':
        color = 'bg-orange-500';
        break;
      case 'delivered':
        color = 'bg-green-500';
        break;
      case 'cancelled':
        color = 'bg-red-500';
        break;
      default:
        color = 'bg-gray-500';
    }
    
    return <Badge className={`${color} text-white`}>{status}</Badge>;
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p>Error loading orders. Please try again later.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Farmer Dashboard</h1>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="placed">New Orders</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="packed">Packed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <FarmerOrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} formatDate={formatDate} />
              ))
            ) : (
              <div className="text-center py-12">
                <h3>No orders found</h3>
                <p>There are no orders to display.</p>
              </div>
            )}
          </TabsContent>
          
          {['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              {orders && orders.filter(o => o.order_status === status).length > 0 ? (
                orders
                  .filter(o => o.order_status === status)
                  .map((order) => (
                    <FarmerOrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                  ))
              ) : (
                <div className="text-center py-12">
                  <h3>No {status} orders</h3>
                  <p>There are no orders with status "{status}".</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

interface FarmerOrderCardProps {
  order: FarmerOrder;
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
  formatDate: (date: string) => string;
}

const FarmerOrderCard = ({ order, getStatusBadge, formatDate }: FarmerOrderCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              Order #{order.id.substring(0, 8)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            {getStatusBadge(order.order_status)}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium">{order.listing_title}</h4>
          <p className="text-sm text-gray-600">
            {order.quantity} × ₹{order.listing_price}/{order.listing_unit}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium">Buyer Information</h4>
          <p className="text-sm text-gray-600">
            {order.buyer.full_name} ({order.buyer.phone})
          </p>
          <p className="text-sm text-gray-600">
            Delivery Address: {order.delivery_address}
          </p>
          {order.delivery_notes && (
            <p className="text-sm text-gray-600">
              Delivery Notes: {order.delivery_notes}
            </p>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span>₹{order.total_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payment Status:</span>
            <span>{order.payment_status}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <Button>View Order Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerDashboardPage;
