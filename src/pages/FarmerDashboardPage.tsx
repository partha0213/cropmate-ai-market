
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { OrderStatus } from '@/types/supabase';
import { useFarmerOrders } from '@/hooks/useFarmerOrders';
import OrderTabContent from '@/components/farmer/OrderTabContent';

const FarmerDashboardPage = () => {
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const { orders, isLoading, error } = useFarmerOrders(filter);
  
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
  
  const statusTabs: Array<'all' | OrderStatus> = [
    'all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Farmer Dashboard</h1>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="mb-4">
            {statusTabs.map(status => (
              <TabsTrigger key={status} value={status}>
                {status === 'all' ? 'All Orders' : 
                 status === 'placed' ? 'New Orders' : 
                 status.charAt(0).toUpperCase() + status.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {statusTabs.map(status => (
            <OrderTabContent 
              key={status} 
              status={status} 
              orders={orders} 
            />
          ))}
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default FarmerDashboardPage;
