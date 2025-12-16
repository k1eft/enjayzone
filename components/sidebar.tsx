"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { supabase } from "@/lib/supabase"; 
import { Home, FolderHeart, Calendar, User, MessageCircle, ShoppingBag } from 'lucide-react'; 

type SidebarProfile = {
  username: string;
  avatar_url: string | null;
  banner_url: string | null; // Added this!
  bias: string | null;
  tokki_points: number;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<SidebarProfile | null>(null);

  // 1. Fetch Profile Data (Including Banner)
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url, banner_url, bias, tokki_points')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    getProfile();
  }, []);

  if (pathname === '/login' || pathname === '/signup' || pathname === '/signup/bias') {
    return null;
  }
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'YapZones', href: '/chat', icon: MessageCircle },
    { name: 'Shop', href: '/shop', icon: ShoppingBag },
    { name: 'Projects', href: '/projects', icon: FolderHeart },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-100 bg-white p-6 hidden md:flex flex-col z-50">
      
      {/* Logo Area */}
      <div className="mb-10 flex items-center gap-2">
         <div className="w-8 h-8 relative">
            <Image src="/icon.png" alt="NJ" fill className="object-contain" />
         </div>
         <h1 className="text-2xl font-bold text-nj-pink tracking-tighter">NJZone</h1>
      </div>

      {/* Nav Links */}
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium ${
                isActive 
                  ? 'bg-nj-pink text-white shadow-md shadow-pink-200' 
                  : 'text-gray-500 hover:bg-pink-50 hover:text-nj-pink'
              }`}
            >
              <item.icon size={22} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ✨ NEW BLURRED BANNER MINI-CARD ✨ */}
      {profile ? (
        <div className="mt-auto relative overflow-hidden p-3 rounded-2xl border border-gray-200 flex items-center gap-3 animate-in fade-in group">
          
          {/* 🖼️ BACKGROUND IMAGE (Blurred) */}
          {profile.banner_url ? (
            <>
              <Image 
                src={profile.banner_url} 
                alt="banner" 
                fill 
                className="object-cover blur-[2px] opacity-60 group-hover:opacity-70 transition-opacity" 
              />
              {/* White overlay so text is readable */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
            </>
          ) : (
            // Default background if no banner
            <div className="absolute inset-0 bg-pink-50/80"></div>
          )}

          {/* 👤 CONTENT (Sitting on top via z-index) */}
          <div className="relative z-10 w-10 h-10 rounded-full overflow-hidden bg-white border border-white/50 shadow-sm flex-shrink-0">
            {profile.avatar_url ? (
               <Image 
                 src={profile.avatar_url} 
                 alt={profile.username} 
                 fill
                 className="object-cover"
               />
            ) : (
               <div className="w-full h-full bg-nj-pink flex items-center justify-center text-white font-bold text-sm">
                 {profile.username?.charAt(0).toUpperCase()}
               </div>
            )}
          </div>

          <div className="relative z-10 overflow-hidden min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate drop-shadow-sm">@{profile.username}</h4>
            <div className="flex items-center gap-2 text-[10px] mt-0.5">
               <span className="bg-white/80 backdrop-blur-sm text-nj-pink px-1.5 py-0.5 rounded-full border border-white/50 truncate font-bold shadow-sm">
                 {profile.bias}
               </span>
<span className="text-yellow-700 font-bold whitespace-nowrap drop-shadow-sm">
  🪙 {profile.tokki_points} Tokkins
</span>
            </div>
          </div>
        </div>
      ) : (
        // Skeleton
        <div className="mt-auto flex gap-3 items-center p-3">
           <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
           <div className="flex-1 space-y-2">
             <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
             <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
           </div>
        </div>
      )}

    </aside>
  );
}