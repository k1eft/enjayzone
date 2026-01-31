"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { MessageCircle, Users, Loader2 } from "lucide-react";

// The Zones Data (Static info only)
const ZONES = [
  { id: 'global', name: "Global Chat 🌍", desc: "General Yap Session", color: "bg-gray-100 text-gray-600" },
  { id: 'hanni-yappers', name: "Hanni's Little Yappers 🐰", desc: "Don't tell her that her unicorn is pregnant", color: "bg-pink-100 text-pink-600" },
  { id: 'danielle-sunshine', name: "Danielle Enjoyers 🌻", desc: "Sunshine corner", color: "bg-yellow-100 text-yellow-600" },
  { id: 'haerin-frogs', name: "Haerin's Frogs 🐸", desc: "Kang Haerin supremacy", color: "bg-green-100 text-green-600" },
  { id: 'hyein-strawberries', name: "Hyein's Strawberries 🍓", desc: "Maknae on top", color: "bg-purple-100 text-purple-600" },
  { id: 'minji-cleaning', name: "Kim Minji & Friends 🐻", desc: "Cleaning patrol", color: "bg-blue-100 text-blue-600" }
];

export default function YapPage() {
  // Store the live counts here: { 'global': 5, 'hanni': 2 }
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👇 THE MAGIC LOOP
    // We subscribe to all 6 rooms to watch the user count
    const channels = ZONES.map((zone) => {
      const channel = supabase.channel(`room_${zone.id}`)
        .on('presence', { event: 'sync' }, () => {
          // Whenever someone joins/leaves, recount the room
          const state = channel.presenceState();
          // The state is an object of users. The length of keys = number of users.
          const userCount = Object.keys(state).length;
          
          setCounts((prev) => ({
            ...prev,
            [zone.id]: userCount
          }));
        })
        .subscribe();
        
      return channel;
    });

    setLoading(false);

    // Cleanup: Unsubscribe when leaving the lobby
    return () => {
      channels.forEach(c => supabase.removeChannel(c));
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Yap Zones 🗣️</h1>
        <p className="text-gray-500">Pick a room and start chatting live.</p>
      </div>

      <div className="grid gap-4">
        {ZONES.map((zone) => (
          <Link href={`/chat/${zone.id}`} key={zone.id}>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${zone.color}`}>
                  #
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-nj-pink transition-colors">
                    {zone.name}
                  </h3>
                  <p className="text-sm text-gray-400">{zone.desc}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* 🔴 LIVE BADGE */}
                {(counts[zone.id] || 0) > 0 && (
                   <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-red-500 rounded-full"/> LIVE
                   </span>
                )}
                
                {/* 👥 USER COUNT */}
                <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                  <Users size={16} />
                  <span>
                    {loading ? "..." : (counts[zone.id] || 0)} Bunnies
                  </span>
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}