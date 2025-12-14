"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Define what a message looks like
type Message = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    bias: string | null;
  };
};

export default function ChatRoom() {
  const { roomId } = useParams();
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null); // We need this to tell others who WE are
  const [status, setStatus] = useState("CONNECTING");
  
  // ⌨️ TYPING STATES
  const [typers, setTypers] = useState<string[]>([]); // List of usernames currently typing
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // To clear the "typing" status
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Setup Chat
  useEffect(() => {
    const setupChat = async () => {
      // A. Get Me & My Profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setMyProfile(profile);
      }

      // B. Fetch History
      const { data } = await supabase
        .from('chat_messages')
        .select('*, profiles(username, avatar_url, bias)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (data) setMessages(data as any);

      // C. 👇 SUBSCRIBE TO REALTIME (Database + Broadcast)
      const channel = supabase
        .channel(`room:${roomId}`)
        // 1. Listen for DB Inserts (Messages)
        .on(
          'postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, 
          async (payload) => {
            const { data: sender } = await supabase
              .from('profiles')
              .select('username, avatar_url, bias')
              .eq('id', payload.new.user_id)
              .single();
            const newMsg = { ...payload.new, profiles: sender } as any;
            setMessages((current) => [...current, newMsg]);
          }
        )
        // 2. 📡 Listen for "Typing" Broadcasts
        .on('broadcast', { event: 'typing' }, (payload) => {
          // If it's me, ignore it
          if (payload.payload.username === myProfile?.username) return;

          // Add this user to the list of typers if not there already
          setTypers((current) => {
            if (!current.includes(payload.payload.username)) {
              return [...current, payload.payload.username];
            }
            return current;
          });

          // Remove them after 3 seconds of silence
          setTimeout(() => {
            setTypers((current) => current.filter(u => u !== payload.payload.username));
          }, 3000);
        })
        .subscribe((state) => {
          if (state === 'SUBSCRIBED') setStatus("LIVE");
          else setStatus("DISCONNECTED");
        });

      return () => { supabase.removeChannel(channel); };
    };

    setupChat();
  }, [roomId, myProfile?.username]); // Add myProfile to dependencies

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typers]); // Scroll if typing indicator appears too

  // 📡 Send "I am typing" Signal
  const handleTyping = async () => {
    if (!myProfile) return;

    // Send the signal
    await supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { username: myProfile.username }
    });
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const text = newMessage;
    setNewMessage(""); 

    await supabase.from('chat_messages').insert({
      content: text,
      room_id: roomId,
      user_id: userId
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
      
      {/* Header */}
      <div className="bg-nj-pink p-4 flex items-center gap-4 text-white shadow-md z-10">
        <Link href="/chat" className="hover:bg-white/20 p-2 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-bold text-lg capitalize">#{roomId} Zone</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
            <p className="text-xs opacity-90">{status === 'LIVE' ? 'Live Chat 🔴' : 'Connecting...'}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.user_id === userId;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mt-1 border border-white shadow-sm">
                 {msg.profiles?.avatar_url ? (
                   <img src={msg.profiles.avatar_url} className="w-full h-full object-cover"/>
                 ) : (
                   <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[10px] font-bold">
                     {msg.profiles?.username?.[0]}
                   </div>
                 )}
              </div>
              <div className={`max-w-[70%]`}>
                {!isMe && <div className="text-xs text-gray-500 ml-1 mb-0.5">@{msg.profiles?.username}</div>}
                <div className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-nj-pink text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* ⌨️ TYPING INDICATOR BUBBLE */}
        {typers.length > 0 && (
          <div className="flex gap-2 items-end ml-2 animate-pulse">
             <div className="text-xs text-gray-400 mb-2 italic">
               {typers.join(", ")} is typing...
             </div>
             <div className="flex gap-1 mb-3">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}

        <div ref={bottomRef} /> 
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping(); // 📡 Send signal when typing
          }}
          type="text" 
          placeholder={`Message #${roomId}...`}
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-nj-pink/50 outline-none"
        />
        <button 
          type="submit"
          className="bg-nj-pink text-white w-12 h-12 rounded-full flex items-center justify-center hover:opacity-90 transition-all shadow-md shadow-pink-200"
        >
          <Send size={20} />
        </button>
      </form>

    </div>
  );
}