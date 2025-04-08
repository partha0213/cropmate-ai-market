
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import AIBadge from './AIBadge';

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  farmer: {
    name: string;
    location: string;
  };
  aiScore: number;
  category: string;
  unit: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  description,
  price,
  imageUrl,
  farmer,
  aiScore,
  category,
  unit
}) => {
  return (
    <div className="product-card h-full flex flex-col">
      {/* Image container */}
      <div className="relative overflow-hidden h-48">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/70 hover:bg-white text-gray-700 rounded-full w-8 h-8"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute top-2 left-2">
          <AIBadge score={aiScore} />
        </div>
        <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-0.5 rounded text-xs text-gray-700">
          {category}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg text-gray-900 hover:text-cropmate-primary transition-colors">
            {name}
          </h3>
          <div className="text-cropmate-accent font-bold">
            ₹{price}/{unit}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        
        <div className="text-xs text-gray-500 mb-3">
          <span>From: {farmer.name} • {farmer.location}</span>
        </div>
        
        <div className="mt-auto">
          <Button className="w-full bg-cropmate-primary hover:bg-cropmate-primary/90 text-white">
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
