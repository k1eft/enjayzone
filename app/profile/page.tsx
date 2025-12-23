"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Camera, LogOut, Loader2, Wallet, Sparkles, 
  Shirt, Library, Edit2, X, Check, Plus 
} from "lucide-react";
import imageCompression from 'browser-image-compression';
import toast, { Toaster } from "react-hot-toast";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [equipping, setEquipping] = useState<string | null>(null);
  
  // Data State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [inventory, setInventory] = useState<any[]>([]);
  const [allCards, setAllCards] = useState<any[]>([]);
  const [topCards, setTopCards] = useState<any[]>([]);

  // UI State
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSelectingPicks, setIsSelectingPicks] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // 🔄 Fetch Data
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // 1. Get Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || {});
      setNewUsername(profileData?.username || ""); 

      // 2. Get Inventory (Frames)
      const { data: inventoryData } = await supabase
        .from('user_inventory')
        .select(`id, equipped, shop_items (id, name, image_url, category, description)`)
        .eq('user_id', user.id);
      setInventory(inventoryData || []);

      // 3. Get ALL Photocards
      const { data: myCards } = await supabase
        .from('user_cards')
        .select('id, card:cards ( id, name, image_url, rarity )')
        .eq('user_id', user.id);

      const formattedCards = myCards?.map((item: any) => ({
          user_card_id: item.id,
          ...item.card
      })) || [];
      
      setAllCards(formattedCards);

      // 4. Handle Top Picks Logic
      if (profileData?.top_picks && profileData.top_picks.length > 0) {
          const picks = profileData.top_picks.map((id: string) => 
            formattedCards.find(c => c.id === id)
          ).filter(Boolean);
          setTopCards(picks);
      } else {
          // Default: Show top 3 by rarity
          const sorted = [...formattedCards].sort((a: any, b: any) => {
            const rarityWeight: any = { UR: 4, SR: 3, Rare: 2, Common: 1 };
            return (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0);
          });
          setTopCards(sorted.slice(0, 3));
      }

      setLoading(false);
    };
    getData();
  }, [router]);

  // 🏆 Save Picks to Database
  const handleSavePicks = async (selectedIds: string[]) => {
      setUploading(true);
      const { error } = await supabase
          .from('profiles')
          .update({ top_picks: selectedIds })
          .eq('id', user.id);

      if (error) {
          toast.error("Failed to save picks 💀");
      } else {
          toast.success("Showcase updated! 🔥");
          setIsSelectingPicks(false);
          // Update profile state locally to avoid extra fetch
          setProfile({ ...profile, top_picks: selectedIds });
      }
      setUploading(false);
  };

  // ✏️ Update Username
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return toast.error("Username can't be empty!");
    setUploading(true);
    const { error } = await supabase.from('profiles').update({ username: newUsername }).eq('id', user.id);
    if (error) {
        toast.error(error.code === '23505' ? "Username taken! 😔" : "Error updating name.");
    } else {
        toast.success("Name changed! 🔄");
        setIsEditingName(false);
        setTimeout(() => window.location.reload(), 1000);
    }
    setUploading(false);
  };

  // 🖼️ Upload Function
  const uploadImage = async (event: any, column: 'avatar_url' | 'banner_url') => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" };
      const compressedFile = await imageCompression(file, options);
      const fileName = `${Math.random()}.webp`;
      await supabase.storage.from('avatars').upload(fileName, compressedFile);
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ [column]: publicUrl }).eq('id', user.id);
      setProfile({ ...profile, [column]: publicUrl });
      toast.success("Profile updated! 📸");
    } catch (e: any) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // 🧢 Equip Frame
  const handleEquip = async (itemId: string, itemUrl: string) => {
    setEquipping(itemId);
    const { data, error } = await supabase.rpc('equip_item', { p_item_id: itemId });
    if (!error && data.success) {
      toast.success(data.message);
      setProfile({ ...profile, frame_url: itemUrl });
      setInventory(inventory.map(i => ({ ...i, equipped: i.shop_items.id === itemId })));
    } else {
      toast.error("Failed to equip.");
    }
    setEquipping(null);
  };

  if (loading) return <div className="p-10 text-center flex flex-col items-center"><Loader2 className="animate-spin text-nj-pink mb-2"/> Loading Profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-[80vh] rounded-3xl shadow-sm border border-pink-100 overflow-hidden relative pb-10">
      <Toaster position="bottom-center" />
      
      {/* 🖼️ BANNER */}
      <div className="h-48 bg-gray-200 relative group">
        {profile.banner_url ? (
          <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-nj-pink to-purple-400"></div>
        )}
        <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
          <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 border border-white/30">
            <Camera size={20} /> Change Banner
          </div>
          <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'banner_url')} />
        </label>
      </div>

      <div className="px-8">
        {/* 👤 AVATAR AREA */}
        <div className="relative -mt-16 mb-4 flex justify-between items-end">
          <div className="relative group w-32 h-32">
            <div className="w-full h-full rounded-full border-[5px] border-white overflow-hidden bg-white shadow-md relative z-10">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-nj-pink flex items-center justify-center text-4xl font-bold text-white">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {profile.frame_url && (
              <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                <img src={profile.frame_url} alt="Frame" className="w-full h-full object-contain scale-[1.05]" />
              </div>
            )}
            <label className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={24} className="text-white" />
              <input type="file" className="hidden" onChange={(e) => uploadImage(e, 'avatar_url')} />
            </label>
          </div>
        </div>

        {/* PROFILE INFO */}
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">@{profile.username}</h1>
            <button onClick={() => setIsEditingName(true)} className="p-1.5 text-gray-400 hover:text-nj-pink transition-colors"><Edit2 size={18} /></button>
        </div>

        <div className="flex items-center gap-2 mt-1 mb-6">
          <span className="bg-pink-100 text-nj-pink px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border border-pink-200">
            {profile.bias || "OT5"} Stan
          </span>
          <span className="text-gray-400 text-sm font-bold">Joined {new Date(profile.created_at).getFullYear()}</span>
        </div>

        {/* 📊 STATS */}
        <div className="grid grid-cols-3 gap-4 mb-10">
            {[ 
                { val: profile.tokki_points || 0, label: "Tokkins" },
                { val: allCards.length, label: "Cards" },
                { val: 12, label: "Yaps" } 
            ].map((stat, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="text-xl font-black text-gray-900">{stat.val}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* 🏆 TOP PICKS SHOWCASE */}
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                    <Sparkles className="text-yellow-500" size={20} fill="currentColor" />
                    Top Picks
                </h2>
                <button 
                    onClick={() => setIsSelectingPicks(true)}
                    className="text-xs bg-gray-900 text-white px-4 py-1.5 rounded-full font-bold hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <Edit2 size={12} /> Customize
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {topCards.map((card, i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-100 rounded-2xl relative overflow-hidden shadow-sm border border-gray-200 group">
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ring-2 ring-white/50
                            ${card.rarity === 'UR' ? 'bg-yellow-400 animate-pulse' : card.rarity === 'SR' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                        />
                    </div>
                ))}
                {[...Array(3 - topCards.length)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center opacity-40">
                        <Plus className="text-gray-400" size={24} />
                    </div>
                ))}
            </div>
        </div>

        {/* 🧢 MY FRAMES */}
        <div className="mb-12">
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-tight">
            <Wallet className="text-nj-pink" size={20} /> My Frames
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {inventory.map((item: any) => (
              <div key={item.id} className="flex flex-col items-center group">
                <div className={`w-full aspect-square bg-gray-50 rounded-2xl border-2 flex items-center justify-center relative transition-all
                  ${item.equipped ? 'border-nj-pink ring-4 ring-pink-50' : 'border-gray-100'}`}
                >
                  <img src={item.shop_items.image_url} alt="item" className="w-12 h-12 object-contain" />
                  {!item.equipped && (
                    <button 
                      onClick={() => handleEquip(item.shop_items.id, item.shop_items.image_url)}
                      className="absolute inset-0 bg-black/60 text-white text-[10px] font-black opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity uppercase"
                    >
                      Equip
                    </button>
                  )}
                  {item.equipped && <div className="absolute top-1.5 right-1.5 bg-nj-pink text-white p-1 rounded-full shadow-sm"><Shirt size={10} /></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

<button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"> <LogOut size={18} /> Sign Out </button> </div>

      {/* 🛑 SELECT TOP PICKS MODAL (THE FIX) */}
      {isSelectingPicks && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] p-8 w-full max-w-md h-[650px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">Showcase Picker</h3>
                        <p className="text-sm font-bold text-nj-pink uppercase tracking-tighter">
                          {topCards.length} / 3 Selected
                        </p>
                      </div>
                      <button onClick={() => setIsSelectingPicks(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-3 gap-3">
                          {allCards.map((card) => {
                              const isSelected = topCards.some(c => c.id === card.id);
                              return (
                                  <div 
                                    key={card.id}
                                    onClick={() => {
                                        if (isSelected) {
                                            setTopCards(topCards.filter(c => c.id !== card.id));
                                        } else if (topCards.length < 3) {
                                            setTopCards([...topCards, card]);
                                        } else {
                                            toast.error("Limit reached! 🛑");
                                        }
                                    }}
                                    className={`aspect-[2/3] rounded-xl relative overflow-hidden cursor-pointer border-4 transition-all
                                        ${isSelected ? 'border-nj-pink scale-[0.97] shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                  >
                                      <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                                      {isSelected && (
                                          <div className="absolute inset-0 bg-nj-pink/20 flex items-center justify-center">
                                              <div className="bg-white text-nj-pink rounded-full p-1 shadow-md"><Check size={16} strokeWidth={4} /></div>
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>

                  <button 
                    onClick={() => handleSavePicks(topCards.map(c => c.id))}
                    className="mt-6 w-full bg-nj-pink text-white font-black py-4 rounded-2xl shadow-xl shadow-pink-200 hover:bg-pink-400 transition-all active:scale-95"
                  >
                      Update Showcase
                  </button>
              </div>
          </div>
      )}

      {/* 🛑 EDIT NAME MODAL */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-black mb-4">Update Handle</h3>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-lg focus:border-nj-pink outline-none transition-all mb-4" 
                />
                <div className="flex gap-3">
                    <button onClick={() => setIsEditingName(false)} className="flex-1 py-4 font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-colors">Cancel</button>
                    <button onClick={handleUpdateUsername} className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-700 transition-all">Save</button>
                </div>
            </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[200]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-nj-pink" size={48} />
              <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Syncing...</p>
            </div>
        </div>
      )}
    </div>
  );
}
