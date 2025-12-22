"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ArrowLeft, Lock, Loader2, Library } from "lucide-react"; // 'Library' icon for Binder vibe
import { useRouter } from "next/navigation";

// Types
interface Card {
  id: number;
  name: string;
  rarity: "Common" | "Rare" | "SR" | "UR";
  image_url: string;
}

export default function CollectionPage() {
  const router = useRouter();
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [userInventory, setUserInventory] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Stats
  const totalCards = allCards.length;
  const ownedCount = Object.keys(userInventory).length;
  const progressPercentage = totalCards > 0 ? (ownedCount / totalCards) * 100 : 0;

  useEffect(() => {
    fetchBinderData();
  }, []);

  const fetchBinderData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: cardsData } = await supabase.from('cards').select('*').order('id', { ascending: true });
      if (cardsData) setAllCards(cardsData);

      const { data: inventoryData } = await supabase.from('user_cards').select('card_id').eq('user_id', user.id);
      
      const inventoryMap: Record<number, number> = {};
      inventoryData?.forEach((item) => {
        inventoryMap[item.card_id] = (inventoryMap[item.card_id] || 0) + 1;
      });
      setUserInventory(inventoryMap);
    } catch (error) {
      console.error("Error loading binder:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🎨 UPDATED: Clean Light Mode Borders
  const getBorderColor = (rarity: string, isOwned: boolean) => {
    if (!isOwned) return "border-dashed border-gray-300 bg-gray-100"; // Soft placeholder
    switch (rarity) {
      case "Common": return "border-gray-200 shadow-sm";
      case "Rare": return "border-blue-300 shadow-blue-100 shadow-md";
      case "SR": return "border-purple-300 shadow-purple-100 shadow-lg ring-2 ring-purple-50";
      case "UR": return "border-yellow-400 shadow-yellow-200 shadow-xl ring-2 ring-yellow-100";
      default: return "border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative px-4">
      
      {/* === HEADER (Matches Shop Design) === */}
      <div className="max-w-6xl mx-auto pt-8 pb-6">
        <button 
          onClick={() => router.push('/shop')} 
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold mb-4"
        >
          <ArrowLeft size={18} /> Back to Shop
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Library className="text-nj-pink" size={32} /> 
              Ditto Archive 📼
            </h1>
            <p className="text-gray-500 font-medium mt-1">Collect all memories to complete the season.</p>
          </div>

          {/* Progress Pill */}
          <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm flex flex-col gap-1 min-w-[200px]">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Progress</span>
              <span className="text-nj-pink">{Math.round(progressPercentage)}%</span>
            </div>
            
            {/* The Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-nj-pink to-purple-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {ownedCount} / {totalCards} Collected
            </div>
          </div>
        </div>
      </div>

      {/* === GRID CONTENT === */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-nj-pink w-10 h-10" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            
            {allCards.map((card) => {
              const count = userInventory[card.id] || 0;
              const isOwned = count > 0;

              return (
                <div key={card.id} className="group flex flex-col items-center">
                  
                  {/* The Card Slot */}
                  <div className={`
                    relative w-full aspect-[2/3] rounded-2xl border-[3px] overflow-hidden transition-all duration-300
                    ${getBorderColor(card.rarity, isOwned)}
                    ${isOwned ? "hover:-translate-y-2 hover:shadow-2xl cursor-pointer" : "opacity-70"}
                  `}>
                    
                    {isOwned ? (
                      // OWNED: Show Image
                      <Image 
                        src={card.image_url} 
                        alt={card.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      // LOCKED: Clean Placeholder
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/50">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <Lock className="text-gray-400" size={20} />
                        </div>
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Locked</span>
                      </div>
                    )}

                    {/* Rarity Tag (Pill Style) */}
                    {isOwned && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm border border-gray-100">
                        {card.rarity}
                      </div>
                    )}

                    {/* Count Badge (Soft & Clean) */}
                    {count > 1 && (
                      <div className="absolute bottom-2 right-2 w-7 h-7 bg-nj-pink text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                        x{count}
                      </div>
                    )}
                  </div>

                  {/* Card Name */}
                  <div className="mt-3 text-center px-1">
                    <p className={`text-sm font-bold truncate ${isOwned ? "text-gray-800" : "text-gray-300"}`}>
                      {isOwned ? card.name : "???"}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}