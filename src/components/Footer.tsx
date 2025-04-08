
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, Twitter, Youtube, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cropmate-dark-bg text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="mb-12 p-6 bg-cropmate-primary/20 rounded-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-xl font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-gray-300 max-w-md">Stay updated with the latest crops, seasonal offers, and farming tips.</p>
            </div>
            <div className="w-full md:w-auto flex-1 max-w-md">
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/10 border-gray-700 focus:border-cropmate-primary text-white placeholder:text-gray-400"
                />
                <Button className="bg-cropmate-accent hover:bg-cropmate-accent/90 text-black">
                  <Send className="h-4 w-4 mr-2" /> Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company & Logo */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-cropmate-primary font-[Poppins] font-bold text-2xl">Crop</span>
              <span className="text-cropmate-secondary font-[Poppins] font-bold text-2xl">Market</span>
              <span className="text-cropmate-accent font-[Poppins] font-bold text-2xl">-Mate</span>
            </div>
            <p className="text-gray-400 mb-4">Connecting farmers and consumers for a sustainable agricultural ecosystem.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cropmate-accent">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Farmers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* For Farmers & Customers */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cropmate-accent">For Users</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Become a Seller</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Delivery Information</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Quality Grading</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing & Earnings</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support Center</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cropmate-accent">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li>123 Agri Tower, Digital Farm Road</li>
              <li>Bangalore, Karnataka 560001</li>
              <li>Email: support@cropmarket-mate.com</li>
              <li>Phone: +91 1234567890</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 CropMarket-Mate. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors mb-2 md:mb-0">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors mb-2 md:mb-0">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors mb-2 md:mb-0">Shipping Policy</a>
            <a href="#" className="hover:text-white transition-colors mb-2 md:mb-0">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
