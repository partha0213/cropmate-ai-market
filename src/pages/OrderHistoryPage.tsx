import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Package, Phone, Calendar, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderWithDetails, ListingWithFarmer } from '@/types/order';
import { OrderStatus, CropCategory, QualityGrade } from '@/types/supabase';

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  
  // Fetch the buyer's orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id, filter],
    queryFn: async (): Promise<OrderWithDetails[]> => {
      if (!user) return [];
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          listing_id
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('order_status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Now we need to fetch the listing details for each order
      const ordersWithDetails: OrderWithDetails[] = await Promise.all(
        (data || []).map(async (order) => {
          // Get the listing details
          const { data: listing, error: listingError } = await supabase
            .from('listings')
            .select('*')
            .eq('id', order.listing_id)
            .single();
          
          if (listingError) {
            console.error('Error fetching listing:', listingError);
            
            // Create default listing with required properties
            const defaultListing: ListingWithFarmer = {
              id: order.listing_id,
              title: 'Unknown Product',
              price: 0,
              quantity: 0,
              farmer_id: '',
              category: 'vegetables' as CropCategory,
              quality_grade: 'A' as QualityGrade,
              description: '',
              status: 'unknown',
              farmer: {
                full_name: 'Unknown Farmer',
                phone: 'N/A'
              }
            };
            
            return { 
              ...order, 
              listing: defaultListing,
              order_status: (order.order_status || 'placed') as OrderStatus 
            };
          }
          
          // Create a properly typed listing object with farmer property
          const processedListing: ListingWithFarmer = {
            ...listing,
            category: (listing.category || 'vegetables') as CropCategory,
            quality_grade: (listing.quality_grade || 'A') as QualityGrade,
            description: listing.description || '',
            status: listing.status || 'unknown',
            farmer: {
              full_name: null,
              phone: null
            }
          };
          
          // Get the farmer details
          const { data: farmer } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', listing.farmer_id)
            .single();
          
          if (farmer) {
            processedListing.farmer = {
              full_name: farmer.full_name || 'Unknown Farmer',
              phone: farmer.phone || 'N/A'
            };
          }
          
          return { 
            ...order, 
            listing: processedListing,
            order_status: (order.order_status || 'placed') as OrderStatus 
          };
        })
      );
      
      return ordersWithDetails;
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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="placed">Placed</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="packed">Packed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} formatDate={formatDate} />
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No orders found</h3>
                <p className="mt-1 text-gray-500">
                  You haven't placed any orders yet.
                </p>
                <Button className="mt-6" onClick={() => window.location.href = '/marketplace'}>
                  Browse Products
                </Button>
              </div>
            )}
          </TabsContent>
          
          {['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              {orders && orders.filter(o => o.order_status === status).length > 0 ? (
                orders
                  .filter(o => o.order_status === status)
                  .map((order) => (
                    <OrderCard key={order.id} order={order} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                  ))
              ) : (
                <div className="text-center py-12">
                  <InfoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No {status} orders</h3>
                  <p className="mt-1 text-gray-500">
                    You don't have any orders with status "{status}".
                  </p>
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

interface OrderCardProps {
  order: OrderWithDetails;
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
  formatDate: (date: string | null) => string;
}

const OrderCard = ({ order, getStatusBadge, formatDate }: OrderCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!order.listing) {
    return null;
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-3">
                Order #{order.id.substring(0, 8)}
              </h3>
              {getStatusBadge(order.order_status)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          
          <div className="mt-2 lg:mt-0">
            <span className="font-semibold">Total: </span>
            <span className="text-lg">₹{order.total_price.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row border rounded-lg overflow-hidden">
          <div className="md:w-1/4 h-24 md:h-auto bg-gray-50">
            <img 
              src={order.listing.image_url || 'https://via.placeholder.com/150'} 
              alt={order.listing.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4 flex-1">
            <h4 className="font-medium">{order.listing.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {order.quantity} × ₹{order.listing.price}/{order.listing.unit || 'kg'}
            </p>
            
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>{order.listing.farmer.full_name?.charAt(0) || 'F'}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{order.listing.farmer.full_name}</span>
              </div>
              
              {order.listing.farmer.phone && (
                <a 
                  href={`tel:${order.listing.farmer.phone}`} 
                  className="flex items-center text-sm text-cropmate-primary"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{order.listing.farmer.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Delivery Information</h4>
                <p className="text-sm text-gray-700">{order.delivery_address || 'No address provided'}</p>
                {order.delivery_notes && (
                  <p className="text-sm text-gray-500 mt-2">
                    Notes: {order.delivery_notes}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Delivery Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Expected Delivery:</span>
                    <span>{formatDate(order.expected_delivery_date)}</span>
                  </div>
                  {order.actual_delivery_date && (
                    <div className="flex justify-between text-sm">
                      <span>Actual Delivery:</span>
                      <span>{formatDate(order.actual_delivery_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Order Status History</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  Current status: <span className="font-medium">{order.order_status}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Payment method: <span className="font-medium">{order.payment_method || 'N/A'}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Payment status: <span className="font-medium">{order.payment_status || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistoryPage;
