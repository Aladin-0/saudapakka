"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { Plus } from "lucide-react"; // Make sure lucide-react is installed

export default function MyListingsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        
        {/* This button links to the Create page you made earlier */}
        <Link href="/dashboard/my-listings/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Property
          </Button>
        </Link>
      </div>

      <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center">
        <p className="text-gray-500">You haven't listed any properties yet.</p>
      </div>
    </div>
  );
}