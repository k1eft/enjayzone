"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Image, Smile, Calendar, BarChart2, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Insert into Supabase
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content,
          user_id: user.id
        });

      if (error) {
        alert("Error posting: " + error.message);
      } else {
        setContent(""); // Clear the box
        router.refresh(); // Refresh the feed below
      }
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
      <div className="flex gap-4">
        {/* Placeholder Avatar - we could fetch the real one, but let's keep it simple */}
        <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-xl">
           🐰
        </div>

        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? 🐰" 
            className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder-gray-400 outline-none h-20"
          ></textarea>

          <div className="border-t border-gray-100 my-2"></div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-4 text-nj-pink">
              <button className="hover:bg-pink-50 p-2 rounded-full transition-colors"><Image size={20} /></button>
              <button className="hover:bg-pink-50 p-2 rounded-full transition-colors"><BarChart2 size={20} /></button>
              <button className="hover:bg-pink-50 p-2 rounded-full transition-colors"><Smile size={20} /></button>
            </div>

            <button 
              onClick={handlePost}
              disabled={loading || !content.trim()}
              className="bg-nj-pink text-white px-6 py-2 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Post <Send size={16} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}