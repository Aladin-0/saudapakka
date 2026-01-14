'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Home, ArrowRight, X, Loader2 } from "lucide-react";
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';

interface SelectedPlace {
    lat: number;
    lng: number;
    address: string;
    name: string;
    place_id: string;
}

export default function SearchBar() {
    const router = useRouter();

    // --- STATE ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [listingType, setListingType] = useState("SALE");
    const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Advanced Filters
    const [propertyType, setPropertyType] = useState("ALL");
    const [budget, setBudget] = useState("ANY");
    const [bedrooms, setBedrooms] = useState("ANY");

    // Google Places Autocomplete Hook
    const { predictions, isLoading: suggestionsLoading, error: suggestionsError, getSuggestions, selectPlace } = usePlacesAutocomplete();

    // --- DEBOUNCED INPUT HANDLER ---
    const handleSearchInputChange = useCallback((value: string) => {
        setSearchQuery(value);
        setHighlightedIndex(-1);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (value.trim()) {
            setShowDropdown(true);
            debounceTimerRef.current = setTimeout(() => {
                getSuggestions(value);
            }, 300); // 300ms debounce
        } else {
            setShowDropdown(false);
        }
    }, [getSuggestions]);

    // --- SELECT SUGGESTION ---
    const handleSelectSuggestion = useCallback(async (placeId: string) => {
        const place = await selectPlace(placeId);
        const prediction = predictions?.find(p => p.place_id === placeId);
        const mainText = prediction?.structured_formatting.main_text;

        if (place) {
            const placeData: SelectedPlace = {
                lat: place.lat,
                lng: place.lng,
                address: place.address.formatted_address,
                name: mainText || place.address.formatted_address,
                place_id: placeId,
            };
            setSelectedPlace(placeData);
            setSearchQuery(mainText || place.address.formatted_address);
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    }, [selectPlace, predictions]);

    // --- SEARCH HANDLER ---
    const handleSearch = useCallback(() => {
        const params = new URLSearchParams();

        // Priority 1: Use selected place with coordinates
        if (selectedPlace?.lat && selectedPlace?.lng) {
            params.append("lat", selectedPlace.lat.toString());
            params.append("lng", selectedPlace.lng.toString());
            params.append("location", selectedPlace.address);
            params.append("q", selectedPlace.name || searchQuery);
        }
        // Priority 2: Use search query
        else if (searchQuery.trim()) {
            params.append("q", searchQuery);
        }

        if (listingType) params.append("type", listingType);

        // Advanced params
        if (propertyType !== "ALL") params.append("property", propertyType);
        if (budget !== "ANY") params.append("budget", budget);

        // Only append BHK if relevant (Residential mainly)
        if (bedrooms !== "ANY" && !['PLOT', 'LAND', 'COMMERCIAL_UNIT'].includes(propertyType)) {
            params.append("bhk", bedrooms);
        }

        router.push(`/search?${params.toString()}`);
        setShowDropdown(false);
    }, [selectedPlace, searchQuery, listingType, propertyType, budget, bedrooms, router]);

    // --- KEYBOARD NAVIGATION ---
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) {
            if (e.key === 'Enter') {
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < (predictions?.length || 0) - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && predictions?.[highlightedIndex]) {
                    handleSelectSuggestion(predictions[highlightedIndex].place_id);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowDropdown(false);
                break;
            case 'Backspace':
                if (selectedPlace) {
                    setSelectedPlace(null);
                }
                break;
        }
    }, [showDropdown, highlightedIndex, predictions, handleSelectSuggestion, handleSearch]);

    // --- CLEAR INPUT ---
    const handleClearInput = useCallback(() => {
        setSearchQuery("");
        setSelectedPlace(null);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // --- CLICK OUTSIDE HANDLER ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                    setShowDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // --- CLEANUP ---
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);



    const clearFilters = () => {
        setPropertyType("ALL");
        setBudget("ANY");
        setBedrooms("ANY");
        setListingType("SALE");
        setSearchQuery("");
        setSelectedPlace(null);
    };

    // Helper to handle Quick Filters
    const handleQuickFilter = (type: string) => {
        if (type === 'COMMERCIAL') {
            setPropertyType('COMMERCIAL_UNIT');
            setListingType('SALE');
        } else if (type === 'PLOTS') {
            setPropertyType('PLOT');
            setListingType('SALE');
        } else {
            setListingType(type);
        }
    };

    const showBHK = !['PLOT', 'LAND', 'COMMERCIAL_UNIT'].includes(propertyType);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 relative z-20">
            {/* Main Search Pill */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-full shadow-2xl transition-all hover:shadow-3xl">
                <div className="relative flex flex-col sm:flex-row items-center p-2">

                    {/* Mobile: Search Icon + Input with Autocomplete */}
                    <div className="flex items-center w-full sm:w-auto flex-1 pl-2 sm:pl-4 relative">
                        <Search className="w-5 h-5 text-[#4A9B6D] shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search city, locality, project..."
                            className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base py-3 px-3 min-w-0"
                            value={searchQuery}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => searchQuery && setShowDropdown(true)}
                            autoComplete="off"
                        />

                        {/* Loading Spinner */}
                        {suggestionsLoading && (
                            <Loader2 className="w-4 h-4 text-[#4A9B6D] animate-spin mr-2 shrink-0" />
                        )}

                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                onClick={handleClearInput}
                                className="p-1 hover:bg-gray-100 rounded mr-2 shrink-0 transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}

                        {/* Autocomplete Dropdown */}
                        {showDropdown && (
                            <div
                                ref={dropdownRef}
                                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
                            >
                                {/* Error State */}
                                {suggestionsError && (
                                    <div className="p-4 text-red-600 text-sm">
                                        {suggestionsError}
                                    </div>
                                )}

                                {/* Loading State */}
                                {suggestionsLoading && (
                                    <div className="p-4 text-gray-600 text-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading suggestions...
                                    </div>
                                )}

                                {/* Suggestions List */}
                                {!suggestionsLoading && predictions && predictions.length > 0 ? (
                                    <ul className="py-1">
                                        {predictions.map((pred, index) => (
                                            <li
                                                key={pred.place_id}
                                                onClick={() => handleSelectSuggestion(pred.place_id)}
                                                className={`px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0
                                                    ${highlightedIndex === index
                                                        ? 'bg-[#4A9B6D] text-white'
                                                        : 'hover:bg-[#E8F5E9] text-gray-900'
                                                    }`}
                                            >
                                                <div className="font-semibold text-sm">{pred.structured_formatting.main_text}</div>
                                                <div className={`text-xs ${highlightedIndex === index ? 'text-green-100' : 'text-gray-500'}`}>
                                                    {pred.structured_formatting.secondary_text}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    !suggestionsLoading && searchQuery && (
                                        <div className="p-4 text-gray-400 text-sm text-center">
                                            No results found for "{searchQuery}"
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Divider (Desktop Only) */}
                    <div className="hidden sm:block h-8 w-px bg-gray-200 mx-2"></div>

                    {/* Action Row for Mobile / Desktop Buttons */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2 mt-2 sm:mt-0 px-2 sm:px-0">

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full font-medium text-sm transition-all sm:w-auto flex-1 sm:flex-none justify-center
                                ${isFilterOpen ? 'bg-[#E8F5E9] text-[#2D5F3F]' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden xs:inline">Filters</span>
                        </button>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D] text-white px-6 py-2.5 rounded-xl sm:rounded-full font-semibold text-sm hover:shadow-lg flex items-center gap-2 transition-transform active:scale-95 sm:w-auto flex-[1.5] sm:flex-none justify-center"
                        >
                            <span>Search</span>
                            <ArrowRight className="w-4 h-4 hidden xs:block" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Filters Panel */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out origin-top 
                    ${isFilterOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">

                    {/* Quick Filter Tabs */}
                    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            <button
                                onClick={() => handleQuickFilter('SALE')}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                                    ${listingType === 'SALE' && propertyType === 'ALL'
                                        ? 'bg-[#4A9B6D] text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A9B6D]'}`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => handleQuickFilter('RENT')}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                                    ${listingType === 'RENT'
                                        ? 'bg-[#4A9B6D] text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A9B6D]'}`}
                            >
                                Rent
                            </button>
                            <button
                                onClick={() => handleQuickFilter('PLOTS')}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                                    ${propertyType === 'PLOT'
                                        ? 'bg-[#4A9B6D] text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A9B6D]'}`}
                            >
                                Plots / Land
                            </button>
                            <button
                                onClick={() => handleQuickFilter('COMMERCIAL')}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
                                    ${propertyType === 'COMMERCIAL_UNIT'
                                        ? 'bg-[#4A9B6D] text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4A9B6D]'}`}
                            >
                                Commercial
                            </button>
                        </div>
                    </div>

                    {/* Detailed Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Property Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property Type</label>
                            <select
                                value={propertyType}
                                onChange={(e) => setPropertyType(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A9B6D]/20 focus:border-[#4A9B6D] outline-none text-sm text-gray-700 font-medium appearance-none"
                            >
                                <option value="ALL">All Residential</option>
                                <option value="FLAT">Apartment / Flat</option>
                                <option value="VILLA_BUNGALOW">Villa / Bungalow</option>
                                <option value="PLOT">Plot (Residential)</option>
                                <option value="LAND">Land (Agri/Ind)</option>
                                <option value="COMMERCIAL_UNIT">Commercial (Shop/Office)</option>
                            </select>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Budget Range</label>
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4A9B6D]/20 focus:border-[#4A9B6D] outline-none text-sm text-gray-700 font-medium appearance-none"
                            >
                                <option value="ANY">Any Budget</option>
                                <option value="50L">Under ₹50 Lac</option>
                                <option value="50L-1CR">₹50 Lac - ₹1 Cr</option>
                                <option value="1CR-2CR">₹1 Cr - ₹2 Cr</option>
                                <option value="2CR-5CR">₹2 Cr - ₹5 Cr</option>
                                <option value="5CR+">Above ₹5 Cr</option>
                            </select>
                        </div>

                        {/* BHK */}
                        {showBHK ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bedrooms</label>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                    {['ANY', '1', '2', '3', '4+'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setBedrooms(opt)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                                                ${bedrooms === opt ? 'bg-white text-[#4A9B6D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {opt === 'ANY' ? 'All' : opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 opacity-50 pointer-events-none grayscale">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bedrooms</label>
                                <div className="p-3 text-sm text-gray-400 italic">Not applicable</div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={clearFilters}
                            className="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <X className="w-4 h-4" /> Reset
                        </button>
                        <button
                            onClick={handleSearch}
                            className="bg-[#2D5F3F] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#1B3A2C] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Apply Filter
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}