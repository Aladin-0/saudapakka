"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle, MapPin, IndianRupee, Home, FileText, Share2, Heart,
  Phone, Calendar, Bed, Bath, Ruler, Building, Car, Shield, Zap,
  School, ShoppingCart, Hospital, ChevronRight, ArrowLeft, Eye,
  Download, Flag, Clock, X, ChevronLeft, Wifi, Droplet, Wind,
  Package, Sparkles, Trees, Users, Camera, Check, ExternalLink,
  MessageCircle, Loader2
} from "lucide-react";

// Import Map dynamically
const MapViewer = dynamic(() => import("@/components/map-viewer"), {
  ssr: false,
  loading: () => <div className="h-[300px] sm:h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-xl flex items-center justify-center">
    <div className="text-center">
      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-bounce" />
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  </div>
});

// Amenity icons mapping
const amenityIcons: { [key: string]: any } = {
  'Parking': Car,
  'Security': Shield,
  'Power Backup': Zap,
  'Wi-Fi': Wifi,
  'Swimming Pool': Droplet,
  'Gym': Users,
  'Garden': Trees,
  'Air Conditioning': Wind,
  'Elevator': Package,
  'Modular Kitchen': Home,
};

// Amenities helper
const getAmenitiesList = (property: any) => {
  if (!property) return [];
  const start = [];
  if (property.has_power_backup) start.push('Power Backup');
  if (property.has_lift) start.push('Elevator');
  if (property.has_swimming_pool) start.push('Swimming Pool');
  if (property.has_club_house) start.push('Club House');
  if (property.has_gym) start.push('Gym');
  if (property.has_park) start.push('Garden');
  if (property.has_reserved_parking) start.push('Parking');
  if (property.has_security) start.push('Security');
  if (property.is_vastu_compliant) start.push('Vastu Compliant');
  if (property.has_intercom) start.push('Intercom');
  if (property.has_piped_gas) start.push('Piped Gas');
  if (property.has_wifi) start.push('Wi-Fi');
  return start;
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Contact Owner State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
      recordView();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const res = await api.get(`/api/properties/${id}/`);
      setProperty(res.data);
      if (res.data.images?.length > 0) {
        setActiveImage(res.data.images[0].image);
      }
    } catch (error) {
      console.error("Error fetching details", error);
    } finally {
      setLoading(false);
    }
  };

  const recordView = async () => {
    try {
      await api.get(`/api/properties/${id}/record_view/`);
    } catch (error) {
      console.warn("Could not record view");
    }
  };

  const toggleSave = async () => {
    try {
      await api.post(`/api/properties/${id}/save_property/`);
      setIsSaved(!isSaved);
    } catch (error) {
      alert("Please login to save properties.");
    }
  };

  const changeImage = (image: string, index: number) => {
    setImageLoading(true);
    setActiveImage(image);
    setActiveImageIndex(index);
  };

  const nextImage = () => {
    if (property.images && activeImageIndex < property.images.length - 1) {
      changeImage(property.images[activeImageIndex + 1].image, activeImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (activeImageIndex > 0) {
      changeImage(property.images[activeImageIndex - 1].image, activeImageIndex - 1);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  const handleContactOwner = async () => {
    if (!user) {
      // Redirect to login with return URL
      const currentUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirect=${currentUrl}`);
      return;
    }

    if (contactDetails) {
      setShowContactModal(true);
      return;
    }

    setContactLoading(true);
    try {
      const res = await api.get(`/api/properties/${id}/get_contact_details/`);
      setContactDetails(res.data);
      setShowContactModal(true);
    } catch (error) {
      console.error("Failed to fetch contact details", error);
      alert("Could not fetch contact details. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      setShowShareModal(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const getAmenityIcon = (amenity: string) => {
    const Icon = Object.entries(amenityIcons).find(([key]) =>
      amenity.toLowerCase().includes(key.toLowerCase())
    )?.[1] || Sparkles;
    return Icon;
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E8F5E9] border-t-[#4A9B6D] mx-auto mb-4"></div>
            <Home className="w-6 h-6 text-[#4A9B6D] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Loading property details...</p>
        </div>
      </div>
      <Footer />
    </>
  );

  if (!property) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/search')} className="bg-[#2D5F3F] hover:bg-[#1B3A2C]">
            Browse Properties
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">

          {/* Back Button - Desktop */}
          <div className="hidden sm:block px-4 sm:px-6 lg:px-8 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-3 -ml-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to listings
            </Button>

            <nav className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto pb-2">
              <Link href="/" className="hover:text-[#2D5F3F] transition-colors whitespace-nowrap">Home</Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link href="/search" className="hover:text-[#2D5F3F] transition-colors whitespace-nowrap">Properties</Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span className="text-[#2D5F3F] font-medium truncate">{property.city}</span>
            </nav>
          </div>

          {/* Mobile Back Button */}
          <div className="sm:hidden px-4 py-3 bg-white border-b border-gray-100">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="-ml-2 text-gray-700 hover:text-[#2D5F3F]"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-0 sm:gap-6 lg:gap-8 px-0 sm:px-6 lg:px-8">

            {/* Left Column - Property Details */}
            <div className="lg:col-span-2">

              {/* Image Gallery */}
              <div className="bg-white sm:rounded-2xl overflow-hidden sm:shadow-lg mb-4 sm:mb-6">
                {/* Main Image */}
                <div className="relative h-64 sm:h-96 md:h-[500px] lg:h-[600px] bg-gray-100">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A9B6D]"></div>
                    </div>
                  )}
                  <img
                    src={activeImage || "https://placehold.co/1200x800?text=No+Image"}
                    alt="Property"
                    className={`w-full h-full object-cover cursor-zoom-in ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onClick={() => setShowImageModal(true)}
                    onLoad={() => setImageLoading(false)}
                  />

                  {/* Image Navigation Arrows */}
                  {property.images?.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={activeImageIndex === 0}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-20"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        disabled={activeImageIndex === property.images.length - 1}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-20"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Verified Badge */}
                  {property.verification_status === "VERIFIED" && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A9B6D]" />
                      <span className="text-[#2D5F3F] font-semibold text-[10px] sm:text-xs">Verified</span>
                    </div>
                  )}



                  {/* Image Counter & View All */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 flex items-center justify-between z-20">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-white transition-all shadow-lg flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View All</span>
                    </button>
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                      {activeImageIndex + 1} / {property.images?.length || 1}
                    </div>
                  </div>
                </div>

                {/* Thumbnail Gallery - Desktop Only */}
                {property.images?.length > 1 && (
                  <div className="hidden sm:grid grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50">
                    {property.images.slice(0, 4).map((img: any, idx: number) => (
                      <div
                        key={img.id}
                        onClick={() => changeImage(img.image, idx)}
                        className={`h-20 md:h-24 bg-cover bg-center rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${activeImage === img.image ? 'ring-3 ring-[#4A9B6D] ring-offset-2' : ''
                          }`}
                        style={{ backgroundImage: `url(${img.image})` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Property Header - Mobile */}
              <div className="sm:hidden bg-white px-4 py-4 mb-4">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 mb-1.5 leading-tight">{property.title}</h1>
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#4A9B6D] flex-shrink-0" />
                      <span>{property.locality}, {property.city}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 rounded-full">
                      <Share2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleSave} className="h-9 w-9 rounded-full">
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-2xl font-bold text-[#2D5F3F] mb-0.5">
                      {formatPrice(Number(property.total_price))}
                    </div>
                    {property.carpet_area && (
                      <div className="text-xs text-gray-500">
                        ₹{Math.round(property.total_price / parseInt(property.carpet_area)).toLocaleString('en-IN')}/sq ft
                      </div>
                    )}
                  </div>
                  {property.verification_status === "VERIFIED" && (
                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2.5 py-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Property Overview - Desktop Only */}
              <div className="hidden sm:block bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                      <p className="text-lg text-gray-600 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#4A9B6D] flex-shrink-0" />
                        <span>{property.address_line || `${property.locality}, ${property.city}`}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={toggleSave}>
                        <Heart className={`w-6 h-6 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="w-6 h-6 text-gray-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {property.views || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Posted {new Date(property.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      ID: #{property.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Desktop */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl hover:shadow-md transition-all">
                    <Bed className="w-8 h-8 mx-auto text-[#4A9B6D] mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.bhk_config}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl hover:shadow-md transition-all">
                    <Bath className="w-8 h-8 mx-auto text-[#4A9B6D] mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl hover:shadow-md transition-all">
                    <Ruler className="w-8 h-8 mx-auto text-[#4A9B6D] mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{property.carpet_area}</div>
                    <div className="text-sm text-gray-600">Sq Ft</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl hover:shadow-md transition-all">
                    <Building className="w-8 h-8 mx-auto text-[#4A9B6D] mb-2" />
                    <div className="text-xl font-bold text-gray-900">{property.property_type}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                </div>

                {/* Description - Desktop */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Description</h2>
                  <div className="text-base text-gray-600 leading-relaxed space-y-3">
                    {property.description ? (
                      property.description.split('\n').map((paragraph: string, idx: number) => (
                        paragraph.trim() && <p key={idx}>{paragraph}</p>
                      ))
                    ) : (
                      <p className="text-gray-400 italic">No description provided by the seller.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats - Mobile Only */}
              <div className="sm:hidden bg-white px-4 py-4 mb-4">
                <h2 className="text-base font-bold text-gray-900 mb-3">Property Details</h2>
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="text-center p-3 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl">
                    <Bed className="w-6 h-6 text-[#4A9B6D] mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-gray-900">{property.bhk_config}</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Beds</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl">
                    <Bath className="w-6 h-6 text-[#4A9B6D] mx-auto mb-1.5" />
                    <div className="text-lg font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Baths</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl">
                    <Ruler className="w-6 h-6 text-[#4A9B6D] mx-auto mb-1.5" />
                    <div className="text-sm font-bold text-gray-900">{property.carpet_area}</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Sq Ft</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#E8F5E9] to-[#E8F5E9]/50 rounded-xl">
                    <Building className="w-6 h-6 text-[#4A9B6D] mx-auto mb-1.5" />
                    <div className="text-[10px] font-bold text-gray-900 leading-tight">{property.property_type}</div>
                    <div className="text-[10px] text-gray-600 leading-tight">Type</div>
                  </div>
                </div>
              </div>

              {/* Description - Mobile */}
              <div className="sm:hidden bg-white px-4 py-4 mb-4">
                <h2 className="text-base font-bold text-gray-900 mb-3">About Property</h2>
                <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                  {property.description ? (
                    property.description.split('\n').map((paragraph: string, idx: number) => (
                      paragraph.trim() && <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No description provided.</p>
                  )}
                </div>
              </div>

              {/* Contact CTAs - Mobile */}
              <div className="sm:hidden bg-white px-4 py-4 mb-4">
                <div className="space-y-2.5">
                  <Button
                    onClick={handleContactOwner}
                    className="w-full bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D] text-white py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    disabled={contactLoading}
                  >
                    {contactLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                    Contact Owner
                  </Button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button variant="outline" className="border-2 border-[#4A9B6D] text-[#4A9B6D] py-3 rounded-xl font-semibold hover:bg-[#E8F5E9]/50 transition-all flex items-center justify-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                    <Button variant="outline" className="border-2 border-[#2D5F3F] text-[#2D5F3F] py-3 rounded-xl font-semibold hover:bg-[#E8F5E9]/50 transition-all flex items-center justify-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features & Amenities */}
              {getAmenitiesList(property).length > 0 && (
                <div className="bg-white sm:rounded-2xl p-4 sm:p-6 md:p-8 sm:shadow-lg mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">Features & Amenities</h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                    {getAmenitiesList(property).map((amenity: string, idx: number) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-[#E8F5E9]/30 transition-all group">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-[#4A9B6D]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all">
                            <Icon className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#4A9B6D]" />
                          </div>
                          <span className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legal Documents - Mobile */}
              {(property.has_7_12 || property.has_mojani) && (
                <div className="sm:hidden bg-white px-4 py-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-[#4A9B6D]" />
                    <h3 className="font-bold text-base text-gray-900">Legal Documents</h3>
                  </div>
                  <div className="space-y-2">
                    {property.has_7_12 && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>7/12 Extract Available</span>
                      </div>
                    )}
                    {property.has_mojani && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span>Mojani Map Available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location & Map */}
              <div className="bg-white sm:rounded-2xl p-4 sm:p-6 md:p-8 sm:shadow-lg mb-4 sm:mb-6">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-6">Location & Nearby</h2>

                {/* Detailed Address */}
                <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D5F3F]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">Property Address</h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {property.project_name && <span className="font-medium block text-gray-800 mb-1">{property.project_name}</span>}
                        {property.address_line}
                      </p>
                      <p className="text-sm sm:text-base text-gray-600 mt-0.5">
                        {property.locality}, {property.city} {property.pincode && <span>- {property.pincode}</span>}
                      </p>
                      {property.landmarks && (
                        <div className="mt-2.5 pt-2.5 border-t border-gray-200/60">
                          <p className="text-xs sm:text-sm text-gray-500">
                            <span className="font-semibold text-gray-700">Landmark:</span> {property.landmarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="mb-4 sm:mb-6 rounded-xl overflow-hidden">
                  <MapViewer lat={property.latitude} lng={property.longitude} />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Approximate location shown for privacy
                  </p>
                </div>

                {/* Nearby Places */}
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">What's Nearby</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#E8F5E9]/30 rounded-lg hover:shadow-md transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#4A9B6D]/10 flex items-center justify-center flex-shrink-0">
                        <School className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900">Schools</p>
                        <p className="text-xs sm:text-sm text-gray-600">2 km away</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#E8F5E9]/30 rounded-lg hover:shadow-md transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#4A9B6D]/10 flex items-center justify-center flex-shrink-0">
                        <Hospital className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900">Hospitals</p>
                        <p className="text-xs sm:text-sm text-gray-600">3 km away</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 bg-[#E8F5E9]/30 rounded-lg hover:shadow-md transition-all">
                      <div className="w-9 h-9 rounded-lg bg-[#4A9B6D]/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A9B6D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base text-gray-900">Shopping</p>
                        <p className="text-xs sm:text-sm text-gray-600">1.5 km away</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property ID - Mobile */}
              <div className="sm:hidden bg-white px-4 py-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Property ID</span>
                  <span className="text-gray-900 font-bold font-mono">#{property.id.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Sticky Booking Card - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                {/* Main Booking Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {formatPrice(Number(property.total_price))}
                    </div>
                    {property.carpet_area && (
                      <div className="text-sm text-gray-600">
                        ₹{Math.round(property.total_price / parseInt(property.carpet_area)).toLocaleString('en-IN')} per sq ft
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-semibold text-gray-900">{property.property_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Property Status</span>
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                        {property.property_status || "Ready to Move"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Listing Type</span>
                      <Badge variant="outline" className="text-xs">{property.listing_type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-mono text-xs text-gray-900">#{property.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleContactOwner}
                      className="w-full bg-gradient-to-r from-[#2D5F3F] to-[#4A9B6D] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      disabled={contactLoading}
                    >
                      {contactLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                      Contact Owner
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-[#4A9B6D] text-[#4A9B6D] py-2 mt-2 rounded-xl font-semibold hover:bg-[#E8F5E9]/50 transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Schedule Visit
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2" onClick={toggleSave}>
                      <Heart className={`w-5 h-5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      {isSaved ? "Saved" : "Save Property"}
                    </Button>
                  </div>

                  {/* Legal Verification */}
                  {(property.has_7_12 || property.has_mojani) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#4A9B6D]" />
                        Legal Documents
                      </h3>
                      <div className="space-y-2">
                        {property.has_7_12 && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2.5 rounded-lg">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            7/12 Extract Available
                          </div>
                        )}
                        {property.has_mojani && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2.5 rounded-lg">
                            <Check className="w-4 h-4 flex-shrink-0" />
                            Mojani Map Available
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Download & Report */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex gap-2">
                    <Button variant="ghost" className="flex-1 text-sm" onClick={() => window.print()}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="ghost" className="flex-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[2010]"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-6xl w-full">
            <img
              src={activeImage}
              alt="Property"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              {activeImageIndex + 1} / {property.images?.length || 1}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Share Property</h3>
            <Button onClick={copyLink} className="w-full bg-[#2D5F3F] hover:bg-[#1B3A2C]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* Contact Owner Modal */}
      {showContactModal && contactDetails && (
        <div className="fixed inset-0 bg-black/60 z-[2010] flex items-end sm:items-center justify-center sm:p-4" onClick={() => setShowContactModal(false)}>
          <div
            className="bg-white w-full sm:w-auto sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up sm:animate-in sm:fade-in sm:zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Owner Contact Details</h3>
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center text-2xl font-bold text-[#2D5F3F]">
                {contactDetails.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{contactDetails.full_name}</h4>
                <p className="text-sm text-gray-500">Property Owner</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5 text-[#2D5F3F]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                    <p className="text-base font-bold text-gray-900">{contactDetails.phone_number}</p>
                  </div>
                </div>
                <a href={`tel:${contactDetails.phone_number}`}>
                  <Button size="sm" className="bg-[#2D5F3F] hover:bg-[#1B3A2C] rounded-lg">Call</Button>
                </a>
              </div>

              {contactDetails.whatsapp_number && (
                <div className="p-4 bg-green-50 rounded-xl flex items-center justify-between border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-700 font-medium">WhatsApp</p>
                      <p className="text-base font-bold text-gray-900">{contactDetails.whatsapp_number}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${contactDetails.whatsapp_number.replace(/\D/g, '')}?text=Hi, I am interested in your property listed on SaudaPakka.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-lg border-none">Chat</Button>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                By contacting the owner, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
