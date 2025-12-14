"use client";
import { useEffect, useState } from "react";
import { X, AlertTriangle, MessageCircle } from "lucide-react"; // Rocket removed
import Image from "next/image"; // Image added

export default function BetaModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("njzone_v2_beta_seen");
    if (!hasSeenIntro) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("njzone_v2_beta_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-pink-100 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-nj-pink to-purple-400 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 cursor-pointer hover:bg-white/20 p-1 rounded-full transition-colors" onClick={handleClose}>
            <X size={20} />
          </div>
          
          {/* 🖼️ THE LOGO IS HERE NOW */}
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg rotate-3 p-2">
            <Image 
              src="/icon.png" // Using the image you put in the 'app' folder
              alt="NJZone Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-bold">Welcome to NJZone 2.0</h2>
          <span className="inline-block mt-2 bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Public Beta 🚧
          </span>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-4">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-600 flex gap-3 text-left">
            <AlertTriangle className="flex-shrink-0" size={20} />
            <p>
              <span className="font-bold">Heads up:</span> The old version of NJZone is gone for good. This is a fresh start!
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed">
            You are currently testing the <strong>Public Beta</strong>. Things might break, features might change, and we are cooking up new stuff every day.
          </p>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-3">Got ideas? Bugs? Suggestions?</p>
            <a 
              href="https://discord.com/app" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-indigo-500 font-bold hover:underline bg-indigo-50 px-4 py-2 rounded-full transition-colors"
            >
              <MessageCircle size={18} /> DM @t1ram1ssu on Discord
            </a>
          </div>
        </div>

        {/* Footer Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={handleClose}
            className="w-full bg-nj-pink hover:opacity-90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
          >
            Let's Go! 🐇
          </button>
        </div>

      </div>
    </div>
  );
}