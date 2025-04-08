
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, Truck } from 'lucide-react';

const OrderSuccessPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Order Placed Successfully!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-center items-center space-x-2 mb-2">
                <Truck className="h-5 w-5 text-gray-500" />
                <p className="font-medium">Delivery Information</p>
              </div>
              <p className="text-sm text-gray-600">
                You will receive an email confirmation shortly with your order details.
                You can also track your order status in your account.
              </p>
            </div>
            
            <div className="flex justify-center items-center gap-2 py-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <p className="text-sm text-gray-600">Order Placed</p>
              <div className="h-0.5 w-16 bg-gray-300"></div>
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <p className="text-sm text-gray-600">Processing</p>
              <div className="h-0.5 w-16 bg-gray-300"></div>
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <p className="text-sm text-gray-600">Shipped</p>
              <div className="h-0.5 w-16 bg-gray-300"></div>
              <div className="h-3 w-3 rounded-full bg-gray-300"></div>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link to="/order-history">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Order History
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/marketplace">
                Continue Shopping
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
