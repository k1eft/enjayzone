"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CreatePost from "@/components/CreatePost";
import Image from "next/image"; // Keep for UI icons if needed
import Link from "next/link";
import { Megaphone, ShieldCheck, MessageCircle, Heart, Share2, Loader2, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // 💬 Comment States
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('is_admin, is_banned').eq('id', user.id).single();
      if (profile?.is_admin) setIsAdmin(true);
      if (profile?.is_banned) {
        alert("YOU HAVE BEEN BANNED FROM THE YAPZONE. 🔨");
        await supabase.auth.signOut();
        window.location.reload();
        return;
      }
    }

    // 2. Fetch Active Announcement
    const { data: announceData } = await supabase
      .from('announcements')
      .select('content')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (announceData) setAnnouncement(announceData.content);

    // 3. Fetch Posts + LIKES + COMMENTS
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
  *,
        profiles (username, avatar_url, frame_url, bias, is_verified),
        likes (user_id),
        comments (
        id, content, created_at,
        profiles (username, avatar_url, is_verified)
)
      `)
      .order('created_at', { ascending: false });

    if (!error && postsData) {
      const processedPosts = postsData.map(post => ({
        ...post,
        like_count: post.likes.length,
        liked_by_me: user ? post.likes.some((like: any) => like.user_id === user.id) : false,
        comments: post.comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }));
      setPosts(processedPosts);
    }
    setLoading(false);
  };

  // ❤️ HANDLE LIKE
  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return toast.error("Login to like!");

    // Optimistic Update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          liked_by_me: !isLiked,
          like_count: isLiked ? p.like_count - 1 : p.like_count + 1
        };
      }
      return p;
    }));

    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: currentUserId });
    }
  };

  // 💬 HANDLE COMMENT SUBMIT
  const submitComment = async (postId: string) => {
    if (!newComment.trim()) return;
    setCommenting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUserId,
      content: newComment
    });

    if (error) {
      toast.error("Failed to yap back.");
    } else {
      toast.success("Reply sent!");
      setNewComment("");
      setOpenCommentId(null);
      fetchData(); 
    }
    setCommenting(false);
  };

  const handleShare = (username: string, content: string) => {
    navigator.clipboard.writeText(`@${username} yapped: "${content}" on NJZone`);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Admin: Delete this post?")) return;
    await supabase.from('posts').delete().eq('id', postId);
    setPosts(posts.filter(p => p.id !== postId));
    toast.success("Post nuked.");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-24">
      <Toaster position="bottom-center" />
      
      {/* 👑 ADMIN BUTTON */}
      {isAdmin && (
        <Link href="/admin">
          <div className="mb-6 bg-gray-900 text-white p-3 rounded-xl flex items-center justify-between hover:bg-gray-800 transition-colors shadow-lg cursor-pointer group">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-nj-pink group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm">Admin Dashboard</span>
            </div>
            <span className="text-xs text-gray-400">Manage App →</span>
          </div>
        </Link>
      )}

      {/* 📣 ANNOUNCEMENT */}
      {announcement && (
        <div className="mb-8 bg-gradient-to-r from-nj-pink to-purple-400 p-[2px] rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[14px] px-5 py-4 flex items-start gap-4">
            <div className="bg-pink-50 p-2.5 rounded-full flex-shrink-0">
              <Megaphone size={20} className="text-nj-pink animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">Announcement</p>
              <p className="text-gray-600 text-sm leading-relaxed">{announcement}</p>
            </div>
          </div>
        </div>
      )}

      {/* 📝 CREATE POST */}
      <CreatePost />

      {/* 📰 FEED */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="animate-spin text-nj-pink" size={32} />
          <p className="text-sm font-medium">Loading YapZone...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Post Header */}
              <div className="flex gap-4 mb-4 relative">
                
                {/* 🔗 AVATAR LINK */}
                <Link href={`/user/${post.user_id}`}>
                    <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer group">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 relative z-0 group-hover:opacity-80 transition-opacity">
                            {/* 🖼️ USING STANDARD IMG FOR GIF SUPPORT */}
                            <img 
                                src={post.profiles?.avatar_url || "https://github.com/shadcn.png"} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {post.profiles?.frame_url && (
                            <div className="absolute -inset-1.5 z-10 pointer-events-none">
                                <img 
                                    src={post.profiles.frame_url} 
                                    alt="Frame" 
                                    className="w-full h-full object-contain scale-90"
                                />
                            </div>
                        )}
                    </div>
                </Link>

                <div>
                  <div className="flex items-center gap-2">
                    {/* 🔗 USERNAME LINK */}
                    <Link href={`/user/${post.user_id}`} className="hover:underline decoration-nj-pink underline-offset-2 flex items-center gap-1">
    <h3 className="font-bold text-gray-900 hover:text-nj-pink transition-colors">
        @{post.profiles?.username || 'User'}
    </h3>
    {post.profiles?.is_verified && <VerifiedBadge size={16} />}
</Link>


                    {post.profiles?.bias && (
                      <span className="bg-pink-50 text-nj-pink text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        {post.profiles.bias}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(post.id)} className="absolute top-0 right-0 text-gray-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                )}
              </div>

              {/* Content */}
              <p className="text-gray-800 leading-relaxed mb-4 text-[15px] whitespace-pre-wrap">{post.content}</p>

              {/* 🖼️ IMAGE DISPLAY */}
              {post.image_url && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 relative bg-gray-50">
                    {/* Standard img tag supports GIFs natively */}
                   <img 
                     src={post.image_url} 
                     alt="Post Attachment" 
                     className="w-full h-auto max-h-[500px] object-cover"
                     loading="lazy"
                   />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 text-gray-400 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => handleLike(post.id, post.liked_by_me)}
                  className={`flex items-center gap-2 transition-colors text-sm font-bold group ${post.liked_by_me ? 'text-red-500' : 'hover:text-red-400'}`}
                >
                  <Heart size={18} className={`transition-transform ${post.liked_by_me ? 'fill-current scale-110' : 'group-hover:scale-110'}`}/> 
                  <span>{post.like_count || 0}</span>
                </button>

                {/* 💬 REPLY BUTTON */}
                <button 
                  onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-medium group ${openCommentId === post.id ? 'text-blue-500' : 'hover:text-blue-400'}`}
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform"/> 
                  <span>{post.comments?.length || 0}</span>
                </button>

                <button 
                  onClick={() => handleShare(post.profiles?.username, post.content)}
                  className="flex items-center gap-2 hover:text-green-500 transition-colors text-sm font-medium group ml-auto"
                >
                  <Share2 size={18} className="group-hover:scale-110 transition-transform"/> 
                </button>
              </div>

              {/* 👇 COMMENT SECTION */}
              {openCommentId === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-50 animate-in slide-in-from-top-2">
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                    {post.comments?.length > 0 ? (
                      post.comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                           {/* Avatar in comments */}
                           <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0 border border-white">
                             <img 
                                src={comment.profiles?.avatar_url || "https://github.com/shadcn.png"} 
                                alt="Av" 
                                className="w-full h-full object-cover"
                             />
                           </div>
                           <div>
                             {/* Link in comments too! */}
                             <Link href={`/user/${comment.profiles?.id}`} className="hover:underline">
                                <p className="text-xs font-bold text-gray-900">@{comment.profiles?.username}</p>
                             </Link>
                             <p className="text-sm text-gray-700">{comment.content}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 text-center italic">No yaps yet. Be the first!</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Write a reply..." 
                      className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                    />
                    <button 
                      onClick={() => submitComment(post.id)}
                      disabled={commenting}
                      className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {commenting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
