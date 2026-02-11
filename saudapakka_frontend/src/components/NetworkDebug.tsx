'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function NetworkDebug() {
    const [status, setStatus] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const checkNetwork = async () => {
            const results: any = {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
                apiUrl: process.env.NEXT_PUBLIC_API_URL,
            };

            // Test API connection
            try {
                // Try a health check or a public endpoint that doesn't require auth
                // The user suggested / but / usually returns HTML from Next.js. 
                // We want to hit the backend.
                // If we use api.get('/'), it respects baseURL. 
                // If baseURL is /, it hits Next.js homepage.
                // If baseURL is http://localhost:8005, it hits API root.

                // Let's try to hit a known endpoint or just root if unsure
                const response = await api.get('/api/');
                results.apiStatus = '✅ Connected';
                results.apiResponse = response.status;
            } catch (error: any) {
                results.apiStatus = '❌ Failed';
                results.apiError = error.message;
                results.apiDetails = {
                    code: error.code,
                    request: !!error.request,
                    response: !!error.response,
                };
            }

            setStatus(results);
            setLoading(false);
        };

        checkNetwork();
    }, []);

    if (!show) return (
        <button
            onClick={() => setShow(true)}
            className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 text-xs"
        >
            🕷️
        </button>
    );

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#1F2937',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '400px',
            zIndex: 9999,
            fontFamily: 'monospace',
            border: '1px solid #374151'
        }}>
            <div className="flex justify-between items-center mb-3">
                <h4 style={{ margin: 0, color: '#10B981', fontWeight: 'bold' }}>🔍 Network Debug</h4>
                <button onClick={() => setShow(false)} style={{ color: '#9CA3AF' }}>✕</button>
            </div>
            <pre style={{ margin: 0, overflow: 'auto', maxHeight: '300px' }}>
                {loading ? 'Checking network...' : JSON.stringify(status, null, 2)}
            </pre>
        </div>
    );
}
