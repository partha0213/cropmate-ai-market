import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CropCategory, Listing, Order, Profile, QualityGrade } from '@/types/supabase';
import { format } from 'date-fns';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart } from '@/components/ui/chart';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, ShoppingBag, TrendingUp, Users, MoreVertical, Plus, Trash2, Edit, Eye } from 'lucide-react';

// Define proper interfaces for the order with related data
interface OrderWithBuyer extends Order {
  buyer?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  total_amount: number;
}

// Define interface for farmer's listings
interface FarmerListing extends Listing {
  category: CropCategory;
  quality_grade: QualityGrade | null;
}

const FarmerDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch farmer's products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['farmer-products', user?.id],
    queryFn: async (): Promise<FarmerListing[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      // Convert string category to CropCategory type
      return (data || []).map(item => ({
        ...item,
        category: item.category as CropCategory,
        quality_grade: item.quality_grade as QualityGrade | null,
      }));
    },
    enabled: !!user?.id,
  });
  
  // Fetch orders for farmer's products
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['farmer-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // First get the product IDs for this farmer
      const { data: productIds, error: productError } = await supabase
        .from('listings')
        .select('id')
        .eq('farmer_id', user.id);
        
      if (productError) throw new Error(productError.message);
      
      if (!productIds?.length) return [];
      
      // Then get orders for these products
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id (
            id,
            full_name,
            phone
          )
        `)
        .in('listing_id', productIds.map(p => p.id))
        .order('created_at', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      // Map orders and add total_amount property
      return (data || []).map(order => {
        const buyer = order.buyer || null;
        
        return {
          ...order,
          total_amount: order.total_price,
          buyer: buyer ? {
            id: buyer.id || order.buyer_id,
            full_name: buyer.full_name || 'Unknown',
            phone: buyer.phone || 'N/A'
          } : {
            id: order.buyer_id,
            full_name: 'Unknown',
            phone: 'N/A'
          }
        };
      }) as OrderWithBuyer[];
    },
    enabled: !!user?.id,
  });
  
  // Safely access orders
  const orders = ordersData || [];

  // Calculate earnings
  const totalEarnings = orders?.reduce((total, order) => 
    total + (order.total_amount || 0), 0) || 0;
    
  const pendingEarnings = orders?.filter(order => 
    order.status.toLowerCase() !== 'delivered' && 
    order.status.toLowerCase() !== 'cancelled'
  ).reduce((total, order) => total + (order.total_amount || 0), 0) || 0;
  
  // Format numbers as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare data for the product categories chart
  const categoryData = React.useMemo(() => {
    if (!products?.length) return [];
    
    // Count products by category
    const categoryCounts: Record<string, number> = {};
    products.forEach(product => {
      const category = product.category || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Map to chart data format with colors
    const colors: Record<string, string> = {
      vegetables: '#4ade80',
      fruits: '#f97316',
      grains: '#facc15',
      dairy: '#3b82f6',
      pulses: '#ec4899',
      spices: '#8b5cf6',
      Other: '#6b7280'
    };
    
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[name.toLowerCase()] || '#6b7280'
    }));
  }, [products]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
            <p className="text-gray-500">Manage your products and orders</p>
          </div>
          <Button onClick={() => window.location.href = "/farmer/add-product"} className="mt-4 md:mt-0">
            <Plus size={16} className="mr-2" />
            Add New Product
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Products</p>
                      <h3 className="text-2xl font-bold mt-1">{products?.length || 0}</h3>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-1">{orders?.length || 0}</h3>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <ShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                      <h3 className="text-2xl font-bold mt-1">{formatCurrency(totalEarnings)}</h3>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Earnings</p>
                      <h3 className="text-2xl font-bold mt-1">{formatCurrency(pendingEarnings)}</h3>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Your most recent customer orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                    </div>
                  ) : orders?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No orders yet</p>
                  ) : (
                    <div className="space-y-4">
                      {orders?.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-4">
                          <div>
                            <div className="font-medium">Order #{order.id.substring(0, 8)}</div>
                            <div className="text-sm text-gray-500">{format(new Date(order.created_at), 'PP')}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                            <Badge variant="outline" className={
                              order.status.toLowerCase() === 'delivered' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : order.status.toLowerCase() === 'cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>
                    Distribution by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {productsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                    </div>
                  ) : (
                    <BarChart data={categoryData} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your product listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                  </div>
                ) : products?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any products listed yet.</p>
                    <Button 
                      className="mt-4"
                      onClick={() => window.location.href = "/farmer/add-product"}
                    >
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left">Product</th>
                          <th className="py-3 px-2 text-left">Category</th>
                          <th className="py-3 px-2 text-left">Price</th>
                          <th className="py-3 px-2 text-left">Quality</th>
                          <th className="py-3 px-2 text-left">Status</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products?.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 mr-3">
                                  <img 
                                    src={product.image_url || '/placeholder.svg'} 
                                    alt={product.title}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                </div>
                                <div className="font-medium">{product.title}</div>
                              </div>
                            </td>
                            <td className="py-3 px-2 capitalize">{product.category}</td>
                            <td className="py-3 px-2">₹{product.price}/{product.unit || 'kg'}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className={
                                product.quality_grade === 'A' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : product.quality_grade === 'B'
                                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }>
                                Grade {product.quality_grade}
                              </Badge>
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className={
                                product.status === 'active' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-gray-50 text-gray-700 border-gray-200'
                              }>
                                {product.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <CardDescription>
                  Manage and track your customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cropmate-primary"></div>
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any orders yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left">Order ID</th>
                          <th className="py-3 px-2 text-left">Date</th>
                          <th className="py-3 px-2 text-left">Customer</th>
                          <th className="py-3 px-2 text-left">Amount</th>
                          <th className="py-3 px-2 text-left">Status</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders?.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="py-3 px-2 font-medium">#{order.id.substring(0, 8)}</td>
                            <td className="py-3 px-2">{format(new Date(order.created_at), 'PP')}</td>
                            <td className="py-3 px-2">{order.buyer.full_name}</td>
                            <td className="py-3 px-2">{formatCurrency(order.total_amount)}</td>
                            <td className="py-3 px-2">
                              <Badge variant="outline" className={
                                order.status.toLowerCase() === 'delivered' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : order.status.toLowerCase() === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : order.status.toLowerCase() === 'processing'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : order.status.toLowerCase() === 'shipped'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Update Status</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default FarmerDashboardPage;
