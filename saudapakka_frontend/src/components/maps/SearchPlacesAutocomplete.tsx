'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface SearchPlacesAutocompleteProps {
    onPlaceSelected: (placeId: string) => void;
    placeholder?: string;
    className?: string;
    onLoadingChange?: (isLoading: boolean) => void;
}

export default function SearchPlacesAutocomplete({
    onPlaceSelected,
    placeholder = "Search area...",
    className = "",
    onLoadingChange
}: SearchPlacesAutocompleteProps) {
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Custom Hook
    const { predictions, isLoading, getSuggestions, clearCache } = usePlacesAutocomplete();

    // Debounce Ref
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Propagate loading state
    useEffect(() => {
        onLoadingChange?.(isLoading);
    }, [isLoading, onLoadingChange]);

    // Handle Input Change with 300ms Debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInput(val);
        setShowSuggestions(true);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            getSuggestions(val);
        }, 300);
    };

    const handleSelect = (placeId: string, description: string) => {
        setInput(description); // Update input to selected
        setShowSuggestions(false);
        onPlaceSelected(placeId);
    };

    const handleClear = () => {
        setInput("");
        setPredictions([]); // This helper needs to be exposed or we just rely on empty input
        setShowSuggestions(false);
        getSuggestions(""); // Clear
    };

    // Helper to close on outside click
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fix for helper function not existing in hook return type yet (I need to update hook or just tolerate it)
    // Actually I implemented clearCache in hook. I can use that to clear but not set predictions directly.
    // Re-triggering getSuggestions("") sets predictions to empty.
    const setPredictions = (p: any[]) => { /* No-op, handled by hook state */ };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (input.length > 2) setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-white rounded-lg shadow-md border-0 focus:ring-2 focus:ring-green-500 text-sm text-gray-800 placeholder:text-gray-400 font-medium"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />

                {isLoading ? (
                    <Loader2 className="w-4 h-4 text-green-500 animate-spin absolute right-3.5 top-3" />
                ) : input ? (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full text-gray-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : null}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && predictions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-[50] divide-y divide-gray-50">
                    {predictions.map((prediction) => (
                        <li key={prediction.place_id}>
                            <button
                                onClick={() => handleSelect(prediction.place_id, prediction.description)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors group"
                            >
                                <div className="mt-0.5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 group-hover:text-green-600 text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {prediction.structured_formatting.main_text}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {prediction.structured_formatting.secondary_text}
                                    </p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
