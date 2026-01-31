"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MapIcon,
  TagIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ChevronRightIcon,
  FingerPrintIcon,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import api from "@/lib/axios";

export default function KYCPage() {
  const router = useRouter();

  // File State
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const ROLES = [
    { id: 'SELLER', label: 'Seller', description: 'Post properties', icon: TagIcon },
    { id: 'BROKER', label: 'Broker', description: 'Real Estate Agent', icon: BriefcaseIcon },
    { id: 'BUILDER', label: 'Builder', description: 'Projects & Layouts', icon: BuildingOfficeIcon },
    { id: 'PLOTTING_AGENCY', label: 'Agency', description: 'Land & Plots', icon: MapIcon },
  ];

  // UI State
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  // WIZARD STATE
  const [step, setStep] = useState(1); // 1: Role, 2: Docs, 3: Selfie

  // Selfie capture state
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Check if user is already verified
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const authData = localStorage.getItem('saudapakka-auth');
        if (authData) {
          const user = JSON.parse(authData);
          if (user.is_kyc_verified) {
            setIsAlreadyVerified(true);
            setChecking(false);
            return;
          }
        }
        const response = await api.get('/api/user/me/');
        if (response.data.is_kyc_verified) {
          setIsAlreadyVerified(true);
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setChecking(false);
      }
    };
    checkKYCStatus();
  }, [router]);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
    };
  }, [cameraStream]);

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      setIsCameraOpen(true);
      setTimeout(() => {
        const videoElement = document.getElementById('selfie-video') as HTMLVideoElement;
        if (videoElement) videoElement.srcObject = stream;
      }, 100);
    } catch (error: any) {
      setCameraError('Camera access denied or missing.');
    }
  };

  const captureSelfie = () => {
    const videoElement = document.getElementById('selfie-video') as HTMLVideoElement;
    if (videoElement) {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setSelfieImage(file);
            setSelfiePreview(URL.createObjectURL(file));
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const retakeSelfie = () => {
    setSelfieImage(null);
    setSelfiePreview(null);
    openCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file (JPG or PNG)'); return; }

    // Different size limits for front and back
    const frontMaxSize = 15 * 1024 * 1024; // 15MB
    const backMaxSize = 25 * 1024 * 1024;  // 25MB

    if (side === 'front' && file.size > frontMaxSize) {
      setError('Aadhaar front image must be less than 15MB');
      return;
    }
    if (side === 'back' && file.size > backMaxSize) {
      setError('Aadhaar back image must be less than 25MB');
      return;
    }

    setError(null);
    if (side === 'front') { setFrontImage(file); setFrontPreview(URL.createObjectURL(file)); }
    else { setBackImage(file); setBackPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async () => {
    if (!navigator.onLine) { setError("Please check your internet connection."); return; }
    if (!frontImage || !backImage || !selfieImage || !selectedRole) { setError("Please complete all steps."); return; }
    setUploading(true); setError(null);
    const formData = new FormData();
    formData.append("aadhaar_front", frontImage);
    formData.append("aadhaar_back", backImage);
    formData.append("selfie", selfieImage);
    formData.append("requested_role", selectedRole);

    try {
      const response = await api.post('/api/kyc/upload-aadhaar/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.status === 200) {
        try {
          const userResponse = await api.get('/api/user/me/');
          if (userResponse.data) localStorage.setItem('saudapakka-auth', JSON.stringify(userResponse.data));
        } catch (e) { console.error(e); }
        setSuccess(true);
        setTimeout(() => { router.push('/dashboard'); window.location.href = '/dashboard'; }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !selectedRole) { setError("Select a role to continue."); return; }
    if (step === 2 && (!frontImage || !backImage)) { setError("Upload both sides of Aadhaar."); return; }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  if (checking) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-primary-green/20 border-t-primary-green rounded-full animate-spin"></div>
    </div>
  );

  if (isAlreadyVerified || success) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white border border-gray-100 rounded-3xl p-12 max-w-md w-full text-center shadow-xl animate-[fadeIn_0.5s_ease-out]">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckBadgeIcon className="w-10 h-10 text-primary-green" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{success ? 'Access Granted' : 'Verified'}</h2>
          <p className="text-gray-500 mb-8">Your digital identity is confirmed.</p>
          <button onClick={() => router.push('/dashboard')} className="w-full bg-primary-green text-white py-3.5 rounded-xl font-bold hover:bg-dark-green transition-all">
            Enter Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-50 font-sans flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">

      {/* Enhanced Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-green/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-green-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card - Enhanced Mobile */}
      <div className="relative z-10 w-full max-w-5xl bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] flex flex-col max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-32px)]">

        {/* Enhanced Progress Bar */}
        <div className="h-2 sm:h-1.5 w-full bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-2xl sm:rounded-t-3xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-green to-green-600 transition-all duration-700 ease-out shadow-lg shadow-green-500/30"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 flex items-end justify-between border-b border-gray-100/50 flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-primary-green font-bold text-xs sm:text-sm uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse shadow-lg shadow-green-500/50"></span>
              Step 0{step} / 03
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              {step === 1 && "Select Identity"}
              {step === 2 && "Documents"}
              {step === 3 && "Face Verification"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
              {step === 1 && "Choose your role to get started"}
              {step === 2 && "Upload both sides of your Aadhaar"}
              {step === 3 && "Take a clear selfie for verification"}
            </p>
          </div>
          <div className="hidden md:flex gap-2 opacity-50">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-10 rounded-full transition-all duration-300 ${s === step ? 'bg-primary-green scale-110' : s < step ? 'bg-green-300' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        {/* CONTENT AREA - Enhanced Scrolling */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 custom-scrollbar">

          {/* STEP 1: ROLE - Enhanced Mobile Grid */}
          {step === 1 && (
            <div className="h-full flex flex-col justify-center animate-[fadeIn_0.5s_ease-out]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`group relative p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer active:scale-95 ${isSelected
                        ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-primary-green shadow-lg shadow-green-500/20 scale-[1.02]'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-md active:shadow-sm'
                        }`}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${isSelected ? 'bg-primary-green text-white shadow-lg shadow-green-500/30' : 'bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-primary-green'}`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <h3 className={`font-bold text-lg sm:text-xl leading-tight mb-1.5 ${isSelected ? 'text-primary-green' : 'text-gray-900'}`}>{role.label}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{role.description}</p>
                      {isSelected && <div className="absolute top-4 right-4"><CheckCircleIcon className="w-6 h-6 text-primary-green drop-shadow-lg" /></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS - Enhanced Mobile Layout */}
          {step === 2 && (
            <div className="h-full flex items-center justify-center animate-[fadeIn_0.5s_ease-out]">
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Front - Enhanced Touch Target */}
                <div
                  className={`relative w-full aspect-[1.586/1] rounded-2xl sm:rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary-green hover:bg-green-50/30 group overflow-hidden active:scale-[0.98] ${frontImage ? 'border-primary-green bg-green-50/20 shadow-lg shadow-green-500/10' : 'border-gray-300 bg-white'}`}
                >
                  <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileChange(e, 'front')} />
                  {frontPreview ? (
                    <>
                      <Image src={frontPreview} alt="Aadhaar Front" fill className="object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                        <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 drop-shadow-lg" /> Front Side
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setFrontImage(null); setFrontPreview(null); }} className="absolute top-3 right-3 z-30 p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white text-white transition-all active:scale-90">
                        <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <ArrowUpTrayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 group-hover:text-primary-green transition-colors" />
                      </div>
                      <p className="text-gray-900 font-bold text-base sm:text-lg mb-1">Aadhaar Front</p>
                      <p className="text-xs sm:text-sm text-gray-500">Tap to upload or capture</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Max 15MB</p>
                    </div>
                  )}
                </div>

                {/* Back - Enhanced Touch Target */}
                <div
                  className={`relative w-full aspect-[1.586/1] rounded-2xl sm:rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary-green hover:bg-green-50/30 group overflow-hidden active:scale-[0.98] ${backImage ? 'border-primary-green bg-green-50/20 shadow-lg shadow-green-500/10' : 'border-gray-300 bg-white'}`}
                >
                  <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileChange(e, 'back')} />
                  {backPreview ? (
                    <>
                      <Image src={backPreview} alt="Aadhaar Back" fill className="object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-white font-semibold text-sm sm:text-base">
                        <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 drop-shadow-lg" /> Back Side
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setBackImage(null); setBackPreview(null); }} className="absolute top-3 right-3 z-30 p-2 bg-white/30 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white text-white transition-all active:scale-90">
                        <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <ArrowUpTrayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 group-hover:text-primary-green transition-colors" />
                      </div>
                      <p className="text-gray-900 font-bold text-base sm:text-lg mb-1">Aadhaar Back</p>
                      <p className="text-xs sm:text-sm text-gray-500">Tap to upload or capture</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Max 25MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SELFIE - Enhanced Mobile Camera */}
          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full overflow-hidden border-[6px] sm:border-8 border-white shadow-2xl ring-1 ring-gray-200">

                {!isCameraOpen && !selfiePreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-center p-8">
                    <FingerPrintIcon className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mb-4 animate-pulse" />
                    <p className="text-sm sm:text-base text-gray-600 font-semibold mb-2">Position your face</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-[200px]">Make sure you're in a well-lit area</p>
                    <button
                      onClick={openCamera}
                      className="bg-gradient-to-r from-primary-green to-green-600 hover:from-green-600 hover:to-primary-green text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-full font-bold shadow-xl shadow-green-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all text-sm sm:text-base flex items-center gap-2 active:scale-95"
                    >
                      <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Start Camera
                    </button>
                  </div>
                )}

                {isCameraOpen && !selfiePreview && (
                  <>
                    <video id="selfie-video" autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 border-[4px] border-primary-green/40 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-10">
                      <button onClick={captureSelfie} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 sm:border-[6px] border-gray-300 hover:border-primary-green transition-all shadow-2xl active:scale-90 hover:scale-105"></button>
                    </div>
                    <button onClick={closeCamera} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all active:scale-90">
                      <XCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  </>
                )}

                {selfiePreview && (
                  <>
                    <Image src={selfiePreview} alt="Selfie" fill className="object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-green/20 to-transparent mix-blend-overlay"></div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center gap-2 shadow-xl">
                      <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-green" />
                      <span className="text-sm sm:text-base font-bold text-dark-green">Captured</span>
                    </div>
                    <button onClick={retakeSelfie} className="absolute inset-0 opacity-0 hover:opacity-100 active:opacity-100 bg-black/60 text-white font-bold text-base sm:text-lg flex items-center justify-center transition-opacity z-10 backdrop-blur-sm">
                      Tap to Retake
                    </button>
                  </>
                )}
              </div>
              <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-600 max-w-sm mx-auto px-4 leading-relaxed">
                {selfiePreview ? "✓ Photo looks great! You can now proceed." : "Ensure you're in a well-lit environment and remove glasses if wearing any."}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER - Enhanced Mobile Actions */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t border-gray-100 flex-shrink-0 bg-white/70 backdrop-blur-md rounded-b-2xl sm:rounded-b-3xl">
          {error && (
            <div className="mb-4 bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base flex items-center gap-3 animate-[shake_0.4s_ease-in-out] border border-red-200 shadow-sm">
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="text-gray-600 font-semibold hover:text-gray-900 transition-colors text-sm sm:text-base px-3 sm:px-4 py-2 hover:bg-gray-100 rounded-lg active:scale-95"
                >
                  ← Back
                </button>
              )}
            </div>

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="bg-gradient-to-r from-primary-green to-green-600 text-white px-8 sm:px-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold hover:from-green-600 hover:to-primary-green transition-all shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base active:scale-95"
              >
                Continue <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={uploading || !selfiePreview}
                className={`px-8 sm:px-12 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2 text-sm sm:text-base active:scale-95 ${uploading || !selfiePreview ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-green to-green-600 hover:from-green-600 hover:to-primary-green shadow-green-900/30 hover:shadow-xl'}`}
              >
                {uploading ? (
                  <><ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> Verifying...</>
                ) : (
                  <><ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Submit</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1));
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(34, 197, 94, 0.5), rgba(34, 197, 94, 0.2));
        }
        @keyframes fadeIn {
           from { opacity: 0; transform: scale(0.96); }
           to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 3px;
          }
        }
      `}</style>
    </div>
  );
}
