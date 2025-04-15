
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your fresh produce is on its way to you!
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md flex items-center">
              <Truck className="h-5 w-5 text-cropmate-primary mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Delivery Expected</p>
                <p className="text-sm text-gray-500">Within 1-3 business days</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md flex items-center">
              <ShoppingBag className="h-5 w-5 text-cropmate-primary mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Order Updates</p>
                <p className="text-sm text-gray-500">Track your order in Order History</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              className="w-full"
              onClick={() => navigate('/order-history')}
            >
              View Order History
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/marketplace')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
