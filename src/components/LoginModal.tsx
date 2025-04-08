
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [userType, setUserType] = useState<string>("buyer");
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === "login" ? "Login to CropMarket-Mate" : "Sign Up with CropMarket-Mate"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs defaultValue="login" className="p-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-cropmate-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Button className="w-full bg-cropmate-primary hover:bg-cropmate-primary/90">
              Login
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>I want to register as:</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button 
                  type="button" 
                  variant={userType === "buyer" ? "default" : "outline"}
                  className={userType === "buyer" ? "bg-cropmate-primary" : ""}
                  onClick={() => setUserType("buyer")}
                >
                  Buyer
                </Button>
                <Button 
                  type="button" 
                  variant={userType === "seller" ? "default" : "outline"}
                  className={userType === "seller" ? "bg-cropmate-secondary" : ""}
                  onClick={() => setUserType("seller")}
                >
                  Farmer/Seller
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <a href="#" className="text-cropmate-primary hover:underline">terms and conditions</a>
              </Label>
            </div>
            <Button className="w-full bg-cropmate-primary hover:bg-cropmate-primary/90">
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginModal;
