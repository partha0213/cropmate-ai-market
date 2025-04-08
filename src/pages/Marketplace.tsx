import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListings, ListingFilters } from '@/hooks/useListings';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CropCategory, QualityGrade } from '@/types/supabase';
import { MapPin, Star, ShoppingCart, Filter, Grid3X3, List } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Marketplace = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ListingFilters>({
    category: null,
    quality: null,
    minPrice: null,
    maxPrice: null,
    searchTerm: null,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: listings, isLoading, error } = useListings(filters);
  const { addToCart } = useCart();

  const handleAddToCart = (listingId: string) => {
    addToCart.mutate({ listingId, quantity: 1 });
  };

  const updateFilter = (key: keyof ListingFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: null,
      quality: null,
      minPrice: null,
      maxPrice: null,
      searchTerm: null,
    });
  };

  const categories: { value: CropCategory; label: string }[] = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'pulses', label: 'Pulses' },
    { value: 'spices', label: 'Spices' },
    { value: 'dairy', label: 'Dairy' }
  ];

  const qualityGrades: { value: QualityGrade; label: string }[] = [
    { value: 'A', label: 'Premium (A)' },
    { value: 'B', label: 'Standard (B)' },
    { value: 'C', label: 'Economy (C)' }
  ];

  const renderQualityBadge = (quality: QualityGrade) => {
    const colorMap = {
      'A': 'bg-green-500',
      'B': 'bg-yellow-500',
      'C': 'bg-orange-500'
    };

    return (
      <Badge className={`${colorMap[quality]} text-white`}>
        Grade {quality}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter size={18} />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search crops..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => updateFilter('searchTerm', e.target.value || null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category || ''}
                    onValueChange={(value) => updateFilter('category', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality Grade</Label>
                  <Select
                    value={filters.quality || ''}
                    onValueChange={(value) => updateFilter('quality', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Grade</SelectItem>
                      {qualityGrades.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Price Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ₹{filters.minPrice || 0} - ₹{filters.maxPrice || 1000}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <Slider 
                      defaultValue={[0, 1000]} 
                      max={1000} 
                      step={10}
                      onValueChange={(values) => {
                        updateFilter('minPrice', values[0]);
                        updateFilter('maxPrice', values[1]);
                      }}
                    />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Marketplace</h1>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid3X3 size={18} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={18} />
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Error loading products. Please try again later.</p>
              </div>
            ) : listings?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
                <Button 
                  variant="link" 
                  onClick={resetFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {listings?.map((listing) => (
                  viewMode === 'grid' ? (
                    <Card key={listing.id} className="overflow-hidden h-full flex flex-col">
                      <Link to={`/product/${listing.id}`} className="relative h-48 overflow-hidden">
                        <img 
                          src={listing.image_url || listing.images?.[0] || '/placeholder.svg'} 
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                        {listing.quality_grade && (
                          <div className="absolute top-2 right-2">
                            {renderQualityBadge(listing.quality_grade as QualityGrade)}
                          </div>
                        )}
                      </Link>
                      
                      <CardContent className="flex-1 pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link to={`/product/${listing.id}`} className="hover:underline">
                              <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
                            </Link>
                            <p className="text-cropmate-primary font-medium">
                              ₹{listing.price}/{listing.unit || 'kg'}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {listing.description}
                        </p>
                        
                        {listing.location_address && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span className="truncate">{listing.location_address}</span>
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <Button 
                          className="w-full" 
                          onClick={() => handleAddToCart(listing.id)}
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <Link to={`/product/${listing.id}`} className="md:w-1/4 h-40 md:h-auto">
                          <img 
                            src={listing.image_url || listing.images?.[0] || '/placeholder.svg'} 
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        
                        <div className="flex-1 p-4">
                          <div className="flex justify-between">
                            <div>
                              <Link to={`/product/${listing.id}`} className="hover:underline">
                                <h3 className="font-semibold text-lg">{listing.title}</h3>
                              </Link>
                              <p className="text-cropmate-primary font-medium">
                                ₹{listing.price}/{listing.unit || 'kg'}
                              </p>
                            </div>
                            
                            {listing.quality_grade && (
                              <div>{renderQualityBadge(listing.quality_grade as QualityGrade)}</div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-2">{listing.description}</p>
                          
                          {listing.location_address && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <MapPin size={14} className="mr-1" />
                              <span>{listing.location_address}</span>
                            </div>
                          )}
                          
                          <div className="mt-4">
                            <Button 
                              onClick={() => handleAddToCart(listing.id)}
                              className="w-full md:w-auto"
                            >
                              <ShoppingCart size={16} className="mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Marketplace;
