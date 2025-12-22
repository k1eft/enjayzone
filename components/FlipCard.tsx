"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import confetti from "canvas-confetti"; 

interface FlipCardProps {
  imageUrl: string;
  rarity: "Common" | "Rare" | "SR" | "UR";
  onFlip?: () => void;
}

export default function FlipCard({ imageUrl, rarity, onFlip }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 🎨 Rarity Styling
  const rarityStyles = {
    Common: "border-gray-300",
    Rare: "border-blue-400 shadow-blue-200",
    SR: "border-purple-500 shadow-purple-300",
    UR: "border-yellow-400 shadow-yellow-200 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]",
  };

  const handleFlip = () => {
    if (isFlipped) return; 
    
    setIsFlipped(true);
    if (onFlip) onFlip(); 

    // Confetti Logic
    if (rarity === "UR") {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFFFFF'] });
    } else if (rarity === "SR") {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#A855F7', '#E879F9'] });
    } else if (rarity === "Rare") {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#60A5FA'] });
    }
  };

  return (
    <div className="relative w-48 h-72 cursor-pointer perspective-1000 group" onClick={handleFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }} // 👈 Ensures 3D space works
      >
        
        {/* 🌑 FRONT (The Rabbit / Card Back) */}
        {/* This side is visible at 0 degrees */}
        <div 
            className="absolute w-full h-full bg-[#2E2E2E] rounded-xl border-4 border-white/20 flex items-center justify-center shadow-lg group-hover:scale-[1.02] transition-transform"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} // 👈 THE FIX
        >
           <span className="text-5xl select-none">🐰</span>
           <span className="absolute bottom-4 text-xs text-white/30 font-mono tracking-widest">NJZONE</span>
        </div>

        {/* 🌟 BACK (The Reveal / Member Photo) */}
        {/* This side is rotated 180 initially, so it faces away. We hide its back. */}
        <div 
            className={`absolute w-full h-full rounded-xl border-4 overflow-hidden shadow-xl bg-white ${rarityStyles[rarity]}`}
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden" // 👈 THE FIX
            }}
        >
          <img src={imageUrl} alt="Card" className="w-full h-full object-cover" />
          
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
            <p className="text-white font-bold text-center text-sm uppercase tracking-wider drop-shadow-md">
              {rarity}
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}