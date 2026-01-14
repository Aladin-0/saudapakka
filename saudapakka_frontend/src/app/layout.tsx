import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/auth-provider";

// Load the font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaudaPakka | 100% Verified Real Estate",
  description: "Find your perfect home with confidence. 100% verified listings, zero hassle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-gray-900 bg-white`} suppressHydrationWarning>
        {/* Google Maps Script Injection - Strategy: beforeInteractive to load early */}
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&loading=async`}
          async
          defer
        />
        <AuthProvider>
          <div id="app-content" className="w-full min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}