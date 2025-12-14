"use client";
import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DeletePost({ postId, authorId, currentUserId }: { postId: string, authorId: string, currentUserId: string | undefined }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If you are NOT the author, you don't see the button.
  if (currentUserId !== authorId) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this Yap? 🗑️");
    if (!confirmed) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      alert("Error deleting: " + error.message);
      setLoading(false);
    } else {
      router.refresh();
      // If we are on the detail page, we might want to go home, 
      // but for now, refresh works for the feed.
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-gray-300 hover:text-red-500 transition-colors p-2"
      title="Delete Post"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
    </button>
  );
}