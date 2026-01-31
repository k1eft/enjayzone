"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { ShoppingBag, Loader2, X, Check, Sparkles, icons } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

// Define the shape of your item
interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category?: string; // Optional: If you add this column to Supabase later
}

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTokkins, setMyTokkins] = useState(0);

  // 🪄 Modal States
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    // 1. Get User Tokkins
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('tokki_points').eq('id', user.id).single();
      setMyTokkins(profile?.tokki_points || 0);
    }
    // 2. Get Shop Items
    const { data: shopItems } = await supabase.from('shop_items').select('*').order('price', { ascending: true });
    setItems(shopItems || []);
    setLoading(false);
  };

  // 🧠 SMART FILTERING
  // If you have a 'category' column, it uses that. Otherwise, it guesses based on the name.
  const packs = items.filter(item => 
    item.category === 'pack' || item.name.toLowerCase().includes('pack')
  );
  
  const frames = items.filter(item => 
    item.category === 'frame' || (item.category !== 'pack' && !item.name.toLowerCase().includes('pack'))
  );

  // 1. Trigger Buy
  const initiateBuy = (item: ShopItem) => {
    setSelectedItem(item);
  };

  // 2. Confirm Buy
const confirmBuy = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    
    let result;
    
    // 🔀 BRANCHING LOGIC
    if (selectedItem.category === 'pack' || selectedItem.name.includes('Collection')) {
        // CASE A: IT'S A PACK (Gacha Time)
        // This function subtracts money AND returns the 3 cards
        result = await supabase.rpc('open_pack', { p_pack_id: selectedItem.id });
    } else {
        // CASE B: IT'S A FRAME (Standard Buy)
        result = await supabase.rpc('buy_item', { p_item_id: selectedItem.id });
    }

    const { data, error } = result;

    if (error) {
        toast.error(error.message);
        setSelectedItem(null);
    } else {
        // ✅ SUCCESS
        setSelectedItem(null);
        fetchShopData(); // Update Tokkins balance
        
        if (selectedItem.category === 'pack') {
            // 🚨 SPECIAL REDIRECT FOR PACKS
            // We need to pass the 'data' (which contains the 3 cards) to the opening page
            // For now, let's save it to LocalStorage so the next page can read it
            localStorage.setItem('opened_pack_cards', JSON.stringify(data));
            window.location.href = '/collection/opening'; 
        } else {
            // Normal Success Modal
            setSuccessItem(selectedItem);
        }
    }
    setProcessing(false);
};
  return (
    <div className="max-w-5xl mx-auto pb-20 relative px-4">
      <Toaster position="bottom-center" />
      
      {/* === HEADER === */}
      <div className="flex justify-between items-center mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="text-nj-pink" fill="currentColor" /> Tokki Shop
          </h1>
          <p className="text-gray-500 font-medium">Spend your hard-earned Tokkins here!</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
          <span className="text-2xl">🪙</span> 
          <span className="text-yellow-700 font-black text-xl">{myTokkins.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-nj-pink w-10 h-10" /></div>
      ) : (
        <div className="space-y-12">
          
          {/* === SECTION 1: GACHA PACKS (Highlighted) === */}
          {packs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800">Card Packs & Collections</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packs.map((item) => (
                  <div key={item.id} className="relative group bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-1 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="bg-gray-800 rounded-[22px] p-5 h-full flex flex-row items-center gap-4">
                      {/* Image */}
                      <div className="w-24 h-32 flex-shrink-0 relative bg-gray-700/50 rounded-xl overflow-hidden border border-white/10">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                          HOT SELLER
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{item.name}</h3>
                        <p className="text-gray-400 text-xs mb-4 line-clamp-2">{item.description}</p>
                        
                        <button 
                          onClick={() => initiateBuy(item)}
                          className="w-full bg-white text-gray-900 font-bold py-2 rounded-lg hover:bg-yellow-400 transition-colors flex justify-center items-center gap-2 text-sm"
                        >
                          Open for 🪙 {item.price}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* === SECTION 2: COSMETICS (Grid) === */}
          {frames.length > 0 && (
            <section>
               <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-6 bg-nj-pink rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">Profile Decor & Frames</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {frames.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                    
                    <div className="w-20 h-20 relative mb-3 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                      <Image src={item.image_url} alt={item.name} width={64} height={64} className="object-contain" />
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 mb-3 h-8 overflow-hidden line-clamp-2">{item.description}</p>

                    <button 
                      onClick={() => initiateBuy(item)}
                      className="w-full bg-pink-50 text-nj-pink font-bold py-1.5 rounded-xl hover:bg-nj-pink hover:text-white transition-all text-sm flex justify-center items-center gap-1 mt-auto"
                    >
                      Buy 🪙 {item.price}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =======================================================
          🛑 CONFIRMATION MODAL 
      ======================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirm Purchase</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center mb-3 border border-pink-100">
                <Image src={selectedItem.image_url} alt="Item" width={64} height={64} className="object-contain" />
              </div>
              <p className="text-gray-600 text-center text-sm">
                Are you sure you want to buy <br/>
                <strong className="text-gray-900 text-lg">{selectedItem.name}</strong>?
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
                {processing ? <Loader2 className="animate-spin" size={20}/> : <>Pay 🪙 {selectedItem.price}</>}
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
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden animate-in zoom-in-90 duration-300 border-4 border-yellow-200">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-50 via-white to-white -z-10"></div>

            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg ring-4 ring-yellow-100 relative">
              <Image src={successItem.image_url} alt="Item" width={80} height={80} className="object-contain animate-bounce-slow" />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white shadow-sm">
                <Check size={20} strokeWidth={4} />
              </div>
            </div>

            <div className="flex justify-center mb-2">
              <Image 
                src="/haerinhappyyippeeee.gif" 
                alt="YIPPEE" 
                width={100} 
                height={100} 
                className="object-contain unoptimized"
              />
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">YIPPEE! 🎉</h2>
            <p className="text-gray-500 mb-6 text-sm">
              You successfully bought <br/>
              <strong className="text-nj-pink">{successItem.name}</strong>
            </p>

            <div className="flex flex-col gap-2">
              {/* Logic: If it's a pack, go to Collection. If frame, go to Profile. */}
              <button 
                onClick={() => window.location.href = successItem.category === 'pack' || successItem.name.includes('Pack') ? '/collection' : '/profile'} 
                className="w-full py-3 bg-nj-pink text-white font-bold rounded-xl hover:bg-pink-400 transition-all shadow-lg shadow-pink-200"
              >
                {successItem.category === 'pack' || successItem.name.includes('Pack') ? 'Open Pack Now' : 'Equip Now'}
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