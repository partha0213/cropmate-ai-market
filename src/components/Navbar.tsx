import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Menu, X, User, LogOut, Heart, Package, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import CartDisplay from "./CartDisplay";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, profile, signOut } = useAuth();
  const { cartItems, isLoading, itemsCount } = useCart();
  const navigate = useNavigate();
  
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/products' },
    { name: 'Farmers', path: '/farmers' },
    { name: 'About Us', path: '/about' },
  ];

  const getRoleSpecificLinks = () => {
    if (!profile) return [];
    
    switch (profile.role) {
      case 'farmer':
        return [
          { name: 'My Products', path: '/farmer/products' },
          { name: 'Add New Product', path: '/farmer/add-product' },
          { name: 'Sales Dashboard', path: '/farmer/dashboard' },
        ];
      case 'buyer':
        return [
          { name: 'My Orders', path: '/orders' },
          { name: 'Favorites', path: '/favorites' },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', path: '/admin' },
          { name: 'User Management', path: '/admin/users' },
          { name: 'Platform Analytics', path: '/admin/analytics' },
        ];
      case 'delivery':
        return [
          { name: 'Delivery Dashboard', path: '/delivery/dashboard' },
          { name: 'Assigned Orders', path: '/delivery/orders' },
        ];
      default:
        return [];
    }
  };
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-cropmate-primary font-[Poppins] font-bold text-2xl">Crop</span>
              <span className="text-cropmate-secondary font-[Poppins] font-bold text-2xl">Market</span>
              <span className="text-cropmate-accent font-[Poppins] font-bold text-2xl">-Mate</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path} 
                className="text-gray-700 hover:text-cropmate-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search crops..." 
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-cropmate-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 absolute left-3 text-gray-400" />
            </form>
            
            {user ? (
              <>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {itemsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-cropmate-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemsCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full md:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Your Cart</SheetTitle>
                    </SheetHeader>
                    <CartDisplay />
                  </SheetContent>
                </Sheet>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full" size="icon">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                        <AvatarFallback className="bg-cropmate-primary text-white">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-normal">
                        <div className="font-medium">{profile?.full_name || 'Your Account'}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {getRoleSpecificLinks().map((link) => (
                      <DropdownMenuItem key={link.path} asChild>
                        <Link to={link.path} className="cursor-pointer">
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-cropmate-primary hover:bg-cropmate-primary/90 text-white"
              >
                Login / Sign Up
              </Button>
            )}
          </div>

          <div className="flex md:hidden items-center space-x-4">
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="relative"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-cropmate-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemsCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                  </SheetHeader>
                  <CartDisplay />
                </SheetContent>
              </Sheet>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Search crops..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-cropmate-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 absolute left-3 text-gray-400" />
                <Button type="submit" size="sm" className="absolute right-1 bg-cropmate-primary">
                  Search
                </Button>
              </div>
            </form>
            
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="pt-2 pb-1 px-3">
                    <div className="text-xs uppercase font-semibold text-gray-500">Account</div>
                  </div>
                  
                  {getRoleSpecificLinks().map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-cropmate-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="inline-block mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors py-2 px-3 rounded-md hover:bg-gray-50 text-left"
                  >
                    <LogOut className="inline-block mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <Button 
                  onClick={() => {
                    navigate('/auth');
                    setIsMenuOpen(false);
                  }}
                  className="bg-cropmate-primary hover:bg-cropmate-primary/90 text-white mt-2"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
