
export type UserRole = 'buyer' | 'farmer' | 'admin' | 'delivery';
export type CropCategory = 'vegetables' | 'fruits' | 'grains' | 'pulses' | 'spices' | 'dairy';
export type QualityGrade = 'A' | 'B' | 'C';
export type OrderStatus = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'razorpay' | 'stripe' | 'upi' | 'crypto' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  geo_lat?: number;
  geo_lng?: number;
  profile_complete?: boolean;
  created_products?: number;
  purchased_products?: number;
  created_at?: string;
}

export interface Listing {
  id: string;
  farmer_id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  image_url?: string;
  status: string;
  category?: CropCategory;
  quality_grade?: QualityGrade;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  unit?: string;
  ai_score?: number;
  images?: string[];
  created_at?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  listing_id: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_agent_id?: string;
  order_status?: OrderStatus;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  payment_id?: string;
  delivery_address?: string;
  delivery_notes?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  created_at?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  listing_id: string;
  quantity: number;
  created_at?: string;
}

export interface FavoriteSeller {
  id: string;
  buyer_id: string;
  farmer_id: string;
  created_at?: string;
}

export interface Review {
  id: string;
  order_id: string;
  buyer_id: string;
  farmer_id: string;
  listing_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface CropAnalysis {
  id: string;
  listing_id: string;
  image_url: string;
  quality_score?: number;
  predicted_grade?: QualityGrade;
  analysis_data?: any;
  created_at?: string;
}

export interface PricePrediction {
  id: string;
  crop_category: CropCategory;
  farmer_id?: string;
  suggested_price?: number;
  market_factors?: any;
  created_at?: string;
}
