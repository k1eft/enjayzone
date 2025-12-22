"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, MessageCircle, Bell, Loader2, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch notifications + Actor details (Avatar/Username)
    const { data } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!actor_id (username, avatar_url) 
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);
    
    // Mark all as read immediately upon viewing (Lazy Dev Hack 🧠)
    if (data && data.length > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-nj-pink" /></div>;

  return (
    <div className="max-w-2xl mx-auto min-h-screen pb-20 px-4 pt-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-50 rounded-2xl">
          <Bell className="text-nj-pink" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">See who's obsessing over you.</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => router.push(`/post/${notif.reference_id}`)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border
                ${notif.is_read ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-pink-50/50 border-pink-100'}`}
            >
              
              {/* Actor Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  {notif.actor?.avatar_url ? (
                    <Image src={notif.actor.avatar_url} alt="User" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </div>
                {/* Icon Badge */}
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white 
                  ${notif.type === 'like' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                  {notif.type === 'like' ? <Heart size={12} fill="currentColor" /> : <MessageCircle size={12} />}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <p className="text-gray-900 text-sm">
                  <span className="font-bold">@{notif.actor?.username || "Someone"}</span>
                  {notif.type === 'like' ? " liked your post." : " commented on your post."}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </p>
              </div>

              {!notif.is_read && <div className="w-2 h-2 bg-nj-pink rounded-full" />}
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400">No notifications yet. Flop era? 💀</p>
          </div>
        )}
      </div>

    </div>
  );
}
