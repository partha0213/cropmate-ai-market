
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import LoginModal from "./LoginModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-cropmate-primary font-[Poppins] font-bold text-2xl">Crop</span>
              <span className="text-cropmate-secondary font-[Poppins] font-bold text-2xl">Market</span>
              <span className="text-cropmate-accent font-[Poppins] font-bold text-2xl">-Mate</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-cropmate-primary transition-colors">Home</a>
            <a href="/products" className="text-gray-700 hover:text-cropmate-primary transition-colors">Products</a>
            <a href="/farmers" className="text-gray-700 hover:text-cropmate-primary transition-colors">Farmers</a>
            <a href="/about" className="text-gray-700 hover:text-cropmate-primary transition-colors">About Us</a>
          </div>

          {/* Search, Cart & Login - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search crops..." 
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-cropmate-primary focus:border-transparent"
              />
              <Search className="w-5 h-5 absolute left-3 text-gray-400" />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-cropmate-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </Button>
            <Button 
              onClick={() => setIsLoginModalOpen(true)}
              className="bg-cropmate-primary hover:bg-cropmate-primary/90 text-white"
            >
              Login / Sign Up
            </Button>
          </div>

          {/* Mobile navigation button */}
          <div className="flex md:hidden items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-cropmate-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 animate-fade-in">
            <div className="flex flex-col space-y-4 px-4">
              <div className="relative flex items-center mb-2">
                <input 
                  type="text" 
                  placeholder="Search crops..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-cropmate-primary focus:border-transparent"
                />
                <Search className="w-5 h-5 absolute left-3 text-gray-400" />
              </div>
              <a href="/" className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 border-b">Home</a>
              <a href="/products" className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 border-b">Products</a>
              <a href="/farmers" className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 border-b">Farmers</a>
              <a href="/about" className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 border-b">About Us</a>
              <Button 
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="bg-cropmate-primary hover:bg-cropmate-primary/90 text-white w-full"
              >
                Login / Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
