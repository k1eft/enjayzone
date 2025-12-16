"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, BarChart2, Smile, Send, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You need to login to yap! 🐰");
      setLoading(false);
      return;
    }

    // 2. Insert Post
    const { error } = await supabase
      .from('posts')
      .insert({ 
        content: content,
        user_id: user.id 
      });

    if (error) {
      toast.error("Failed to post: " + error.message);
    } else {
      // 3. SUCCESS! 🎉 (Trigger the "Money Sound" visually)
      setContent("");
      toast.success(
        "Yapped successfully! 🗣️\n(You earn +5 Tokkins every 5 mins!)", 
        {
          duration: 4000,
          icon: '💸',
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
          },
        }
      );
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 mb-6 relative overflow-hidden">
      {/* Toast Container - Requires react-hot-toast */}
      <Toaster position="bottom-center" />

      {/* Input Area */}
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 border border-pink-100">
          <span className="text-2xl">🐰</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? 🥕"
          className="w-full h-24 p-3 bg-gray-50 rounded-2xl border-none resize-none focus:ring-2 focus:ring-nj-pink/50 focus:bg-white transition-all outline-none text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mt-4 pl-16">
        <div className="flex gap-4 text-gray-400">
          <button className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full">
            <ImageIcon size={20} />
          </button>
          <button className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full">
            <BarChart2 size={20} />
          </button>
          <button className="hover:text-nj-pink transition-colors p-2 hover:bg-pink-50 rounded-full">
            <Smile size={20} />
          </button>
        </div>

        <button 
          onClick={handlePost}
          disabled={loading || !content.trim()}
          className="bg-nj-pink text-white px-6 py-2.5 rounded-full font-bold hover:bg-pink-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-pink-200"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Post <Send size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}