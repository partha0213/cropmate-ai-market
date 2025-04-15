
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FarmerOrder } from '@/types/order';
import { OrderStatus } from '@/types/supabase';

interface FarmerOrderCardProps {
  order: FarmerOrder;
  getStatusBadge: (status: OrderStatus) => React.ReactNode;
  formatDate: (date: string) => string;
}

const FarmerOrderCard: React.FC<FarmerOrderCardProps> = ({ 
  order, 
  getStatusBadge, 
  formatDate 
}) => {
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

export default FarmerOrderCard;
