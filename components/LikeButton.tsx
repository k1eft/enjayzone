"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LikeButton({ postId, initialCount, isLiked }: { postId: string, initialCount: number, isLiked: boolean }) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic UI: Update the screen BEFORE the database finishes (feels faster)
    const newLikedState = !liked;
    setLiked(newLikedState);
    setCount(newLikedState ? count + 1 : count - 1);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should not happen if logged in

    if (newLikedState) {
      // Add Like
      await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
    } else {
      // Remove Like
      await supabase.from("likes").delete().match({ user_id: user.id, post_id: postId });
    }

    setLoading(false);
  };

  return (
    <button 
      onClick={toggleLike}
      className={`flex items-center gap-1 transition-colors ${liked ? "text-nj-pink" : "hover:text-nj-pink"}`}
    >
      <Heart size={18} className={liked ? "fill-current" : ""} />
      <span>{count}</span>
    </button>
  );
}