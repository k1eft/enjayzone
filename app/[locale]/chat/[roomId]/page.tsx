"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Send, ArrowLeft, Loader2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

// Helper to get Room Info based on ID
const getRoomInfo = (id: string) => {
  const zones: Record<string, any> = {
    'global': { name: "Global Chat 🌍", color: "bg-gray-700" },
    'hanni-yappers': { name: "Hanni's Little Yappers 🐰", color: "bg-pink-500" },
    'danielle-sunshine': { name: "Danielle Enjoyers 🌻", color: "bg-yellow-500" },
    'haerin-frogs': { name: "Haerin's Frogs 🐸", color: "bg-green-600" },
    'hyein-strawberries': { name: "Hyein's Strawberries 🍓", color: "bg-purple-600" },
    'minji-cleaning': { name: "Kim Minji & Friends 🐻", color: "bg-blue-600" },
  };
  return zones[id] || { name: "Unknown Zone", color: "bg-gray-900" };
};

export default function ChatRoom() {
  const params = useParams();
  // ✅ FIX 1: Use the correct param name matching your folder [roomId]
  const roomId = params.roomId as string;
  const router = useRouter();
  const roomInfo = getRoomInfo(roomId);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 📡 SETUP: Get User + Fetch Messages
  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Login to yap!");
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // ✅ FIX 2: Correct Table Name 'chat_messages'
      const { data, error } = await supabase
        .from('chat_messages') 
        .select('*, profiles(username, avatar_url, frame_url)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (error) console.error("Fetch error:", error);
      if (data) setMessages(data);
      setLoading(false);
    };

    setup();
  }, [roomId, router]);

  // 2. ⚡ REALTIME: Listen for 'chat_messages'
  useEffect(() => {
    const channel = supabase.channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        // ✅ FIX 3: Listen to the correct table
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url, frame_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg = { ...payload.new, profiles: profile };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({ 
              user_id: user.id, 
              online_at: new Date().toISOString() 
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. 👇 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. 📤 Send Message
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msgContent = newMessage;
    setNewMessage("");

    // ✅ FIX 4: Insert into correct table
    const { error } = await supabase.from('chat_messages').insert({
      content: msgContent,
      room_id: roomId,
      user_id: currentUser.id
    });

    if (error) {
      console.error("Supabase Error:", error);
      toast.error("Failed to send");
      setNewMessage(msgContent);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto bg-gray-50 md:rounded-3xl md:shadow-xl md:my-4 md:border md:border-gray-200 overflow-hidden relative">
      <Toaster position="top-center" />

      {/* HEADER */}
      <div className={`${roomInfo.color} p-4 flex items-center justify-between text-white shadow-md z-10`}>
        <div className="flex items-center gap-3">
          <Link href="/chat" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">{roomInfo.name}</h1>
            <p className="text-xs opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> Live Zone
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-white/20 rounded-full"><MoreVertical size={20}/></button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-gray-400"/></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-2">🦗</p>
            <p>It's quiet... too quiet.</p>
            <p className="text-sm">Be the first to yap!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user_id === currentUser?.id;
            return (
              <div key={msg.id || i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="relative w-8 h-8 flex-shrink-0 self-end mb-1">
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative z-0">
                     <Image src={msg.profiles?.avatar_url || "https://github.com/shadcn.png"} alt="Av" fill className="object-cover" />
                   </div>
                   {msg.profiles?.frame_url && (
                     <div className="absolute -inset-1 z-10 pointer-events-none">
                       <Image src={msg.profiles.frame_url} alt="Frame" fill className="object-contain scale-110" />
                     </div>
                   )}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe 
                    ? `${roomInfo.color} text-white rounded-br-none` 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}>
                  {!isMe && <p className={`text-[10px] font-bold mb-1 opacity-70 ${roomInfo.color.replace('bg-', 'text-')}`}>@{msg.profiles?.username}</p>}
                  {msg.content}
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message #${roomId}...`}
          className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className={`p-3 rounded-xl transition-all ${
            newMessage.trim() 
              ? `${roomInfo.color} text-white shadow-lg hover:brightness-110 transform hover:scale-105` 
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}