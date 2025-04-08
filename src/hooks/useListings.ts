
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Listing, CropCategory, QualityGrade } from '@/types/supabase';

export interface ListingFilters {
  category?: CropCategory | null;
  quality?: QualityGrade | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  searchTerm?: string | null;
  farmerId?: string | null;
  nearby?: boolean;
  userLat?: number;
  userLng?: number;
  maxDistance?: number; // in km
}

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select(`
          *,
          farmer:profiles(id, full_name, avatar_url, address)
        `)
        .eq('status', 'active');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.quality) {
        query = query.eq('quality_grade', filters.quality);
      }

      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }

      // For nearby filtering, we'd ideally use PostGIS in Supabase
      // As a fallback, we'll fetch all and filter by distance in the client side

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let filteredData = data;

      // Client-side distance calculation if nearby flag is true
      if (filters.nearby && filters.userLat && filters.userLng) {
        filteredData = data.filter(listing => {
          if (!listing.location_lat || !listing.location_lng) return false;
          
          const distance = calculateDistance(
            filters.userLat!,
            filters.userLng!,
            listing.location_lat,
            listing.location_lng
          );
          
          return distance <= (filters.maxDistance || 50); // Default 50km if not specified
        });
      }

      return filteredData;
    },
  });
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
