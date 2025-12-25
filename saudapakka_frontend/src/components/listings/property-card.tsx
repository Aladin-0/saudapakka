"use client";

import Link from "next/link";
import { MapPin, Bed, IndianRupee, CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Interface matching your backend
interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  address_line: string;
  verification_status: string;
  images: { id: number; image: string }[];
  has_7_12: boolean;
}

export default function PropertyCard({ property }: { property: Property }) {
  // Use first image or a placeholder
  const mainImage = property.images.length > 0 
    ? property.images[0].image 
    : "https://placehold.co/600x400?text=No+Image";

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={mainImage} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute top-2 left-2 flex gap-2">
             <Badge className="bg-black/70 hover:bg-black/70">
                {property.property_type.replace("_", " ")}
             </Badge>
             <Badge variant={property.listing_type === 'SELL' ? 'default' : 'secondary'}>
                {property.listing_type}
             </Badge>
          </div>
        </div>

        {/* Details Section */}
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
            {/* Show Verified Badge if Verified */}
            {property.verification_status === "VERIFIED" && (
              <div className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full border border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </div>
            )}
          </div>
          <p className="text-gray-500 text-sm flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {property.address_line}
          </p>
        </CardHeader>

        <CardContent className="p-4 pt-2 flex-1">
           {/* Trust Markers - Only show if true */}
           <div className="flex gap-2 text-xs mt-2">
              {property.has_7_12 && (
                 <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                    📜 7/12 Available
                 </span>
              )}
           </div>
        </CardContent>

        <CardFooter className="p-4 border-t bg-gray-50 flex items-center justify-between">
           <div className="flex items-center text-xl font-bold text-gray-900">
              <IndianRupee className="w-5 h-5" />
              {Number(property.price).toLocaleString('en-IN')}
           </div>
           <span className="text-sm text-blue-600 font-medium group-hover:underline">
              View Details &rarr;
           </span>
        </CardFooter>
      </Card>
    </Link>
  );
}