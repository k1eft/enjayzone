"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommentBox({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendComment = async () => {
    if (!content.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('comments').insert({
        content: content,
        post_id: postId,
        user_id: user.id
      });
      setContent("");
      router.refresh(); // Refresh page to see new comment
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:bg-transparent md:p-0">
      <div className="flex gap-2 max-w-2xl mx-auto">
        <input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendComment()}
          type="text" 
          placeholder="Write a reply..." 
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nj-pink/50"
        />
        <button 
          onClick={sendComment}
          disabled={loading || !content.trim()}
          className="bg-nj-pink text-white w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}