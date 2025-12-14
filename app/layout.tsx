import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar"; // <--- Importing your new component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NJZone",
  description: "For Bunnies, By Bunnies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          {/* Put the Sidebar here! */}
          <Sidebar />
          
          {/* This main part is where your pages (Home, Profile, etc.) will load */}
          <main className="flex-1 md:ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}