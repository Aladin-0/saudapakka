'use client';

import React, { useState } from 'react';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { requestMonitor } from '@/lib/google-maps/request-monitor';

export default function TestReverseGeoPage() {
    const { reverseGeocode, isLoading, error } = useReverseGeocode();
    const [result, setResult] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(requestMonitor.getMetrics());

    // Coordinates for India Gate (approx)
    const LAT = 28.6129;
    const LNG = 77.2295;

    const handleTest = async () => {
        const res = await reverseGeocode(LAT, LNG);
        setResult(res);
        setMetrics({ ...requestMonitor.getMetrics() });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Reverse Geocoding</h1>
                    <p className="text-gray-600 mb-6">
                        Click "Geocode India Gate". First click = API Call. Second click = Cache Hit.
                    </p>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center gap-4">
                        <button
                            onClick={handleTest}
                            disabled={isLoading}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
                        >
                            {isLoading ? "Geocoding..." : "Geocode India Gate"}
                        </button>

                        {error && (
                            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="w-full bg-gray-50 p-4 rounded text-sm">
                                <pre>{JSON.stringify(result, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-6 rounded-xl font-mono text-sm">
                    <h3 className="font-bold text-lg mb-4">Request Metrics</h3>
                    <pre>{JSON.stringify(metrics, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
