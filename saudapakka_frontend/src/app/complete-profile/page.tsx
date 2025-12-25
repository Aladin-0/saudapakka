"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompleteProfile() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      // PATCH request to update name
      await api.patch("/api/user/me/", { full_name: name });
      router.push("/dashboard/overview"); // Go to home after saving
    } catch (error) {
      alert("Failed to update name");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">One Last Step!</h1>
      <p className="mb-4 text-gray-600">Please enter your full name to continue.</p>
      <Input 
        className="max-w-xs mb-4" 
        placeholder="Full Name (e.g. Rahul Patil)" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <Button onClick={handleSubmit} disabled={!name}>Save & Continue</Button>
    </div>
  );
}