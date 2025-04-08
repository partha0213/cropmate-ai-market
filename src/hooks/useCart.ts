
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CartItem, Listing } from '@/types/supabase';

interface CartItemWithListing extends CartItem {
  listing: Listing;
}

export interface AddToCartParams {
  listingId: string;
  quantity: number;
}

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cartUpdating, setCartUpdating] = useState(false);
  
  // Fetch cart items with listing details for the current user
  const { data: cartItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async (): Promise<CartItemWithListing[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          user_id,
          listing_id,
          quantity,
          listing:listings(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Transform the data to ensure type safety
      return (data || []).map(item => ({
        ...item,
        listing: {
          ...item.listing as Listing,
          // Ensure the category is properly typed
          category: item.listing?.category as Listing['category'],
          quality_grade: item.listing?.quality_grade as Listing['quality_grade'],
        }
      }));
    },
    enabled: !!user,
  });
  
  // Add item to cart
  const addToCart = useMutation({
    mutationFn: async ({ listingId, quantity }: AddToCartParams) => {
      if (!user) throw new Error('You must be logged in to add items to cart');
      
      setCartUpdating(true);
      
      // Check if the item is already in the cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
        
        if (updateError) throw updateError;
        return { id: existingItem.id, added: false, updated: true };
      } else {
        // Add new item to cart
        const { data, error: insertError } = await supabase
          .from('cart_items')
          .insert([
            { user_id: user.id, listing_id: listingId, quantity }
          ])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return { id: data.id, added: true, updated: false };
      }
    },
    onSuccess: (result) => {
      setCartUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      
      if (result.added) {
        toast.success('Item added to cart');
      } else {
        toast.success('Cart updated');
      }
    },
    onError: (error: any) => {
      setCartUpdating(false);
      toast.error(error.message || 'Failed to add to cart');
    }
  });
  
  // Update cart item quantity
  const updateCartItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!user) throw new Error('You must be logged in to update cart');
      
      setCartUpdating(true);
      
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { id, removed: true };
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { id, quantity, updated: true };
      }
    },
    onSuccess: () => {
      setCartUpdating(false);
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Cart updated');
    },
    onError: (error: any) => {
      setCartUpdating(false);
      toast.error(error.message || 'Failed to update cart');
    }
  });
  
  // Remove item from cart
  const removeFromCart = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('You must be logged in to remove items');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove item');
    }
  });
  
  // Clear cart
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('You must be logged in to clear cart');
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      return { cleared: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear cart');
    }
  });
  
  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.listing.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    cartItems,
    isLoading,
    error,
    cartUpdating,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetch,
    cartTotal,
    itemsCount,
  };
}
