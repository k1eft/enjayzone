"use client";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 1. We move all the logic into this sub-component
function TradeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('target'); 

  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<any>(null);
  
  // Inventories
  const [theirCards, setTheirCards] = useState<any[]>([]);
  const [myCards, setMyCards] = useState<any[]>([]);

  // Selection
  const [selectedWanted, setSelectedWanted] = useState<string | null>(null);
  const [selectedOffered, setSelectedOffered] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!targetUserId) {
      toast.error("No trading partner selected!");
      router.push('/trade');
      return;
    }
    fetchData();
  }, [targetUserId]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/');

    if (user.id === targetUserId) {
        toast.error("You can't trade with yourself, lonely.");
        return router.push('/collection');
    }

    // 1. Get Target User Details
    const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
    setTargetUser(targetProfile);

    // 2. Get THEIR Cards (The Menu)
    const { data: theirs } = await supabase
      .from('user_cards')
      .select('id, card:cards(name, image_url, rarity)')
      .eq('user_id', targetUserId);

    // 3. Get MY Cards (The Wallet)
    const { data: mine } = await supabase
      .from('user_cards')
      .select('id, card:cards(name, image_url, rarity)')
      .eq('user_id', user.id);

    // Sort by Rarity (UR first)
    const rarityWeight: any = { UR: 4, SR: 3, Rare: 2, Common: 1 };
    const sortFn = (a: any, b: any) => rarityWeight[b.card.rarity] - rarityWeight[a.card.rarity];

    setTheirCards(theirs?.sort(sortFn) || []);
    setMyCards(mine?.sort(sortFn) || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedWanted || !selectedOffered) return toast.error("Select one card from each side!");
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('trades').insert({
      sender_id: user?.id,
      receiver_id: targetUserId,
      offered_card_id: selectedOffered,
      requested_card_id: selectedWanted,
      status: 'pending'
    });

    if (error) {
      toast.error("Trade failed: " + error.message);
    } else {
      toast.success("Offer sent! 🤝");
      router.push('/trade'); // Go to Dashboard
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-nj-pink" /></div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 h-[90vh] flex flex-col">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Trading with <span className="text-nj-pink">@{targetUser?.username}</span>
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* 🎭 THE TRADING FLOOR */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
        
        {/* LEFT: THEIR CARDS (REQUEST) */}
        <div className="flex-1 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col overflow-hidden">
            <div className="p-4 bg-blue-100 border-b border-blue-200 text-blue-800 font-bold flex justify-between items-center">
                <span>Requesting (Their Card)</span>
                {selectedWanted && <span className="text-xs bg-white px-2 py-1 rounded text-blue-600">Selected</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 custom-scrollbar">
                {theirCards.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedWanted(item.id)}
                        className={`relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border-4 transition-all
                            ${selectedWanted === item.id ? 'border-blue-500 scale-95 shadow-lg' : 'border-transparent hover:border-blue-200'}
                        `}
                    >
                        <img src={item.card.image_url} className="w-full h-full object-cover" />
                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-white
                            ${item.card.rarity === 'UR' ? 'bg-yellow-400' : item.card.rarity === 'SR' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* CENTER: ACTION */}
        <div className="flex md:flex-col items-center justify-center gap-4 py-2">
            <div className="bg-white p-3 rounded-full shadow-md border border-gray-100">
                <ArrowRightLeft className="text-gray-400" />
            </div>
        </div>

        {/* RIGHT: MY CARDS (OFFER) */}
        <div className="flex-1 bg-pink-50 rounded-2xl border border-pink-100 flex flex-col overflow-hidden">
             <div className="p-4 bg-pink-100 border-b border-pink-200 text-pink-800 font-bold flex justify-between items-center">
                <span>Offering (Your Card)</span>
                {selectedOffered && <span className="text-xs bg-white px-2 py-1 rounded text-pink-600">Selected</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-3 custom-scrollbar">
                {myCards.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedOffered(item.id)}
                        className={`relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border-4 transition-all
                            ${selectedOffered === item.id ? 'border-nj-pink scale-95 shadow-lg' : 'border-transparent hover:border-pink-200'}
                        `}
                    >
                        <img src={item.card.image_url} className="w-full h-full object-cover" />
                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-white
                            ${item.card.rarity === 'UR' ? 'bg-yellow-400' : item.card.rarity === 'SR' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                        />
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* 🚀 SUBMIT BAR */}
      <div className="mt-6 p-4 bg-white border-t border-gray-100 flex justify-end">
        <button
            onClick={handleSubmit}
            disabled={!selectedWanted || !selectedOffered || submitting}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full md:w-auto justify-center"
        >
            {submitting ? <Loader2 className="animate-spin" /> : "Confirm Offer 🤝"}
        </button>
      </div>
    </div>
  );
}

// 2. This is the main component that Next.js sees
export default function NewTradePage() {
  return (
    // 3. ⚠️ THE FIX: We wrap the search params logic in Suspense
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-nj-pink" /></div>}>
        <TradeContent />
    </Suspense>
  );
}
