"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { Heart } from "lucide-react";
import PropertyCard from "@/components/listings/property-card";

export default function SavedPropertiesPage() {
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const res = await api.get("/api/properties/my_saved/");
                // The API returns a list of SavedProperty objects (id, user, property details nested in 'property')
                // OR it returns the list of Property objects?
                // backend view: `serializer_class = PropertySerializer`.
                // Queryset: `Property.objects.filter(saved_by__user=self.request.user)` (likely).
                // Let's assume it returns Property objects directly based on standard ViewSet behavior
                // IF the endpoint is `my_saved` on `PropertyViewSet`.

                // Let's check backend view 'my_saved'.
                // Previous reading of views.py: 
                // @action... def my_saved(self, request):
                //   saved_items = SavedProperty.objects.filter(user=request.user)
                //   properties = [item.property for item in saved_items]
                //   serializer = self.get_serializer(properties, many=True)
                //   return Response(serializer.data)

                // Yes, it returns List[Property].
                setProperties(res.data);
            } catch (error) {
                console.error("Failed to fetch saved properties", error);
            } finally {
                setLoading(false);
            }

        };
        fetchSaved();
    }, []);

    const handleUnsave = (id: string) => {
        // Optimistically remove from list if child component triggers this
        setProperties(prev => prev.filter(p => p.id !== id));
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading saved properties...</div>;
    }

    if (properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Properties</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    You have not saved any properties yet. Browse listings to find your dream home.
                </p>
                <Link href="/search">
                    <button className="bg-[#2D5F3F] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1B3A2C] transition-colors">
                        Browse Properties
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
                <p className="text-gray-500 mt-2">Manage your shortlist of potential homes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: any) => (
                    <PropertyCard
                        key={property.id}
                        property={{ ...property, is_saved: true }} // Ensure is_saved is true for these
                    // We can optionally pass a callback if we want the card to trigger removal 
                    // But PropertyCard handles its own state. 
                    // If user unsaves in card, it just updates icon.
                    // To remove from list, we might need a custom action or just let it be.
                    // Let's just render the card.
                    />
                ))}
            </div>
        </div>
    );
}
