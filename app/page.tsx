import { supabase } from "@/lib/supabase";
import CreatePost from "@/components/CreatePost";
import LikeButton from "@/components/LikeButton";
import DeletePost from "@/components/DeletePost";
import BetaModal from "@/components/BetaModal"; 
import { MessageCircle, Repeat } from 'lucide-react';
import Link from "next/link";

export const revalidate = 0; 

export default async function Home() {
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch posts + profiles + likes + COMMENTS (ids only)
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (username, bias, avatar_url),
      likes (user_id),
      comments (id)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl mx-auto">
      {/* 🚨 BETA MODAL (Shows only once) */}
      <BetaModal />

      <h1 className="text-3xl font-bold text-nj-text mb-6">Home Feed 🏠</h1>
      
      <CreatePost />
      
      <div className="space-y-4">
        {posts?.map((post: any) => {
          const likeCount = post.likes.length;
          const isLikedByMe = !!post.likes.find((like: any) => like.user_id === user?.id);
          // 🔢 CALCULATE COMMENT COUNT
          const commentCount = post.comments?.length || 0;

          return (
            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
              <div className="flex justify-between items-start w-full mb-4">
                <div className="flex items-center gap-3">
                  
                  {/* 🔗 LINK TO USER PROFILE (AVATAR) */}
                  <Link href={`/user/${post.user_id}`}>
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity relative border border-gray-100">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full bg-nj-pink flex items-center justify-center text-white font-bold uppercase text-sm">
                          {post.profiles?.username?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div>
                    <div className="flex items-center gap-2">
                      {/* 🔗 LINK TO USER PROFILE (USERNAME) */}
                      <Link href={`/user/${post.user_id}`} className="hover:underline decoration-nj-pink decoration-2 underline-offset-2">
                        <h3 className="font-bold text-sm text-gray-900">@{post.profiles?.username || "unknown"}</h3>
                      </Link>

                      {post.profiles?.bias && (
                        <span className="bg-pink-50 text-nj-pink text-[10px] px-2 py-0.5 rounded-full border border-pink-100 font-bold">
                          {post.profiles.bias} Stan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <DeletePost 
                  postId={post.id} 
                  authorId={post.user_id} 
                  currentUserId={user?.id} 
                />
              </div>
              
              <Link href={`/post/${post.id}`} className="block hover:opacity-80 transition-opacity">
                <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </Link>
              
              <div className="flex gap-6 text-gray-400 text-sm">
                <LikeButton 
                  postId={post.id} 
                  initialCount={likeCount} 
                  isLiked={isLikedByMe} 
                />
                
                {/* 💬 THE REAL COMMENT COUNT */}
                <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-nj-pink transition-colors group">
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform"/> {commentCount}
                </Link>

                <button className="flex items-center gap-1 hover:text-green-500 transition-colors group">
                  <Repeat size={18} className="group-hover:rotate-180 transition-transform duration-500"/> 0
                </button>
              </div>
            </div>
          );
        })}

        {(!posts || posts.length === 0) && (
          <div className="text-center py-20">
             <div className="text-6xl mb-4">🐇</div>
             <p className="text-gray-400 text-lg">No posts yet... be the first to yap!</p>
          </div>
        )}
      </div>
    </div>
  );
}