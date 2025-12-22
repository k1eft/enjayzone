import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // ⚠️ CHANGE THIS TO YOUR ACTUAL VERCEL DOMAIN WHEN DEPLOYED
  metadataBase: new URL('https://njzone.vercel.app'), 
  
  title: {
    default: "NJZone | For Bunnies, By Bunnies",
    template: "%s | NJZone"
  },
  description: "Join the ultimate NewJeans community. Collect digital photocards, yap in the chat, and customize your profile.",

  // 🟦 DISCORD / FACEBOOK / IMESSAGE EMBEDS
  openGraph: {
    title: "NJZone | For Bunnies, By Bunnies",
    description: "Join the ultimate NewJeans community. Collect digital photocards, yap in the chat, and customize your profile. (Not affiliated with HYBE/ADOR)",
    url: "https://njzone.vercel.app",
    siteName: "NJZone",
    images: [
      {
        url: "/og-image.png", // 👈 Make sure this file exists in public/ folder
        width: 1200,
        height: 630,
        alt: "NJZone Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 🐦 TWITTER / X LARGE CARD
  twitter: {
    card: "summary_large_image",
    title: "NJZone",
    description: "Collect cards, chat, and vibe with NewJeans fans. (Not affiliated with HYBE/ADOR)",
    images: ["/og-image.png"],
  },
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
          
          {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
          <Sidebar />
          
          {/* Main Content Area 
             - md:ml-64: Pushes content right on desktop to fit sidebar
             - pb-24: Adds padding at bottom so Mobile Nav doesn't cover content
             - md:pb-8: Resets bottom padding on desktop
          */}
          <main className="flex-1 md:ml-64 p-8 pb-24 md:pb-8">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
