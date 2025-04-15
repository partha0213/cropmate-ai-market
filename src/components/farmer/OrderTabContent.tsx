
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { OrderStatus } from '@/types/supabase';
import { FarmerOrder } from '@/types/order';
import FarmerOrderCard from './FarmerOrderCard';
import { formatDate, getStatusBadge } from './orderUtils';

interface OrderTabContentProps {
  status: 'all' | OrderStatus;
  orders: FarmerOrder[] | undefined;
}

const OrderTabContent: React.FC<OrderTabContentProps> = ({ status, orders }) => {
  const filteredOrders = status === 'all' 
    ? orders 
    : orders?.filter(o => o.order_status === status);
    
  return (
    <TabsContent value={status} className="space-y-6">
      {filteredOrders && filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <FarmerOrderCard 
            key={order.id} 
            order={order} 
            getStatusBadge={getStatusBadge} 
            formatDate={formatDate} 
          />
        ))
      ) : (
        <div className="text-center py-12">
          <h3>No {status !== 'all' ? status : ''} orders</h3>
          <p>There are no orders {status !== 'all' ? `with status "${status}"` : 'to display'}.</p>
        </div>
      )}
    </TabsContent>
  );
};

export default OrderTabContent;
