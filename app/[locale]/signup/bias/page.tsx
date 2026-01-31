"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import the engine
import { Check, ArrowRight, Loader2 } from "lucide-react";

export default function BiasPicker() {
  const router = useRouter();
  const [selectedBias, setSelectedBias] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const members = [
    { id: "Minji", name: "Minji 🐻", color: "bg-blue-100" },
    { id: "Hanni", name: "Hanni 🐰", color: "bg-pink-100" },
    { id: "Danielle", name: "Danielle 🌻", color: "bg-yellow-100" },
    { id: "Haerin", name: "Haerin 🐸", color: "bg-green-100" },
    { id: "Hyein", name: "Hyein 🍓", color: "bg-purple-100" },
  ];

  const saveBias = async () => {
    if (!selectedBias) return;
    setLoading(true);

    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 2. Update their profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ bias: selectedBias })
        .eq('id', user.id);

      if (error) {
        alert("Failed to save bias: " + error.message);
        setLoading(false);
      } else {
        // 3. Success! Go Home.
        router.push("/");
      }
    } else {
      alert("No user found! Try signing up again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Who is your Bias?</h1>
        <p className="text-gray-500">
          Select your favorite member to customize your NJZone experience! 
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 w-full max-w-4xl">
        {members.map((member) => (
          <div 
            key={member.id}
            onClick={() => setSelectedBias(member.id)}
            className={`
              relative group cursor-pointer rounded-3xl p-4 h-64 flex flex-col items-center justify-end transition-all duration-300
              ${selectedBias === member.id 
                ? 'ring-4 ring-nj-pink ring-offset-2 scale-105 shadow-xl shadow-pink-100' 
                : 'hover:scale-105 hover:shadow-lg border border-gray-100'}
              ${member.color}
            `}
          >
            {selectedBias === member.id && (
              <div className="absolute top-3 right-3 bg-nj-pink text-white p-1 rounded-full shadow-sm animate-bounce">
                <Check size={16} strokeWidth={4} />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-20 font-bold text-6xl text-gray-900 rotate-[-10deg] group-hover:rotate-0 transition-transform">
              {member.name.split(" ")[1]} 
            </div>

            <div className="z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-gray-800 shadow-sm">
              {member.name}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={saveBias}
          disabled={!selectedBias || loading}
          className={`
            px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2
            ${selectedBias 
              ? 'bg-nj-pink text-white shadow-lg shadow-pink-200 hover:opacity-90 animate-pulse' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Finish Setup <ArrowRight size={24} /></>}
        </button>
      </div>

    </div>
  );
}