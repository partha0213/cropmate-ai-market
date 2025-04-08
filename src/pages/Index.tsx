
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero'; // Changed from { Hero } to default import
import FeaturedProducts from '@/components/FeaturedProducts';
import CategoryList from '@/components/CategoryList';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, profile } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      
      {user && profile && (
        <div className="container mx-auto px-4 py-6 mt-8 bg-white rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Welcome back, {profile.full_name || 'there'}!
              </h2>
              <p className="text-gray-600">
                {profile.role === 'farmer' 
                  ? 'Manage your crops and track your sales'
                  : 'Browse fresh produce directly from local farms'}
              </p>
            </div>
            {profile.role === 'farmer' && (
              <a 
                href="/farmer/add-product" 
                className="btn-primary"
              >
                Add New Listing
              </a>
            )}
          </div>
        </div>
      )}
      
      <FeaturedProducts />
      <CategoryList />
      <Footer />
    </div>
  );
};

export default Index;
