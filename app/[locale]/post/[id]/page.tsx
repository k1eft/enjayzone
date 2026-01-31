import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CommentBox from "@/components/CommentBox";

export const revalidate = 0;

// Notice: 'params' is a Promise now!
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. 🔓 UNLOCK THE BOX (Await params)
  const { id } = await params;

  // 2. Fetch the specific Post using the unlocked ID
  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url, bias)')
    .eq('id', id) // <--- Use 'id', not 'params.id'
    .single();

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-6xl">🕵️‍♂️</div>
        <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
        <p className="text-gray-500">It might have been deleted or the ID is wrong.</p>
        <Link href="/" className="text-nj-pink font-bold hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  // 3. Fetch the Comments for this post
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(username, avatar_url)')
    .eq('post_id', id)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-2xl mx-auto pb-20 pt-6">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-nj-pink mb-6 font-bold transition-colors">
        <ArrowLeft size={20} /> Back to Feed
      </Link>

      {/* The Main Post */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
             {post.profiles?.avatar_url ? (
                <img src={post.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover"/>
             ) : (
                <div className="w-full h-full bg-nj-pink flex items-center justify-center text-white font-bold text-xl">
                  {post.profiles?.username?.[0].toUpperCase()}
                </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg">@{post.profiles?.username}</h1>
              {post.profiles?.bias && (
                <span className="bg-pink-50 text-nj-pink text-xs px-2 py-0.5 rounded-full border border-pink-100">
                  {post.profiles.bias} Stan
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Comment Section */}
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
        Comments <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{comments?.length || 0}</span>
      </h3>

      <div className="space-y-4 mb-24">
        {comments?.map((comment: any) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-xl flex gap-3 border border-gray-100">
             <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0 border border-gray-200">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xs">
                    {comment.profiles?.username?.[0].toUpperCase()}
                  </div>
                )}
             </div>
             <div className="flex-1">
               <div className="flex items-center justify-between mb-1">
                 <span className="font-bold text-sm text-gray-900">@{comment.profiles?.username}</span>
                 <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               </div>
               <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
             </div>
          </div>
        ))}
        
        {(!comments || comments.length === 0) && (
           <p className="text-gray-400 text-center italic">No comments yet. Be the first! 🐇</p>
        )}
      </div>

      {/* The Input Box Component */}
      <CommentBox postId={id} />

    </div>
  );
}