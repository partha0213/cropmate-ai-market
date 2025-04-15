
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Package, Tractor, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderStatus } from '@/types/supabase';

// Order type for the farmer dashboard
interface FarmerOrder {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number;
  listing_unit: string;
  quantity: number;
  total_price: number;
  order_status: OrderStatus;
  payment_status: string;
  created_at: string;
  buyer: {
    id: string;
    full_name: string | null;
    phone: string | null;
  };
  delivery_address: string;
  delivery_notes: string | null;
}

const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  
  // Fetch the farmer's listings and their orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['farmer-orders', user?.id, filter],
    queryFn: async (): Promise<FarmerOrder[]> => {
      if (!user) return [];
      
      // First get all listings by this farmer
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id, title, price, unit')
        .eq('farmer_id', user.id);
      
      if (listingsError) throw listingsError;
      
      if (!listings || listings.length === 0) {
        return [];
      }
      
      // Get all orders for these listings
      const listingIds = listings.map(listing => listing.id);
      
      let query = supabase
        .from('orders')
        .select(`
          id, 
          listing_id,
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
      
      const { data: ordersData, error: ordersError } = await query;
      
      if (ordersError) throw ordersError;
      
      // Get buyer details for each order
      const farmerOrders: FarmerOrder[] = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Get the buyer details
          const { data: buyer, error: buyerError } = await supabase
            .from('profiles')
            .select('id, full_name, phone')
            .eq('id', order.buyer_id)
            .single();
          
          if (buyerError) {
            console.error('Error fetching buyer:', buyerError);
            // If there's an error, provide default buyer data
            return {
              ...order,
              buyer: {
                id: 'unknown',
                full_name: 'Unknown Buyer',
                phone: 'N/A'
              },
              listing_title: listings.find(l => l.id === order.listing_id)?.title || 'Unknown Product',
              listing_price: listings.find(l => l.id === order.listing_id)?.price || 0,
              listing_unit: listings.find(l => l.id === order.listing_id)?.unit || 'unit'
            };
          }
          
          // Find the listing details
          const listing = listings.find(l => l.id === order.listing_id);
          
          return {
            ...order,
            buyer,
            listing_title: listing?.title || 'Unknown Product',
            listing_price: listing?.price || 0,
            listing_unit: listing?.unit || 'unit'
          };
        })
      );
      
      return farmerOrders;
    },
    enabled: !!user,
  });
  
  // Calculate dashboard stats
  const totalEarnings = orders?.reduce((sum, order) => sum + order.total_price, 0) || 0;
  const pendingOrders = orders?.filter(order => ['placed', 'confirmed', 'packed'].includes(order.order_status)).length || 0;
  const uniqueCustomers = new Set(orders?.map(order => order.buyer.id)).size;
  
  // Update order status
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    }
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
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus.mutate({ orderId, status: newStatus });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Farmer Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <h3 className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-full mr-4">
                  <Package className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <h3 className="text-2xl font-bold">{pendingOrders}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-full mr-4">
                  <Users className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customers</p>
                  <h3 className="text-2xl font-bold">{uniqueCustomers}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-full mr-4">
                  <Tractor className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <h3 className="text-2xl font-bold">{orders?.length || 0}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="placed">New</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="packed">Packed</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                  </div>
                ) : orders && orders.length > 0 ? (
                  <OrdersTable 
                    orders={orders} 
                    getStatusBadge={getStatusBadge} 
                    formatDate={formatDate} 
                    handleStatusChange={handleStatusChange} 
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </TabsContent>
              
              {['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <TabsContent key={status} value={status}>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                    </div>
                  ) : orders && orders.filter(o => o.order_status === status).length > 0 ? (
                    <OrdersTable 
                      orders={orders.filter(o => o.order_status === status)} 
                      getStatusBadge={getStatusBadge} 
                      formatDate={formatDate} 
                      handleStatusChange={handleStatusChange} 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No {status} orders found</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

interface OrdersTableProps {
  orders: FarmerOrder[];
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
  formatDate: (date: string) => string;
  handleStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const OrdersTable = ({ orders, getStatusBadge, formatDate, handleStatusChange }: OrdersTableProps) => {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <TableRow className="cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                    {formatDate(order.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{order.buyer.full_name?.charAt(0) || 'B'}</AvatarFallback>
                    </Avatar>
                    {order.buyer.full_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    {order.listing_title}
                    <div className="text-xs text-gray-500">
                      {order.quantity} × ₹{order.listing_price}/{order.listing_unit}
                    </div>
                  </div>
                </TableCell>
                <TableCell>₹{order.total_price.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.order_status as OrderStatus)}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={order.order_status} 
                    onValueChange={(value) => {
                      handleStatusChange(order.id, value as OrderStatus);
                      // Stop event propagation to prevent the row click
                      event?.stopPropagation();
                    }}
                  >
                    <SelectTrigger className="w-28" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="placed">Placed</SelectItem>
                      <SelectItem value="confirmed">Confirm</SelectItem>
                      <SelectItem value="packed">Pack</SelectItem>
                      <SelectItem value="shipped">Ship</SelectItem>
                      <SelectItem value="delivered">Deliver</SelectItem>
                      <SelectItem value="cancelled">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
              
              {expandedOrder === order.id && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div className="bg-gray-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Customer Information</h4>
                          <p>
                            <span className="text-gray-500">Name:</span> {order.buyer.full_name}
                          </p>
                          {order.buyer.phone && (
                            <p>
                              <span className="text-gray-500">Phone:</span> {order.buyer.phone}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Delivery Information</h4>
                          <p>
                            <span className="text-gray-500">Address:</span> {order.delivery_address}
                          </p>
                          {order.delivery_notes && (
                            <p>
                              <span className="text-gray-500">Notes:</span> {order.delivery_notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Order Timeline</h4>
                        <p>
                          <span className="text-gray-500">Current Status:</span> {order.order_status}
                        </p>
                        <p>
                          <span className="text-gray-500">Order Placed:</span> {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FarmerDashboardPage;
