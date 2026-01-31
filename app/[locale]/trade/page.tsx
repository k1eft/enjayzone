"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight, Check, X, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function TradeDashboard() {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Incoming (People want my stuff)
    const { data: inc } = await supabase
      .from('trades')
      .select(`
        *,
        sender:profiles!sender_id (username, avatar_url),
        offered:user_cards!offered_card_id (id, card:cards(name, image_url, rarity)),
        requested:user_cards!requested_card_id (id, card:cards(name, image_url, rarity))
      `)
      .eq('receiver_id', user.id)
      .eq('status', 'pending') // Only show active
      .order('created_at', { ascending: false });

    // Fetch Outgoing (I want their stuff)
    const { data: out } = await supabase
      .from('trades')
      .select(`
        *,
        receiver:profiles!receiver_id (username, avatar_url),
        offered:user_cards!offered_card_id (id, card:cards(name, image_url, rarity)),
        requested:user_cards!requested_card_id (id, card:cards(name, image_url, rarity))
      `)
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    setIncoming(inc || []);
    setOutgoing(out || []);
    setLoading(false);
  };

  const handleAction = async (tradeId: string, action: 'accept' | 'reject') => {
    setProcessing(tradeId);
    
    if (action === 'reject') {
      const { error } = await supabase.from('trades').update({ status: 'rejected' }).eq('id', tradeId);
      if (!error) {
        toast.success("Trade rejected.");
        fetchTrades();
      }
    } else {
      // Execute the Secure Transaction
      const { data, error } = await supabase.rpc('execute_trade', { trade_uuid: tradeId });
      
      if (error || !data.success) {
        toast.error(data?.message || "Trade failed.");
      } else {
        toast.success("Trade completed! Check your binder.");
        fetchTrades();
      }
    }
    setProcessing(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Toaster position="bottom-center" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Trade Center 🤝</h1>
        <button onClick={fetchTrades} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <RefreshCw size={20} />
        </button>
      </div>

      {/* 👇 INCOMING OFFERS */}
      <h2 className="font-bold text-gray-500 uppercase tracking-wide text-xs mb-4">Incoming Offers</h2>
      <div className="space-y-4 mb-10">
        {incoming.length > 0 ? incoming.map((trade) => (
            <div key={trade.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                {/* WHO */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <img src={trade.sender?.avatar_url} className="w-10 h-10 rounded-full border border-gray-200" />
                    <div>
                        <p className="text-sm font-bold">@{trade.sender?.username}</p>
                        <p className="text-xs text-gray-400">wants to trade</p>
                    </div>
                </div>

                {/* THE DEAL */}
                <div className="flex-1 flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-xl w-full">
                    {/* They Give */}
                    <div className="text-center">
                        <div className="w-16 h-24 bg-gray-200 rounded-lg overflow-hidden mb-1 relative mx-auto">
                           <img src={trade.offered?.card?.image_url} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 truncate w-20">{trade.offered?.card?.name}</p>
                    </div>
                    
                    <ArrowRight className="text-gray-300" />
                    
                    {/* You Give */}
                    <div className="text-center">
                        <div className="w-16 h-24 bg-gray-200 rounded-lg overflow-hidden mb-1 relative mx-auto border-2 border-nj-pink">
                           <img src={trade.requested?.card?.image_url} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 truncate w-20">{trade.requested?.card?.name}</p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button 
                        onClick={() => handleAction(trade.id, 'reject')}
                        disabled={!!processing}
                        className="p-3 rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                    >
                        <X size={20} />
                    </button>
                    <button 
                        onClick={() => handleAction(trade.id, 'accept')}
                        disabled={!!processing}
                        className="px-6 py-2 rounded-full bg-nj-pink text-white font-bold hover:bg-pink-400 flex items-center gap-2"
                    >
                        {processing === trade.id ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Accept</>}
                    </button>
                </div>
            </div>
        )) : (
            <p className="text-gray-400 italic text-sm">No incoming offers. You're safe... for now.</p>
        )}
      </div>

      {/* 👇 OUTGOING HISTORY */}
      <h2 className="font-bold text-gray-500 uppercase tracking-wide text-xs mb-4">Your Sent Requests</h2>
      <div className="space-y-3">
        {outgoing.map((trade) => (
             <div key={trade.id} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase
                        ${trade.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                          trade.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                          'bg-red-100 text-red-600'}`}>
                        {trade.status}
                    </span>
                    <span className="text-sm text-gray-600">
                        To <span className="font-bold">@{trade.receiver?.username}</span>: 
                        You offered <span className="font-bold">{trade.offered?.card?.name}</span>
                    </span>
                </div>
                <div className="text-xs text-gray-400">
                    {new Date(trade.created_at).toLocaleDateString()}
                </div>
             </div>
        ))}
      </div>
    </div>
  );
}
