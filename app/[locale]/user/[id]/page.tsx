import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Heart, ArrowRightLeft, Sparkles } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
export const revalidate = 0; // Always fetch fresh data

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Get Current Logged In User
  const { data: { user: currentUser } } = await supabase.auth.getUser();

// Inside fetch profile...
const { data: profile } = await supabase
    .from('profiles')
    .select('*, is_verified') // 👈 Make sure is_verified is included (or use *)
    .eq('id', id)
    .single();


  // 3. Fetch Inventory Count & Top Cards
  const { data: rawCards } = await supabase
    .from('user_cards')
    .select('id, card:cards ( name, image_url, rarity )')
    .eq('user_id', id);

  const rarityWeight: Record<string, number> = { UR: 4, SR: 3, Rare: 2, Common: 1 };
  const sortedCards = rawCards?.map((item: any) => item.card).sort((a: any, b: any) => {
    return (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0);
  }) || [];
  
  const topCards = sortedCards.slice(0, 3);
  const totalCards = rawCards?.length || 0;

  // 4. Fetch User's Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (username, avatar_url, bias),
      likes (user_id),
      comments (id)
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  if (!profile) return <div className="p-10 text-center">User not found 🕵️‍♂️</div>;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-nj-pink mb-4 font-bold transition-colors">
        <ArrowLeft size={20} /> Back to Feed
      </Link>

      {/* 🖼️ HEADER CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden mb-6 relative group">
        
        {/* 🤝 TRADE BUTTON */}
        {currentUser && currentUser.id !== id && (
            <Link 
                href={`/trade/new?target=${id}`}
                className="absolute top-4 right-4 z-30 bg-nj-pink text-white px-5 py-2 rounded-full font-bold hover:bg-pink-400 shadow-lg flex items-center gap-2 text-sm transition-transform hover:scale-105 active:scale-95"
            >
                <ArrowRightLeft size={16} />
                Trade
            </Link>
        )}

        {/* Banner */}
        <div className="h-44 bg-gray-200 relative">
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-nj-pink to-purple-400"></div>
          )}
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6 relative">
          <div className="-mt-16 mb-4 relative inline-block"> 
             {/* ^ Added 'relative inline-block' here to anchor the frame */}
             
             <div className="w-32 h-32 rounded-full border-[5px] border-white overflow-hidden bg-white shadow-md relative z-10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-nj-pink flex items-center justify-center text-4xl font-bold text-white">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
                )}
             </div>

             {/* ✨ Fixed Frame Overlay */}
             {profile.frame_url && (
                <div className="absolute inset-0 w-32 h-32 pointer-events-none z-20 flex items-center justify-center">
                     <img 
                        src={profile.frame_url} 
                        alt="Frame" 
                        className="w-full h-full object-contain scale-[1.25]" 
                     />
                </div>
             )}
          </div>

          <div>
             <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-3xl font-black text-gray-900 flex items-center gap-1">
    @{profile.username}
    {profile.is_verified && <VerifiedBadge size={24} />}
</h1>

                   <div className="flex items-center gap-2 mt-2">
                      <span className="bg-pink-100 text-nj-pink px-3 py-1 rounded-full text-xs font-bold border border-pink-200 uppercase tracking-wide">
                         {profile.bias || "OT5"} Stan
                      </span>
                      <span className="text-gray-500 text-sm font-bold flex items-center gap-1">
                         Joined {new Date(profile.created_at).getFullYear()}
                      </span>
                   </div>
                </div>
             </div>

             {/* 📊 STATS */}
             <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                    <p className="text-lg font-black text-gray-900">{profile.tokki_points}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tokkins</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                    <p className="text-lg font-black text-gray-900">{totalCards}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cards</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl text-center border border-gray-100">
                    <p className="text-lg font-black text-gray-900">{posts?.length || 0}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Yaps</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 🏆 SHOWCASE */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Sparkles size={16} className="text-yellow-500" /> Showcase
        </h3>
        
        {topCards.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
                {topCards.map((card: any, i: number) => (
                    <div key={i} className="aspect-[2/3] bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200 shadow-sm group">
                        <img src={card.image_url} alt={card.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                        <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white/50
                            ${card.rarity === 'UR' ? 'bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 
                              card.rarity === 'SR' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                        />
                    </div>
                ))}
                {[...Array(3 - topCards.length)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-[2/3] bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center opacity-50">
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400 italic">No cards collected yet. 📉</p>
            </div>
        )}
      </div>

      {/* 📝 USER'S YAPS */}
      <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
         <MessageCircle size={16} /> Recent Yaps
      </h3>
      
      <div className="space-y-4">
        {posts?.map((post: any) => (
          <div key={post.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative border border-gray-100">
                 {post.profiles?.avatar_url ? (
                   <img src={post.profiles.avatar_url} alt="pfp" className="w-full h-full object-cover"/>
                 ) : (
                   <div className="w-full h-full bg-nj-pink"></div>
                 )}
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-gray-900 text-sm">@{post.profiles?.username}</span>
                 <span className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleDateString()}</span>
               </div>
            </div>
            
            <p className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {post.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={post.image_url} className="w-full max-h-[400px] object-cover" loading="lazy" />
                </div>
            )}

            <div className="flex gap-6 text-gray-400 text-sm pt-4 border-t border-gray-50">
               <div className="flex items-center gap-2 font-medium"><Heart size={18} /> {post.likes?.length || 0}</div>
               <div className="flex items-center gap-2 font-medium"><MessageCircle size={18} /> {post.comments?.length || 0}</div>
            </div>
          </div>
        ))}

        {posts?.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="font-bold text-gray-500">No yaps yet.</p>
            <p className="text-sm">Maybe they are shy? 🤫</p>
          </div>
        )}
      </div>

    </div>
  );
}