
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { OrderStatus } from '@/types/supabase';

interface OrderWithListing {
  id: string;
  buyer_id: string;
  listing_id: string;
  quantity: number;
  total_price: number;
  status: string;
  order_status: OrderStatus;
  payment_method: string;
  payment_status: string;
  delivery_address: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  created_at: string;
  listing: {
    id: string;
    title: string;
    image_url: string | null;
    price: number;
    unit: string;
    farmer_id: string;
    farmer: {
      id: string;
      full_name: string | null;
    };
  };
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
    'placed': { color: 'bg-blue-100 text-blue-800', label: 'Placed' },
    'confirmed': { color: 'bg-indigo-100 text-indigo-800', label: 'Confirmed' },
    'packed': { color: 'bg-purple-100 text-purple-800', label: 'Packed' },
    'shipped': { color: 'bg-amber-100 text-amber-800', label: 'Shipped' },
    'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <Badge className={config.color} variant="outline">
      {config.label}
    </Badge>
  );
};

const OrderTracker = ({ status }: { status: OrderStatus }) => {
  const statuses: OrderStatus[] = ['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
  
  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center mt-2">
        <Badge variant="destructive" className="px-3 py-1">Order Cancelled</Badge>
      </div>
    );
  }

  const currentIndex = statuses.findIndex(s => s === status);
  
  return (
    <div className="flex items-center justify-between mt-4 px-4">
      {statuses.map((s, index) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <div 
              className={`h-3 w-3 rounded-full ${
                index <= currentIndex ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></div>
            <span className="text-xs mt-1">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>
          
          {index < statuses.length - 1 && (
            <div 
              className={`h-0.5 w-full ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const OrderHistoryPage = () => {
  const { user } = useAuth();
  
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async (): Promise<OrderWithListing[]> => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          listing:listings(
            id,
            title,
            image_url,
            price,
            unit,
            farmer_id,
            farmer:profiles(id, full_name)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithListing[];
    },
    enabled: !!user,
  });

  const groupedOrders = {
    active: orders?.filter(order => 
      !['delivered', 'cancelled'].includes(order.order_status)
    ) || [],
    completed: orders?.filter(order => 
      order.order_status === 'delivered'
    ) || [],
    cancelled: orders?.filter(order => 
      order.order_status === 'cancelled'
    ) || [],
  };

  const renderOrderCard = (order: OrderWithListing) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
            <CardDescription>
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.order_status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4 mb-4">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src={order.listing.image_url || '/placeholder.svg'}
              alt={order.listing.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{order.listing.title}</h3>
            <p className="text-sm text-gray-500">
              Quantity: {order.quantity} {order.listing.unit}
            </p>
            <p className="text-sm text-gray-500">
              Sold by: {order.listing.farmer.full_name || 'Unknown Farmer'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">₹{order.total_price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              ₹{order.listing.price}/{order.listing.unit}
            </p>
          </div>
        </div>

        <OrderTracker status={order.order_status} />
        
        <div className="mt-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Payment Method:</span>
            <span>{order.payment_method.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Payment Status:</span>
            <span>{order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}</span>
          </div>
          {order.expected_delivery_date && (
            <div className="flex justify-between">
              <span className="text-gray-500">Expected Delivery:</span>
              <span>{format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
          {order.actual_delivery_date && (
            <div className="flex justify-between">
              <span className="text-gray-500">Delivered On:</span>
              <span>{format(new Date(order.actual_delivery_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order History</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load orders</h3>
            <p className="text-muted-foreground text-center">
              {(error as Error).message || 'An unexpected error occurred.'}
            </p>
          </div>
        ) : orders?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button asChild>
              <a href="/marketplace">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Products
              </a>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Active ({groupedOrders.active.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({groupedOrders.completed.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({groupedOrders.cancelled.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {groupedOrders.active.length > 0 ? (
                groupedOrders.active.map(renderOrderCard)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active orders at the moment.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {groupedOrders.completed.length > 0 ? (
                groupedOrders.completed.map(renderOrderCard)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No completed orders yet.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              {groupedOrders.cancelled.length > 0 ? (
                groupedOrders.cancelled.map(renderOrderCard)
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No cancelled orders.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
