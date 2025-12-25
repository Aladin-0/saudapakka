"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MapPin, IndianRupee, Home, FileText, Share2, Heart } from "lucide-react";

// Import Map dynamically (No SSR)
const MapViewer = dynamic(() => import("@/components/map-viewer"), { 
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl" />
});

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      recordView();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const res = await api.get(`/api/listings/${id}/`);
      setProperty(res.data);
      // Set initial main image
      if (res.data.images?.length > 0) {
        setActiveImage(res.data.images[0].image);
      }
      // Check if user saved this property (API usually returns this, or check separate list)
      // For now, we assume false or rely on backend data if it includes 'is_saved' field
    } catch (error) {
      console.error("Error fetching details", error);
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      // Backend expects this call to increment the "View History"
      await api.get(`/api/listings/${id}/record_view/`);
    } catch (error) {
      // Silently fail (analytics shouldn't break the page)
      console.warn("Could not record view");
    }
  };

  const toggleSave = async () => {
    try {
      await api.post(`/api/listings/${id}/save_property/`);
      setIsSaved(!isSaved); // Optimistic UI update
      alert(isSaved ? "Removed from Saved" : "Property Saved!");
    } catch (error) {
      alert("Please login to save properties.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Property...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. Image Gallery Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg relative">
              <img 
                src={activeImage || "https://placehold.co/800x600?text=No+Image"} 
                alt="Property Main" 
                className="w-full h-full object-cover"
              />
              {property.verification_status === "VERIFIED" && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center shadow-md">
                  <CheckCircle className="w-4 h-4 mr-1" /> Verified Property
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img: any) => (
                  <button 
                    key={img.id}
                    onClick={() => setActiveImage(img.image)}
                    className={`w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 ${activeImage === img.image ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={img.image} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <Button variant="ghost" size="icon" onClick={toggleSave}>
                  <Heart className={`w-6 h-6 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                </Button>
              </div>
              <p className="text-gray-500 flex items-center mt-2 text-lg">
                <MapPin className="w-5 h-5 mr-1 text-blue-600" />
                {property.address_line}
              </p>
            </div>

            <div className="flex items-center text-3xl font-bold text-blue-700">
               <IndianRupee className="w-8 h-8" />
               {Number(property.price).toLocaleString('en-IN')}
            </div>

            <div className="flex flex-wrap gap-2">
               <Badge variant="outline" className="px-3 py-1 text-base"><Home className="w-4 h-4 mr-2"/> {property.property_type}</Badge>
               <Badge variant="secondary" className="px-3 py-1 text-base">{property.listing_type}</Badge>
            </div>

            <Card className="bg-blue-50 border-blue-100">
               <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-blue-900">Legal Verification Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div className={`flex items-center ${property.has_7_12 ? "text-green-700" : "text-gray-400"}`}>
                        {property.has_7_12 ? "✅" : "❌"} 7/12 Extract
                     </div>
                     <div className={`flex items-center ${property.has_mojani ? "text-green-700" : "text-gray-400"}`}>
                        {property.has_mojani ? "✅" : "❌"} Mojani / Measurement
                     </div>
                     <div className={`flex items-center ${property.has_na_order ? "text-green-700" : "text-gray-400"}`}>
                        {property.has_na_order ? "✅" : "❌"} NA Order
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
               <Button className="flex-1 h-12 text-lg">Contact Seller</Button>
               <Button variant="outline" className="h-12 w-12 p-0"><Share2 className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        {/* 2. Description Section */}
        <div className="mt-12">
           <h2 className="text-2xl font-bold mb-4">About this Property</h2>
           <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided by the seller."}
           </p>
        </div>

        {/* 3. Map Section */}
        <div className="mt-12">
           <h2 className="text-2xl font-bold mb-4">Location</h2>
           <MapViewer lat={property.latitude} lng={property.longitude} />
           <p className="text-sm text-gray-500 mt-2">
             Note: Exact location may vary slightly for privacy.
           </p>
        </div>

      </div>
    </div>
  );
}