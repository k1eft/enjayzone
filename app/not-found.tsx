"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, Music2 } from "lucide-react";

// 🎶 THE PLAYLIST OF LOST SOULS
const LYRICS = [
  { text: "Oh my god, so crazy... this page is gone.", song: "OMG" },
  { text: "Where are you looking? I'm not there.", song: "Attention (Remix)" },
  { text: "What's your ETA? Because this page is never arriving.", song: "ETA" },
  { text: "Got me looking for attention... but this link is broken.", song: "Attention" },
  { text: "I'm super shy, super shy... to tell you this page doesn't exist.", song: "Super Shy" },
  { text: "You got me chasing... a 404 error.", song: "Super Shy" },
  { text: "Stay in the middle... like you a little... lost?", song: "Ditto" },
  { text: "Hurt... because I can't find what you wanted.", song: "Hurt" },
  { text: "Cool with you? I hope you're cool with this 404.", song: "Cool With You" },
];

export default function NotFound() {
  const [message, setMessage] = useState(LYRICS[0]);

  useEffect(() => {
    // Pick a random lyric on load
    const random = LYRICS[Math.floor(Math.random() * LYRICS.length)];
    setMessage(random);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      
      {/* 🖼️ Haerin Shrugging */}
      <div className="w-64 h-64 relative mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl animate-in zoom-in duration-500">
        {/* wats yo eta wats yo eta mhmhmmm */}
        <img 
            src="https://media1.tenor.com/m/1R4_c9exBTMAAAAC/haerin-newjeans.gif" 
            alt="Haerin Doesn't Know" 
            className="w-full h-full object-cover"
        />
      </div>

      {/* 404 Text */}
      <h1 className="text-9xl font-black text-nj-pink opacity-20 absolute select-none pointer-events-none">
        404
      </h1>

      <div className="z-10 relative">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
            Oops! Are you lost?
        </h2>
        
        {/* 🎤 The Lyric */}
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-100 mb-8 max-w-md mx-auto transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="text-lg font-bold text-gray-800 italic">"{message.text}"</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <Music2 size={12} /> {message.song}
            </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
            <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full font-bold hover:bg-gray-100 shadow-sm border border-gray-200 transition-colors"
            >
                <ArrowLeft size={18} /> Go Back
            </button>
            
            <Link href="/">
                <button className="flex items-center gap-2 px-6 py-3 bg-nj-pink text-white rounded-full font-bold hover:bg-pink-400 shadow-lg shadow-pink-200 transition-colors">
                    <Home size={18} /> Home
                </button>
            </Link>
        </div>
      </div>

    </div>
  );
}
