
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem, Listing } from '@/types/supabase';

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get cart items with product details
  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          listing:listings(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        toast.error('Failed to load cart items');
        throw error;
      }

      return cartItems;
    },
    enabled: !!user,
  });

  // Add to cart
  const addToCart = useMutation({
    mutationFn: async ({ listingId, quantity }: { listingId: string; quantity: number }) => {
      if (!user) throw new Error('User must be logged in');

      // Check if item already exists in cart
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (existingItems) {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItems.quantity + quantity })
          .eq('id', existingItems.id)
          .select();

        if (error) throw error;
        return data;
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert([
            { user_id: user.id, listing_id: listingId, quantity }
          ])
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Added to cart');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  // Update cart item quantity
  const updateCartItem = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (!user) throw new Error('User must be logged in');

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', user.id);

        if (error) throw error;
        return null;
      } else {
        // Update quantity
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId)
          .eq('user_id', user.id)
          .select();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cart');
    },
  });

  // Remove from cart
  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;
      return cartItemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Item removed from cart');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });

  // Clear entire cart
  const clearCart = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
      toast.success('Cart cleared');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });

  // Calculate cart total price
  const calculateTotal = () => {
    if (!cartQuery.data) return 0;
    
    return cartQuery.data.reduce((total, item) => {
      const listing = item.listing as Listing;
      return total + (listing.price * item.quantity);
    }, 0);
  };

  return {
    cart: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    totalPrice: calculateTotal(),
    itemCount: cartQuery.data?.length || 0,
  };
}
