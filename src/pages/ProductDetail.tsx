
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Star, 
  MapPin, 
  Truck, 
  Calendar, 
  Package, 
  AlertTriangle 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Listing } from '@/types/supabase';

interface ProductWithFarmer extends Listing {
  farmer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    address: string | null;
    phone: string | null;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          farmer:profiles(id, full_name, avatar_url, address, phone)
        `)
        .eq('id', id as string)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data as unknown as ProductWithFarmer;
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to your cart');
      navigate('/auth');
      return;
    }

    if (!product) return;
    
    addToCart.mutate({ 
      listingId: product.id, 
      quantity 
    });
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1);
    } else {
      toast.warning('Cannot exceed available quantity');
    }
  };

  const renderQualityBadge = (quality: string) => {
    const colorMap: Record<string, string> = {
      'A': 'bg-green-500',
      'B': 'bg-yellow-500',
      'C': 'bg-orange-500'
    };

    return (
      <Badge className={`${colorMap[quality] || 'bg-gray-500'} text-white`}>
        Grade {quality}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-center">Product Not Found</h1>
        <p className="text-gray-600 mb-6 text-center">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const farmer = product.farmer as any;
  const images = product.images || [];
  if (product.image_url && !images.includes(product.image_url)) {
    images.unshift(product.image_url);
  }
  if (images.length === 0) {
    images.push('/placeholder.svg');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2" size={16} />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
              <img 
                src={images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer w-20 h-20 rounded border overflow-hidden
                      ${index === activeImage ? 'ring-2 ring-cropmate-primary' : 'opacity-70'}
                    `}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.title} - image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold">{product.title}</h1>
                  {product.quality_grade && renderQualityBadge(product.quality_grade)}
                </div>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cropmate-primary">
                    ₹{product.price}
                  </span>
                  <span className="text-gray-600">per {product.unit || 'kg'}</span>
                </div>
                
                {product.location_address && (
                  <div className="flex items-center mt-4 text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    {product.location_address}
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="prose prose-sm max-w-none text-gray-700 mb-6">
                  <p>{product.description}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-gray-700">Category</div>
                    <div className="text-sm">{product.category || 'General'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-gray-700">Available</div>
                    <div className="text-sm">{product.quantity} {product.unit || 'kg'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-gray-700">Quality</div>
                    <div className="text-sm">{product.quality_grade || 'N/A'} Grade</div>
                  </div>
                </div>
                
                {/* Farmer Card */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Seller Information</h3>
                    <div className="flex items-center">
                      <Avatar className="mr-3 h-10 w-10">
                        <AvatarImage src={farmer.avatar_url} alt={farmer.full_name} />
                        <AvatarFallback>
                          {farmer.full_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{farmer.full_name}</div>
                        <div className="text-sm text-gray-500">Verified Farmer</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Action Section */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 whitespace-nowrap">Quantity:</div>
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={increaseQuantity}
                      disabled={product.quantity && quantity >= product.quantity}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="ml-4 text-sm text-gray-500">
                    ({product.quantity} available)
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="flex-1" 
                    size="lg"
                    onClick={() => {
                      handleAddToCart();
                      navigate('/checkout');
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="details" className="flex-1">Product Details</TabsTrigger>
            <TabsTrigger value="shipping" className="flex-1">Shipping Info</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="space-y-4">
                  <p>
                    {product.description || 'No detailed description available for this product.'}
                  </p>
                  
                  {product.ai_score && (
                    <div className="mt-4">
                      <h4 className="font-medium">AI Quality Assessment</h4>
                      <div className="mt-2 bg-gray-100 rounded-full h-4 w-full">
                        <div 
                          className="h-full bg-cropmate-primary rounded-full" 
                          style={{ width: `${product.ai_score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Truck className="mr-3 text-cropmate-primary" />
                    <div>
                      <h4 className="font-medium">Delivery</h4>
                      <p className="text-sm text-gray-600">
                        Usually ships within 1-2 business days. Delivery time depends on your location.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package className="mr-3 text-cropmate-primary" />
                    <div>
                      <h4 className="font-medium">Packaging</h4>
                      <p className="text-sm text-gray-600">
                        Products are carefully packaged to ensure freshness and prevent damage during transit.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="mr-3 text-cropmate-primary" />
                    <div>
                      <h4 className="font-medium">Harvest Date</h4>
                      <p className="text-sm text-gray-600">
                        Our products are harvested fresh before shipping to ensure maximum quality and shelf life.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet for this product.</p>
                  {user && (
                    <Button variant="link" className="mt-2">
                      Be the first to write a review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
