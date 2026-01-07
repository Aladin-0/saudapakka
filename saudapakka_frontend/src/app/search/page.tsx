"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/listings/property-card";
import { Search, SlidersHorizontal, MapPin, Home } from "lucide-react";

// 1. The Search Logic Component
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial State from URL
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    type: searchParams.get("type") || "ALL",      // BUY, RENT, etc.
    propertyType: searchParams.get("property") || "ALL", // FLAT, VILLA
    maxPrice: searchParams.get("price") || "",
  });

  // Fetch when filters or URL changes
  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Build API Query String for Django
      const params = new URLSearchParams();
      if (filters.query) params.append("search", filters.query);
      if (filters.type !== "ALL") params.append("listing_type", filters.type);
      if (filters.propertyType !== "ALL") params.append("property_type", filters.propertyType);
      if (filters.maxPrice) params.append("price__lte", filters.maxPrice);

      const res = await api.get(`/api/properties/?${params.toString()}`);
      setListings(res.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = () => {
    // Update URL to match current filters (so user can copy-paste link)
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.type !== "ALL") params.set("type", filters.type);
    if (filters.propertyType !== "ALL") params.set("property", filters.propertyType);
    if (filters.maxPrice) params.set("price", filters.maxPrice);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* --- COMPACT HERO & FILTER BAR --- */}
      <div className="bg-dark-green pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-green/10 rounded-full blur-3xl -ml-10"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Results for <span className="text-accent-green">"{filters.query || "All Properties"}"</span>
          </h1>

          {/* Glass Filter Bar */}
          <div className="glass-effect p-4 rounded-3xl shadow-xl max-w-5xl mx-auto border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Search Input */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="City or Locality..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-accent-green outline-none"
                />
              </div>

              {/* Listing Type */}
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-accent-green outline-none bg-white"
              >
                <option value="ALL">Buy / Rent</option>
                <option value="SELL">Buy</option>
                <option value="RENT">Rent</option>
              </select>

              {/* Property Type */}
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-accent-green outline-none bg-white"
              >
                <option value="ALL">All Property Types</option>
                <option value="FLAT">Flat / Apartment</option>
                <option value="VILLA">Villa / Bungalow</option>
                <option value="LAND">Plot / Land</option>
              </select>

              {/* Search Button */}
              <button
                onClick={handleFilterSubmit}
                className="w-full bg-accent-green hover:bg-primary-green text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- RESULTS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600 font-medium">
            Found <span className="text-primary-green font-bold">{listings.length}</span> properties
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((item: any) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// 2. Wrap in Suspense (Required for Next.js Search Params)
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}