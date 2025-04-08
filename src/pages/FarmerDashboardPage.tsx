
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Package,
  Edit,
  Trash2,
  Loader2,
  PlusCircle,
  FileText,
  ShoppingCart,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { Listing, Order } from '@/types/supabase';

interface OrderWithBuyer extends Order {
  buyer: {
    id: string;
    full_name: string | null;
    phone: string | null;
  };
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null);

  // Fetch farmer's products
  const { 
    data: products, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useQuery({
    queryKey: ['farmer-products', user?.id],
    queryFn: async (): Promise<Listing[]> => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Listing[];
    },
    enabled: !!user,
  });

  // Fetch orders for the farmer's products
  const { 
    data: orders, 
    isLoading: isLoadingOrders, 
    error: ordersError 
  } = useQuery({
    queryKey: ['farmer-orders', user?.id],
    queryFn: async (): Promise<OrderWithBuyer[]> => {
      if (!user) throw new Error('User not authenticated');
      
      // First get all the farmer's listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('farmer_id', user.id);
      
      if (listingsError) throw listingsError;
      
      if (!listings || listings.length === 0) {
        return [];
      }
      
      // Then get all orders for these listings
      const listingIds = listings.map(listing => listing.id);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles(id, full_name, phone)
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrderWithBuyer[];
    },
    enabled: !!user,
  });

  // Calculate dashboard stats
  const stats: ProductStats = React.useMemo(() => {
    return {
      totalProducts: products?.length || 0,
      activeProducts: products?.filter(p => p.status === 'active').length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue: orders?.reduce((sum, order) => sum + order.total_price, 0) || 0,
    };
  }, [products, orders]);

  // Group orders by status
  const groupedOrders = React.useMemo(() => {
    const result = {
      new: [] as OrderWithBuyer[],
      processing: [] as OrderWithBuyer[],
      completed: [] as OrderWithBuyer[],
    };
    
    orders?.forEach(order => {
      if (['placed', 'confirmed'].includes(order.order_status || '')) {
        result.new.push(order);
      } else if (['packed', 'shipped'].includes(order.order_status || '')) {
        result.processing.push(order);
      } else {
        result.completed.push(order);
      }
    });
    
    return result;
  }, [orders]);

  const handleEditProduct = (product: Listing) => {
    setSelectedProduct(product);
    // Implement edit functionality (you'd navigate to edit product page)
  };

  const handleDeleteProduct = async (productId: string) => {
    // Implement delete functionality
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('listings')
          .update({ status: 'deleted' })
          .eq('id', productId)
          .eq('farmer_id', user?.id);
        
        if (error) throw error;
        
        // Refetch products
        // You'd typically use queryClient to invalidate queries
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to log in to access the farmer dashboard.</p>
          <Button asChild>
            <a href="/auth">Login</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isLoading = isLoadingProducts || isLoadingOrders;
  const error = productsError || ordersError;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
            <p className="text-gray-600">Manage your products and orders</p>
          </div>
          <Button asChild>
            <a href="/farmer/add-product">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Product
            </a>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground text-center">
              {(error as Error).message || 'An unexpected error occurred.'}
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold">{stats.totalProducts}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.activeProducts} active listings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold">{stats.totalOrders}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {groupedOrders.new.length} new orders
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lifetime earnings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-2xl font-bold">
                      {stats.totalProducts > 0 
                        ? `${((stats.totalOrders / stats.totalProducts) * 100).toFixed(1)}%` 
                        : '0%'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Orders per product
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products">My Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 p-4 text-sm font-medium text-gray-500 border-b">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Stock</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  {products && products.length > 0 ? (
                    <div className="divide-y">
                      {products.map((product) => (
                        <div key={product.id} className="grid grid-cols-12 p-4 items-center">
                          <div className="col-span-5 flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                              <img
                                src={product.image_url || '/placeholder.svg'}
                                alt={product.title}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">{product.title}</h3>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="col-span-2">₹{product.price}/{product.unit || 'kg'}</div>
                          <div className="col-span-2">{product.quantity} {product.unit || 'kg'}</div>
                          <div className="col-span-1">
                            <Badge 
                              className={
                                product.status === 'active' 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                              }
                              variant="outline"
                            >
                              {product.status}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No products yet</h3>
                      <p className="text-gray-500 mb-4 text-center">
                        You haven't added any products to your store yet.
                      </p>
                      <Button asChild>
                        <a href="/farmer/add-product">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Product
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <Tabs defaultValue="new">
                  <TabsList>
                    <TabsTrigger value="new">
                      New Orders ({groupedOrders.new.length})
                    </TabsTrigger>
                    <TabsTrigger value="processing">
                      Processing ({groupedOrders.processing.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({groupedOrders.completed.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  {['new', 'processing', 'completed'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                      {groupedOrders[tab as keyof typeof groupedOrders].length > 0 ? (
                        groupedOrders[tab as keyof typeof groupedOrders].map((order) => (
                          <Card key={order.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    Order #{order.id.substring(0, 8)}
                                  </CardTitle>
                                  <CardDescription>
                                    Placed on {format(new Date(order.created_at || ''), 'MMM dd, yyyy')}
                                  </CardDescription>
                                </div>
                                <Badge 
                                  className={
                                    order.order_status === 'placed' ? 'bg-blue-100 text-blue-800' :
                                    order.order_status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                    order.order_status === 'packed' ? 'bg-purple-100 text-purple-800' :
                                    order.order_status === 'shipped' ? 'bg-amber-100 text-amber-800' :
                                    order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }
                                  variant="outline"
                                >
                                  {order.order_status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Buyer Information
                                  </h3>
                                  <p className="text-sm">{order.buyer?.full_name || 'Anonymous'}</p>
                                  <p className="text-sm">Phone: {order.buyer?.phone || 'N/A'}</p>
                                  <p className="text-sm">
                                    Delivery Address: {order.delivery_address || 'N/A'}
                                  </p>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Order Details
                                  </h3>
                                  <div className="flex justify-between text-sm">
                                    <span>Quantity:</span>
                                    <span>{order.quantity}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Total Price:</span>
                                    <span className="font-medium">₹{order.total_price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Payment Method:</span>
                                    <span>{order.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Payment Status:</span>
                                    <span>{order.payment_status || 'N/A'}</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-2">
                                  <Button size="sm" variant="outline">
                                    Contact Buyer
                                  </Button>
                                  {order.order_status === 'placed' && (
                                    <Button size="sm">
                                      Confirm Order
                                    </Button>
                                  )}
                                  {order.order_status === 'confirmed' && (
                                    <Button size="sm">
                                      Mark as Packed
                                    </Button>
                                  )}
                                  {order.order_status === 'packed' && (
                                    <Button size="sm">
                                      Mark as Shipped
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Package className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No {tab} orders
                          </h3>
                          <p className="text-gray-500 text-center">
                            {tab === 'new' 
                              ? 'You don\'t have any new orders at the moment.' 
                              : tab === 'processing' 
                                ? 'No orders are currently being processed.' 
                                : 'You don\'t have any completed orders yet.'}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FarmerDashboardPage;
