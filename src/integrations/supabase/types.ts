export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          quantity: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          ai_score: number | null
          category: string | null
          created_at: string | null
          description: string | null
          farmer_id: string
          id: string
          image_url: string | null
          images: string[] | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          price: number
          quality_grade: string | null
          quantity: number
          status: string | null
          title: string
          unit: string | null
        }
        Insert: {
          ai_score?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          farmer_id: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          price: number
          quality_grade?: string | null
          quantity: number
          status?: string | null
          title: string
          unit?: string | null
        }
        Update: {
          ai_score?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          farmer_id?: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          price?: number
          quality_grade?: string | null
          quantity?: number
          status?: string | null
          title?: string
          unit?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          buyer_id: string
          created_at: string | null
          delivery_address: string | null
          delivery_agent_id: string | null
          delivery_notes: string | null
          expected_delivery_date: string | null
          id: string
          listing_id: string
          order_status: string | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          quantity: number
          status: string | null
          total_price: number
        }
        Insert: {
          actual_delivery_date?: string | null
          buyer_id: string
          created_at?: string | null
          delivery_address?: string | null
          delivery_agent_id?: string | null
          delivery_notes?: string | null
          expected_delivery_date?: string | null
          id?: string
          listing_id: string
          order_status?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity: number
          status?: string | null
          total_price: number
        }
        Update: {
          actual_delivery_date?: string | null
          buyer_id?: string
          created_at?: string | null
          delivery_address?: string | null
          delivery_agent_id?: string | null
          delivery_notes?: string | null
          expected_delivery_date?: string | null
          id?: string
          listing_id?: string
          order_status?: string | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          quantity?: number
          status?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          created_products: number | null
          email: string | null
          full_name: string | null
          geo_lat: number | null
          geo_lng: number | null
          id: string
          phone: string | null
          profile_complete: boolean | null
          purchased_products: number | null
          role: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_products?: number | null
          email?: string | null
          full_name?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id: string
          phone?: string | null
          profile_complete?: boolean | null
          purchased_products?: number | null
          role?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          created_products?: number | null
          email?: string | null
          full_name?: string | null
          geo_lat?: number | null
          geo_lng?: number | null
          id?: string
          phone?: string | null
          profile_complete?: boolean | null
          purchased_products?: number | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
