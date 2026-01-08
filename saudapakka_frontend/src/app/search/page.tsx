"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/listings/property-card";
import SearchBar from "@/components/search/SearchBar"; // Import the component
import { Home } from "lucide-react";

// 1. The Search Logic Component
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch when URL Params change (driven by SearchBar)
  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const apiParams = new URLSearchParams();

      // 1. Search Query
      const q = searchParams.get("q");
      if (q) apiParams.append("search", q);

      // 2. Listing Type (SALE / RENT)
      const type = searchParams.get("type");
      if (type) apiParams.append("listing_type", type);

      // 3. Property Type
      const propType = searchParams.get("property");
      if (propType && propType !== "ALL") apiParams.append("property_type", propType);

      // 4. BHK
      const bhk = searchParams.get("bhk");
      if (bhk && bhk !== "ANY") {
        if (bhk === "4+") apiParams.append("bhk_config__gte", "4");
        else apiParams.append("bhk_config", bhk);
      }

      // 5. Budget Parsing
      const budget = searchParams.get("budget");
      if (budget && budget !== "ANY") {
        const { min, max } = parseBudget(budget);
        if (min) apiParams.append("min_price", min.toString());
        if (max) apiParams.append("max_price", max.toString());
      }

      // 6. Availability (Optional default: only show Active?)
      // apiParams.append("availability_status", "IMMEDIATE"); // Example if needed

      const res = await api.get(`/api/properties/?${apiParams.toString()}`);
      setListings(res.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse budget strings into numbers
  const parseBudget = (budgetCode: string) => {
    // Values in Rupees
    const L = 100000;
    const CR = 10000000;

    switch (budgetCode) {
      case "50L": return { min: 0, max: 50 * L };
      case "50L-1CR": return { min: 50 * L, max: 1 * CR };
      case "1CR-2CR": return { min: 1 * CR, max: 2 * CR };
      case "2CR-5CR": return { min: 2 * CR, max: 5 * CR };
      case "5CR+": return { min: 5 * CR, max: null }; // Backend handles missing max as open-ended
      default: return { min: null, max: null };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#4A9B6D] selection:text-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative bg-[#1B3A2C] pt-32 pb-40 overflow-hidden">
        {/* Decorative Grid Pattern (Keep subtle) */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Find Your <span className="text-[#4A9B6D]">Dream</span> Property
          </h1>

          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* --- RESULTS SECTION --- */}
      <div className="relative z-20 -mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 min-h-[600px]">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Search Results</h2>
              <p className="text-gray-500 text-sm">Best properties matching your criteria</p>
            </div>
            <div className="mt-4 sm:mt-0 px-4 py-2 bg-gray-50 text-[#2D5F3F] rounded-full text-sm font-semibold border border-gray-100">
              {listings.length} Properties found
            </div>
          </div>

          {loading ? (
            /* Premium Skeleton Loading */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="space-y-4 animate-pulse group">
                  <div className="h-64 bg-gray-200 rounded-3xl w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" />
                  </div>
                  <div className="space-y-2 px-2">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Home className="w-10 h-10 text-[#2D5F3F]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Found</h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                We couldn't find any properties matching your current filters. Try adjusting your budget or selecting a different location.
              </p>
            </div>
          ) : (
            /* Property Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((item: any) => (
                <div key={item.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                  <PropertyCard property={item} />
                </div>
              ))}
            </div>
          )}
        </div>
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