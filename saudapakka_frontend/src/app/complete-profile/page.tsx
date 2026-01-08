"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Phone, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setFormData({ ...formData, phone_number: value });
    }
  };

  const handleUpdate = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.phone_number.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      await api.patch("/api/user/me/", formData);
      router.push("/dashboard/overview");
    } catch (error: any) {
      console.error(error);
      const data = error.response?.data;
      if (data) {
        const fieldErrors = Object.keys(data).map(key => {
          const msgs = Array.isArray(data[key]) ? data[key].join(" ") : data[key];
          return `${key.replace('_', ' ').toUpperCase()}: ${msgs}`;
        }).join("\n");
        alert(fieldErrors || "Failed to update profile. Please try again.");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">

      {/* --- BACKGROUND (Matching Login Page) --- */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-green/90 via-dark-green/80 to-black/60"></div>
      </div>

      {/* Floating Blobs */}
      <div className="hidden sm:block absolute top-[10%] left-[10%] w-72 h-72 bg-accent-green/20 rounded-full blur-3xl animate-float"></div>
      <div className="hidden sm:block absolute bottom-[10%] right-[10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-lg px-4 sm:px-6">

        {/* GLASS CARD */}
        <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/40 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-500">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-xl mb-4 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Values First.
            </h1>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Tell us a bit about yourself to personalize your experience on SaudaPakka.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">First Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent-green transition-colors pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="pl-10 pr-4 h-12 bg-white border-gray-200 focus:border-accent-green focus:ring-accent-green rounded-xl"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent-green transition-colors pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="pl-10 pr-4 h-12 bg-white border-gray-200 focus:border-accent-green focus:ring-accent-green rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent-green transition-colors pointer-events-none z-10" />
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="pl-10 pr-4 h-12 bg-white border-gray-200 focus:border-accent-green focus:ring-accent-green rounded-xl"
                />
              </div>
              {formData.phone_number.length > 0 && formData.phone_number.length < 10 && (
                <p className="text-xs text-red-500 ml-1">
                  {10 - formData.phone_number.length} more digit{10 - formData.phone_number.length > 1 ? 's' : ''} required
                </p>
              )}
              {formData.phone_number.length === 10 && (
                <p className="text-xs text-green-600 ml-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid mobile number
                </p>
              )}
            </div>

            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full h-12 mt-4 bg-gradient-to-r from-primary-green to-accent-green hover:to-primary-green text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  Complete Setup <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">
              Your information is securely stored and never shared without permission.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
