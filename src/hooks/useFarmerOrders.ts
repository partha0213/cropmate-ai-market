
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FarmerOrder } from '@/types/order';
import { OrderStatus } from '@/types/supabase';

export const useFarmerOrders = (filter: 'all' | OrderStatus = 'all') => {
  const { user } = useAuth();
  
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
            payment_status: (order.payment_status || 'pending') as any,
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
  
  return {
    orders,
    isLoading,
    error
  };
};
