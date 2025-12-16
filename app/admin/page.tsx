"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, Megaphone, Loader2, Trash2, CheckCircle, ShoppingBag, Plus, Users, Ban, Coins, Search } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Announcement State
  const [announcement, setAnnouncement] = useState("");
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);

  // Shop State
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'frame' });
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [uploadingItem, setUploadingItem] = useState(false);

  // 👇 NEW: User Manager State
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdmin();
    fetchAnnouncements();
    fetchShopItems();
    fetchUsers();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/"); return; }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (profile?.is_admin) {
      setIsAdmin(true);
      setLoading(false);
    } else {
      router.push("/"); 
    }
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setActiveAnnouncements(data || []);
  };
  const fetchShopItems = async () => {
    const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    setShopItems(data || []);
  };
  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  // --- ACTIONS ---

  const postAnnouncement = async () => {
    if (!announcement.trim()) return;
    await supabase.from('announcements').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('announcements').insert({ content: announcement, created_by: user?.id, is_active: true });
    toast.success("Announcement Live! 📣");
    setAnnouncement("");
    fetchAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    toast.success("Deleted.");
    fetchAnnouncements();
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItemImage) return toast.error("Fill in everything!");
    setUploadingItem(true);
    try {
      const fileName = `shop/${Date.now()}_${newItemImage.name}`;
      await supabase.storage.from('shop-items').upload(fileName, newItemImage);
      const { data: { publicUrl } } = supabase.storage.from('shop-items').getPublicUrl(fileName);
      await supabase.from('shop_items').insert({ ...newItem, price: parseInt(newItem.price), image_url: publicUrl });
      toast.success("Item Added! 🛍️");
      setNewItem({ name: '', price: '', description: '', category: 'frame' });
      setNewItemImage(null);
      fetchShopItems();
    } catch (e: any) { toast.error(e.message); }
    setUploadingItem(false);
  };

  const deleteShopItem = async (id: string) => {
    if(!confirm("Remove item?")) return;
    await supabase.from('shop_items').delete().eq('id', id);
    toast.success("Item Removed.");
    fetchShopItems();
  };

  // 👇 USER MANAGER ACTIONS
  const toggleBan = async (userId: string, currentStatus: boolean) => {
    if(!confirm(`Are you sure you want to ${currentStatus ? 'UNBAN' : 'BAN'} this user?`)) return;
    const { error } = await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId);
    if(error) toast.error("Error updating user.");
    else {
      toast.success(currentStatus ? "User Unbanned." : "User BANNED. 🔨");
      fetchUsers();
    }
  };

  const giftTokkins = async (userId: string, currentAmount: number) => {
    const amountStr = prompt("How many Tokkins to add? (Use negative to remove)", "100");
    if(!amountStr) return;
    const amount = parseInt(amountStr);
    if(isNaN(amount)) return;

    const { error } = await supabase.from('profiles').update({ tokki_points: (currentAmount || 0) + amount }).eq('id', userId);
    if(error) toast.error("Failed to send money.");
    else {
      toast.success(`Sent ${amount} Tokkins! 💸`);
      fetchUsers();
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id === searchQuery
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline"/> Verifying Clearance...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Toaster position="bottom-right"/>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 bg-gray-900 text-white p-6 rounded-3xl shadow-lg">
        <div className="p-3 bg-white/10 rounded-2xl text-nj-pink"><Shield size={32} /></div>
        <div><h1 className="text-3xl font-black">Admin Dashboard</h1><p className="text-gray-400">Manage App →</p></div>
      </div>

      {/* 📣 ANNOUNCEMENT */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Megaphone className="text-nj-pink" /> Global Announcement</h2>
        <div className="flex gap-4 mb-4">
          <input type="text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Broadcast..." className="flex-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-nj-pink/50 outline-none"/>
          <button onClick={postAnnouncement} className="bg-gray-900 text-white font-bold px-6 rounded-xl hover:bg-gray-700">Post</button>
        </div>
        <div className="space-y-2">{activeAnnouncements.map((item) => (<div key={item.id} className={`flex justify-between items-center p-3 rounded-xl border ${item.is_active ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}><span className="font-bold text-gray-800 text-sm">{item.content}</span><button onClick={() => deleteAnnouncement(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button></div>))}</div>
      </div>

      {/* 🛍️ SHOP MANAGER */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ShoppingBag className="text-blue-500" /> Shop Manager</h2>
        {/* Add Item Form */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4"><input type="text" placeholder="Name" className="flex-[2] p-3 rounded-xl border-gray-200" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})}/><input type="number" placeholder="Price" className="flex-1 p-3 rounded-xl border-gray-200" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})}/></div>
            <div className="flex gap-4 items-center"><input type="file" onChange={(e) => e.target.files && setNewItemImage(e.target.files[0])} className="flex-1 text-sm text-gray-500"/><button onClick={handleAddItem} disabled={uploadingItem} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 flex items-center gap-2">{uploadingItem ? <Loader2 className="animate-spin" size={20}/> : <><Plus size={20}/> Add</>}</button></div>
          </div>
        </div>
        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{shopItems.map((item) => (<div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 group"><div className="w-12 h-12 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0"><Image src={item.image_url} alt={item.name} fill className="object-contain" /></div><div className="flex-1 min-w-0"><h4 className="font-bold text-gray-900 truncate">{item.name}</h4><p className="text-xs text-gray-500">🪙 {item.price}</p></div><button onClick={() => deleteShopItem(item.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button></div>))}</div>
      </div>

      {/* 👥 USER MANAGER (THE FINAL FEATURE) */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-purple-500" /> User Manager</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border ${user.is_banned ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100 hover:border-purple-200'} transition-all`}>
              
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative border border-gray-200">
                  {user.avatar_url ? <Image src={user.avatar_url} alt="av" fill className="object-cover"/> : <div className="w-full h-full bg-purple-200 flex items-center justify-center font-bold text-purple-500">{user.username?.[0]}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${user.is_banned ? 'text-red-600' : 'text-gray-900'}`}>{user.username || 'No Name'}</h3>
                    {user.is_admin && <Shield size={14} className="text-blue-500"/>}
                    {user.is_banned && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">BANNED</span>}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Coins size={12} className="text-yellow-500"/> 
                    <span className="font-medium text-gray-700">{user.tokki_points || 0} Tokkins</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => giftTokkins(user.id, user.tokki_points)}
                  className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-xl transition-colors tooltip"
                  title="Gift Tokkins"
                >
                  <Plus size={20} />
                </button>
                
                {!user.is_admin && (
                  <button 
                    onClick={() => toggleBan(user.id, user.is_banned)}
                    className={`p-2 rounded-xl transition-colors ${user.is_banned ? 'text-green-500 hover:bg-green-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                    title={user.is_banned ? "Unban User" : "Ban User"}
                  >
                    {user.is_banned ? <CheckCircle size={20} /> : <Ban size={20} />}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}