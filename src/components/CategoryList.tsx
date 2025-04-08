
import React from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  {
    id: 1,
    name: 'Vegetables',
    icon: '🥦',
    description: 'Fresh and seasonal vegetables directly from farms',
    color: 'bg-green-100'
  },
  {
    id: 2,
    name: 'Fruits',
    icon: '🍎',
    description: 'Juicy, ripened fruits from orchards across the country',
    color: 'bg-red-100'
  },
  {
    id: 3,
    name: 'Grains',
    icon: '🌾',
    description: 'Quality grains including rice, wheat, millets and more',
    color: 'bg-yellow-100'
  },
  {
    id: 4,
    name: 'Pulses',
    icon: '🥜',
    description: 'Protein-rich legumes and pulses sourced directly from farmers',
    color: 'bg-amber-100'
  },
  {
    id: 5,
    name: 'Spices',
    icon: '🌶️',
    description: 'Authentic spices that add flavor to all your dishes',
    color: 'bg-orange-100'
  },
  {
    id: 6,
    name: 'Dairy',
    icon: '🥛',
    description: 'Farm-fresh dairy products delivered to your doorstep',
    color: 'bg-blue-100'
  }
];

const CategoryList = () => {
  return (
    <section className="py-16 bg-cropmate-light-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">Explore our wide range of farm-fresh products organized by categories</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md ${category.color} border border-gray-100`}
            >
              <div className="mb-4 text-4xl">{category.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <Button variant="outline" className="text-cropmate-primary hover:bg-cropmate-primary/10 hover:text-cropmate-primary">
                Browse {category.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
