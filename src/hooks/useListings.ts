
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CropCategory, QualityGrade, Listing } from '@/types/supabase';

export interface ListingFilters {
  category: CropCategory | null;
  quality: QualityGrade | null;
  minPrice: number | null;
  maxPrice: number | null;
  searchTerm: string | null;
  farmerId?: string;
  nearby?: {
    lat: number;
    lng: number;
    radius?: number; // in km
  };
}

export const useListings = (filters: ListingFilters = {
  category: null,
  quality: null,
  minPrice: null,
  maxPrice: null,
  searchTerm: null
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async (): Promise<Listing[]> => {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.quality) {
        query = query.eq('quality_grade', filters.quality);
      }

      if (filters.minPrice !== null && filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }

      // Location-based filtering
      if (filters.nearby && filters.nearby.lat && filters.nearby.lng) {
        // This is a simplified version - for production, you may want to use PostGIS or a more sophisticated approach
        const radius = filters.nearby.radius || 10; // default 10km
        
        // Simple bounding box filter (not perfect but works for small distances)
        const latDiff = radius / 111.32; // 1 degree of latitude is approximately 111.32 km
        const lngDiff = radius / (111.32 * Math.cos(filters.nearby.lat * Math.PI / 180));
        
        query = query
          .gte('location_lat', filters.nearby.lat - latDiff)
          .lte('location_lat', filters.nearby.lat + latDiff)
          .gte('location_lng', filters.nearby.lng - lngDiff)
          .lte('location_lng', filters.nearby.lng + lngDiff);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching listings: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
