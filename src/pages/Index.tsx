
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryList from '@/components/CategoryList';
import SearchFilters from '@/components/SearchFilters';
import FeaturedProducts from '@/components/FeaturedProducts';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <SearchFilters />
          </div>
        </div>
        <FeaturedProducts />
        <CategoryList />
        
        {/* AI Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Quality Assurance</h2>
                <p className="text-gray-600 mb-6">Our advanced AI technology analyzes every crop to ensure you get the best quality. Upload images of your produce to get instant quality assessment and fair pricing.</p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-cropmate-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Accurate quality grading within seconds</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-cropmate-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Price recommendations based on market data</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-cropmate-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Detection of defects or disease</span>
                  </li>
                  <li className="flex items-start">
                    <div className="rounded-full bg-green-100 p-1 mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-cropmate-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Fair pricing for both farmers and customers</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 relative">
                <img 
                  src="https://images.unsplash.com/photo-1551649001-7a2482d98d05?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3" 
                  alt="AI Crop Analysis" 
                  className="rounded-xl shadow-xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium">Quality: Premium (95%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-cropmate-light-bg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">How CropMarket-Mate Works</h2>
              <p className="text-gray-600 mt-2 max-w-xl mx-auto">Simple steps to connect farmers with consumers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-cropmate-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cropmate-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">List Your Crops</h3>
                <p className="text-gray-600">Farmers upload crop details with photos for AI quality grading and get fair price recommendations</p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-cropmate-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cropmate-secondary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Place Your Order</h3>
                <p className="text-gray-600">Customers browse AI-graded crops, add to cart and place secure orders with various payment options</p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-16 h-16 bg-cropmate-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cropmate-accent">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Delivery</h3>
                <p className="text-gray-600">Track your order in real-time as it makes its way from farm to your doorstep</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section - Simple version */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
              <p className="text-gray-600 mt-2 max-w-xl mx-auto">Trusted by farmers and consumers across the country</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-cropmate-primary/20 flex items-center justify-center text-cropmate-primary font-bold">RS</div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Rajesh Singh</h4>
                    <p className="text-sm text-gray-500">Farmer, Punjab</p>
                  </div>
                </div>
                <p className="text-gray-600">"The AI grading system has helped me get better prices for my premium crops. I've increased my earnings by 30% since joining CropMarket-Mate."</p>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-cropmate-accent/20 flex items-center justify-center text-cropmate-accent font-bold">AM</div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Anita Mehta</h4>
                    <p className="text-sm text-gray-500">Customer, Bangalore</p>
                  </div>
                </div>
                <p className="text-gray-600">"I love knowing exactly where my food comes from. The quality is consistently excellent and I appreciate supporting farmers directly."</p>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-cropmate-secondary/20 flex items-center justify-center text-cropmate-secondary font-bold">VP</div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Vijay Patel</h4>
                    <p className="text-sm text-gray-500">Farmer, Gujarat</p>
                  </div>
                </div>
                <p className="text-gray-600">"The platform has connected me with customers across the country. The payment system is secure and I receive my earnings promptly."</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
