
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { OrderStatus } from '@/types/supabase';

export const getStatusBadge = (status: OrderStatus) => {
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

export const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy');
};
