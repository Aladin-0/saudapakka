"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Import Map dynamically to avoid Server-Side Rendering errors
const LocationPicker = dynamic(() => import("@/components/location-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
});

export default function CreateListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Added Description here
    price: "",
    address: "",
    property_type: "FLAT",
    listing_type: "SELL",
    lat: 0,
    lng: 0,
  });

  // File State
  const [doc712, setDoc712] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.title || !formData.price || !formData.description) {
      alert("Please fill in Title, Price, and Description.");
      return;
    }
    if (formData.lat === 0 || formData.lng === 0) {
      alert("Please click on the map to select a location.");
      return;
    }

    setLoading(true);
    try {
      // --- STEP 1: Create the Listing (Text + Docs) ---
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description); // Sending Description
      payload.append("price", formData.price);
      payload.append("address_line", formData.address);
      payload.append("property_type", formData.property_type);
      payload.append("listing_type", formData.listing_type);
      // Ensure lat/lng are sent as strings
      payload.append("latitude", formData.lat.toString());
      payload.append("longitude", formData.lng.toString());

      // Attach Verification Docs if they exist
      if (doc712) {
        payload.append("doc_7_12", doc712);
      }

      // Send Request
      console.log("Sending Payload...");
      const res = await api.post("/api/listings/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newListingId = res.data.id;
      console.log("Listing Created, ID:", newListingId);

      // --- STEP 2: Upload Gallery Images (If any) ---
      if (galleryImages && galleryImages.length > 0) {
        console.log(`Uploading ${galleryImages.length} images...`);
        const uploadPromises = Array.from(galleryImages).map((file) => {
          const imgData = new FormData();
          imgData.append("image", file);
          return api.post(`/api/listings/${newListingId}/upload_image/`, imgData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });
        await Promise.all(uploadPromises);
      }

      alert("Property Created Successfully!");
      router.push("/dashboard/overview"); 

    } catch (error: any) {
      console.error("Error creating listing:", error);
      // Helper to show backend error message if available
      if (error.response?.data) {
        alert(`Failed: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Failed to create property. Check console.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">List a New Property</h1>
      </div>
      
      <Card>
        <CardContent className="space-y-6 pt-6">
          
          {/* Title & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input 
                id="title"
                placeholder="e.g. Luxurious 2BHK in Baner" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input 
                id="price"
                type="number" 
                placeholder="e.g. 5000000" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
          </div>

          {/* Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select onValueChange={(val) => setFormData({...formData, property_type: val})} defaultValue="FLAT">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLAT">Flat / Apartment</SelectItem>
                  <SelectItem value="LAND">Plot / Land</SelectItem>
                  <SelectItem value="VILLA">Villa / Bungalow</SelectItem>
                  <SelectItem value="FARMHOUSE">Farmhouse</SelectItem>
                  <SelectItem value="SERVICED_APT">Serviced Apartment</SelectItem>
                  <SelectItem value="BUILDER_FLOOR">Builder Floor</SelectItem>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Listing Type</Label>
              <Select onValueChange={(val) => setFormData({...formData, listing_type: val})} defaultValue="SELL">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELL">Sell</SelectItem>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="NEW_LAUNCH">New Launch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description Section (NEW) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe the property features, amenities, and nearby landmarks..." 
              className="min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Location Section */}
          <div className="space-y-2">
            <Label className="block">Location (Click map to pin exact spot)</Label>
            <LocationPicker onLocationSelect={(lat, lng) => setFormData({...formData, lat, lng})} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Selected Coordinates:</span>
              <code className="bg-gray-100 px-1 rounded">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</code>
            </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea 
                id="address"
                placeholder="Flat No, Building, Street, Area, City..." 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
          </div>

          {/* Documents & Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div className="space-y-2">
              <Label className="text-blue-600 font-semibold">7/12 Extract (PDF)</Label>
              <Input 
                type="file" 
                accept="application/pdf" 
                onChange={e => setDoc712(e.target.files?.[0] || null)} 
              />
              <p className="text-xs text-muted-foreground">Upload official 7/12 extract to get the "Verified" badge.</p>
            </div>
            <div className="space-y-2">
              <Label>Gallery Photos</Label>
              <Input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={e => setGalleryImages(e.target.files)} 
              />
              <p className="text-xs text-muted-foreground">Select multiple images (Max 5 recommended).</p>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full text-lg h-12">
            {loading ? "Creating Listing..." : "Submit Listing"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}