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
    if (file.size > 5 * 1024 * 1024) { setError('File size must be less than 5MB'); return; }
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
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] lg:h-screen w-full bg-gray-50 font-sans flex items-center justify-center p-4 md:p-6 overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-green/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-200/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col max-h-full">

        {/* Progress Bar (Top) */}
        <div className="h-1.5 w-full bg-gray-100 rounded-t-[2rem] overflow-hidden">
          <div
            className="h-full bg-primary-green transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 flex items-end justify-between border-b border-gray-100/50 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-primary-green font-bold text-xs uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse"></span>
              Step 0{step} / 03
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {step === 1 && "Select Identity"}
              {step === 2 && "Documents"}
              {step === 3 && "Face Verification"}
            </h1>
          </div>
          <div className="hidden md:flex gap-1.5 opacity-40">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s === step ? 'bg-primary-green' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>

        {/* CONTENT AREA (Scrollable Middle) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">

          {/* STEP 1: ROLE */}
          {step === 1 && (
            <div className="h-full flex flex-col justify-center animate-[fadeIn_0.4s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                          ? 'bg-green-50/50 border-primary-green shadow-md scale-[1.02]'
                          : 'bg-white border-gray-100 hover:border-green-200 hover:shadow-sm'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? 'bg-primary-green text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-primary-green'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className={`font-bold text-lg leading-tight mb-1 ${isSelected ? 'text-primary-green' : 'text-gray-900'}`}>{role.label}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
                      {isSelected && <div className="absolute top-3 right-3"><CheckCircleIcon className="w-5 h-5 text-primary-green" /></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENTS */}
          {step === 2 && (
            <div className="h-full flex items-center justify-center animate-[fadeIn_0.4s_ease-out]">
              <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
                {/* Front */}
                <div
                  className={`relative w-full aspect-[1.586/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary-green hover:bg-green-50/30 group overflow-hidden ${frontImage ? 'border-primary-green bg-green-50/20' : 'border-gray-200 bg-white'}`}
                >
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileChange(e, 'front')} />
                  {frontPreview ? (
                    <>
                      <Image src={frontPreview} alt="Aadhaar Front" fill className="object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-white font-medium text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-400" /> Front Side
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setFrontImage(null); setFrontPreview(null); }} className="absolute top-2 right-2 z-30 p-1.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white text-white transition-colors">
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <ArrowUpTrayIcon className="w-6 h-6 text-gray-400 group-hover:text-primary-green" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">Aadhaar Front</p>
                      <p className="text-xs text-gray-400">Click to upload image</p>
                    </div>
                  )}
                </div>

                {/* Back */}
                <div
                  className={`relative w-full aspect-[1.586/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary-green hover:bg-green-50/30 group overflow-hidden ${backImage ? 'border-primary-green bg-green-50/20' : 'border-gray-200 bg-white'}`}
                >
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={(e) => handleFileChange(e, 'back')} />
                  {backPreview ? (
                    <>
                      <Image src={backPreview} alt="Aadhaar Back" fill className="object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-white font-medium text-sm">
                        <CheckCircleIcon className="w-5 h-5 text-green-400" /> Back Side
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setBackImage(null); setBackPreview(null); }} className="absolute top-2 right-2 z-30 p-1.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-red-500 hover:text-white text-white transition-colors">
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <ArrowUpTrayIcon className="w-6 h-6 text-gray-400 group-hover:text-primary-green" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">Aadhaar Back</p>
                      <p className="text-xs text-gray-400">Click to upload image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SELFIE */}
          {step === 3 && (
            <div className="h-full flex flex-col items-center justify-center animate-[fadeIn_0.4s_ease-out]">
              <div className="relative w-64 h-64 md:w-72 md:h-72 bg-gray-100 rounded-full overflow-hidden border-8 border-white shadow-xl ring-1 ring-gray-200">

                {!isCameraOpen && !selfiePreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-center p-6">
                    <FingerPrintIcon className="w-16 h-16 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium mb-4">Position your face within the frame</p>
                    <button
                      onClick={openCamera}
                      className="bg-primary-green hover:bg-dark-green text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                    >
                      <CameraIcon className="w-4 h-4" /> Start Camera
                    </button>
                  </div>
                )}

                {isCameraOpen && !selfiePreview && (
                  <>
                    <video id="selfie-video" autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 border-[3px] border-primary-green/30 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-end justify-center pb-6">
                      <button onClick={captureSelfie} className="w-12 h-12 rounded-full bg-white border-4 border-gray-200 hover:border-primary-green transition-all shadow-lg"></button>
                    </div>
                    <button onClick={closeCamera} className="absolute top-4 right-4 p-1 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors">
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {selfiePreview && (
                  <>
                    <Image src={selfiePreview} alt="Selfie" fill className="object-cover transform scale-x-[-1]" />
                    <div className="absolute inset-0 bg-primary-green/10 mix-blend-overlay"></div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <CheckBadgeIcon className="w-4 h-4 text-primary-green" />
                      <span className="text-xs font-bold text-dark-green">Captured</span>
                    </div>
                    <button onClick={retakeSelfie} className="absolute top-0 right-0 left-0 h-full w-full opacity-0 hover:opacity-100 bg-black/40 text-white font-medium flex items-center justify-center transition-opacity z-10">
                      Retake Photo
                    </button>
                  </>
                )}
              </div>
              <p className="mt-6 text-center text-sm text-gray-500 max-w-xs mx-auto">
                {selfiePreview ? "Photo looks good! You can now proceed." : "Ensure you are in a well-lit environment and not wearing glasses."}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER (Actions) */}
        <div className="px-8 py-6 border-t border-gray-100 flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-b-[2rem]">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 animate-[shake_0.4s_ease-in-out]">
              <XCircleIcon className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="text-gray-500 font-medium hover:text-gray-900 transition-colors text-sm px-2"
                >
                  Back
                </button>
              )}
            </div>

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="bg-primary-green text-white px-8 py-3 rounded-xl font-bold hover:bg-dark-green transition-all shadow-lg shadow-green-900/10 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
              >
                Continue <ChevronRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={uploading || !selfiePreview}
                className={`px-10 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2 ${uploading ? 'bg-gray-400 cursor-wait' : 'bg-primary-green hover:bg-dark-green shadow-green-900/20'}`}
              >
                {uploading ? (
                  <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <><ShieldCheckIcon className="w-5 h-5" /> Submit Verification</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 20px;
        }
        @keyframes fadeIn {
           from { opacity: 0; transform: scale(0.98); }
           to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
