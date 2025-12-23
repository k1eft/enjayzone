"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Sparkles, Brain } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

// 🐰 The Cards (Using static images or placeholders for now)
const CARDS = [
  { id: 1, content: "🐰", color: "bg-blue-100" },
  { id: 2, content: "🐻", color: "bg-green-100" },
  { id: 3, content: "🐶", color: "bg-yellow-100" },
  { id: 4, content: "🐱", color: "bg-red-100" },
  { id: 5, content: "🐹", color: "bg-purple-100" },
  { id: 6, content: "🐸", color: "bg-pink-100" },
];

export default function MemoryGame() {
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Shuffle Logic
  const shuffleCards = () => {
    const duplicated = [...CARDS, ...CARDS].map((card, i) => ({ ...card, uniqueId: i }));
    const shuffled = duplicated.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setDisabled(false);
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  // 2. Handle Click
  const handleClick = (id: number) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setFlipped([flipped[0], id]);
    setDisabled(true);

    // Check Match
    const firstCard = cards.find(c => c.uniqueId === flipped[0]);
    const secondCard = cards.find(c => c.uniqueId === id);

    if (firstCard.id === secondCard.id) {
      setSolved(prev => [...prev, flipped[0], id]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  // 3. Check Win Condition
  useEffect(() => {
    if (cards.length > 0 && solved.length === cards.length) {
      handleWin();
    }
  }, [solved]);

  const handleWin = async () => {
    setWon(true);
    setLoading(true);
    // 💰 Call the Backend to give money
    const { data, error } = await supabase.rpc('claim_memory_reward');
    
    if (!error && data.success) {
      toast.success(data.message, { icon: '🧠' });
    } else {
      toast.error("Played too fast! Wait a sec.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Toaster position="bottom-center" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Brain className="text-nj-pink" /> Match It
        </h1>
        <p className="text-gray-500">Find the pairs to earn 50 Tokkins.</p>
      </div>

      {won ? (
        <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center animate-in zoom-in">
            <Sparkles className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You Won! 🎉</h2>
            <p className="text-gray-600 mb-6">Your brain is huge.</p>
            <button 
                onClick={shuffleCards} 
                disabled={loading}
                className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Play Again"}
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {cards.map((card) => (
                <div 
                    key={card.uniqueId} 
                    onClick={() => handleClick(card.uniqueId)}
                    className={`aspect-square rounded-2xl cursor-pointer transition-all duration-300 transform preserve-3d relative
                        ${flipped.includes(card.uniqueId) || solved.includes(card.uniqueId) ? 'rotate-y-180' : 'hover:scale-105'}
                    `}
                >
                    {/* Front (Hidden) */}
                    <div className={`absolute inset-0 bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm backface-hidden
                        ${flipped.includes(card.uniqueId) || solved.includes(card.uniqueId) ? 'opacity-0' : 'opacity-100'}
                    `}>
                        <span className="text-2xl opacity-50">?</span>
                    </div>

                    {/* Back (Revealed) */}
                    <div className={`absolute inset-0 ${card.color} rounded-2xl flex items-center justify-center border-2 border-white shadow-sm
                         ${flipped.includes(card.uniqueId) || solved.includes(card.uniqueId) ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}>
                        <span className="text-4xl">{card.content}</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
