import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MessageCircle, Heart } from "lucide-react";

export const revalidate = 0; // Always fetch fresh data

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Fetch User's Posts
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
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-nj-pink mb-4 font-bold transition-colors">
        <ArrowLeft size={20} /> Back to Feed
      </Link>

      {/* 🖼️ HEADER CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden mb-6 relative">
        {/* Banner */}
        <div className="h-40 bg-gray-200 relative">
          {profile.banner_url ? (
            <Image src={profile.banner_url} alt="Banner" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-nj-pink to-purple-400"></div>
          )}
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6 relative">
          <div className="-mt-12 mb-4">
             <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-nj-pink flex items-center justify-center text-3xl font-bold text-white">
                    {profile.username?.[0]?.toUpperCase()}
                  </div>
                )}
             </div>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-pink-100 text-nj-pink px-2 py-0.5 rounded-full text-xs font-bold border border-pink-200">
                  {profile.bias} Stan
                </span>
                <span className="text-yellow-600 font-bold text-sm">🪙 {profile.tokki_points} Points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 USER'S YAPS */}
      <h3 className="font-bold text-gray-900 mb-4 text-lg">Recent Yaps 🗣️</h3>
      
      <div className="space-y-4">
        {posts?.map((post: any) => (
          <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 relative">
                  {post.profiles?.avatar_url ? (
                    <Image src={post.profiles.avatar_url} alt="pfp" fill className="object-cover rounded-full"/>
                  ) : (
                    <div className="w-full h-full bg-nj-pink"></div>
                  )}
               </div>
               <div className="text-sm">
                 <span className="font-bold">@{post.profiles?.username}</span>
                 <span className="text-gray-400 text-xs ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
               </div>
            </div>
            
            <Link href={`/post/${post.id}`} className="block hover:opacity-80 transition-opacity">
               <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
            </Link>

            <div className="flex gap-4 text-gray-400 text-sm">
               <div className="flex items-center gap-1"><Heart size={16} /> {post.likes?.length || 0}</div>
               <div className="flex items-center gap-1"><MessageCircle size={16} /> {post.comments?.length || 0}</div>
            </div>
          </div>
        ))}

        {posts?.length === 0 && (
          <div className="text-center py-10 text-gray-400 italic">
            This user hasn't yapped anything yet. 🤫
          </div>
        )}
      </div>
    </div>
  );
}