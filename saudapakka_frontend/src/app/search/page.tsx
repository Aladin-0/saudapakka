"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PropertyCardVertical from "@/components/listings/property-card-vertical";
import SearchBar from "@/components/search/SearchBar";
import { Home, ChevronDown, ChevronUp, X, SlidersHorizontal, MapPin, Check, Loader2 } from "lucide-react";

// Filter Section Component
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-800 hover:text-[#2D5F3F] transition-colors text-sm"
      >
        {title}
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}

// The Search Logic Component
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Working Filter States (matches backend)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [bhkConfigs, setBhkConfigs] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("-created_at");

  // Fetch when URL Params change - Sync State & Fetch
  useEffect(() => {
    // 1. Sync State with URL
    const pTypes = searchParams.getAll("property_type");
    // Fallback for singular 'property' param from SearchBar
    const pSingle = searchParams.get("property");
    if (pTypes.length > 0) {
      setPropertyTypes(pTypes);
    } else if (pSingle) {
      setPropertyTypes([pSingle]);
    } else {
      setPropertyTypes([]);
    }

    const bhk = searchParams.getAll("bhk");
    setBhkConfigs(bhk);

    const avail = searchParams.getAll("availability");
    setAvailability(avail);

    const minP = searchParams.get("min_price");
    const maxP = searchParams.get("max_price");

    // Handle Presets from SearchBar "budget" param
    const budgetPreset = searchParams.get("budget");
    if (minP) setBudgetMin(minP);
    else if (budgetPreset === "50L-1CR") setBudgetMin("5000000");
    else if (budgetPreset === "1CR-2CR") setBudgetMin("10000000");
    else if (budgetPreset === "2CR-5CR") setBudgetMin("20000000");
    else if (budgetPreset === "5CR+") setBudgetMin("50000000");
    else setBudgetMin("");

    if (maxP) setBudgetMax(maxP);
    else if (budgetPreset === "50L") setBudgetMax("5000000");
    else if (budgetPreset === "50L-1CR") setBudgetMax("10000000");
    else if (budgetPreset === "1CR-2CR") setBudgetMax("20000000");
    else if (budgetPreset === "2CR-5CR") setBudgetMax("50000000");
    else setBudgetMax("");

    const sort = searchParams.get("ordering");
    if (sort) setSortBy(sort);

    // 2. Fetch Data
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const apiParams = new URLSearchParams();

      // Basic Search
      const q = searchParams.get("q");
      if (q) apiParams.append("search", q);

      const type = searchParams.get("type"); // listing_type
      if (type) apiParams.append("listing_type", type);

      // Property Type
      // We read from URL directly for API call to ensure consistency, 
      // but we can also use the state since we just synced it. 
      // Let's use URL params for truth.
      const pTypes = searchParams.getAll("property_type");
      if (pTypes.length > 0) {
        pTypes.forEach(pt => apiParams.append("property_type", pt));
      } else if (searchParams.get("property")) {
        apiParams.append("property_type", searchParams.get("property")!);
      }

      // BHK
      const bhks = searchParams.getAll("bhk");
      if (bhks.length > 0) {
        bhks.forEach(bhk => {
          if (bhk === "5+") apiParams.append("bhk_config__gte", "5");
          else apiParams.append("bhk_config", bhk);
        });
      }

      // Budget
      // Prioritize explicit min/max, then preset
      const minP = searchParams.get("min_price");
      const maxP = searchParams.get("max_price");
      const budgetPreset = searchParams.get("budget");

      if (minP) apiParams.append("min_price", minP);
      else if (budgetPreset === "50L-1CR") apiParams.append("min_price", "5000000");
      else if (budgetPreset === "1CR-2CR") apiParams.append("min_price", "10000000");
      else if (budgetPreset === "2CR-5CR") apiParams.append("min_price", "20000000");
      else if (budgetPreset === "5CR+") apiParams.append("min_price", "50000000");

      if (maxP) apiParams.append("max_price", maxP);
      else if (budgetPreset === "50L") apiParams.append("max_price", "5000000");
      else if (budgetPreset === "50L-1CR") apiParams.append("max_price", "10000000");
      else if (budgetPreset === "1CR-2CR") apiParams.append("max_price", "20000000");
      else if (budgetPreset === "2CR-5CR") apiParams.append("max_price", "50000000");

      // Availability
      const avails = searchParams.getAll("availability");
      if (avails.length > 0) {
        avails.forEach(av => apiParams.append("availability_status", av));
      }

      // Ordering
      const ordering = searchParams.get("ordering") || "-created_at";
      apiParams.append("ordering", ordering);

      const res = await api.get(`/api/properties/?${apiParams.toString()}`);
      setListings(res.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  // --- URL UPDATERS ---

  const updateUrl = (newParams: Record<string, string | string[] | null>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      current.delete(key);
      if (value === null) return;
      if (Array.isArray(value)) {
        value.forEach(v => current.append(key, v));
      } else {
        current.set(key, value);
      }
    });

    router.push(`/search?${current.toString()}`);
  };

  const togglePropertyType = (type: string) => {
    const current = searchParams.getAll("property_type");
    // Also include 'property' param if it exists and we are adding to it
    const legacy = searchParams.get("property");
    let newTypes = [...current];
    if (legacy && !newTypes.includes(legacy)) newTypes.push(legacy);

    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }

    // Clear legacy 'property' param and use standard 'property_type'
    updateUrl({ property_type: newTypes, property: null });
  };

  const toggleBhk = (bhk: string) => {
    const current = searchParams.getAll("bhk");
    let newBhk = current.includes(bhk)
      ? current.filter(b => b !== bhk)
      : [...current, bhk];
    updateUrl({ bhk: newBhk });
  };

  const toggleAvailability = (status: string) => {
    const current = searchParams.getAll("availability");
    let newAvail = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateUrl({ availability: newAvail });
  };

  const handleBudgetMin = (val: string) => {
    updateUrl({ min_price: val || null, budget: null }); // Clear preset budget if custom used
  };

  const handleBudgetMax = (val: string) => {
    updateUrl({ max_price: val || null, budget: null });
  };

  const clearAllFilters = () => {
    router.push("/search");
  };

  const hasActiveFilters =
    propertyTypes.length > 0 ||
    bhkConfigs.length > 0 ||
    budgetMin ||
    budgetMax ||
    availability.length > 0;


  // Filter Sidebar Content
  const FilterContent = () => (
    <>
      {/* Budget */}
      <FilterSection title="Budget" defaultOpen={true}>
        <div className="flex items-center gap-2">
          <select
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-[#4A9B6D] outline-none bg-white"
          >
            <option value="">No min</option>
            <option value="1000000">₹10 Lac</option>
            <option value="2000000">₹20 Lac</option>
            <option value="3000000">₹30 Lac</option>
            <option value="5000000">₹50 Lac</option>
            <option value="7500000">₹75 Lac</option>
            <option value="10000000">₹1 Cr</option>
            <option value="20000000">₹2 Cr</option>
          </select>
          <span className="text-gray-400 text-xs">to</span>
          <select
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:ring-2 focus:ring-[#4A9B6D] outline-none bg-white"
          >
            <option value="">No max</option>
            <option value="2000000">₹20 Lac</option>
            <option value="5000000">₹50 Lac</option>
            <option value="7500000">₹75 Lac</option>
            <option value="10000000">₹1 Cr</option>
            <option value="20000000">₹2 Cr</option>
            <option value="50000000">₹5 Cr</option>
            <option value="100000000">₹10 Cr+</option>
          </select>
        </div>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Type of Property" defaultOpen={true}>
        <div className="space-y-2.5">
          {[
            { value: "FLAT", label: "Residential Apartment" },
            { value: "PLOT", label: "Residential / Commercial Plot" },
            { value: "VILLA_BUNGALOW", label: "Independent House/Villa" },
            { value: "COMMERCIAL_UNIT", label: "Commercial Property" },
            { value: "LAND", label: "Agricultural / Industrial Land" },
          ].map(item => (
            <label
              key={item.value}
              onClick={() => togglePropertyType(item.value)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${propertyTypes.includes(item.value)
                ? "bg-[#2D5F3F] border-[#2D5F3F]"
                : "border-gray-300 group-hover:border-gray-400"
                }`}>
                {propertyTypes.includes(item.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${propertyTypes.includes(item.value) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* BHK Configuration */}
      <FilterSection title="BHK" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {["1", "2", "3", "4", "5+"].map(bhk => (
            <button
              key={bhk}
              onClick={() => toggleBhk(bhk)}
              className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${bhkConfigs.includes(bhk)
                ? "border-[#2D5F3F] bg-[#E8F5E9] text-[#2D5F3F]"
                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
            >
              {bhk} BHK
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" defaultOpen={true}>
        <div className="space-y-2.5">
          {[
            { value: "READY", label: "Ready to Move" },
            { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
          ].map(item => (
            <label
              key={item.value}
              onClick={() => toggleAvailability(item.value)}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${availability.includes(item.value)
                ? "bg-[#2D5F3F] border-[#2D5F3F]"
                : "border-gray-300 group-hover:border-gray-400"
                }`}>
                {availability.includes(item.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${availability.includes(item.value) ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="pt-4">
          <button
            onClick={clearAllFilters}
            className="w-full py-2 text-[#2D5F3F] font-medium text-sm hover:bg-[#E8F5E9] rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Header with Search */}
      <div className="bg-gradient-to-r from-[#1B3A2C] to-[#2D5F3F] pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Title */}
          <h1 className="text-center text-2xl md:text-3xl font-bold text-white mb-6">
            Results for <span className="text-emerald-300">"All Properties"</span>
          </h1>
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            {[
              { label: "Ready To Move", value: "READY", active: availability.includes("READY") },
              { label: "Under Construction", value: "UNDER_CONSTRUCTION", active: availability.includes("UNDER_CONSTRUCTION") },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => toggleAvailability(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${item.active
                  ? "bg-[#2D5F3F] text-white"
                  : "border border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex-1" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-medium text-gray-700 outline-none cursor-pointer"
            >
              <option value="-created_at">Newest First</option>
              <option value="total_price">Price: Low to High</option>
              <option value="-total_price">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-5">
          {/* Main Content - Results (Left Side) */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <><span className="text-[#2D5F3F]">{listings.length}</span> results | Property for Sale</>
                  )}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  Showing properties in your selected area
                </p>
              </div>

              {/* Mobile Filters Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {loading ? (
              /* Skeleton Loading */
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 bg-gray-100" />
                      <div className="flex-1 p-4 space-y-3">
                        <div className="h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-4 bg-gray-50 rounded w-1/2" />
                        <div className="h-7 bg-gray-100 rounded w-1/3" />
                        <div className="flex gap-3">
                          <div className="h-4 bg-gray-50 rounded w-16" />
                          <div className="h-4 bg-gray-50 rounded w-16" />
                          <div className="h-4 bg-gray-50 rounded w-20" />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <div className="h-9 bg-gray-100 rounded w-24" />
                          <div className="h-9 bg-gray-200 rounded w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-[#2D5F3F]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-[#2D5F3F] text-white rounded-lg font-medium text-sm hover:bg-[#1B3A2C] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Property Grid - 3 columns */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item: any) => (
                  <PropertyCardVertical key={item.id} property={item} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-16 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-auto text-xs text-[#2D5F3F] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                      {propertyTypes.length + bhkConfigs.length + availability.length + (budgetMin || budgetMax ? 1 : 0)}
                    </span>
                  )}
                </h3>
              </div>
              <div className="px-4 pb-4 max-h-[calc(100vh-150px)] overflow-y-auto">
                <FilterContent />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-base">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-20">
              <FilterContent />
            </div>
            <div className="fixed bottom-0 right-0 w-full max-w-xs bg-white border-t border-gray-100 p-3">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-2.5 bg-[#2D5F3F] text-white rounded-xl font-semibold text-sm"
              >
                Show {listings.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Wrap in Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-[#2D5F3F]" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}