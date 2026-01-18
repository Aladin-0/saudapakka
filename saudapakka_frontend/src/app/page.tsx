"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Star, Shield, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import api from "@/lib/axios";
import PropertyCard from "@/components/listings/property-card";
import SearchBar from "@/components/search/SearchBar";

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/api/properties/");
        setListings(res.data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      {/* HERO SECTION - Mobile Responsive */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6 lg:px-8 min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
            alt="Luxury Real Estate"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5F3F]/92 via-[#1B3A2C]/88 to-[#4A9B6D]/85"></div>
        </div>

        {/* Decorative Floating Circles - Hidden on mobile */}
        <div className="absolute top-20 right-10 w-48 h-48 md:w-72 md:h-72 bg-white/5 rounded-full blur-3xl animate-float hidden sm:block"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-[#4A9B6D]/10 rounded-full blur-3xl animate-float-delayed hidden sm:block"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-center mb-8 md:mb-12">
            {/* Left Content Area */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Badge */}
              {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 animate-float">
                <div className="w-2 h-2 bg-[#4A9B6D] rounded-full animate-pulse"></div>
                <span className="text-white text-xs sm:text-sm font-medium">Trusted by 10,000+ Home Seekers</span>
              </div> */}

              {/* Main Headline - Responsive text sizes */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                India's First
                <span className="block bg-gradient-to-r from-white to-[#E8F5E9] bg-clip-text text-transparent">
                  100% Verified
                </span>
                Property Platform
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-xl mb-6 sm:mb-8 leading-relaxed mx-auto lg:mx-0">
                Direct owner contact. Legal documents verified.
                <span className="font-bold text-white"> Find your dream home with complete trust & transparency.</span>
              </p>

              {/* Stats Row - Responsive grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-10 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                  <div className="text-xs sm:text-sm text-white/70">Properties</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-white/70">Verified</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
                  <div className="text-xs sm:text-sm text-white/70">Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Property Cards - Hidden on mobile and tablet */}
            <div className="lg:col-span-5 relative h-96 hidden lg:block">
              {/* Floating Card 1 */}
              <div className="absolute top-0 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden animate-float-card">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Property"
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">₹1.2 Cr</span>
                    <span className="bg-[#4A9B6D]/10 text-[#4A9B6D] px-3 py-1 rounded-full text-xs font-semibold">VERIFIED</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">Luxury Villa</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Whitefield, Bangalore
                  </p>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute bottom-0 left-0 w-64 bg-white rounded-2xl shadow-2xl overflow-hidden animate-float" style={{ animationDelay: '1s' }}>
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Property"
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-gray-900">₹85 Lac</span>
                    <span className="bg-[#4A9B6D]/10 text-[#4A9B6D] px-2 py-1 rounded-full text-xs font-semibold">VERIFIED</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">Modern Apartment</h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    HSR Layout
                  </p>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/20 rounded-full blur-xl animate-float-delayed"></div>
            </div>
          </div>

          {/* SEARCH BAR COMPONENT */}
          <SearchBar />

          {/* Trust Indicators - Responsive */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 text-white/80 px-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">No Hidden Charges</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">100% Verified</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Expert Guidance</span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY ADDED PROPERTIES - Responsive Grid */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Recently Viewed</h2>
              <p className="text-sm sm:text-base text-gray-600">Pick up where you left off</p>
            </div>
            <Link href="/search" className="text-[#4A9B6D] font-semibold hover:text-[#2D5F3F] transition-colors duration-200 flex items-center gap-1 text-sm sm:text-base">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-80 sm:h-96 bg-gray-200 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-gray-500 text-sm sm:text-base">No properties found. Be the first to list!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {listings.slice(0, 6).map((item: any) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US SECTION - Responsive */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#E8F5E9]/30 to-white relative overflow-hidden">
        {/* Decorative Blob Shapes - Smaller on mobile */}
        <div className="absolute top-20 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-[#4A9B6D]/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-[#2D5F3F]/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header - Responsive */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <span className="text-[#4A9B6D] font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Premium Features for
              <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D]">
                {" "}Exceptional Living
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mt-3 sm:mt-4 px-4">
              Experience the difference with our industry-leading platform designed for property seekers
            </p>
          </div>

          {/* Features Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Feature 1 - Large Featured Card */}
            <div className="md:row-span-2 bg-gradient-to-br from-[#2D5F3F] to-[#4A9B6D] p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl text-white relative overflow-hidden group hover:-translate-y-2 transition-all duration-400">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">100% Verified Listings</h3>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  Every single property on our platform undergoes rigorous verification by our expert team. We validate ownership, legal documents, and property details to ensure complete authenticity and peace of mind.
                </p>
                <div className="flex items-center gap-2 text-white/90 group-hover:gap-3 transition-all">
                  <span className="font-semibold text-sm sm:text-base">Learn More</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl group hover:-translate-y-2 transition-all duration-400">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#4A9B6D]/20 to-[#2D5F3F]/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-[#4A9B6D]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Commute Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Calculate real-time travel distances to your workplace, schools, hospitals, and key locations using AI-powered route optimization.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl group hover:-translate-y-2 transition-all duration-400">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#4A9B6D]/20 to-[#2D5F3F]/20 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
                  <Star className="w-7 h-7 sm:w-8 sm:h-8 text-[#4A9B6D]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Detailed Area Score</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Get comprehensive insights on safety ratings, school quality, amenities, connectivity, and overall family-friendliness of neighborhoods.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 bg-gradient-to-r from-gray-50 to-[#E8F5E9]/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl group hover:-translate-y-2 transition-all duration-400">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#4A9B6D] to-[#2D5F3F] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-400">
                    <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Bank-Level Security</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                    Your data and transactions are protected with military-grade encryption, secure payment gateways, and complete transparency at every step.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#4A9B6D] mb-1">256-bit</div>
                    <div className="text-xs sm:text-sm text-gray-600">SSL Encryption</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#4A9B6D] mb-1">100%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Data Privacy</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#4A9B6D] mb-1">24/7</div>
                    <div className="text-xs sm:text-sm text-gray-600">Monitoring</div>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-[#4A9B6D] mb-1">Secure</div>
                    <div className="text-xs sm:text-sm text-gray-600">Payments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section - Responsive */}
          <div className="mt-10 sm:mt-12 md:mt-16 text-center">
            <Link href="/search" className="bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base hover:shadow-2xl inline-flex items-center gap-2 sm:gap-3 transition-all hover:-translate-y-1">
              <span>Explore other properties</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-card {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(2deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        
        @keyframes blob {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out 2s infinite;
        }
        
        .animate-float-card {
          animation: float-card 8s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
