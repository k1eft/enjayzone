"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Bell, Heart, MessageCircle, ArrowRightLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ActivityPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
  };

  const markAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-500 fill-red-500" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-500 fill-blue-500" />;
      case 'trade_offer': return <ArrowRightLeft size={16} className="text-green-500" />;
      case 'trade_result': return <CheckCircle size={16} className="text-nj-pink" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getLink = (notif: any) => {
    if (notif.type === 'trade_offer') return '/trade';
    if (notif.type === 'comment' || notif.type === 'like') return '/'; // Ideally link to specific post
    return '/';
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <Bell className="text-nj-pink" /> Activity
      </h1>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-nj-pink" /></div>
      ) : (
        <div className="space-y-2">
          {notifications.length > 0 ? notifications.map((notif) => (
            <Link key={notif.id} href={getLink(notif)}>
              <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer
                  ${notif.is_read ? 'bg-white border border-gray-100' : 'bg-blue-50 border border-blue-100 shadow-sm'}
              `}>
                
                {/* Avatar */}
                <div className="relative">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <img src={notif.actor?.avatar_url || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                      {getIcon(notif.type)}
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                   <p className="text-sm text-gray-800">
                      <span className="font-bold">@{notif.actor?.username}</span> {notif.message}
                   </p>
                   <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                   </p>
                </div>

                {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            </Link>
          )) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 italic">No activity yet. It's quiet... too quiet. 🦗</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
