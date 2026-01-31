"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Gamepad2, Brain, Coins, Lock, Sparkles } from "lucide-react";

export default function ArcadeMenu() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('tokki_points').eq('id', user.id).single();
        setBalance(data?.tokki_points || 0);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      
      {/* Header */}
      <div className="text-center mb-10 animate-in slide-in-from-top-5 duration-700">
        <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Gamepad2 size={40} className="text-nj-pink" />
          NJZone Arcade
        </h1>
        <p className="text-gray-500">Play games, earn Tokkins, fuel your addiction.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-nj-pink to-purple-400 p-6 rounded-3xl text-white shadow-lg mb-10 flex items-center justify-between transform transition-all hover:scale-[1.02]">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full"><Coins size={24} /></div>
            <div className="text-left">
                <p className="text-xs font-bold opacity-80 uppercase">Your Wallet</p>
                <p className="text-2xl font-black">{balance.toLocaleString()} Tokkins</p>
            </div>
        </div>
        <Sparkles className="opacity-50 animate-pulse" />
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 🧠 Bunny Match (Active Game) */}
        <Link href="/arcade/memory">
          <div className="bg-white border-2 border-pink-100 p-6 rounded-3xl hover:border-nj-pink hover:shadow-md transition-all group cursor-pointer h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-nj-pink text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wide">
                Earn 50 🪙
            </div>
            
            <div className="bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Brain size={32} className="text-nj-pink" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-nj-pink transition-colors">Bunny Match</h3>
            <p className="text-sm text-gray-500 leading-snug">
              Test your memory with NewJeans icons. Find the pairs to get paid.
            </p>
          </div>
        </Link>

        {/* 🔒 Coming Soon Placeholder */}
        {/* 🍓 Strawberry Rush */}
<Link href="/arcade/strawberry">
  <div className="bg-white border-2 border-green-100 p-6 rounded-3xl hover:border-green-400 hover:shadow-md transition-all group cursor-pointer h-full relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wide">
        New! 🍓
    </div>
    
    <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <span className="text-3xl">🧺</span>
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">Strawberry Rush</h3>
    <p className="text-sm text-gray-500 leading-snug">
      Help Farmer Hyein harvest the crops. Catch the golden ones, avoid the bugs.
    </p>
  </div>
</Link>


      </div>
    </div>
  );
}
