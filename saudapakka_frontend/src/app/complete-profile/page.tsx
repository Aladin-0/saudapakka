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

  const handleUpdate = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      alert("Please fill in all fields.");
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
        // Handle field-specific errors (e.g. phone_number: ["User with this..."])
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-accent-green transition-colors" />
                  <Input

                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Last Name</label>
                <div className="relative group">
                  <Input

                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-accent-green transition-colors" />
                <Input

                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
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