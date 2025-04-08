
import React from 'react';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

// Sample product data
const featuredProducts = [
  {
    id: 1,
    name: 'Organic Red Apples',
    description: 'Premium organic red apples grown with natural farming methods. Sweet and juicy!',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
    farmer: {
      name: 'Green Valley Farms',
      location: 'Karnataka'
    },
    aiScore: 95,
    category: 'Fruits',
    unit: 'kg'
  },
  {
    id: 2,
    name: 'Farm Fresh Tomatoes',
    description: 'Vine-ripened tomatoes, perfect for salads and cooking. Grown without harmful pesticides.',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469',
    farmer: {
      name: 'Sunshine Organics',
      location: 'Maharashtra'
    },
    aiScore: 88,
    category: 'Vegetables',
    unit: 'kg'
  },
  {
    id: 3,
    name: 'Basmati Rice',
    description: 'Premium long-grain aromatic rice. Aged for perfect taste and aroma.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6',
    farmer: {
      name: 'Punjab Harvests',
      location: 'Punjab'
    },
    aiScore: 92,
    category: 'Grains',
    unit: 'kg'
  },
  {
    id: 4,
    name: 'Fresh Green Spinach',
    description: 'Nutrient-rich leafy greens harvested daily for maximum freshness.',
    price: 40,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    farmer: {
      name: 'Organic Greens Co.',
      location: 'Tamil Nadu'
    },
    aiScore: 86,
    category: 'Vegetables',
    unit: 'bunch'
  }
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-2">Discover our hand-picked selection of quality crops</p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 text-cropmate-primary hover:text-cropmate-primary/90">
            View All Products <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
