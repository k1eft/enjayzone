"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Play, Trophy, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function StrawberryRush() {
  const router = useRouter();
  
  // UI State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [items, setItems] = useState<any[]>([]);
  const [basketX, setBasketX] = useState(50); // For UI rendering
  const [loading, setLoading] = useState(false);

  // 🧠 GAME ENGINE REFS (Mutable values that don't trigger re-renders but update instantly)
  const basketXRef = useRef(50); 
  const lastSpawnTime = useRef(0);
  const animationFrameId = useRef<number>(0);
  const isPlayingRef = useRef(false); // Tracks game state synchronously

  // 🍓 CONSTANTS
  const SPAWN_RATE = 600; // ms (Faster spawn = more fun)
  const FALL_SPEED = 0.6; // % per tick

  // 1. GAME LOOP (The Engine)
  const gameLoop = (time: number) => {
    if (!isPlayingRef.current) return;

    // A. Spawn Logic
    if (time - lastSpawnTime.current > SPAWN_RATE) {
      const type = Math.random() > 0.8 ? 'rotten' : Math.random() > 0.9 ? 'golden' : 'normal';
      const newItem = {
        id: Math.random(),
        x: Math.random() * 85, // 0-85% width
        y: -10, // Start above screen
        type: type 
      };
      setItems(prev => [...prev, newItem]);
      lastSpawnTime.current = time;
    }

    // B. Physics & Collision
    setItems(prevItems => {
      const newItems = [];
      const basketLeft = basketXRef.current; 
      const basketRight = basketXRef.current + 20; // Basket is roughly 20% width

      for (let item of prevItems) {
        // Move Item Down
        item.y += FALL_SPEED;

        // Collision Check (Hitbox)
        // Y: 85-95% (Basket height) | X: Within basket width
        if (item.y > 82 && item.y < 92 && item.x + 5 > basketLeft && item.x < basketRight) {
           handleCatch(item.type);
           continue; // Remove item (caught)
        }

        // Missed (Fell off screen)
        if (item.y > 105) continue; 

        newItems.push(item);
      }
      return newItems;
    });

    // C. Next Frame
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  // 2. SCORING LOGIC
  const handleCatch = (type: string) => {
    if (type === 'normal') setScore(s => s + 10);
    if (type === 'golden') {
        setScore(s => s + 50);
        // Visual flair could go here
    }
    if (type === 'rotten') {
        setScore(s => Math.max(0, s - 30));
        toast('BUG! -30 pts 🐛', { icon: '🤢', duration: 1000, style: { background: '#333', color: '#fff'} });
    }
  };

  // 3. START / END LOGIC
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setGameState('playing');
    
    // Sync Refs for the Engine
    isPlayingRef.current = true;
    lastSpawnTime.current = performance.now();
    
    // Start Loop
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  const endGame = async () => {
    setGameState('gameover');
    isPlayingRef.current = false; // Stop engine immediately
    cancelAnimationFrame(animationFrameId.current);
    
    // Calculate Reward
    setLoading(true);
    const { data, error } = await supabase.rpc('claim_strawberry_reward', { score });
    
    if (error) {
      toast.error("Network error! Check internet.");
    } else if (data.success) {
      toast.success(data.message, { icon: '💰', duration: 4000 });
    } else {
        toast.error(data.message);
    }
    setLoading(false);
  };

  // 4. TIMER (Independent of Game Loop)
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  // 5. CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
        isPlayingRef.current = false;
        cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // 6. CONTROLS (Mouse/Touch updates the REF immediately)
  const handleMove = (e: any) => {
    if (gameState !== 'playing') return;
    
    // Get container bounds
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    
    // Calculate %
    let x = ((clientX - container.left) / container.width) * 100;
    x = Math.max(0, Math.min(x - 10, 80)); // Center the 20% basket
    
    // Update Ref (For Logic) AND State (For UI)
    basketXRef.current = x;
    setBasketX(x);
  };

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      <Toaster position="top-center" />
      
      {/* 🔙 Exit Button */}
      <button 
        onClick={() => router.push('/arcade')} 
        className="absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100"
      >
        <ArrowLeft size={24} />
      </button>

      {/* 🎮 GAME CONTAINER */}
      <div 
        className="w-full max-w-md h-[80vh] bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl relative overflow-hidden shadow-2xl border-4 border-white cursor-none touch-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {/* Background Decor */}
        <div className="absolute bottom-0 w-full h-24 bg-green-500 rounded-b-2xl border-t-4 border-green-600/20"></div>
        <div className="absolute top-10 left-10 text-4xl opacity-80 animate-pulse">☁️</div>
        <div className="absolute top-20 right-20 text-4xl opacity-80 animate-pulse delay-700">☁️</div>

        {/* 📊 HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-black text-gray-800 flex items-center gap-2 shadow-sm border border-white/50">
                <Trophy size={16} className="text-yellow-500" /> {score}
            </div>
            <div className={`px-4 py-2 rounded-full font-black text-white shadow-sm transition-colors ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-gray-800'}`}>
                ⏳ {timeLeft}s
            </div>
        </div>

        {/* 🍓 FALLING ITEMS RENDERER */}
        {items.map(item => (
            <div 
                key={item.id}
                className="absolute text-4xl drop-shadow-md transition-transform"
                style={{ 
                    left: `${item.x}%`, 
                    top: `${item.y}%`,
                    // transform: `rotate(${item.y * 2}deg)` // Optional spin
                }}
            >
                {item.type === 'normal' ? '🍓' : item.type === 'golden' ? '🌟' : '🐛'}
            </div>
        ))}

        {/* 🧺 BASKET (Player) */}
        {gameState === 'playing' && (
            <div 
                className="absolute bottom-20 w-[20%] text-center text-6xl drop-shadow-xl"
                style={{ left: `${basketX}%` }}
            >
                🧺
            </div>
        )}

        {/* 🛑 START SCREEN */}
        {gameState === 'start' && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm z-20">
                <h1 className="text-4xl font-black mb-2 text-pink-300 drop-shadow-md">Strawberry Rush</h1>
                <p className="mb-8 font-medium text-lg">Catch 🍓 & 🌟<br/>Avoid the 🐛!</p>
                <button 
                    onClick={startGame}
                    className="bg-nj-pink hover:bg-pink-400 text-white px-8 py-4 rounded-full font-black text-xl shadow-lg transform transition-transform hover:scale-105 flex items-center gap-2 active:scale-95"
                >
                    <Play fill="currentColor" /> START HARVEST
                </button>
            </div>
        )}

        {/* 🏁 GAME OVER SCREEN */}
        {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-md z-20 animate-in zoom-in duration-300">
                <h2 className="text-3xl font-black mb-2">Harvest Done!</h2>
                <div className="text-7xl font-black text-yellow-400 mb-2 drop-shadow-lg tracking-tighter">{score}</div>
                <p className="mb-8 text-gray-300 font-bold uppercase tracking-widest text-xs">Points Collected</p>
                
                {loading ? (
                    <div className="flex flex-col items-center gap-3 bg-white/10 p-4 rounded-2xl">
                        <Loader2 className="animate-spin text-nj-pink" size={32} />
                        <p className="text-sm font-bold">Calculating Paycheck...</p>
                    </div>
                ) : (
                    <button 
                        onClick={startGame}
                        className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all mb-4 w-full shadow-lg hover:scale-105 active:scale-95"
                    >
                        Play Again
                    </button>
                )}
                
                {!loading && (
                    <button onClick={() => router.push('/arcade')} className="text-sm text-gray-400 hover:text-white underline mt-2">
                        Back to Arcade
                    </button>
                )}
            </div>
        )}

      </div>
      
      <p className="mt-4 text-xs text-gray-500 font-bold uppercase tracking-wide opacity-50">Drag to move • Catch the fruit</p>
    </div>
  );
}
    