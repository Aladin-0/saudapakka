"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Home, MapPin, IndianRupee, Image as ImageIcon, FileText,
  Bed, Bath, Ruler, Building, Calendar, CheckCircle, Upload,
  Sparkles, ArrowLeft, Save, Check, X, Info, Camera
} from "lucide-react";

// Import Map dynamically
const LocationPicker = dynamic(() => import("@/components/location-picker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-bounce" />
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  )
});

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="p-2.5 bg-gradient-to-br from-[#2D5F3F] to-[#4A9B6D] rounded-xl text-white">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  </div>
);

// Image Preview Component
const ImagePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => (
  <div className="relative group">
    <img
      src={URL.createObjectURL(file)}
      alt="Preview"
      className="w-full h-24 object-cover rounded-lg"
    />
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    listing_type: "SALE",
    property_type: "FLAT",
    bhk_config: 1,
    bathrooms: 1,
    balconies: 0,
    super_builtup_area: "",
    carpet_area: "",
    plot_area: "",
    furnishing_status: "UNFURNISHED",
    total_price: "",
    maintenance_charges: "",
    maintenance_interval: "MONTHLY",
    project_name: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    locality: "",
    city: "",
    pincode: "",
    latitude: 19.8762,
    longitude: 75.3433,
    landmarks: "",
    specific_floor: "",
    total_floors: "",
    facing: "",
    availability_status: "READY",
    possession_date: "",
    age_of_construction: 0,
    listed_by: "OWNER",
    whatsapp_number: "",
    video_url: "",
    // Amenities
    has_power_backup: false,
    has_lift: false,
    has_swimming_pool: false,
    has_club_house: false,
    has_gym: false,
    has_park: false,
    has_reserved_parking: false,
    has_security: false,
    is_vastu_compliant: false,
    has_intercom: false,
    has_piped_gas: false,
    has_wifi: false,
  });

  // Files State
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [doc712, setDoc712] = useState<File | null>(null);
  const [docMojani, setDocMojani] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCheckbox = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryImages(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 images
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.total_price || !formData.description) {
      alert("Please fill in required fields: Title, Price, and Description.");
      return;
    }

    if (galleryImages.length === 0) {
      alert("Please upload at least one property image.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create Property
      const payload = new FormData();

      // Basic Info
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("listing_type", formData.listing_type);
      payload.append("property_type", formData.property_type);
      payload.append("bhk_config", formData.bhk_config.toString());
      payload.append("bathrooms", formData.bathrooms.toString());
      payload.append("balconies", formData.balconies.toString());

      // Area
      payload.append("super_builtup_area", formData.super_builtup_area);
      payload.append("carpet_area", formData.carpet_area);
      if (formData.plot_area) payload.append("plot_area", formData.plot_area);
      payload.append("furnishing_status", formData.furnishing_status);

      // Pricing
      payload.append("total_price", formData.total_price);
      payload.append("maintenance_charges", formData.maintenance_charges || "0");
      payload.append("maintenance_interval", formData.maintenance_interval);

      // Location - Combine address lines
      const fullAddress = [formData.address_line_1, formData.address_line_2, formData.address_line_3]
        .filter(Boolean)
        .join(", ");
      payload.append("address_line", fullAddress);
      if (formData.project_name) payload.append("project_name", formData.project_name);
      payload.append("locality", formData.locality);
      payload.append("city", formData.city);
      payload.append("pincode", formData.pincode);
      payload.append("latitude", formData.latitude.toString());
      payload.append("longitude", formData.longitude.toString());
      if (formData.landmarks) payload.append("landmarks", formData.landmarks);

      // Floor Details
      if (formData.specific_floor) payload.append("specific_floor", formData.specific_floor);
      if (formData.total_floors) payload.append("total_floors", formData.total_floors);
      if (formData.facing) payload.append("facing", formData.facing);

      // Status
      payload.append("availability_status", formData.availability_status);
      if (formData.possession_date) payload.append("possession_date", formData.possession_date);
      payload.append("age_of_construction", formData.age_of_construction.toString());

      // Contact
      payload.append("listed_by", formData.listed_by);
      if (formData.whatsapp_number) payload.append("whatsapp_number", formData.whatsapp_number);
      if (formData.video_url) payload.append("video_url", formData.video_url);

      // Amenities
      Object.keys(formData).forEach(key => {
        if (key.startsWith('has_') || key === 'is_vastu_compliant') {
          payload.append(key, formData[key as keyof typeof formData] ? "true" : "false");
        }
      });

      // Documents
      if (doc712) payload.append("doc_7_12", doc712);
      if (docMojani) payload.append("doc_mojani", docMojani);
      if (floorPlan) payload.append("floor_plan", floorPlan);

      const res = await api.post("/api/properties/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const propertyId = res.data.id;

      // Step 2: Upload Gallery Images
      if (galleryImages.length > 0) {
        const uploadPromises = galleryImages.map((file, index) => {
          const imgData = new FormData();
          imgData.append("image", file);
          imgData.append("is_thumbnail", index === 0 ? "true" : "false");
          return api.post(`/api/properties/${propertyId}/upload_image/`, imgData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        });
        await Promise.all(uploadPromises);
      }

      alert("Property listed successfully!");
      router.push("/dashboard/overview");
    } catch (error: any) {
      console.error("Error creating property:", error);
      alert(error.response?.data?.detail || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Amenities List
  const amenities = [
    { key: 'has_power_backup', label: '⚡ Power Backup', icon: '⚡' },
    { key: 'has_lift', label: '🛗 Lift', icon: '🛗' },
    { key: 'has_swimming_pool', label: '🏊 Swimming Pool', icon: '🏊' },
    { key: 'has_club_house', label: '🏛️ Club House', icon: '🏛️' },
    { key: 'has_gym', label: '🏋️ Gymnasium', icon: '🏋️' },
    { key: 'has_park', label: '🌳 Garden/Park', icon: '🌳' },
    { key: 'has_reserved_parking', label: '🚗 Parking', icon: '🚗' },
    { key: 'has_security', label: '🛡️ 24/7 Security', icon: '🛡️' },
    { key: 'is_vastu_compliant', label: '🕉️ Vastu Compliant', icon: '🕉️' },
    { key: 'has_intercom', label: '📞 Intercom', icon: '📞' },
    { key: 'has_piped_gas', label: '🔥 Piped Gas', icon: '🔥' },
    { key: 'has_wifi', label: '📶 WiFi', icon: '📶' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">List Your Property</h1>
              <p className="text-sm text-gray-500">Fill in the details below</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* 1. Basic Information */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={Home}
            title="Basic Information"
            subtitle="Tell us about your property"
          />

          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Property Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Spacious 3BHK with Sea View"
                value={formData.title}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your property features, amenities, nearby landmarks..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1.5"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Detailed descriptions get 3x more inquiries</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Listing Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {['SALE', 'RENT'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, listing_type: type }))}
                      className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${formData.listing_type === type
                        ? 'border-[#4A9B6D] bg-[#E8F5E9] text-[#2D5F3F]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {type === 'SALE' ? 'Sell' : 'Rent'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Listed By</Label>
                <select
                  name="listed_by"
                  value={formData.listed_by}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm"
                >
                  <option value="OWNER">Owner</option>
                  <option value="AGENT">Agent</option>
                  <option value="BUILDER">Builder</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Property Type</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'FLAT', label: 'Flat', icon: '🏢' },
                  { value: 'VILLA', label: 'Villa', icon: '🏡' },
                  { value: 'LAND', label: 'Plot', icon: '🏞️' },
                  { value: 'STUDIO', label: 'Studio', icon: '🏠' },
                  { value: 'PENTHOUSE', label: 'Penthouse', icon: '🏛️' },
                  { value: 'OFFICE', label: 'Office', icon: '💼' }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, property_type: type.value }))}
                    className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all flex flex-col items-center gap-1 ${formData.property_type === type.value
                      ? 'border-[#4A9B6D] bg-[#E8F5E9] text-[#2D5F3F]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Property Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={Ruler}
            title="Property Details"
            subtitle="Size and configuration"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">BHK</Label>
                <select
                  name="bhk_config"
                  value={formData.bhk_config}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm font-semibold"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} BHK</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Bathrooms</Label>
                <Input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="1"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Balconies</Label>
                <Input
                  type="number"
                  name="balconies"
                  value={formData.balconies}
                  onChange={handleChange}
                  min="0"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Built-up Area (sq.ft) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  name="super_builtup_area"
                  placeholder="e.g., 1200"
                  value={formData.super_builtup_area}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Carpet Area (sq.ft) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  name="carpet_area"
                  placeholder="e.g., 1000"
                  value={formData.carpet_area}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Floor Number</Label>
                <Input
                  type="number"
                  name="specific_floor"
                  placeholder="e.g., 5"
                  value={formData.specific_floor}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Total Floors</Label>
                <Input
                  type="number"
                  name="total_floors"
                  placeholder="e.g., 10"
                  value={formData.total_floors}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Furnishing</Label>
                <select
                  name="furnishing_status"
                  value={formData.furnishing_status}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Facing</Label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm"
                >
                  <option value="">Select</option>
                  <option value="NORTH">North</option>
                  <option value="SOUTH">South</option>
                  <option value="EAST">East</option>
                  <option value="WEST">West</option>
                  <option value="NORTH_EAST">North-East</option>
                  <option value="SOUTH_EAST">South-East</option>
                  <option value="NORTH_WEST">North-West</option>
                  <option value="SOUTH_WEST">South-West</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Property Age (years)</Label>
              <Input
                type="number"
                name="age_of_construction"
                value={formData.age_of_construction}
                onChange={handleChange}
                min="0"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={IndianRupee}
            title="Pricing Details"
            subtitle="Set your expected price"
          />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Total Price (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <Input
                  type="number"
                  name="total_price"
                  placeholder="e.g., 5000000"
                  value={formData.total_price}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Maintenance (₹)</Label>
                <Input
                  type="number"
                  name="maintenance_charges"
                  placeholder="e.g., 2000"
                  value={formData.maintenance_charges}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Interval</Label>
                <select
                  name="maintenance_interval"
                  value={formData.maintenance_interval}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Location */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={MapPin}
            title="Location Details"
            subtitle="Where is your property located?"
          />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Project/Building Name</Label>
              <Input
                name="project_name"
                placeholder="e.g., Amanora Park Town"
                value={formData.project_name}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            {/* 3 Address Boxes */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="address_line_1"
                  placeholder="Flat/House No, Building Name"
                  value={formData.address_line_1}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Address Line 2</Label>
                <Input
                  name="address_line_2"
                  placeholder="Street, Area"
                  value={formData.address_line_2}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Address Line 3</Label>
                <Input
                  name="address_line_3"
                  placeholder="Landmark (optional)"
                  value={formData.address_line_3}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Locality <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="locality"
                  placeholder="e.g., Koregaon Park"
                  value={formData.locality}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  name="city"
                  placeholder="e.g., Pune"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Pincode <span className="text-red-500">*</span>
              </Label>
              <Input
                name="pincode"
                placeholder="e.g., 411001"
                value={formData.pincode}
                onChange={handleChange}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Nearby Landmarks</Label>
              <Textarea
                name="landmarks"
                placeholder="e.g., Near Phoenix Mall, 2km from Pune Station"
                value={formData.landmarks}
                onChange={handleChange}
                rows={2}
                className="mt-1.5"
              />
            </div>

            {/* Map */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4A9B6D]" />
                Pin Location on Map
              </Label>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                <LocationPicker
                  onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                📍 Selected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Amenities */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={Sparkles}
            title="Amenities & Features"
            subtitle="Select all that apply"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenities.map(amenity => (
              <button
                key={amenity.key}
                type="button"
                onClick={() => handleCheckbox(amenity.key)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${formData[amenity.key as keyof typeof formData]
                  ? 'border-[#4A9B6D] bg-[#E8F5E9] text-[#2D5F3F]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium line-clamp-1">{amenity.label}</span>
                  {formData[amenity.key as keyof typeof formData] && (
                    <CheckCircle className="w-4 h-4 text-[#4A9B6D] flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Photos & Documents */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={Camera}
            title="Photos & Documents"
            subtitle="Upload images and verification docs"
          />

          <div className="space-y-6">
            {/* Gallery Images */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Property Photos (Max 10) <span className="text-red-500">*</span>
              </Label>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                  {galleryImages.map((file, index) => (
                    <ImagePreview key={index} file={file} onRemove={() => removeGalleryImage(index)} />
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4A9B6D] hover:bg-[#E8F5E9]/30 transition-all">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload images</span>
                <span className="text-xs text-gray-400 mt-1">{galleryImages.length}/10 uploaded</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Floor Plan */}
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">Floor Plan (Optional)</Label>
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#4A9B6D] hover:bg-[#E8F5E9]/30 transition-all">
                <FileText className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {floorPlan ? floorPlan.name : "Upload floor plan"}
                  </p>
                  {floorPlan && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFloorPlan(null); }}
                      className="text-xs text-red-500 mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFloorPlan(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Legal Documents */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Legal Documents</h4>
                  <p className="text-xs text-blue-700 mt-0.5">Upload to get verified badge & higher visibility</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:border-blue-400 transition-all">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {doc712 ? doc712.name : "7/12 Extract"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDoc712(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center gap-2 p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:border-blue-400 transition-all">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {docMojani ? docMojani.name : "Mojani Map"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocMojani(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Additional Info */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <SectionHeader
            icon={Info}
            title="Additional Information"
            subtitle="Optional details"
          />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">WhatsApp Number</Label>
              <Input
                name="whatsapp_number"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.whatsapp_number}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Video Tour Link (YouTube/Other)</Label>
              <Input
                name="video_url"
                type="url"
                placeholder="https://youtube.com/..."
                value={formData.video_url}
                onChange={handleChange}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Availability</Label>
                <select
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleChange}
                  className="w-full mt-1.5 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-[#4A9B6D] focus:ring-2 focus:ring-[#E8F5E9] outline-none transition-all text-sm"
                >
                  <option value="READY">Ready to Move</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                </select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">Possession Date</Label>
                <Input
                  type="date"
                  name="possession_date"
                  value={formData.possession_date}
                  onChange={handleChange}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-4 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 shadow-lg">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D] hover:from-[#1B3A2C] hover:to-[#2D5F3F] text-white py-6 rounded-xl font-bold text-base shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating Listing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Publish Property
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
