'use client';

import React, { useState, useCallback } from 'react';
import SearchPlacesAutocomplete from '@/components/maps/SearchPlacesAutocomplete';
import { requestMonitor } from '@/lib/google-maps/request-monitor';

export default function TestSearchPage() {
    const [selectedId, setSelectedId] = useState<string>("");
    const [metrics, setMetrics] = useState<any>(requestMonitor.getMetrics());

    const refreshMetrics = useCallback(() => {
        setMetrics({ ...requestMonitor.getMetrics() });
    }, []);

    const handlePlaceSelected = useCallback((id: string) => {
        setSelectedId(id);
        refreshMetrics();
    }, [refreshMetrics]);

    const handleLoadingChange = useCallback((loading: boolean) => {
        if (!loading) refreshMetrics();
    }, [refreshMetrics]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Search Autocomplete</h1>
                    <p className="text-gray-600 mb-6">Type quickly to test debouncing. Type the same thing twice to test caching.</p>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <SearchPlacesAutocomplete
                            onPlaceSelected={handlePlaceSelected}
                            onLoadingChange={handleLoadingChange}
                        />
                    </div>
                </div>

                {selectedId && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800">
                        Selected Place ID: <strong>{selectedId}</strong>
                    </div>
                )}

                <div className="bg-gray-900 text-white p-6 rounded-xl font-mono text-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Request Metrics</h3>
                        <button onClick={refreshMetrics} className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">Refresh</button>
                    </div>
                    <pre>{JSON.stringify(metrics, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
