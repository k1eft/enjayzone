"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import FlipCard from "@/components/FlipCard"; 
import { ArrowLeft, Repeat } from "lucide-react";
import confetti from "canvas-confetti";

interface Card {
  name: string;
  rarity: "Common" | "Rare" | "SR" | "UR";
  image_url: string;
}

export default function PackOpeningPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const router = useRouter();
  
  // 🧠 SMART TRACKER: Counts unique card positions (0, 1, 2) not card IDs
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedCards = localStorage.getItem("opened_pack_cards");
    if (savedCards) {
      setCards(JSON.parse(savedCards));
    } else {
      router.push("/shop");
    }
  }, [router]);

  const handleCardFlip = (index: number) => {
    if (flippedIndices.has(index)) return;

    const newSet = new Set(flippedIndices);
    newSet.add(index);
    setFlippedIndices(newSet);

    // 🎉 FINALE: Trigger when ALL cards are flipped
    if (newSet.size === cards.length && cards.length > 0) {
      setTimeout(() => {
        confetti({
            particleCount: 200,
            spread: 160,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#FFFFFF'] 
        });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-nj-pink/20 to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="mb-12 text-center z-10">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg animate-in slide-in-from-top-5 duration-700">
          {flippedIndices.size === cards.length && cards.length > 0 ? "COLLECTION UPDATED!" : "TAP TO REVEAL"}
        </h1>
        <p className="text-gray-400 font-mono text-sm">
          {flippedIndices.size}/{cards.length} Cards Revealed
        </p>
      </div>

      {/* 🃏 THE CARDS ROW */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center z-10 perspective-1000">
        {cards.map((card, index) => (
          <div 
            // 🔑 THE FIX: Using index ensures duplicates are treated as separate cards
            key={`pack-card-${index}`} 
            className="animate-in slide-in-from-bottom-10 fade-in duration-700"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <FlipCard 
              imageUrl={card.image_url} 
              rarity={card.rarity} 
              onFlip={() => handleCardFlip(index)} 
            />
          </div>
        ))}
      </div>

      {/* 🔘 ACTION BUTTONS (Show when all cards flipped) */}
      {flippedIndices.size === cards.length && cards.length > 0 && (
        <div className="mt-16 flex gap-4 z-20 animate-in zoom-in duration-300">
          <button
            onClick={() => router.push("/shop")}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Repeat size={20} />
            Open Another
          </button>
          
          <button
            onClick={() => router.push("/collection")} 
            className="flex items-center gap-2 px-6 py-3 bg-nj-pink text-white rounded-xl font-bold hover:bg-pink-400 transition-colors shadow-lg shadow-pink-500/30"
          >
            <ArrowLeft size={20} />
            Go to Binder
          </button>
        </div>
      )}

    </div>
  );
}
