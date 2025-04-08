
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative bg-cropmate-light-bg">
      <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
        {/* Text content */}
        <div className="flex-1 space-y-6 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cropmate-primary leading-tight animate-fade-in">
            Farm Fresh <span className="text-cropmate-secondary">Crops</span> Direct to Your <span className="text-cropmate-accent">Doorstep</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-lg mx-auto md:mx-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Connect directly with local farmers, get AI-graded quality produce, and support sustainable agriculture with CropMarket-Mate.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button className="bg-cropmate-primary hover:bg-cropmate-primary/90 text-white px-8 py-6 rounded-md text-lg">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-cropmate-secondary text-cropmate-secondary hover:bg-cropmate-secondary/10 px-8 py-6 rounded-md text-lg">
              Become a Seller
            </Button>
          </div>
          <div className="flex justify-center md:justify-start space-x-8 pt-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-cropmate-primary">500+</p>
              <p className="text-sm text-gray-600">Farmers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cropmate-primary">1000+</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cropmate-primary">50+</p>
              <p className="text-sm text-gray-600">Cities</p>
            </div>
          </div>
        </div>
        
        {/* Hero image */}
        <div className="flex-1 relative animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <img 
            src="https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
            alt="Fresh vegetables and fruits from farm" 
            className="rounded-2xl shadow-xl object-cover w-full h-[500px]"
          />
          <div className="absolute -bottom-5 -left-5 md:-left-10 bg-white p-4 rounded-lg shadow-lg w-40 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-medium">AI Quality Checked</p>
            </div>
          </div>
          <div className="absolute top-10 -right-5 md:-right-10 bg-white p-4 rounded-lg shadow-lg animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="text-center">
              <p className="text-lg font-bold text-cropmate-accent">30% OFF</p>
              <p className="text-xs">First Order</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
