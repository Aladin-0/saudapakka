import Link from 'next/link';
import { ArrowRight, Map, Search, Crosshair, MapPin } from 'lucide-react';

export default function TestPage() {
    const tests = [
        {
            title: "Search Autocomplete",
            description: "Test Places API autocomplete with debouncing and caching.",
            href: "/test-search",
            icon: Search,
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Geolocation",
            description: "Test browser geolocation with cooldown and error handling.",
            href: "/test-geo",
            icon: Crosshair,
            color: "bg-green-100 text-green-600"
        },
        {
            title: "Smart Location Picker",
            description: "Test the unified picker with drag, search, and reverse geocoding.",
            href: "/test-picker",
            icon: Map,
            color: "bg-purple-100 text-purple-600"
        },
        {
            title: "Reverse Geocoding",
            description: "Test coordinate to address conversion with deduplication.",
            href: "/test-reverse-geo",
            icon: MapPin,
            color: "bg-orange-100 text-orange-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Maps Migration Tests</h1>
                <p className="text-gray-600 mb-8">
                    Use these test pages to verify the implementation of Google Maps API features,
                    ensuring performance requirements (deduplication, caching, rate limiting) are met.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {tests.map((test) => (
                        <Link key={test.href} href={test.href}>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${test.color}`}>
                                        <test.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{test.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    Open Developer Console (F12) to see Request Monitor logs.
                </div>
            </div>
        </div>
    );
}
