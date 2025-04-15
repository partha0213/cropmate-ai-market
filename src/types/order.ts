
import { CartItem, Listing, Order, Profile } from './supabase';

export interface OrderWithDetails extends Order {
  listing?: Listing;
  buyer?: Profile;
  farmer?: Profile;
}

export interface ListingWithFarmer extends Listing {
  farmer: {
    full_name: string | null;
    phone: string | null;
  };
}

export interface CartItemWithDetails extends CartItem {
  listing: Listing;
}

export interface OrderSummary {
  items: CartItemWithDetails[];
  subtotal: number;
  total: number;
  shippingFee?: number;
  taxes?: number;
}
