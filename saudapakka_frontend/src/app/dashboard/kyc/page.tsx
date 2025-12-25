"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Fingerprint, 
  CheckCircle2, 
  Lock, 
  Loader2,
  AlertCircle,
  ScanFace
} from "lucide-react";

export default function KYCPage() {
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-format: 0000 0000 0000
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 12);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaar(formatted);
  };

  const handleSubmit = async () => {
    const rawAadhaar = aadhaar.replace(/\s/g, '');
    if (rawAadhaar.length !== 12) return;

    setLoading(true);
    try {
      const payload = {
        aadhaar_number: rawAadhaar,
        digilocker_json: { verified: true, name: "User from Frontend", timestamp: new Date().toISOString() }
      };
      await api.post("/api/kyc/submit/", payload);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Verification failed. Please try again.");
    }
    setLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-green-50 text-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Complete</h2>
          <p className="text-gray-500 mb-8">
            Thank you for verifying your identity. You now have full access to Seller features.
          </p>
          <Button 
            className="bg-primary-green hover:bg-dark-green text-white px-8 py-2 rounded-xl font-semibold"
            onClick={() => window.location.href = '/dashboard/overview'}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
        <p className="text-gray-500">Securely verify your identity to unlock premium features.</p>
      </div>

      {/* Main Unified Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: The Main Form (White Background - Primary Focus) */}
        <div className="flex-1 p-8 lg:p-12">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-primary-green">
                   <ScanFace className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900">Aadhaar KYC</h2>
                   <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Digilocker Secured
                   </div>
                </div>
            </div>

            <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Aadhaar Number</label>
                   <div className="relative group">
                      <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-primary-green transition-colors" />
                      <input 
                        type="text"
                        placeholder="0000 0000 0000" 
                        value={aadhaar} 
                        onChange={handleAadhaarChange}
                        className="w-full pl-11 pr-4 h-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-300 focus:border-accent-green focus:ring-4 focus:ring-green-50 transition-all font-mono text-lg tracking-wide outline-none"
                        maxLength={14} 
                      />
                   </div>
                   <p className="text-xs text-gray-400 ml-1">Enter your 12-digit UIDAI number.</p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl flex gap-3 items-start">
                   <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                   <p className="text-xs text-blue-700 leading-relaxed">
                      Your ID is checked against the government database for authenticity. We do not store biometric data.
                   </p>
                </div>

                <Button 
                    onClick={handleSubmit} 
                    disabled={loading || aadhaar.replace(/\s/g, '').length !== 12} 
                    className="w-full h-12 bg-primary-green hover:bg-dark-green text-white font-semibold rounded-xl shadow-lg shadow-green-900/5 transition-all"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                </Button>
            </div>
        </div>

        {/* RIGHT: Benefits (Subtle Grey Background - Secondary Focus) */}
        <div className="lg:w-80 bg-gray-50/80 border-l border-gray-100 p-8 lg:p-10 flex flex-col justify-center">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Why Verify?</h3>
            
            <ul className="space-y-6">
                <li className="flex gap-3 items-start">
                    <div className="mt-0.5 text-accent-green">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Verified Badge</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Get the trusted blue checkmark on your profile.
                        </p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <div className="mt-0.5 text-accent-green">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Higher Visibility</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Verified listings appear top in search results.
                        </p>
                    </div>
                </li>
                <li className="flex gap-3 items-start">
                    <div className="mt-0.5 text-accent-green">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Broker Network</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Unlock networking tools with other brokers.
                        </p>
                    </div>
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
}