
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, Map } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';

// List of states in India
const states = [
  "All States",
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Punjab",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

const categories = [
  { id: "vegetables", label: "Vegetables" },
  { id: "fruits", label: "Fruits" },
  { id: "grains", label: "Grains" },
  { id: "pulses", label: "Pulses" },
  { id: "spices", label: "Spices" },
  { id: "dairy", label: "Dairy" },
];

const certifications = [
  { id: "organic", label: "Organic Certified" },
  { id: "pesticide-free", label: "Pesticide Free" },
  { id: "non-gmo", label: "Non-GMO" },
];

const SearchFilters = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [aiScore, setAiScore] = useState([60]);
  
  return (
    <div className="bg-white shadow-md rounded-lg mb-8">
      <div className="p-4">
        {/* Search bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for crops, vegetables, fruits..."
            className="pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-cropmate-primary focus:border-transparent"
          />
          <Button
            variant="ghost"
            className="ml-2 p-3 text-gray-600 hover:bg-gray-100"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">Filters</span>
          </Button>
          <Button
            variant="ghost"
            className="ml-2 p-3 text-gray-600 hover:bg-gray-100 hidden sm:flex"
          >
            <Map className="h-5 w-5" />
            <span className="ml-2 hidden md:inline">Near Me</span>
          </Button>
        </div>
        
        {/* Filters - collapsible */}
        {isFiltersOpen && (
          <div className="mt-4 pt-4 border-t animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Location</Label>
                <Select defaultValue="All States">
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price range filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </Label>
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mt-3"
                />
              </div>
              
              {/* AI Quality Score filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  AI Quality Score: {aiScore[0]}+
                </Label>
                <Slider
                  defaultValue={[60]}
                  min={0}
                  max={100}
                  step={5}
                  value={aiScore}
                  onValueChange={setAiScore}
                  className="mt-3"
                />
              </div>
              
              {/* Sort by */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select defaultValue="recommended">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium mb-3">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox id={`category-${category.id}`} />
                      <Label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Certifications */}
              <div>
                <h4 className="text-sm font-medium mb-3">Certifications</h4>
                <div className="grid grid-cols-1 gap-2">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center space-x-2">
                      <Checkbox id={`cert-${cert.id}`} />
                      <Label htmlFor={`cert-${cert.id}`} className="text-sm">
                        {cert.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsFiltersOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-cropmate-primary hover:bg-cropmate-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
