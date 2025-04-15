
import { CartItem, Listing, Order, Profile, OrderStatus, PaymentMethod, PaymentStatus } from './supabase';

export interface OrderWithDetails extends Order {
  listing?: ListingWithFarmer;
  buyer?: Profile;
  farmer?: Profile;
  order_status: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
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

export interface FarmerOrder {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_price: number;
  listing_unit: string;
  quantity: number;
  total_price: number;
  order_status: OrderStatus;
  payment_status: string;
  created_at: string;
  buyer: {
    id: string;
    full_name: string | null;
    phone: string | null;
  };
  delivery_address: string;
  delivery_notes: string | null;
}
