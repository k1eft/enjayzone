"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, LogOut, Loader2, Wallet, Sparkles, Shirt, Library, Edit2, X, Check } from "lucide-react";
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
  const [topCards, setTopCards] = useState<any[]>([]);

  // ✏️ Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
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

      // 2. Get Inventory
      const { data: inventoryData } = await supabase
        .from('user_inventory')
        .select(`id, equipped, shop_items (id, name, image_url, category, description)`)
        .eq('user_id', user.id);
      setInventory(inventoryData || []);

      // 3. Get Photocards
      const { data: myCards } = await supabase
        .from('user_cards')
        .select('card:cards ( name, image_url, rarity )')
        .eq('user_id', user.id);

      const formattedCards = myCards?.map((item: any) => item.card) || [];
      const sortedCards = formattedCards.sort((a: any, b: any) => {
        const rarityWeight: any = { UR: 4, SR: 3, Rare: 2, Common: 1 };
        return rarityWeight[b.rarity] - rarityWeight[a.rarity];
      });
      setTopCards(sortedCards.slice(0, 3));
      setLoading(false);
    };
    getData();
  }, [router]);

  // ✏️ Update Username Function (NOW WITH REFRESH 🔄)
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return toast.error("Username can't be empty!");
    if (newUsername.length > 15) return toast.error("Too long! Max 15 chars.");
    if (newUsername === profile.username) {
        setIsEditingName(false);
        return;
    }

    setUploading(true);
    const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

    if (error) {
        if (error.code === '23505') {
            toast.error("Username already taken! 😔");
        } else {
            toast.error("Error updating name.");
        }
    } else {
        // ✅ SUCCESS
        setProfile({ ...profile, username: newUsername });
        toast.success("Name changed! Refreshing... 🔄");
        setIsEditingName(false);

        // ⏳ The Nuclear Option: Force Reload after 1s
        setTimeout(() => {
            window.location.reload(); 
        }, 1000);
    }
    setUploading(false);
  };

  // 🖼️ Upload Function
  const uploadImage = async (event: any, column: 'avatar_url' | 'banner_url') => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select an image!');
      const file = event.target.files[0];
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" };
      const compressedFile = await imageCompression(file, options);
      const fileName = `${Math.random()}.webp`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, compressedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').update({ [column]: publicUrl }).eq('id', user.id);
      setProfile({ ...profile, [column]: publicUrl });
      toast.success("Image updated! 📸");
      router.refresh(); // Soft refresh for images is fine
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  // 🧢 Equip Function
  const handleEquip = async (itemId: string, itemUrl: string) => {
    setEquipping(itemId);
    const { data, error } = await supabase.rpc('equip_item', { p_item_id: itemId });
    if (!error && data.success) {
      toast.success(data.message);
      setProfile({ ...profile, frame_url: itemUrl });
      setInventory(inventory.map(i => ({ ...i, equipped: i.shop_items.id === itemId })));
    } else {
      toast.error("Failed to equip item.");
    }
    setEquipping(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
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
          <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'banner_url')} disabled={uploading}/>
        </label>
      </div>

      {/* 👤 AVATAR AREA */}
      <div className="px-8">
        <div className="relative -mt-16 mb-4 flex justify-between items-end">
            <div className="relative group mx-auto md:mx-0 w-32 h-32"> 
                {/* Avatar Base */}
                <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative z-0">
                    {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                    <div className="w-full h-full bg-nj-pink flex items-center justify-center text-4xl font-bold text-white">
                        {profile.username?.[0]?.toUpperCase()}
                    </div>
                    )}
                </div>
                {/* Frame */}
                {profile.frame_url && (
                    <div className="absolute -inset-3 z-20 pointer-events-none flex items-center justify-center">
                    <Image src={profile.frame_url} alt="Frame" fill className="object-contain scale-90" />
                    </div>
                )}
                {/* Upload Hover */}
                <label className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="text-white flex flex-col items-center gap-1 transform scale-90">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'avatar_url')} disabled={uploading}/>
                </label>
            </div>
        </div>

        {/* ✏️ USERNAME & EDIT BUTTON */}
        <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">@{profile.username}</h1>
            <button 
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-gray-400 hover:text-nj-pink hover:bg-pink-50 rounded-full transition-colors"
            >
                <Edit2 size={16} />
            </button>
        </div>

        <div className="flex justify-center md:justify-start items-center gap-2 mt-1 mb-6">
          <span className="bg-pink-100 text-nj-pink px-2 py-0.5 rounded-full text-xs font-bold border border-pink-200">
            {profile.bias} Stan
          </span>
          <span className="text-gray-500 text-sm">Joined {new Date().getFullYear()}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center shadow-sm">
            <div className="text-xl font-bold text-gray-900">{profile.tokki_points || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Tokkins</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center shadow-sm">
             <div className="text-xl font-bold text-gray-900">{inventory.length + topCards.length}</div> 
             <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Items</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center shadow-sm">
             <div className="text-xl font-bold text-gray-900">12</div>
             <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Yaps</div>
          </div>
        </div>

        {/* 🏆 TROPHY CASE */}
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={18} fill="currentColor" />
                    Top Pulls
                </h2>
                <button onClick={() => router.push('/collection')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg text-gray-600 font-bold transition-colors">
                    View Binder &rarr;
                </button>
            </div>

            {topCards.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                    {topCards.map((card, i) => (
                        <div key={i} className="aspect-[2/3] bg-gray-100 rounded-xl relative overflow-hidden shadow-sm border border-gray-200 group">
                            <Image src={card.image_url} alt={card.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-[10px] text-white font-bold text-center truncate">{card.name}</p>
                            </div>
                             <div className={`absolute top-2 right-2 w-2 h-2 rounded-full shadow-sm ring-1 ring-white
                                ${card.rarity === 'UR' ? 'bg-yellow-400 animate-pulse' : 
                                  card.rarity === 'SR' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                             />
                        </div>
                    ))}
                    {[...Array(3 - topCards.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-[2/3] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><span className="text-gray-300 text-xs">?</span></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div onClick={() => router.push('/shop')} className="h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-nj-pink hover:text-nj-pink transition-colors bg-white group">
                    <Library size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Start Collecting</span>
                </div>
            )}
        </div>

        {/* INVENTORY */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="text-nj-pink" size={20} /> My Frames
          </h2>
          {inventory.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {inventory.map((item: any) => (
                <div key={item.id} className="flex flex-col items-center group relative">
                  <div className={`w-24 h-24 bg-gray-50 rounded-2xl border-2 flex items-center justify-center relative overflow-hidden transition-all
                    ${item.equipped ? 'border-nj-pink ring-2 ring-pink-100' : 'border-gray-100 group-hover:border-pink-200'}`}
                  >
                    <Image src={item.shop_items.image_url} alt={item.shop_items.name} width={60} height={60} className="object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEquip(item.shop_items.id, item.shop_items.image_url)}
                        disabled={equipping === item.shop_items.id || item.equipped}
                        className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 active:scale-95 transition-transform"
                      >
                        {item.equipped ? 'On' : 'Equip'}
                      </button>
                    </div>
                    {item.equipped && (<div className="absolute top-1 right-1 bg-nj-pink text-white p-0.5 rounded-full shadow-sm"><Shirt size={10} /></div>)}
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 mt-2 text-center leading-tight px-1">{item.shop_items.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200 flex flex-col items-center">
              <Sparkles className="text-gray-300 mb-2" size={32} />
              <p className="text-gray-400 text-sm font-medium">No frames yet.</p>
              <button onClick={() => router.push('/shop')} className="mt-3 text-nj-pink text-sm font-bold hover:underline bg-pink-50 px-4 py-2 rounded-full">Go to Shop →</button>
            </div>
          )}
        </div>

        <button onClick={handleSignOut} className="w-full border border-red-100 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <LogOut size={18} /> Sign Out
        </button>

      </div>

      {/* 🛑 EDIT USERNAME MODAL */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Change Username</h3>
                    <button onClick={() => setIsEditingName(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                
                <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="New username..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-nj-pink mb-2"
                />
                <p className="text-xs text-gray-500 mb-6 pl-1">Max 15 characters. Be unique.</p>

                <div className="flex gap-2">
                    <button onClick={() => setIsEditingName(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                    <button 
                        onClick={handleUpdateUsername}
                        disabled={uploading}
                        className="flex-1 py-3 bg-nj-pink text-white font-bold rounded-xl hover:bg-pink-400 transition-colors flex justify-center items-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin" size={18}/> : <><Check size={18}/> Save</>}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Loading Overlay */}
      {uploading && !isEditingName && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="animate-spin text-nj-pink" size={48} />
             <p className="font-bold text-gray-600">Updating Profile...</p>
          </div>
        </div>
      )}
    </div>
  );
}
