"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Correct import
import { Search, SlidersHorizontal, CheckCircle, Shield, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import api from "@/lib/axios";
import PropertyCard from "@/components/listings/property-card";

export default function HomePage() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  
  // Search States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // NEW: State to capture the filter dropdown selection
  const [propertyType, setPropertyType] = useState("ALL"); 

  // --- ACTIONS ---

  // 1. Improved Search Handler
  const handleSearch = () => {
    // Create a generic URLSearchParams object to manage query strings easily
    const params = new URLSearchParams();

    // Only add params if they have values
    if (searchQuery.trim()) {
      params.append("q", searchQuery);
    }
    if (propertyType !== "ALL") {
      params.append("property", propertyType);
    }

    // Push to search page with the constructed query string
    // e.g., /search?q=Pune&property=VILLA
    router.push(`/search?${params.toString()}`);
  };

  // 2. Fetch Recent Listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get("/api/listings/");
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
    <div className="bg-white min-h-screen font-sans">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-32 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center overflow-hidden">
        {/* Background & Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                 src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80" 
                 alt="Luxury Real Estate" 
                 className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-overlay"></div>
        </div>
        
        {/* Floating Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
            <div className="text-center lg:text-left mb-12">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6 animate-float">
                    <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Trusted by 10,000+ Home Seekers</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    Find Your <span className="block gradient-text">Perfect Home</span> With Confidence
                </h2>
                
                <p className="text-xl text-white/90 max-w-xl mb-8 leading-relaxed lg:mx-0 mx-auto">
                    Experience India's first <span className="font-bold text-white">100% verified</span> real estate platform.
                </p>
            </div>
            
            {/* --- INTERACTIVE SEARCH BAR --- */}
            <div className="max-w-4xl mx-auto lg:mx-0">
                <div className="glass-effect rounded-full shadow-2xl p-2 flex items-center">
                    <div className="pl-4 pr-3">
                        <Search className="w-5 h-5 text-accent-green" />
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Search city, locality, or property..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base py-2.5 pr-4 focus:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        // FIXED: Safer enter key check
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSearch() }}
                    />
                    
                    <div className="h-10 w-px bg-gray-300 mx-3 hidden sm:block"></div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium text-sm transition-all">
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </button>
                    
                    <button 
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-primary-green to-accent-green text-white px-8 py-3 rounded-full font-semibold text-sm hover:shadow-lg flex items-center gap-2 ml-2 hover:scale-105 transition-transform"
                    >
                        Search
                    </button>
                </div>
                
                {/* Expandable Filters */}
                <div className={`mt-4 transition-all duration-500 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="glass-effect rounded-3xl p-6 shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Property Type</label>
                                {/* FIXED: This select is now controlled by React State */}
                                <select 
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className="w-full p-3 rounded-xl border-2 border-gray-100 bg-white focus:border-accent-green outline-none"
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="FLAT">Flat / Apartment</option>
                                    <option value="VILLA">Villa / Bungalow</option>
                                    <option value="LAND">Plot / Land</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- LIVE LISTINGS --- */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Recently Added</h2>
                <Link href="/search" className="text-accent-green font-semibold hover:text-primary-green flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[1,2,3].map(i => <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : listings.length === 0 ? (
                 <div className="text-center py-20 text-gray-500">No properties found. Be the first to list!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listings.slice(0, 6).map((item: any) => (
                        <PropertyCard key={item.id} property={item} />
                    ))}
                </div>
            )}
        </div>
      </section>

      <Footer />
    </div>
  );
}