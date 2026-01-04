"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Property {
  id: string;
  title: string;
  total_price: number;
  property_type: string;
  listing_type: string;
  address_line: string;
  locality: string;
  city: string;
  bhk_config: number;
  bathrooms: number;
  carpet_area: string;
  verification_status: string;
  images: { id: string; image: string }[];
  has_7_12: boolean;
  has_mojani: boolean;
  created_at: string;
  property_status?: string;
  is_hot_deal?: boolean;
  is_new?: boolean;
}

export default function PropertyCard({ property }: { property: Property }) {
  const mainImage = property.images && property.images.length > 0
    ? property.images[0].image
    : "https://placehold.co/600x400?text=SaudaPakka+Property";

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)} Lac`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const isVerified = property.verification_status === "VERIFIED";

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border-0">
      {/* Image Section - Rounded top corners */}
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Hot Deal Badge - Top Right */}
        {property.is_hot_deal && (
          <div className="absolute top-3 right-3 bg-[#4A9B6D] text-white px-3 py-1.5 rounded-lg font-semibold text-xs">
            HOT DEAL
          </div>
        )}

        {/* New Badge - Top Right */}
        {property.is_new && (
          <div className="absolute top-3 right-3 bg-[#4A9B6D] text-white px-3 py-1.5 rounded-lg font-semibold text-xs">
            NEW
          </div>
        )}

        {/* Verified Badge - Top Left */}
        {isVerified && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#2D5F3F] px-2.5 py-1 rounded-lg font-medium text-xs">
            ✓ Verified
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Price */}
        <h3 className="text-xl font-bold text-gray-900 mb-1.5">
          {formatPrice(Number(property.total_price))}
        </h3>

        {/* Title */}
        <h4 className="text-base font-semibold text-gray-800 mb-1.5 line-clamp-1">
          {property.title}
        </h4>

        {/* Location */}
        <p className="text-gray-600 mb-3 flex items-center text-sm">
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.locality}, {property.city}
        </p>

        {/* Specs Row */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span>{property.bhk_config} BHK</span>
          <span>•</span>
          <span>{property.carpet_area} sqft</span>
          <span>•</span>
          <span>{property.property_status || "Ready to Move"}</span>
        </div>

        {/* View Details Button - More rounded */}
        <Link href={`/property/${property.id}`}>
          <button className="w-full bg-[#2D5F3F] text-white py-2.5 rounded-xl hover:bg-[#1B3A2C] transition-all duration-200 font-medium text-sm">
            View Details
          </button>
        </Link>
      </div>
    </Card>
  );
}
