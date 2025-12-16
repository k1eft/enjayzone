"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ShoppingBag, Loader2, X, Check, AlertCircle } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import TokkinIcon from "@/components/TokkinIcon"; // Ensure you have this, or swap for '🪙'

export default function Shop() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTokkins, setMyTokkins] = useState(0);

  // 🪄 Modal States
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // For Confirmation Modal
  const [successItem, setSuccessItem] = useState<any | null>(null);   // For "YIPPEE" Modal
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('tokki_points').eq('id', user.id).single();
      setMyTokkins(profile?.tokki_points || 0);
    }
    const { data: shopItems } = await supabase.from('shop_items').select('*').order('price', { ascending: true });
    setItems(shopItems || []);
    setLoading(false);
  };

  // 1. Trigger the Confirmation Modal
  const initiateBuy = (item: any) => {
    setSelectedItem(item);
  };

  // 2. Actually Buy the Item
  const confirmBuy = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    
    const { data, error } = await supabase.rpc('buy_item', { p_item_id: selectedItem.id });

    if (error || !data.success) {
      toast.error(data?.message || error?.message || "Something went wrong!");
      setSelectedItem(null); // Close confirm modal
    } else {
      // ✅ SUCCESS!
      setSuccessItem(selectedItem); // Open Success Modal
      setSelectedItem(null);        // Close Confirm Modal
      fetchShopData();              // Update balance in background
    }
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      <Toaster position="bottom-center" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-nj-pink" /> Tokki Shop
          </h1>
          <p className="text-gray-500">Spend your hard-earned Tokkins here!</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-2">
           {/* Swap '🪙' for <TokkinIcon /> if you made it */}
          <span className="text-2xl">🪙</span> 
          <span className="text-yellow-700 font-bold text-lg">{myTokkins}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-nj-pink" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
              
              <div className="w-24 h-24 relative mb-4 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <Image src={item.image_url} alt={item.name} width={80} height={80} className="object-contain" />
              </div>

              <h3 className="font-bold text-gray-900 mb-1 leading-tight">{item.name}</h3>
              <p className="text-xs text-gray-400 mb-4 h-8 overflow-hidden line-clamp-2">{item.description}</p>

              <button 
                onClick={() => initiateBuy(item)}
                className="w-full bg-pink-50 text-nj-pink font-bold py-2 rounded-xl hover:bg-nj-pink hover:text-white transition-all flex justify-center items-center gap-2 mt-auto"
              >
                Buy <span className="text-sm opacity-80">🪙 {item.price}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =======================================================
          🛑 CONFIRMATION MODAL 
      ======================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Purchase</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center mb-3">
                <Image src={selectedItem.image_url} alt="Item" width={64} height={64} className="object-contain" />
              </div>
              <p className="text-gray-600 text-center">
                Are you sure you want to buy <br/>
                <strong className="text-gray-900">{selectedItem.name}</strong>?
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBuy}
                disabled={processing}
                className="flex-1 py-3 rounded-xl bg-nj-pink text-white font-bold hover:bg-pink-400 transition-colors flex justify-center items-center gap-2"
              >
                {processing ? <Loader2 className="animate-spin" size={20}/> : <>Confirm 🪙 {selectedItem.price}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          🎉 SUCCESS MODAL (YIPPEE)
      ======================================================= */}
      {successItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-90 duration-300">
            
            {/* Background Confetti Effect (CSS only) */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white -z-10"></div>

<div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-yellow-100 relative">
   <Image src={successItem.image_url} alt="Item" width={80} height={80} className="object-contain animate-bounce-slow" />
   <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white">
     <Check size={20} strokeWidth={4} />
   </div>
</div>

{/* 👇 THE CHAOS GIF IS HERE 👇 */}
<div className="flex justify-center mb-2">
  <Image 
    src="/haerinhappyyippeeee.gif" // Make sure the file is in your public/ folder!
    alt="YIPPEE" 
    width={120} 
    height={120} 
    className="object-contain unoptimized" // 'unoptimized' is key for GIFs to play!
  />
</div>

<h2 className="text-2xl font-black text-gray-900 mb-1">YIPPEE! 🎉</h2>
            <p className="text-gray-500 mb-6">You got <strong>{successItem.name}</strong>!</p>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => window.location.href = '/profile'} // Or router.push
                className="w-full py-3 bg-nj-pink text-white font-bold rounded-xl hover:bg-pink-400 transition-all shadow-md shadow-pink-200"
              >
                Equip Now
              </button>
              <button 
                onClick={() => setSuccessItem(null)}
                className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 text-sm"
              >
                Keep Shopping
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}